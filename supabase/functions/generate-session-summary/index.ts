import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5; // 5 summary generations per minute

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Authenticated user ${user.id} requesting session summary`);

    // Rate limiting check
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count, error: countError } = await supabaseClient
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('action_type', 'session_summary')
      .gte('created_at', windowStart);

    if (countError) {
      console.error("Rate limit check failed:", countError.message);
    } else if (count && count >= MAX_REQUESTS_PER_WINDOW) {
      console.warn(`Rate limit exceeded for user ${user.id}: ${count} requests`);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please wait before generating another summary." }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { transcription, patientName, sessionDuration } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!transcription || transcription.trim().length < 20) {
      return new Response(
        JSON.stringify({ error: "Transcription is too short for summarization" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Generating session summary...");

    const systemPrompt = `אתה עוזר רפואי לרפואה סינית מסורתית (TCM). תפקידך לסכם פגישות טיפול.
כלל חשוב: הסיכום הוא לשימוש פנימי של המטפל בלבד, לא למסירה למטופל.

צור סיכום מובנה של הפגישה הכולל:

1. **תלונה עיקרית**: מה המטופל דיווח כבעיה המרכזית
2. **סימפטומים נוספים**: סימנים וסימפטומים נלווים שהוזכרו
3. **אבחנה TCM אפשרית**: דפוסים או חוסר איזון שעולים מהשיחה
4. **המלצות טיפול**: נקודות דיקור, צמחים או המלצות שנידונו
5. **מעקב**: נקודות למעקב או פגישה הבאה

השתמש בעברית. היה תמציתי אך מקיף. אם מידע מסוים לא הוזכר בשיחה, ציין זאת.`;

    const userPrompt = `סכם את פגישת הטיפול הבאה:

${patientName ? `שם המטופל: ${patientName}` : ''}
${sessionDuration ? `משך הפגישה: ${Math.floor(sessionDuration / 60)} דקות` : ''}

תמלול הפגישה:
---
${transcription}
---

צור סיכום מובנה בעברית.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to generate summary" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || "";

    console.log("Summary generated successfully");

    // Log usage
    await supabaseClient.from('usage_logs').insert({
      user_id: user.id,
      action_type: 'session_summary',
      tokens_used: data.usage?.total_tokens || 0,
      metadata: { 
        model: 'google/gemini-2.5-flash',
        transcription_length: transcription.length,
        timestamp: new Date().toISOString()
      }
    });

    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error generating summary:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

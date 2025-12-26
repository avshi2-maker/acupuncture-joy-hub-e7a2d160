import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TCM_SYSTEM_PROMPT = `You are TCM Brain, an expert Traditional Chinese Medicine (TCM) knowledge assistant for licensed practitioners.

Respond in the language of the question (Hebrew or English).

CRITICAL: You MUST provide a COMPLETE clinical report with ALL relevant sections filled with REAL, specific clinical data. Do not skip sections. Do not write placeholders.

Use these EXACT section headings in this order. Under each heading, provide SPECIFIC, ACTIONABLE bullet points with real clinical information:

## Pattern / Diagnosis
- Provide the specific TCM pattern diagnosis (e.g., "Liver Qi Stagnation with Blood Deficiency")
- Include relevant Western correlates if applicable
- Note pulse and tongue findings expected for this pattern

## Treatment Principle
- State the specific treatment strategy (e.g., "Soothe Liver Qi, nourish Blood, calm Shen")
- Include treatment goals and expected outcomes

## Acupuncture Points
- List 6-12 specific points with their CODES (e.g., LI4, ST36, SP6)
- Include point name in Pinyin and Chinese: "LI4 (Hegu 合谷)"
- Add brief rationale for each point selection

## Herbal Formula
- Recommend a classical formula or modification (e.g., "Xiao Yao San modified")
- List 6-10 key herbs with Pinyin and Chinese: "Chai Hu (柴胡) 9g"
- Include dosages when possible
- Note any modifications based on pattern

## Nutrition Recommendations
- List 5-8 SPECIFIC foods to INCLUDE with TCM reasoning (e.g., "Dark leafy greens - nourish Blood and Yin")
- List 3-5 foods to AVOID with reasoning (e.g., "Spicy foods - aggravate Liver Heat")
- Include preparation methods when relevant (steamed, warm, raw, etc.)

## Lifestyle & Wellness
- Provide 4-6 specific lifestyle recommendations
- Include: sleep schedule, stress management techniques, emotional regulation
- Add breathing exercises or meditation practices if relevant

## Exercise & Movement
- Recommend specific exercises or movement practices
- Include: Qi Gong exercises, Tai Chi forms, stretching routines
- Specify frequency and duration (e.g., "Practice 8 Brocades 15-20 minutes daily")
- Consider patient's constitution and condition

## Wellness Practices
- Suggest supplementary wellness approaches
- Include: acupressure self-care points, moxibustion recommendations
- Add seasonal considerations if relevant
- Mention any TCM wellness traditions applicable

## Safety & Contraindications
- List any contraindications for the recommended treatments
- Note pregnancy/lactation considerations
- Mention herb-drug interactions if applicable
- Include precautions for specific techniques

RULES:
- EVERY section must have real, specific clinical content - NO placeholders like "consult practitioner" or "individual assessment needed"
- Use bullet points with specific recommendations
- If information is truly insufficient, provide the MOST LIKELY pattern and treatment based on the symptoms given
- Keep responses clinical, professional, and actionable
- Provide COMPLETE answers - users need ALL sections filled with real data`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    const { messages, query } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build messages array
    const chatMessages = [
      { role: "system", content: TCM_SYSTEM_PROMPT },
    ];

    // If it's a simple query (not conversation), add it as user message
    if (query) {
      chatMessages.push({ role: "user", content: query });
    } else if (messages && Array.isArray(messages)) {
      chatMessages.push(...messages);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: chatMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("TCM chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

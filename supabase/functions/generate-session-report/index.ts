import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
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
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { sessionNotes, patientName, chiefComplaint, anxietyResponses } = await req.json();

    if (!sessionNotes && !chiefComplaint) {
      throw new Error('Session notes or chief complaint are required');
    }

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`User ${user.id} generating session report for patient:`, patientName);

    // Build context from available data
    let context = '';
    if (patientName) context += `Patient: ${patientName}\n`;
    if (chiefComplaint) context += `Chief Complaint: ${chiefComplaint}\n`;
    if (sessionNotes) context += `Session Notes:\n${sessionNotes}\n`;
    if (anxietyResponses && anxietyResponses.length > 0) {
      context += `\nAnxiety Q&A Responses:\n${anxietyResponses.join('\n')}\n`;
    }

    const systemPrompt = `You are a Traditional Chinese Medicine (TCM) therapist assistant helping to create patient session summaries.
    
Your task is to generate a CONDENSED summary in HEBREW that includes:

1. **נקודות מפתח** (Key Points) - 3-5 bullet points summarizing the main findings and treatment
2. **המלצות תזונה** (Nutrition Recommendations) - 2-3 specific food/dietary suggestions based on TCM principles
3. **המלצות פעילות גופנית** (Exercise/Movement) - 1-2 gentle movement or exercise recommendations
4. **צמחי מרפא** (Herbal Recommendations) - If applicable, mention 1-2 herbs or herbal formulas

Keep the summary concise but actionable. Use warm, supportive Hebrew language.
Format as plain text suitable for text-to-speech reading.
Do NOT use markdown formatting, asterisks, or special characters.
Write numbers as words when spoken naturally.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please generate a session summary based on the following information:\n\n${context}` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required, please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || '';

    console.log('Generated summary length:', summary.length);

    return new Response(
      JSON.stringify({ summary }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error generating session report:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});

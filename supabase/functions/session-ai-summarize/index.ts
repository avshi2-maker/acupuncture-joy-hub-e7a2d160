import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript, phase, patientName, keywords } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Phase-specific context for better summaries
    const phaseInstructions: Record<string, string> = {
      opening: "Focus on the chief complaint and patient's main concerns.",
      diagnosis: "Highlight diagnostic findings: pulse qualities, tongue observations, TCM patterns.",
      treatment: "Summarize treatment approach: acupuncture points, techniques applied, herbs mentioned.",
      closing: "Focus on follow-up recommendations and lifestyle advice given.",
    };

    const phaseContext = phaseInstructions[phase] || phaseInstructions.opening;
    const keywordsList = keywords?.length > 0 ? `\nKey detected topics: ${keywords.join(", ")}` : "";

    const systemPrompt = `You are a clinical documentation assistant for Traditional Chinese Medicine sessions.
Your role is to provide real-time summaries of the ongoing session.

Current session phase: ${phase}
${phaseContext}
${keywordsList}
${patientName ? `Patient: ${patientName}` : ""}

Rules:
- Summarize in 3 bullet points maximum
- Use Hebrew for the summary
- Be concise and clinically relevant
- Highlight any TCM patterns or diagnostic findings
- If keywords are provided, emphasize those topics
- Keep each bullet under 15 words`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Summarize the following session transcript:\n\n${transcript}` },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    // Return the stream directly for token-by-token rendering
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("session-ai-summarize error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

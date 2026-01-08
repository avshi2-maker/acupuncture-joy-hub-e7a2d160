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
    const { query, analysisType } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "No query provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are Dr. Roni Sapir, an expert Traditional Chinese Medicine (TCM) practitioner specializing in Ba Zi (Four Pillars of Destiny) clinical applications and acupuncture.

Your role is to provide comprehensive TCM analysis integrating:
1. Ba Zi element analysis (Wood, Fire, Earth, Metal, Water)
2. Pattern differentiation (Bian Zheng)
3. Acupuncture point recommendations
4. Herbal formula suggestions
5. Lifestyle and dietary advice

IMPORTANT: Always respond in Hebrew (עברית).

Format your response as JSON with this structure:
{
  "baziAnalysis": {
    "dominantElement": "string (Hebrew)",
    "elementImbalance": "string (Hebrew)",
    "sensitiveSeasons": "string (Hebrew)",
    "optimalTreatmentHours": "string (Hebrew)"
  },
  "tcmPattern": {
    "pattern": "string (Hebrew)",
    "explanation": "string (Hebrew)"
  },
  "treatment": {
    "primaryPoints": ["array of points with codes"],
    "secondaryPoints": ["array of points with codes"],
    "treatmentPrinciple": "string (Hebrew)",
    "herbalFormula": "string (Hebrew with Pinyin)",
    "formulaExplanation": "string (Hebrew)"
  },
  "lifestyle": {
    "dietaryAdvice": "string (Hebrew)",
    "exerciseRecommendations": "string (Hebrew)",
    "emotionalGuidance": "string (Hebrew)"
  },
  "summary": "string (Hebrew) - A concise clinical summary"
}`;

    const userMessage = analysisType === 'multi' 
      ? `נא לנתח את המקרה הקליני הבא בגישה רב-זוויתית:\n${query}`
      : `נא לנתח את התסמינים הבאים ולספק המלצות טיפוליות:\n${query}`;

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
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "חריגה ממגבלת בקשות, נסה שוב מאוחר יותר" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "נדרש תשלום, אנא הוסף קרדיטים" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Try to parse JSON from the response
    let analysisResult;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      analysisResult = JSON.parse(jsonStr);
    } catch {
      // If parsing fails, return the raw text
      analysisResult = { rawResponse: content };
    }

    return new Response(
      JSON.stringify({ success: true, analysis: analysisResult }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("bazi-analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "שגיאה לא ידועה" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

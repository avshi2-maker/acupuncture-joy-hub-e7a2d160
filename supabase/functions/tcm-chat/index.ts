import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Detect if text is primarily Hebrew
function detectLanguage(text: string): "he" | "en" {
  const hebrewPattern = /[\u0590-\u05FF]/g;
  const hebrewMatches = text.match(hebrewPattern) || [];
  return hebrewMatches.length > text.length * 0.1 ? "he" : "en";
}

// Translate Hebrew query to English for searching
async function translateToEnglish(query: string, apiKey: string): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { 
          role: "system", 
          content: "You are a medical translation optimizer. Translate the Hebrew TCM/medical query to a concise English search term. Output ONLY the English search query, nothing else. Preserve medical terminology accurately."
        },
        { role: "user", content: query }
      ],
    }),
  });

  if (!response.ok) {
    console.error("Translation failed, using original query");
    return query;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || query;
}

// Search knowledge base with English query
async function searchKnowledgeBase(
  supabaseClient: any,
  searchQuery: string
): Promise<{ content: string; source: string }[]> {
  const searchTerms = searchQuery.toLowerCase().split(/\s+/).filter((t: string) => t.length > 2);
  
  if (searchTerms.length === 0) return [];

  const { data: chunks, error } = await supabaseClient
    .from("knowledge_chunks")
    .select(`
      content,
      question,
      answer,
      document_id,
      knowledge_documents!inner(original_name)
    `)
    .or(`content.ilike.%${searchTerms[0]}%,question.ilike.%${searchTerms[0]}%,answer.ilike.%${searchTerms[0]}%`)
    .limit(8);

  if (error) {
    console.error("Knowledge search error:", error);
    return [];
  }

  return (chunks || []).map((chunk: any) => ({
    content: chunk.answer || chunk.content || "",
    source: chunk.knowledge_documents?.original_name || "Unknown"
  }));
}

const TCM_SYSTEM_PROMPT = `You are TCM Brain, an expert Traditional Chinese Medicine (TCM) knowledge assistant for licensed practitioners.

LANGUAGE RULE (CRITICAL):
- IF the user asks in Hebrew -> Answer ENTIRELY in Hebrew.
- IF the user asks in English -> Answer ENTIRELY in English.
- Do NOT mention that source documents were in English. Answer naturally.

When Context is provided below, use it as your PRIMARY source. If no relevant context, use your training knowledge.

CRITICAL: You MUST provide a COMPLETE clinical report using the TCM-CAF (TCM Clinical Asset Framework). ALL 15 sections MUST be filled with REAL, specific clinical data. Do not skip sections. Do not write placeholders.

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
- Recommend a classical formula with Chinese name (e.g., "Xiao Yao San 逍遙散")
- List modifications based on specific pattern presentation
- List 6-10 key herbs with Pinyin and Chinese: "Chai Hu (柴胡) 9g"
- Include dosages and preparation method (decoction, granules, pills)

## Nutrition Recommendations
- List 5-8 SPECIFIC foods to INCLUDE with TCM reasoning
- List 3-5 foods to AVOID with reasoning
- Include preparation methods (steamed, warm, raw, etc.)

## Lifestyle & Wellness
- Provide 4-6 specific lifestyle recommendations
- Include seasonal considerations (current season adjustments)
- Add constitutional type considerations (Yin/Yang dominance, Five Element type)
- Include stress management and emotional regulation techniques

## Exercise & Movement
- Recommend specific exercises or movement practices
- Include: Qi Gong exercises, Tai Chi forms, stretching routines
- Specify frequency and duration
- Consider patient's constitution and condition

## Wellness Practices
- Suggest supplementary wellness approaches
- Include: acupressure self-care points, moxibustion recommendations
- Add seasonal wellness practices
- Mention any TCM wellness traditions applicable

## Safety & Contraindications
- List any contraindications for the recommended treatments
- Note pregnancy/lactation considerations
- Mention herb-drug interactions if applicable
- Include precautions for specific techniques

## Mental & Emotional
- Address the emotional/Shen aspects of the condition
- Include specific emotions related to the pattern (e.g., Liver = anger, frustration)
- Recommend emotional cultivation practices
- Suggest meditation or mindfulness techniques specific to the pattern

## Sleep Optimization
- Provide specific sleep recommendations based on pattern
- Include optimal sleep/wake times according to Chinese Clock
- Recommend pre-sleep routines and practices
- Address any pattern-specific sleep disturbances

## Condition Management
- Provide ongoing management strategies
- Include frequency of treatments recommended
- Suggest self-monitoring indicators
- Timeline for expected improvements

## Constitutional Balance
- Identify the patient's likely constitutional type
- Provide constitution-specific recommendations
- Address Yin/Yang balance considerations
- Include Five Element correlations and recommendations

## Chinese Astrology
- Consider relevant astrological influences if applicable
- Include current year/season energetic influences
- Provide timing recommendations for treatments
- Note any relevant celestial considerations

## BaZi Considerations
- If birth data available, note relevant BaZi elements
- Identify potentially weak or excess elements
- Provide element-balancing recommendations
- Suggest colors, directions, or timing based on chart

RULES:
- EVERY section must have real, specific clinical content - NO placeholders
- Use bullet points with specific recommendations
- If information is insufficient for a section, provide the MOST LIKELY recommendations based on the pattern
- Keep responses clinical, professional, and actionable
- This is the TCM-CAF (TCM Clinical Asset Framework) - all 15 assets must be addressed`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

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

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
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

    // Get the user's actual query
    const userQuery = query || (messages && messages.length > 0 ? messages[messages.length - 1].content : "");
    
    // STEP 1: Detect language
    const inputLanguage = detectLanguage(userQuery);
    console.log(`Input language detected: ${inputLanguage}`);

    // STEP 2: Translate to English if Hebrew (Cross-Lingual RAG)
    let searchQuery = userQuery;
    let translatedQuery = "";
    
    if (inputLanguage === "he") {
      translatedQuery = await translateToEnglish(userQuery, LOVABLE_API_KEY);
      searchQuery = translatedQuery;
      console.log(`Translated query: ${translatedQuery}`);
    }

    // STEP 3: Search knowledge base with English query
    const contextChunks = await searchKnowledgeBase(adminClient, searchQuery);
    const sourceDocs = [...new Set(contextChunks.map(c => c.source))];
    console.log(`Found ${contextChunks.length} relevant chunks from: ${sourceDocs.join(", ")}`);

    // Build context string
    const contextString = contextChunks.length > 0
      ? `\n\n--- KNOWLEDGE BASE CONTEXT (Use as primary source) ---\n${contextChunks.map((c, i) => `[${i + 1}] ${c.content}`).join("\n\n")}\n--- END CONTEXT ---\n`
      : "";

    // Build messages array with context injected
    const systemWithContext = TCM_SYSTEM_PROMPT + contextString;
    const chatMessages = [
      { role: "system", content: systemWithContext },
    ];

    // Add conversation history or single query
    if (query) {
      chatMessages.push({ role: "user", content: query });
    } else if (messages && Array.isArray(messages)) {
      chatMessages.push(...messages);
    }

    // STEP 4: Generate response (will be in user's language due to prompt)
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

    const latencyMs = Date.now() - startTime;

    // STEP 5: Log for monitoring (async, don't block response)
    try {
      await adminClient.from("rag_query_logs").insert({
        user_id: user.id,
        query_text: userQuery,
        search_terms: translatedQuery || searchQuery,
        chunks_found: contextChunks.length,
        sources_used: sourceDocs,
        ai_model: "google/gemini-2.5-flash",
        chunks_matched: { input_language: inputLanguage, translated_query: translatedQuery, latency_ms: latencyMs }
      });
      console.log("Query logged successfully");
    } catch (logError) {
      console.error("Failed to log query:", logError);
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

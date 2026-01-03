import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BATCH_SIZE = 10;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
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
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { targetLanguage = "he", documentId } = await req.json();
    
    // Get English chunks that don't have Hebrew translations yet
    let query = supabaseAdmin
      .from("knowledge_chunks")
      .select("*")
      .eq("language", "en");
    
    if (documentId) {
      query = query.eq("document_id", documentId);
    }

    const { data: englishChunks, error: fetchError } = await query.limit(100);

    if (fetchError) {
      console.error("Error fetching chunks:", fetchError);
      throw new Error("Failed to fetch English chunks");
    }

    if (!englishChunks || englishChunks.length === 0) {
      return new Response(
        JSON.stringify({ message: "No chunks to translate", translated: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${englishChunks.length} English chunks to translate`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let translatedCount = 0;
    const errors: string[] = [];

    // Process in batches
    for (let i = 0; i < englishChunks.length; i += BATCH_SIZE) {
      const batch = englishChunks.slice(i, i + BATCH_SIZE);
      
      for (const chunk of batch) {
        try {
          // Check if Hebrew version already exists
          const { data: existing } = await supabaseAdmin
            .from("knowledge_chunks")
            .select("id")
            .eq("document_id", chunk.document_id)
            .eq("chunk_index", chunk.chunk_index)
            .eq("language", targetLanguage)
            .single();

          if (existing) {
            console.log(`Skipping chunk ${chunk.id} - Hebrew version exists`);
            continue;
          }

          // Build content to translate
          const contentToTranslate = [
            chunk.content,
            chunk.question ? `Question: ${chunk.question}` : "",
            chunk.answer ? `Answer: ${chunk.answer}` : ""
          ].filter(Boolean).join("\n\n");

          // Translate using Lovable AI
          const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                {
                  role: "system",
                  content: `You are a professional medical translator specializing in Traditional Chinese Medicine (TCM). 
Translate the following content from English to Hebrew.
Keep all medical/TCM terminology accurate. Preserve formatting.
For TCM terms, include both the Hebrew translation and the original English/Chinese/Pinyin in parentheses.
Return ONLY the translation, no explanations.`
                },
                {
                  role: "user",
                  content: contentToTranslate
                }
              ],
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Translation API error for chunk ${chunk.id}:`, errorText);
            errors.push(`Chunk ${chunk.id}: API error`);
            continue;
          }

          const aiResponse = await response.json();
          const translatedText = aiResponse.choices?.[0]?.message?.content || "";

          if (!translatedText) {
            errors.push(`Chunk ${chunk.id}: Empty translation`);
            continue;
          }

          // Parse translated content
          let translatedContent = translatedText;
          let translatedQuestion = null;
          let translatedAnswer = null;

          // Try to extract question/answer if they were in the original
          if (chunk.question) {
            const questionMatch = translatedText.match(/(?:שאלה|Question):\s*(.+?)(?=(?:תשובה|Answer):|$)/is);
            if (questionMatch) {
              translatedQuestion = questionMatch[1].trim();
            }
          }
          if (chunk.answer) {
            const answerMatch = translatedText.match(/(?:תשובה|Answer):\s*(.+)/is);
            if (answerMatch) {
              translatedAnswer = answerMatch[1].trim();
            }
          }

          // If we extracted Q&A, remove them from main content
          if (translatedQuestion || translatedAnswer) {
            translatedContent = translatedText
              .replace(/(?:שאלה|Question):\s*.+?(?=(?:תשובה|Answer):|$)/is, "")
              .replace(/(?:תשובה|Answer):\s*.+/is, "")
              .trim();
            if (!translatedContent) {
              translatedContent = translatedText; // Fallback to full text
            }
          }

          // Insert Hebrew version
          const { error: insertError } = await supabaseAdmin
            .from("knowledge_chunks")
            .insert({
              document_id: chunk.document_id,
              chunk_index: chunk.chunk_index,
              content: translatedContent,
              question: translatedQuestion || chunk.question, // Keep original if translation failed
              answer: translatedAnswer || chunk.answer,
              content_type: chunk.content_type,
              metadata: {
                ...chunk.metadata,
                source_language: "en",
                translated_from: chunk.id,
              },
              language: targetLanguage,
            });

          if (insertError) {
            console.error(`Error inserting translated chunk:`, insertError);
            errors.push(`Chunk ${chunk.id}: Insert error`);
            continue;
          }

          translatedCount++;
          console.log(`Translated chunk ${chunk.id} (${translatedCount}/${englishChunks.length})`);
        } catch (chunkError) {
          console.error(`Error processing chunk ${chunk.id}:`, chunkError);
          errors.push(`Chunk ${chunk.id}: ${chunkError instanceof Error ? chunkError.message : 'Unknown error'}`);
        }
      }

      // Small delay between batches to avoid rate limits
      if (i + BATCH_SIZE < englishChunks.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        translated: translatedCount,
        total: englishChunks.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Translation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

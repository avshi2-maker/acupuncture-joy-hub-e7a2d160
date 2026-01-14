import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TCM_SYSTEM_PROMPT = `You are a knowledgeable Traditional Chinese Medicine (TCM) clinical assistant. 
You help therapists during patient sessions by providing accurate, evidence-based information about:
- Acupuncture points, their locations, indications, and contraindications
- Herbal formulas and their compositions
- TCM patterns and differential diagnosis
- Treatment principles and protocols

Guidelines:
- Be concise but thorough
- Always cite sources when available
- Use proper TCM terminology with pinyin when relevant
- Highlight important safety considerations
- Format responses for easy scanning (use bullet points, headers)
- If uncertain, clearly state the limitation

You have access to a curated knowledge base of TCM literature. Base your answers primarily on the provided context.`;

// Helper: Detect if text is primarily Hebrew
function isHebrew(text: string): boolean {
  const hebrewPattern = /[\u0590-\u05FF]/;
  const hebrewChars = (text.match(/[\u0590-\u05FF]/g) || []).length;
  return hebrewPattern.test(text) && hebrewChars > text.length * 0.3;
}

// Stealth Translation: Translate Hebrew query to English for DB search
async function translateToEnglish(query: string, apiKey: string): Promise<string> {
  try {
    console.log('[ask-tcm-brain] Stealth translating Hebrew query to English...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a medical translator. Translate the following Hebrew medical query to English. Preserve medical terminology exactly. Return ONLY the English translation, nothing else.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      console.error('[ask-tcm-brain] Translation API error:', response.status);
      return query; // Return original on error
    }

    const data = await response.json();
    const translated = data.choices?.[0]?.message?.content?.trim() || query;
    console.log(`[ask-tcm-brain] Translated: "${query.slice(0, 50)}" -> "${translated.slice(0, 50)}"`);
    return translated;
  } catch (error) {
    console.error('[ask-tcm-brain] Translation failed:', error);
    return query;
  }
}

const EMBEDDING_MODEL = 'text-embedding-3-small';

/**
 * Generate embedding for query text using OpenAI (for hybrid search)
 */
async function generateQueryEmbedding(text: string, apiKey: string): Promise<number[] | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: text.substring(0, 8000),
      }),
    });

    if (!response.ok) {
      console.error('[ask-tcm-brain] Embedding API error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('[ask-tcm-brain] Embedding generation failed:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, patientId, language = 'en' } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[ask-tcm-brain] Query: "${query.slice(0, 100)}..." | PatientID: ${patientId || 'none'}`);
    
    // Get Lovable API key for translation
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    // STEALTH TRANSLATION: If Hebrew, translate to English for DB search
    const queryIsHebrew = isHebrew(query);
    let searchQuery = query;
    
    if (queryIsHebrew && LOVABLE_API_KEY) {
      searchQuery = await translateToEnglish(query, LOVABLE_API_KEY);
      console.log('Translated Query for Search:', searchQuery);
      console.log(`[ask-tcm-brain] Using translated query for search: "${searchQuery.slice(0, 50)}"`);
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get API keys
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Step 1: VECTOR SEARCH - Search ALL documents, NO FILTERS
    // Translation happens BEFORE this (line 133) - searchQuery is already English
    console.log(`[ask-tcm-brain] ✓ Translation confirmed - searching with: "${searchQuery}"`);
    
    let searchMethod = 'vector';
    let relevantChunks: any[] = [];
    
    // Generate embedding for the (translated) query - searches ALL indexed documents
    if (OPENAI_API_KEY) {
      console.log('[ask-tcm-brain] Generating embedding for FULL library vector search...');
      const queryEmbedding = await generateQueryEmbedding(searchQuery, OPENAI_API_KEY);
      
      if (queryEmbedding) {
        console.log('[ask-tcm-brain] Embedding ready - scanning ALL documents (no filters)...');
        
        // Direct vector similarity search - NO source/id restrictions
        const embeddingString = `[${queryEmbedding.join(',')}]`;
        
        const { data: vectorResults, error: vectorError } = await supabase
          .rpc('hybrid_search', {
            query_text: searchQuery,
            query_embedding: embeddingString,
            match_count: 15, // Increased to get more variety from all sources
            match_threshold: 0.03, // Very low threshold to capture all relevant docs
            language_filter: null // NO language restriction
            // NO metadata filters - searches EVERYTHING
          });
        
        if (vectorError) {
          console.error('[ask-tcm-brain] Vector search error:', vectorError);
        } else {
          relevantChunks = vectorResults || [];
          
          // PRIORITY BOOST + DIVERSITY (post-rank):
          // - Weighted score: if metadata.priority exists => score * 1.5
          // - Hard rule: tcm_points.csv / priority assets MUST rank before syllabus new.csv
          // - Diversity: keep at most 1 chunk per source to avoid “Entry #42” dominance

          const getSourceName = (c: any) =>
            String(c?.metadata?.source || c?.original_name || c?.file_name || '').trim();

          const getBaseScore = (c: any) => {
            if (typeof c?.combined_score === 'number') return c.combined_score;
            if (typeof c?.ferrari_score === 'number') return c.ferrari_score;
            if (typeof c?.vector_score === 'number') return c.vector_score;
            if (typeof c?.keyword_score === 'number') return c.keyword_score;
            return 0;
          };

          const hasPriorityFlag = (c: any) => c?.metadata?.priority !== undefined && c?.metadata?.priority !== null;

          const getSourceRank = (sourceLower: string, c: any) => {
            if (sourceLower.includes('tcm_points')) return 0;
            if (hasPriorityFlag(c) || c?.priority_score) return 1;
            if (sourceLower.includes('syllabus new') || sourceLower.includes('syllabus') || sourceLower.includes('new.csv')) return 3;
            return 2;
          };

          const getWeightedScore = (c: any) => {
            const base = getBaseScore(c);
            return hasPriorityFlag(c) ? base * 1.5 : base;
          };

          relevantChunks.sort((a, b) => {
            const sourceA = getSourceName(a).toLowerCase();
            const sourceB = getSourceName(b).toLowerCase();

            const rankA = getSourceRank(sourceA, a);
            const rankB = getSourceRank(sourceB, b);
            if (rankA !== rankB) return rankA - rankB;

            return getWeightedScore(b) - getWeightedScore(a);
          });

          // Diversity filter: keep only the best chunk per source
          const seenSources = new Set<string>();
          relevantChunks = (relevantChunks || []).filter((c) => {
            const key = getSourceName(c) || String(c?.document_id || c?.id || '');
            if (!key) return false;
            if (seenSources.has(key)) return false;
            seenSources.add(key);
            return true;
          });

          console.log(`[ask-tcm-brain] Vector search found ${relevantChunks.length} diverse chunks (post-rank)`);

          // Log sources for debugging
          const uniqueSources = [...new Set(relevantChunks.map(c => getSourceName(c)).filter(Boolean))];
          console.log(`[ask-tcm-brain] Sources (top): ${uniqueSources.slice(0, 8).join(', ')}${uniqueSources.length > 8 ? '...' : ''}`);
        }
      }
    }
    
    // Fallback to keyword search if vector search failed
    if (relevantChunks.length === 0) {
      console.log('[ask-tcm-brain] Fallback to keyword search (no filters)...');
      searchMethod = 'keyword (fallback)';
      
      const { data: keywordResults, error: keywordError } = await supabase.rpc('keyword_search', {
        query_text: searchQuery,
        match_count: 15,
        match_threshold: 0.10, // Lower threshold for broader results
        language_filter: null
      });
      
      if (keywordError) {
        console.error('[ask-tcm-brain] Keyword search error:', keywordError);
      }
      relevantChunks = keywordResults || [];
    }
    
    console.log(`[ask-tcm-brain] Found ${relevantChunks.length} relevant chunks (${searchMethod})`);

    // Step 3: Build context with TOKEN BUDGETING and DYNAMIC SELECTION
    const TOKEN_BUDGET_CHARS = 6000; // ~1,500 tokens
    const MIN_HIGH_CONFIDENCE_CHUNKS = 3; // Always include top 3
    const CLINICAL_STANDARD_THRESHOLD = 0.80; // ferrari_score threshold for chunks 4+
    
    const contextParts: string[] = [];
    const sources: Array<{ name: string; confidence: string; score?: number }> = [];
    let currentLength = 0;
    let chunksIncluded = 0;
    let chunksDropped = 0;
    let budgetReached = false;
    
    // Debug: Track all chunks with their status
    interface ChunkDebugInfo {
      index: number;
      sourceName: string;
      ferrariScore: number;
      keywordScore: number;
      questionBoost: boolean;
      included: boolean;
      reason: string;
    }
    const chunkDebugInfo: ChunkDebugInfo[] = [];
    
    for (let i = 0; i < relevantChunks.length; i++) {
      const chunk = relevantChunks[i];
      const sourceName = chunk.original_name || chunk.file_name;
      const chunkText = `---\nSource: ${sourceName}\n${chunk.content}\n`;
      const chunkLength = chunkText.length;
      
      // Detect question boost: if keyword_score is higher than base would suggest
      // The SQL boosts keyword_score by 1.5x when question matches
      // We approximate boost detection: if keyword_score > 0.25 and is high relative to vector
      const keywordScore = chunk.keyword_score || 0;
      const vectorScore = chunk.vector_score || 0;
      const questionBoost = keywordScore > 0.25 && keywordScore > vectorScore * 0.5;
      
      // Dynamic selection logic:
      // - Always include top 3 chunks (high confidence)
      // - Include chunks 4+ ONLY if ferrari_score >= 0.80 (clinical standard)
      // - Stop if we hit the token budget
      
      const isHighConfidence = i < MIN_HIGH_CONFIDENCE_CHUNKS;
      const isClinicalStandard = (chunk.ferrari_score || 0) >= CLINICAL_STANDARD_THRESHOLD;
      
      let included = false;
      let reason = '';
      
      // Token budget check first (with buffer for system prompt)
      if (currentLength + chunkLength > TOKEN_BUDGET_CHARS) {
        reason = `Budget exceeded (${currentLength}/${TOKEN_BUDGET_CHARS})`;
        budgetReached = true;
        console.log(`[ask-tcm-brain] Token budget reached at chunk ${i + 1}: ${currentLength}/${TOKEN_BUDGET_CHARS} chars`);
      } else if (!isHighConfidence && !isClinicalStandard) {
        // For chunks beyond top 3, require clinical standard quality
        reason = `Below threshold (${(chunk.ferrari_score || 0).toFixed(3)} < ${CLINICAL_STANDARD_THRESHOLD})`;
        chunksDropped++;
        console.log(`[ask-tcm-brain] Skipping chunk ${i + 1}: ferrari_score ${chunk.ferrari_score?.toFixed(3)} < ${CLINICAL_STANDARD_THRESHOLD}`);
      } else {
        // Include this chunk
        included = true;
        reason = isHighConfidence ? 'Top 3 (High Confidence)' : 'Clinical Standard';
        contextParts.push(chunkText);
        currentLength += chunkLength;
        chunksIncluded++;
        
        if (!sources.find(s => s.name === sourceName)) {
          sources.push({
            name: sourceName,
            confidence: chunk.confidence || 'medium',
            score: chunk.ferrari_score || chunk.combined_score || chunk.keyword_score
          });
        }
      }
      
      chunkDebugInfo.push({
        index: i + 1,
        sourceName: sourceName.slice(0, 30),
        ferrariScore: chunk.ferrari_score || 0,
        keywordScore: keywordScore,
        questionBoost,
        included,
        reason
      });
      
      if (budgetReached) break;
    }
    
    console.log(`[ask-tcm-brain] Context built: ${chunksIncluded} chunks, ${currentLength} chars (~${Math.round(currentLength / 4)} tokens)`);
    console.log(`[ask-tcm-brain] Dropped ${chunksDropped} chunks due to low ferrari_score`);

    // Build debug metadata for frontend
    const debugMetadata = {
      tokenBudget: {
        used: currentLength,
        max: TOKEN_BUDGET_CHARS,
        percentage: Math.round((currentLength / TOKEN_BUDGET_CHARS) * 100)
      },
      chunks: {
        found: relevantChunks.length,
        included: chunksIncluded,
        dropped: chunksDropped,
        budgetReached
      },
      topChunks: chunkDebugInfo.slice(0, 8), // Send first 8 for debugging
      thresholds: {
        clinicalStandard: CLINICAL_STANDARD_THRESHOLD,
        minHighConfidence: MIN_HIGH_CONFIDENCE_CHUNKS
      }
    };

    const contextString = contextParts.length > 0 
      ? `\n\nRelevant Knowledge Base Context (${searchMethod} search, ${chunksIncluded} sources):\n${contextParts.join('\n')}`
      : '\n\nNo specific context found in knowledge base. Answer based on general TCM knowledge.';

    // Step 4: Call Gemini API directly for response generation with streaming
    console.log('[ask-tcm-brain] Calling Gemini 2.0 Flash for response...');
    
    // Build system prompt with language instruction
    let systemPrompt = TCM_SYSTEM_PROMPT;
    if (queryIsHebrew) {
      systemPrompt += `\n\nIMPORTANT: The user asked in Hebrew. You MUST respond in Hebrew. Use the English clinical context provided to formulate your answer, but deliver it entirely in Hebrew.`;
    }

    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUser Question: ${query}${contextString}` }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.', sources }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('[ask-tcm-brain] Gemini API error:', aiResponse.status, errorText);
      throw new Error(`Gemini API error: ${aiResponse.status}`);
    }

    // Transform Gemini SSE format to our expected format
    const originalBody = aiResponse.body!;
    const reader = originalBody.getReader();
    const decoder = new TextDecoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        // First, send sources, search metadata, and debug info as a custom event
        const metadataEvent = `data: ${JSON.stringify({ 
          sources,
          searchMethod,
          chunksFound: relevantChunks.length,
          debug: debugMetadata,
          // NEW: Include translation info for UI debugging
          originalQuery: query,
          translatedQuery: queryIsHebrew ? searchQuery : null,
          queryLanguage: queryIsHebrew ? 'he' : 'en'
        })}\n\n`;
        controller.enqueue(new TextEncoder().encode(metadataEvent));
      },
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        
        // Parse Gemini SSE and extract text
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                const text = data.candidates[0].content.parts[0].text;
                // Send as OpenAI-compatible format for frontend
                const openAIFormat = {
                  choices: [{ delta: { content: text } }]
                };
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(openAIFormat)}\n\n`));
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      },
      cancel() {
        reader.cancel();
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('[ask-tcm-brain] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        sources: []
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

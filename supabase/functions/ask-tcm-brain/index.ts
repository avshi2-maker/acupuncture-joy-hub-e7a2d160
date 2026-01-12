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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Generate embedding for the query using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Step 2: Search knowledge base using keyword search (fallback without embedding)
    console.log('[ask-tcm-brain] Searching knowledge base...');
    
    const { data: searchResults, error: searchError } = await supabase.rpc('keyword_search', {
      query_text: query,
      match_count: 8,
      match_threshold: 0.15,
      language_filter: null
    });

    if (searchError) {
      console.error('[ask-tcm-brain] Search error:', searchError);
    }

    const relevantChunks = searchResults || [];
    console.log(`[ask-tcm-brain] Found ${relevantChunks.length} relevant chunks`);

    // Step 3: Build context from search results
    const contextParts: string[] = [];
    const sources: Array<{ name: string; confidence: string }> = [];

    for (const chunk of relevantChunks.slice(0, 6)) {
      contextParts.push(`---\nSource: ${chunk.original_name || chunk.file_name}\n${chunk.content}\n`);
      if (!sources.find(s => s.name === (chunk.original_name || chunk.file_name))) {
        sources.push({
          name: chunk.original_name || chunk.file_name,
          confidence: chunk.confidence || 'medium'
        });
      }
    }

    const contextString = contextParts.length > 0 
      ? `\n\nRelevant Knowledge Base Context:\n${contextParts.join('\n')}`
      : '\n\nNo specific context found in knowledge base. Answer based on general TCM knowledge.';

    // Step 4: Call Lovable AI (Gemini) for response generation with streaming
    console.log('[ask-tcm-brain] Calling Lovable AI for response...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: TCM_SYSTEM_PROMPT },
          { role: 'user', content: `${query}${contextString}` }
        ],
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.', sources }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds to continue.', sources }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('[ask-tcm-brain] AI error:', aiResponse.status, errorText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    // Create a transform stream to inject sources at the end
    const originalBody = aiResponse.body!;
    const reader = originalBody.getReader();
    
    const stream = new ReadableStream({
      async start(controller) {
        // First, send sources as a custom event
        const sourcesEvent = `data: ${JSON.stringify({ sources })}\n\n`;
        controller.enqueue(new TextEncoder().encode(sourcesEvent));
      },
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        controller.enqueue(value);
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

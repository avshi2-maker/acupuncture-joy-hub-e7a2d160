import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TCM_RAG_SYSTEM_PROMPT = `You are Dr. Sapir's TCM Knowledge Assistant, powered EXCLUSIVELY by proprietary materials from Dr. Roni Sapir's clinical knowledge base.

CRITICAL RULES:
1. You MUST ONLY answer using the provided context from Dr. Sapir's materials
2. If the context doesn't contain relevant information, say: "I don't have information about this in Dr. Sapir's proprietary knowledge base."
3. ALWAYS cite sources using [Source: filename, entry #X] format
4. NEVER make up information or use general knowledge
5. Respond in the same language as the user's question

When answering:
- Quote or paraphrase directly from the provided context
- Include specific acupoints, formulas, or clinical notes when available
- Mention safety considerations if present in the source material
- Be concise but thorough`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { query, messages } = await req.json();
    const searchQuery = query || messages?.[messages.length - 1]?.content || '';

    console.log('RAG Query:', searchQuery);

    // Search for relevant chunks using full-text search
    const { data: chunks, error: searchError } = await supabaseClient
      .from('knowledge_chunks')
      .select(`
        id,
        content,
        question,
        answer,
        chunk_index,
        metadata,
        document:knowledge_documents(file_name, original_name, category)
      `)
      .textSearch('content', searchQuery.split(' ').slice(0, 5).join(' | '), {
        type: 'websearch',
        config: 'english'
      })
      .limit(10);

    if (searchError) {
      console.error('Search error:', searchError);
    }

    // Build context from retrieved chunks
    let context = '';
    const sources: Array<{ fileName: string; chunkIndex: number; preview: string }> = [];

    if (chunks && chunks.length > 0) {
      context = chunks.map((chunk, i) => {
        const doc = chunk.document as any;
        const fileName = doc?.original_name || doc?.file_name || 'Unknown';
        sources.push({
          fileName,
          chunkIndex: chunk.chunk_index,
          preview: (chunk.question || chunk.content).substring(0, 100)
        });
        
        if (chunk.question && chunk.answer) {
          return `[Source: ${fileName}, Entry #${chunk.chunk_index}]
Q: ${chunk.question}
A: ${chunk.answer}`;
        }
        return `[Source: ${fileName}, Entry #${chunk.chunk_index}]
${chunk.content}`;
      }).join('\n\n---\n\n');
    }

    console.log(`Found ${chunks?.length || 0} relevant chunks`);

    // Build messages for AI
    const systemMessage = context 
      ? `${TCM_RAG_SYSTEM_PROMPT}\n\n=== CONTEXT FROM DR. SAPIR'S KNOWLEDGE BASE ===\n\n${context}\n\n=== END CONTEXT ===`
      : `${TCM_RAG_SYSTEM_PROMPT}\n\nNOTE: No relevant entries found in the knowledge base for this query.`;

    const chatMessages = [
      { role: 'system', content: systemMessage },
      ...(messages || [{ role: 'user', content: query }])
    ];

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: chatMessages,
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      throw new Error('AI service error');
    }

    const aiData = await aiResponse.json();
    const responseContent = aiData.choices?.[0]?.message?.content || 'No response generated';

    return new Response(JSON.stringify({
      response: responseContent,
      sources: sources,
      chunksFound: chunks?.length || 0,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('RAG chat error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

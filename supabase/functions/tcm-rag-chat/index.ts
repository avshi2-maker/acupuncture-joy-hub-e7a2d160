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

const EXTERNAL_AI_SYSTEM_PROMPT = `You are a general TCM (Traditional Chinese Medicine) knowledge assistant.

IMPORTANT DISCLAIMER - INCLUDE THIS IN EVERY RESPONSE:
⚠️ This response is from EXTERNAL AI and is NOT from Dr. Roni Sapir's verified clinical materials.
The therapist has accepted liability for using this external information.

When answering:
- Provide helpful TCM information based on general knowledge
- Include appropriate medical disclaimers
- Recommend consulting Dr. Sapir's verified materials for clinical decisions
- Respond in the same language as the user's question`;

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

    const { query, messages, useExternalAI } = await req.json();
    const searchQuery = query || messages?.[messages.length - 1]?.content || '';
    const searchTerms = searchQuery.split(' ').slice(0, 5).join(' | ');

    console.log('RAG Query:', searchQuery);
    console.log('Search terms:', searchTerms);
    console.log('Using external AI:', useExternalAI || false);

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
        document:knowledge_documents(id, file_name, original_name, category)
      `)
      .textSearch('content', searchTerms, {
        type: 'websearch',
        config: 'english'
      })
      .limit(15);

    if (searchError) {
      console.error('Search error:', searchError);
    }

    // Build context from retrieved chunks
    let context = '';
    const sources: Array<{ fileName: string; chunkIndex: number; preview: string; category: string; documentId: string }> = [];
    const chunksMatched: Array<{ id: string; documentId: string; chunkIndex: number; contentPreview: string }> = [];

    if (chunks && chunks.length > 0) {
      context = chunks.map((chunk, i) => {
        const doc = chunk.document as any;
        const fileName = doc?.original_name || doc?.file_name || 'Unknown';
        const category = doc?.category || 'general';
        const documentId = doc?.id || '';
        
        sources.push({
          fileName,
          chunkIndex: chunk.chunk_index,
          preview: (chunk.question || chunk.content).substring(0, 100),
          category,
          documentId
        });
        
        chunksMatched.push({
          id: chunk.id,
          documentId,
          chunkIndex: chunk.chunk_index,
          contentPreview: chunk.content.substring(0, 200)
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

    console.log(`Found ${chunks?.length || 0} relevant chunks from ${new Set(sources.map(s => s.fileName)).size} unique documents`);

    // Build messages for AI
    let systemMessage: string;
    
    if (useExternalAI) {
      // Using external AI - no RAG context, use general knowledge
      systemMessage = EXTERNAL_AI_SYSTEM_PROMPT;
      console.log('Using external AI mode - no RAG context');
    } else if (context) {
      systemMessage = `${TCM_RAG_SYSTEM_PROMPT}\n\n=== CONTEXT FROM DR. SAPIR'S KNOWLEDGE BASE ===\n\n${context}\n\n=== END CONTEXT ===`;
    } else {
      systemMessage = `${TCM_RAG_SYSTEM_PROMPT}\n\nNOTE: No relevant entries found in the knowledge base for this query.`;
    }

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

    // Log the query for audit trail (use service role for insert)
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: logError } = await serviceClient
      .from('rag_query_logs')
      .insert({
        user_id: user.id,
        query_text: searchQuery,
        search_terms: searchTerms,
        chunks_found: chunks?.length || 0,
        chunks_matched: chunksMatched,
        sources_used: useExternalAI ? [{ type: 'external_ai', liability_waived: true }] : sources.map(s => ({ fileName: s.fileName, category: s.category, chunkIndex: s.chunkIndex })),
        response_preview: responseContent.substring(0, 500),
        ai_model: useExternalAI ? 'google/gemini-2.5-flash (external)' : 'google/gemini-2.5-flash'
      });

    if (logError) {
      console.error('Failed to log query:', logError);
    } else {
      console.log('Query logged for audit trail');
    }

    // Get unique documents used
    const uniqueDocuments = [...new Set(sources.map(s => s.fileName))];

    return new Response(JSON.stringify({
      response: responseContent,
      sources: useExternalAI ? [] : sources,
      chunksFound: useExternalAI ? 0 : (chunks?.length || 0),
      documentsSearched: useExternalAI ? 0 : uniqueDocuments.length,
      searchTermsUsed: searchTerms,
      auditLogged: !logError,
      isExternal: useExternalAI || false,
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
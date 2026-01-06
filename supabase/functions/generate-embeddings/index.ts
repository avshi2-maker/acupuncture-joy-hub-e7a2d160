import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const EMBEDDING_MODEL = 'text-embedding-3-small';
const BATCH_SIZE = 50;

interface EmbeddingRequest {
  batchSize?: number;
  forceRegenerate?: boolean;
  documentId?: string;
}

/**
 * Generate embedding for a single text using OpenAI
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text.substring(0, 8000), // Truncate to avoid token limits
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI embedding error:', error);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * Generate embeddings for a batch of texts
 */
async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts.map(t => t.substring(0, 8000)),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI batch embedding error:', error);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data.map((item: any) => item.embedding);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body: EmbeddingRequest = await req.json().catch(() => ({}));
    const batchSize = body.batchSize || BATCH_SIZE;
    const forceRegenerate = body.forceRegenerate || false;
    const documentId = body.documentId;

    console.log(`Starting embedding generation (batch: ${batchSize}, force: ${forceRegenerate})`);

    // Build query for chunks that need embeddings
    let query = supabase
      .from('knowledge_chunks')
      .select('id, content, question, answer, document_id')
      .order('created_at', { ascending: true });

    // Filter by document if specified
    if (documentId) {
      query = query.eq('document_id', documentId);
    }

    // Only get chunks without embeddings unless forcing regeneration
    if (!forceRegenerate) {
      query = query.is('embedding', null);
    }

    query = query.limit(batchSize);

    const { data: chunks, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching chunks:', fetchError);
      throw new Error(`Database error: ${fetchError.message}`);
    }

    if (!chunks || chunks.length === 0) {
      console.log('No chunks need embedding generation');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No chunks need embedding generation',
          processed: 0,
          remaining: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${chunks.length} chunks for embedding generation`);

    // Prepare texts for embedding (combine content with Q&A if available)
    // Filter out chunks with empty content
    const validChunks = chunks.filter(chunk => {
      const text = (chunk.content || '').trim();
      const question = (chunk.question || '').trim();
      const answer = (chunk.answer || '').trim();
      return text.length > 0 || question.length > 0 || answer.length > 0;
    });

    if (validChunks.length === 0) {
      console.log('No valid chunks with content to embed');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No valid chunks with content to embed',
          processed: 0,
          skipped: chunks.length,
          remaining: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const textsToEmbed = validChunks.map(chunk => {
      let text = chunk.content || '';
      if (chunk.question) text += `\n\nQuestion: ${chunk.question}`;
      if (chunk.answer) text += `\nAnswer: ${chunk.answer}`;
      return text.trim();
    });

    console.log(`Processing ${validChunks.length} valid chunks (skipped ${chunks.length - validChunks.length} empty)`);

    // Generate embeddings in batches
    const embeddings = await generateBatchEmbeddings(textsToEmbed);

    console.log(`Generated ${embeddings.length} embeddings`);

    // Update chunks with embeddings
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < validChunks.length; i++) {
      const chunk = validChunks[i];
      const embedding = embeddings[i];

      // Convert to pgvector format (array string)
      const embeddingString = `[${embedding.join(',')}]`;

      const { error: updateError } = await supabase
        .from('knowledge_chunks')
        .update({ embedding: embeddingString })
        .eq('id', chunk.id);

      if (updateError) {
        console.error(`Error updating chunk ${chunk.id}:`, updateError);
        errorCount++;
      } else {
        successCount++;
      }
    }

    // Count remaining chunks without embeddings
    const { count: remainingCount, error: countError } = await supabase
      .from('knowledge_chunks')
      .select('id', { count: 'exact', head: true })
      .is('embedding', null);

    console.log(`Embedding generation complete: ${successCount} success, ${errorCount} errors, ${remainingCount || 0} remaining`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${chunks.length} chunks`,
        processed: successCount,
        errors: errorCount,
        remaining: remainingCount || 0,
        batchSize,
        model: EMBEDDING_MODEL
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-embeddings:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

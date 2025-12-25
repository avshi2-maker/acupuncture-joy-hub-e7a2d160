import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple hash function for file content
async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verify user
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { documents } = await req.json();

    if (!documents || !Array.isArray(documents)) {
      return new Response(JSON.stringify({ error: 'Invalid documents array' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing ${documents.length} documents`);

    const results = [];

    for (const doc of documents) {
      try {
        const { fileName, category, language, content, rows } = doc;

        if (!fileName || !content || !rows) {
          results.push({ fileName, success: false, error: 'Missing required fields' });
          continue;
        }

        // Generate hash
        const fileHash = await hashContent(JSON.stringify(content));

        // Check if already exists
        const { data: existing } = await supabaseClient
          .from('knowledge_documents')
          .select('id')
          .eq('file_hash', fileHash)
          .maybeSingle();

        if (existing) {
          results.push({ fileName, success: false, error: 'Document already indexed' });
          continue;
        }

        // Create document record
        const { data: newDoc, error: docError } = await supabaseClient
          .from('knowledge_documents')
          .insert({
            file_name: fileName.replace(/[^a-zA-Z0-9._-]/g, '_'),
            original_name: fileName,
            file_hash: fileHash,
            file_size: JSON.stringify(content).length,
            row_count: rows.length,
            category: category || 'general',
            language: language || 'en',
            status: 'indexing',
            uploaded_by: user.id,
          })
          .select()
          .single();

        if (docError) {
          console.error('Document insert error:', docError);
          results.push({ fileName, success: false, error: docError.message });
          continue;
        }

        // Create chunks from rows
        const chunks = rows.map((row: any, index: number) => {
          // Handle different row formats
          let question = '';
          let answer = '';
          let content = '';

          if (row.Question && row.Answer) {
            question = row.Question;
            answer = row.Answer;
            content = `Q: ${row.Question}\nA: ${row.Answer}`;
          } else if (row.patient_question && row.clinic_answer) {
            question = row.patient_question;
            answer = row.clinic_answer;
            content = `Q: ${row.patient_question}\nA: ${row.clinic_answer}`;
          } else if (row.Question_Therapist && row.Answer_Therapist) {
            question = row.Question_Therapist;
            answer = row.Answer_Therapist;
            content = `Q: ${row.Question_Therapist}\nA: ${row.Answer_Therapist}`;
          } else if (row.Clinical_Description) {
            content = row.Clinical_Description;
            if (row['Clinical Q&A – Question'] && row['Clinical Q&A – Answer']) {
              question = row['Clinical Q&A – Question'];
              answer = row['Clinical Q&A – Answer'];
            }
          } else {
            // Generic: join all values
            content = Object.values(row).filter(Boolean).join(' | ');
          }

          return {
            document_id: newDoc.id,
            chunk_index: index + 1,
            content: content.substring(0, 10000), // Limit content size
            content_type: question ? 'qa' : 'text',
            question: question?.substring(0, 2000) || null,
            answer: answer?.substring(0, 5000) || null,
            metadata: row,
          };
        });

        // Insert chunks in batches
        const batchSize = 100;
        for (let i = 0; i < chunks.length; i += batchSize) {
          const batch = chunks.slice(i, i + batchSize);
          const { error: chunkError } = await supabaseClient
            .from('knowledge_chunks')
            .insert(batch);

          if (chunkError) {
            console.error('Chunk insert error:', chunkError);
          }
        }

        // Update document status
        await supabaseClient
          .from('knowledge_documents')
          .update({ status: 'indexed', indexed_at: new Date().toISOString() })
          .eq('id', newDoc.id);

        results.push({ fileName, success: true, chunksCreated: chunks.length });
        console.log(`Indexed ${fileName}: ${chunks.length} chunks`);

      } catch (error) {
        console.error('Document processing error:', error);
        results.push({ fileName: doc.fileName, success: false, error: String(error) });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      results,
      totalProcessed: documents.length,
      successCount: results.filter(r => r.success).length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Import error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { decode as base64Decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface GoldenKnowledgeEntry {
  source_file: string;
  section_title?: string;
  hierarchy_path?: string;
  content: string;
  page_number?: number;
  image_ref?: string;
  metadata?: Record<string, any>;
}

interface ImportRequest {
  entries: GoldenKnowledgeEntry[];
  images?: { [filename: string]: string }; // base64 encoded images
  documentName?: string;
  category?: string;
  language?: string;
  clearExisting?: boolean;
}

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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify user is admin
    const userClient = createClient(
      SUPABASE_URL,
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

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: ImportRequest = await req.json();
    const { entries, images, documentName, category, language, clearExisting } = body;

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return new Response(JSON.stringify({ error: 'No entries provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Starting Golden Knowledge import: ${entries.length} entries, ${Object.keys(images || {}).length} images`);

    // Upload images to storage first
    const imageUrls: { [ref: string]: string } = {};
    if (images && Object.keys(images).length > 0) {
      console.log('Uploading images to storage...');
      
      for (const [filename, base64Data] of Object.entries(images)) {
        try {
          // Decode base64 to bytes
          const imageBytes = base64Decode(base64Data);
          
          // Determine content type
          let contentType = 'image/png';
          if (filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg')) {
            contentType = 'image/jpeg';
          } else if (filename.toLowerCase().endsWith('.webp')) {
            contentType = 'image/webp';
          }
          
          // Upload to storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('tcm-tongue-images')
            .upload(filename, imageBytes, {
              contentType,
              upsert: true,
            });
          
          if (uploadError) {
            console.error(`Failed to upload ${filename}:`, uploadError);
            continue;
          }
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('tcm-tongue-images')
            .getPublicUrl(filename);
          
          imageUrls[filename] = urlData.publicUrl;
          console.log(`Uploaded ${filename} -> ${urlData.publicUrl}`);
        } catch (imgError) {
          console.error(`Error processing image ${filename}:`, imgError);
        }
      }
    }

    // Create document record
    const docName = documentName || 'TCM_GOLDEN_BIBLE';
    const fileHash = await hashContent(JSON.stringify(entries));
    
    // Check for existing document
    if (clearExisting) {
      // Delete existing chunks for this document
      const { data: existingDoc } = await supabase
        .from('knowledge_documents')
        .select('id')
        .eq('original_name', docName)
        .maybeSingle();
      
      if (existingDoc) {
        await supabase.from('knowledge_chunks').delete().eq('document_id', existingDoc.id);
        await supabase.from('knowledge_documents').delete().eq('id', existingDoc.id);
        console.log('Cleared existing document and chunks');
      }
    }

    const { data: newDoc, error: docError } = await supabase
      .from('knowledge_documents')
      .insert({
        file_name: docName.replace(/[^a-zA-Z0-9._-]/g, '_'),
        original_name: docName,
        file_hash: fileHash,
        file_size: JSON.stringify(entries).length,
        row_count: entries.length,
        category: category || 'golden-knowledge',
        language: language || 'en',
        status: 'indexing',
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (docError) {
      console.error('Document insert error:', docError);
      return new Response(JSON.stringify({ error: docError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Created document: ${newDoc.id}`);

    // Process entries into chunks
    const chunks = entries.map((entry, index) => {
      let question = '';
      let answer = '';
      let contentType = 'text';
      
      // Parse content for Q&A patterns
      const qaMatch = entry.content.match(/Q:\s*(.+?)[\n\r]+A:\s*(.+)/s);
      if (qaMatch) {
        question = qaMatch[1].trim();
        answer = qaMatch[2].trim();
        contentType = 'qa';
      }
      
      // Build enhanced content with hierarchy
      let enhancedContent = '';
      if (entry.hierarchy_path) {
        enhancedContent += `[${entry.hierarchy_path}]\n`;
      }
      if (entry.section_title) {
        enhancedContent += `## ${entry.section_title}\n\n`;
      }
      enhancedContent += entry.content;
      
      // Resolve image URL if image_ref exists
      const imageUrl = entry.image_ref ? imageUrls[entry.image_ref] : null;
      
      return {
        document_id: newDoc.id,
        chunk_index: index + 1,
        content: enhancedContent.substring(0, 10000),
        content_type: contentType,
        question: question?.substring(0, 2000) || null,
        answer: answer?.substring(0, 5000) || null,
        image_ref: entry.image_ref || null,
        image_url: imageUrl,
        metadata: {
          source_file: entry.source_file,
          section_title: entry.section_title,
          hierarchy_path: entry.hierarchy_path,
          page_number: entry.page_number,
          ...(entry.metadata || {}),
        },
        language: language || 'en',
      };
    });

    // Insert chunks in batches
    const batchSize = 100;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const { error: chunkError } = await supabase
        .from('knowledge_chunks')
        .insert(batch);

      if (chunkError) {
        console.error(`Chunk insert error (batch ${i / batchSize + 1}):`, chunkError);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
      }
    }

    // Update document status
    await supabase
      .from('knowledge_documents')
      .update({
        status: 'indexed',
        indexed_at: new Date().toISOString(),
      })
      .eq('id', newDoc.id);

    // Trigger embedding generation asynchronously
    try {
      const embeddingUrl = `${SUPABASE_URL}/functions/v1/generate-embeddings`;
      fetch(embeddingUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: newDoc.id,
          batchSize: 50,
        }),
      }).catch(e => console.error('Embedding trigger error:', e));
    } catch (embedError) {
      console.error('Failed to trigger embeddings:', embedError);
    }

    console.log(`Golden Knowledge import complete: ${successCount} chunks created, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        documentId: newDoc.id,
        documentName: docName,
        chunksCreated: successCount,
        chunksErrored: errorCount,
        imagesUploaded: Object.keys(imageUrls).length,
        imageUrls,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in import-golden-knowledge:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

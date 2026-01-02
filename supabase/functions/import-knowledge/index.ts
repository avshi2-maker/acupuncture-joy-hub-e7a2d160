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

    // Keep each request small to avoid timeouts/crashes.
    // The UI batches requests, but we also enforce a hard limit server-side.
    if (documents.length > 2) {
      return new Response(JSON.stringify({
        error: 'Too many documents in one request. Please send max 2 documents per import.'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing ${documents.length} documents`);

    const results = [];

    for (const doc of documents) {
      try {
        const { fileName, category, language, rows, content } = doc;

        const effectiveRows = (Array.isArray(rows) ? rows : null) ?? (Array.isArray(content) ? content : null);

        if (!fileName || !effectiveRows) {
          results.push({ fileName, success: false, error: 'Missing required fields' });
          continue;
        }

        // Generate hash (based on rows only)
        const fileHash = await hashContent(JSON.stringify(effectiveRows));

        // Check if already exists
        const { data: existing } = await supabaseClient
          .from('knowledge_documents')
          .select('id, original_name, created_at, indexed_at, status, row_count')
          .eq('file_hash', fileHash)
          .maybeSingle();

        if (existing) {
          // Treat as success so the UI can show a clear, non-blocking status.
          results.push({
            fileName,
            success: true,
            alreadyIndexed: true,
            fileHash,
            existingDocument: existing,
          });
          continue;
        }

        // Create document record
        const { data: newDoc, error: docError } = await supabaseClient
          .from('knowledge_documents')
          .insert({
            file_name: fileName.replace(/[^a-zA-Z0-9._-]/g, '_'),
            original_name: fileName,
            file_hash: fileHash,
            file_size: JSON.stringify(effectiveRows).length,
            row_count: effectiveRows.length,
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
        const chunks = effectiveRows.map((row: any, index: number) => {
          // Handle different row formats
          let question = '';
          let answer = '';
          let content = '';
          let contentType = 'text';

          // TCM-CAF Format (asset_type, question, answer, category, tags)
          if (row.asset_type && row.question && row.answer) {
            question = row.question;
            answer = row.answer;
            const tags = row.tags || '';
            const assetType = row.asset_type;
            content = `[TCM-CAF Asset: ${assetType}]\nCategory: ${row.category || assetType}\nTags: ${tags}\nQ: ${question}\nA: ${answer}`;
            contentType = 'qa';
          }
          // Standard Q&A formats
          else if (row.Question && row.Answer) {
            question = row.Question;
            answer = row.Answer;
            content = `Q: ${row.Question}\nA: ${row.Answer}`;
            contentType = 'qa';
          } else if (row.patient_question && row.clinic_answer) {
            question = row.patient_question;
            answer = row.clinic_answer;
            content = `Q: ${row.patient_question}\nA: ${row.clinic_answer}`;
            contentType = 'qa';
          } else if (row.Question_Therapist && row.Answer_Therapist) {
            question = row.Question_Therapist;
            answer = row.Answer_Therapist;
            content = `Q: ${row.Question_Therapist}\nA: ${row.Answer_Therapist}`;
            contentType = 'qa';
          } else if (row.Clinical_Description) {
            content = row.Clinical_Description;
            if (row['Clinical Q&A – Question'] && row['Clinical Q&A – Answer']) {
              question = row['Clinical Q&A – Question'];
              answer = row['Clinical Q&A – Answer'];
              contentType = 'qa';
            }
          } else if (row.Question_Hebrew || row.Question_English) {
            // TCM Professional Training Syllabus format - bilingual Q&A
            const nameHe = row.Name_Hebrew || row['Name\\_Hebrew'] || '';
            const nameEn = row.Name_English || row['Name\\_English'] || '';
            const pinyin = row.Pinyin || '';
            const clinical = row.Clinical_Description || row['Clinical\\_Description'] || '';
            const points = row.Acupuncture_Points || row['Acupuncture\\_Points'] || '';
            const treatment = row.Treatment_Principle || row['Treatment\\_Principle'] || '';
            const qHe = row.Question_Hebrew || row['Question\\_Hebrew'] || '';
            const qEn = row.Question_English || row['Question\\_English'] || '';
            const categoryVal = row.Category || '';
            const bodySystem = row.Body_System || row['Body\\_System'] || '';
            
            // Create bilingual question
            question = qEn ? `${qEn}` : '';
            if (qHe) question += ` | ${qHe}`;
            
            // Create comprehensive answer
            answer = `${nameEn}${nameHe ? ` (${nameHe})` : ''}${pinyin ? ` - ${pinyin}` : ''}\n` +
              `Clinical: ${clinical}\n` +
              `Acupuncture Points: ${points}\n` +
              `Treatment Principle: ${treatment}`;
            
            content = `Category: ${categoryVal}\n` +
              `Name: ${nameEn}${nameHe ? ` (${nameHe})` : ''}${pinyin ? ` - ${pinyin}` : ''}\n` +
              `Clinical Description: ${clinical}\n` +
              `Acupuncture Points: ${points}\n` +
              `Treatment Principle: ${treatment}\n` +
              `Body System: ${bodySystem}\n` +
              `Q: ${question}\nA: ${answer}`;
            contentType = 'qa';
          } else if (row.Stage && row.Question) {
            // Patient Q&A format (Acupuncture_Patient_QA_Updated.xlsx)
            const stage = row.Stage || '';
            const questionText = row.Question || '';
            const notes = row.Notes || '';
            const treatmentSuggestions = row.Treatment_Suggestions || row['Treatment Suggestions'] || '';
            
            question = questionText;
            answer = `Stage: ${stage}\nNotes: ${notes}\nTreatment Suggestions: ${treatmentSuggestions}`;
            content = `Patient Q&A - ${stage}\nQ: ${questionText}\nNotes: ${notes}\nTreatment: ${treatmentSuggestions}`;
            contentType = 'qa';
          } else if (row.Category && row.Diet_Habit && (row.TCM_Perspective || row.Western_Perspective)) {
            // Diet & Nutrition Intake format
            const category = row.Category || '';
            const habit = row.Diet_Habit || '';
            const western = row.Western_Perspective || '';
            const tcm = row.TCM_Perspective || '';
            const calories = row.Estimated_Calories_Per_Day || '';
            
            question = `What are the health implications of "${habit}" (${category})?`;
            answer = `Western Perspective: ${western}\nTCM Perspective: ${tcm}${calories ? `\nEstimated Calories: ${calories}` : ''}`;
            content = `Diet & Nutrition: ${category}\nHabit: ${habit}\nWestern View: ${western}\nTCM View: ${tcm}${calories ? `\nCalories: ${calories}` : ''}`;
            contentType = 'qa';
          } else if (row.code && row.name_english && row.name_pinyin) {
            // Acupoints Master format (code, name_english, name_pinyin, category, location_note, function_note)
            const code = row.code || '';
            const nameEn = row.name_english || '';
            const pinyin = row.name_pinyin || '';
            const pointCategory = row.category || '';
            const location = row.location_note || '';
            const functions = row.function_note || '';
            
            question = `What is ${code} ${pinyin} (${nameEn}) acupuncture point?`;
            answer = `${code} - ${nameEn} (${pinyin})\nCategory: ${pointCategory}\nLocation: ${location}\nFunctions: ${functions}`;
            content = `Acupoint: ${code} ${nameEn} (${pinyin})\nCategory: ${pointCategory}\nLocation: ${location}\nFunctions/Indications: ${functions}`;
            contentType = 'acupoint';
          } else if (row.system && row.western_label && row.tcm_pattern && row.deep_thinking_note) {
            // CAF Master Studies format (comprehensive clinical framework)
            const system = row.system || '';
            const westernLabel = row.western_label || '';
            const tcmPattern = row.tcm_pattern || '';
            const keySymptoms = row.key_symptoms || '';
            const pulseTongue = row.pulse_tongue || '';
            const treatmentPrinciple = row.treatment_principle || '';
            const acupoints = row.acupoints || '';
            const pharmacopeia = row.pharmacopeia || '';
            const deepThinking = row.deep_thinking_note || '';
            
            question = `How do I treat ${westernLabel} with ${tcmPattern} pattern in TCM?`;
            answer = `**Western Condition:** ${westernLabel}\n**TCM Pattern:** ${tcmPattern}\n**System:** ${system}\n\n**Key Symptoms:** ${keySymptoms}\n**Pulse/Tongue:** ${pulseTongue}\n\n**Treatment Principle:** ${treatmentPrinciple}\n**Acupoints:** ${acupoints}\n**Formula:** ${pharmacopeia}\n\n**Clinical Insight (Deep Thinking):** ${deepThinking}`;
            content = `CAF Clinical Study: ${westernLabel} - ${tcmPattern}\nSystem: ${system}\nSymptoms: ${keySymptoms}\nPulse/Tongue: ${pulseTongue}\nPrinciple: ${treatmentPrinciple}\nPoints: ${acupoints}\nFormula: ${pharmacopeia}\nDeep Thinking: ${deepThinking}`;
            contentType = 'caf-study';
          } else if (row.Question_Assessment && row.TCM_Pattern_Diagnosis && row.CM_Dot_Numbers_Acupoints) {
            // Brain Health TCM format (pediatric/adult/geriatric cognitive health)
            const questionAssessment = row.Question_Assessment || '';
            const tcmPattern = row.TCM_Pattern_Diagnosis || '';
            const acupoints = row.CM_Dot_Numbers_Acupoints || '';
            const formula = row.Pharmacopeia_Formula || '';
            
            question = questionAssessment;
            answer = `**TCM Pattern:** ${tcmPattern}\n**Acupuncture Points:** ${acupoints}\n**Herbal Formula:** ${formula}`;
            content = `Brain Health TCM Assessment\nQ: ${questionAssessment}\nTCM Pattern: ${tcmPattern}\nAcupoints: ${acupoints}\nFormula: ${formula}`;
            contentType = 'brain-health';
          } else {
            // Generic: join all values
            content = Object.values(row).filter(Boolean).join(' | ');
          }

          return {
            document_id: newDoc.id,
            chunk_index: index + 1,
            content: content.substring(0, 10000), // Limit content size
            content_type: contentType,
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

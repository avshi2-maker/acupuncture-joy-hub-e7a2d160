import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Knowledge base files with their categories
const KNOWLEDGE_FILES: Record<string, { category: string; description: string }> = {
  // Diagnostic modules
  'four-examinations-qa.csv': { category: 'diagnostic', description: 'Four Examinations Q&A' },
  'pulse-diagnosis.csv': { category: 'diagnostic', description: 'Pulse Diagnosis' },
  'tongue-diagnosis.csv': { category: 'diagnostic', description: 'Tongue Diagnosis' },
  'tcm_pulse_tongue_diagnosis_qa.csv': { category: 'diagnostic', description: 'Pulse & Tongue Combined' },
  'pattern-differentiation-protocols.csv': { category: 'diagnostic', description: 'Pattern Differentiation' },
  'tcm-pattern-differentiation-100qa.csv': { category: 'diagnostic', description: 'Pattern Differentiation 100 Q&A' },
  'tcm_pattern_differentiation_enhanced.csv': { category: 'diagnostic', description: 'Pattern Differentiation Enhanced' },
  'nine-constitutions-qa.csv': { category: 'diagnostic', description: 'Nine Constitutions' },
  'dr-zanfu-syndromes-qa.csv': { category: 'diagnostic', description: 'Zang-Fu Syndromes' },
  'dr-zanfu-clinic-syndromes.csv': { category: 'diagnostic', description: 'Clinic Syndromes' },
  'diagnostics-professional.csv': { category: 'diagnostic', description: 'Professional Diagnostics' },
  'chief-complaints-tcm.csv': { category: 'diagnostic', description: 'Chief Complaints' },
  'clinical-scenarios-100.csv': { category: 'diagnostic', description: 'Clinical Scenarios' },
  
  // Constitutional modules
  'comprehensive_caf_studies.csv': { category: 'constitutional', description: 'CAF Studies' },
  'TCM_Western_Symptom_Translation_Guide.csv': { category: 'constitutional', description: 'Western Symptom Translation' },
  'TCM_Grief_Symptom_Tongue_Pulse_Mapping.csv': { category: 'constitutional', description: 'Grief Symptom Mapping' },
  
  // Specialty modules - Medical Conditions
  'brain-health-tcm.csv': { category: 'specialty', description: 'Brain Health' },
  'digestive-disorders.csv': { category: 'specialty', description: 'Digestive Disorders' },
  'gastric-conditions.csv': { category: 'specialty', description: 'Gastric Conditions' },
  'ibs-sibo-protocols.csv': { category: 'specialty', description: 'IBS/SIBO Protocols' },
  'liver-gallbladder-tcm.csv': { category: 'specialty', description: 'Liver & Gallbladder' },
  'womens-health-tcm.csv': { category: 'specialty', description: 'Women\'s Health' },
  'fertility-protocols.csv': { category: 'specialty', description: 'Fertility Protocols' },
  'pregnancy-trimester-guide.csv': { category: 'specialty', description: 'Pregnancy Guide' },
  'tcm-dermatology-comprehensive.csv': { category: 'specialty', description: 'Dermatology' },
  'TCM_Renovada_Skin_Renewal_100QA_CLEANED.csv': { category: 'specialty', description: 'Skin Renewal' },
  'tcm-skin-renewal-100qa.csv': { category: 'specialty', description: 'Skin Renewal Q&A' },
  'neuro-degenerative-tcm-100.csv': { category: 'specialty', description: 'Neurodegenerative' },
  'chronic-pain-management.csv': { category: 'specialty', description: 'Chronic Pain' },
  'musculoskeletal-orthopedic.csv': { category: 'specialty', description: 'MSK Orthopedic' },
  'msk-protocols.csv': { category: 'specialty', description: 'MSK Protocols' },
  'TCM_Oncology_Comprehensive_All_Ages.csv': { category: 'specialty', description: 'Oncology All Ages' },
  'tcm-oncology-comprehensive.csv': { category: 'specialty', description: 'Oncology Comprehensive' },
  'immune-resilience.csv': { category: 'specialty', description: 'Immune Resilience' },
  
  // Mental Health & Emotions
  'mental-health-tcm.csv': { category: 'mental_health', description: 'Mental Health TCM' },
  'TCM_Mindset_Mental_100_QA_Complete.csv': { category: 'mental_health', description: 'Mindset Mental' },
  'tcm-anger-qa.csv': { category: 'mental_health', description: 'Anger Q&A' },
  'tcm-fear-qa.csv': { category: 'mental_health', description: 'Fear Q&A' },
  'tcm-grief-qa.csv': { category: 'mental_health', description: 'Grief Q&A' },
  'TCM_Grief_Insomnia_Acupuncture_Points.csv': { category: 'mental_health', description: 'Grief Insomnia Points' },
  'tcm-trauma-qa.csv': { category: 'mental_health', description: 'Trauma Q&A' },
  'trauma_corrected.csv': { category: 'mental_health', description: 'Trauma Corrected' },
  'TCM_Trauma_Casualties_100_QA_Corrected.csv': { category: 'mental_health', description: 'Trauma Casualties' },
  'Profound_Crisis_QA_100_CLEANED.csv': { category: 'mental_health', description: 'Profound Crisis' },
  'tcm_stress_biofeedback_75qa.csv': { category: 'mental_health', description: 'Stress Biofeedback' },
  'work-stress-burnout.csv': { category: 'mental_health', description: 'Work Stress Burnout' },
  
  // Lifestyle & Nutrition
  'TCM_Diet_Nutrition_100_QA_Complete.csv': { category: 'nutrition', description: 'Diet & Nutrition 100 Q&A' },
  'diet-nutrition-intake.csv': { category: 'nutrition', description: 'Diet Nutrition Intake' },
  'sport-performance-recovery.csv': { category: 'lifestyle', description: 'Sport Performance' },
  'elderly-lifestyle-recommendations.csv': { category: 'lifestyle', description: 'Elderly Lifestyle' },
  'Elderly_Lifestyle_TCM_Enhanced.csv': { category: 'lifestyle', description: 'Elderly Lifestyle Enhanced' },
  'Extreme_Weather_Climate_TCM_100QA_CLEANED.csv': { category: 'lifestyle', description: 'Extreme Weather' },
  'extreme-weather-climate.csv': { category: 'lifestyle', description: 'Climate' },
  
  // Age-specific modules
  'tcm-newborn-qa.csv': { category: 'age_specific', description: 'Newborn Q&A' },
  'tcm-children-7-13-qa.csv': { category: 'age_specific', description: 'Children 7-13 Q&A' },
  'tcm_children_7-13_qa_enhanced.csv': { category: 'age_specific', description: 'Children Enhanced' },
  'TCM_Teenage_Mental_Health_Enhanced.csv': { category: 'age_specific', description: 'Teenage Mental Health' },
  'tcm-teenage-mental-health-qa.csv': { category: 'age_specific', description: 'Teenage Q&A' },
  'TCM_Adults_18_50_Comprehensive_CONDITIONS.csv': { category: 'age_specific', description: 'Adults 18-50 Conditions' },
  'tcm-adults-18-50-qa.csv': { category: 'age_specific', description: 'Adults 18-50 Q&A' },
  'age-prompts-adults-18-50.csv': { category: 'age_specific', description: 'Adults 18-50 Prompts' },
  'TCM_Adults_50_70_Comprehensive_CONDITIONS.csv': { category: 'age_specific', description: 'Adults 50-70 Conditions' },
  'age-prompts-adults-50-70.csv': { category: 'age_specific', description: 'Adults 50-70 Prompts' },
  'tcm-elderly-70-120-qa.csv': { category: 'age_specific', description: 'Elderly 70-120 Q&A' },
  'TCM_Clinic_70-120_100_Common_Conditions_Complete.csv': { category: 'age_specific', description: 'Elderly Conditions' },
  
  // Acupuncture & Points
  'acupoints_master.csv': { category: 'acupuncture', description: 'Acupoints Master' },
  'acupoint-reference-50.csv': { category: 'acupuncture', description: 'Acupoint Reference' },
  'acupuncture-body-parts-detailed.csv': { category: 'acupuncture', description: 'Body Parts Detailed' },
  'anatomical-views-master.csv': { category: 'acupuncture', description: 'Anatomical Views' },
  'point-coordinates.csv': { category: 'acupuncture', description: 'Point Coordinates' },
  'HT7_Shenmen_Needling_Technique_Complete.csv': { category: 'acupuncture', description: 'HT7 Shenmen Technique' },
  'Pediatric_Acupuncture_Points_Safety_Guide.csv': { category: 'acupuncture', description: 'Pediatric Safety Guide' },
  'energy-channels-100-qa.csv': { category: 'acupuncture', description: 'Energy Channels' },
  'vagus_nerve_100_qa.csv': { category: 'acupuncture', description: 'Vagus Nerve' },
  
  // Herbal Medicine
  'TCM_Herbal_Formulas_Comprehensive.csv': { category: 'herbal', description: 'Herbal Formulas' },
  
  // Treatment Planning
  'Treatment_Planning_Protocols_Professional_100plus.csv': { category: 'treatment', description: 'Treatment Protocols' },
  'retreat-assessment-50qa.csv': { category: 'treatment', description: 'Retreat Assessment' },
  'clinical-trials-template.csv': { category: 'treatment', description: 'Clinical Trials' },
  
  // Clinic Forms
  'clinic-allergies-intake-form.csv': { category: 'clinic', description: 'Allergies Intake' },
  'clinic-diet-nutrition-intake-form.csv': { category: 'clinic', description: 'Diet Intake Form' },
  'clinic-medications-supplements-intake.csv': { category: 'clinic', description: 'Medications Intake' },
  'clinic-pulse-diagnosis-reference.csv': { category: 'clinic', description: 'Pulse Reference' },
  
  // Q&A Collections
  'QA_Professional_Corrected_4Columns.csv': { category: 'qa', description: 'Professional Q&A' },
  'wellness_issue_enhanced_fixed.csv': { category: 'qa', description: 'Wellness Issues' },
};

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

function parseCSV(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map(line => parseCSVLine(line));
  
  return { headers, rows };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, files } = await req.json();
    
    if (action === 'list') {
      // Return list of available files with their indexing status
      const { data: indexed } = await supabaseClient
        .from('knowledge_documents')
        .select('file_name, status, row_count, indexed_at, category');
      
      const indexedMap = new Map(indexed?.map(d => [d.file_name, d]) || []);
      
      const fileList = Object.entries(KNOWLEDGE_FILES).map(([filename, info]) => ({
        filename,
        ...info,
        indexed: indexedMap.has(filename),
        indexedAt: indexedMap.get(filename)?.indexed_at,
        rowCount: indexedMap.get(filename)?.row_count,
        status: indexedMap.get(filename)?.status || 'not_indexed'
      }));
      
      return new Response(JSON.stringify({ 
        success: true, 
        files: fileList,
        totalFiles: fileList.length,
        indexedFiles: fileList.filter(f => f.indexed).length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (action === 'index') {
      const filesToIndex = files || Object.keys(KNOWLEDGE_FILES);
      const results: Array<{ filename: string; success: boolean; rowCount?: number; error?: string }> = [];
      
      for (const filename of filesToIndex) {
        try {
          const info = KNOWLEDGE_FILES[filename];
          if (!info) {
            results.push({ filename, success: false, error: 'Unknown file' });
            continue;
          }
          
          // Fetch file from public folder
          const publicUrl = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}/storage/v1/object/public/knowledge-assets/${filename}`;
          
          // Try fetching from the project's public folder first
          let content: string;
          try {
            // Fetch from public knowledge-assets in the project
            const response = await fetch(`https://hwwwioyrsbewptuwvrix.lovableproject.com/knowledge-assets/${filename}`);
            if (!response.ok) {
              throw new Error(`File not found: ${filename}`);
            }
            content = await response.text();
          } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Unknown error';
            results.push({ filename, success: false, error: `Could not fetch file: ${errorMessage}` });
            continue;
          }
          
          const fileHash = hashString(content);
          
          // Check if already indexed with same hash
          const { data: existing } = await supabaseClient
            .from('knowledge_documents')
            .select('id, file_hash')
            .eq('file_name', filename)
            .single();
          
          if (existing?.file_hash === fileHash) {
            results.push({ filename, success: true, rowCount: 0, error: 'Already indexed' });
            continue;
          }
          
          // Parse CSV
          const { headers, rows } = parseCSV(content);
          
          // Create or update document
          let documentId: string;
          if (existing) {
            await supabaseClient
              .from('knowledge_documents')
              .update({
                file_hash: fileHash,
                category: info.category,
                status: 'indexing',
                row_count: rows.length,
                updated_at: new Date().toISOString()
              })
              .eq('id', existing.id);
            documentId = existing.id;
            
            // Delete old chunks
            await supabaseClient
              .from('knowledge_chunks')
              .delete()
              .eq('document_id', documentId);
          } else {
            const { data: newDoc, error: createError } = await supabaseClient
              .from('knowledge_documents')
              .insert({
                file_name: filename,
                original_name: filename,
                file_hash: fileHash,
                category: info.category,
                status: 'indexing',
                row_count: rows.length,
                language: 'en'
              })
              .select('id')
              .single();
            
            if (createError) throw createError;
            documentId = newDoc.id;
          }
          
          // Create chunks from rows
          const chunks = rows.map((row, index) => {
            const rowData: Record<string, string> = {};
            headers.forEach((h, i) => {
              rowData[h] = row[i] || '';
            });
            
            // Determine question/answer format
            const questionCol = headers.find(h => 
              h.toLowerCase().includes('question') || 
              h.toLowerCase().includes('symptom') ||
              h.toLowerCase() === 'q'
            );
            const answerCol = headers.find(h => 
              h.toLowerCase().includes('answer') || 
              h.toLowerCase().includes('response') ||
              h.toLowerCase() === 'a'
            );
            
            return {
              document_id: documentId,
              chunk_index: index,
              content: Object.values(rowData).filter(v => v).join(' | '),
              question: questionCol ? rowData[questionCol] : null,
              answer: answerCol ? rowData[answerCol] : null,
              content_type: 'csv_row',
              language: 'en',
              metadata: { 
                headers, 
                row_data: rowData,
                source_file: filename,
                category: info.category
              }
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
              console.error(`Error inserting chunks for ${filename}:`, chunkError);
            }
          }
          
          // Mark as indexed
          await supabaseClient
            .from('knowledge_documents')
            .update({
              status: 'indexed',
              indexed_at: new Date().toISOString()
            })
            .eq('id', documentId);
          
          results.push({ filename, success: true, rowCount: rows.length });
          console.log(`Indexed ${filename}: ${rows.length} rows`);
          
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Error indexing ${filename}:`, error);
          results.push({ filename, success: false, error: errorMessage });
        }
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        results,
        totalIndexed: results.filter(r => r.success && (r.rowCount ?? 0) > 0).length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Bulk index error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

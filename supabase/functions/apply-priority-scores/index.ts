import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ============================================================================
// MASTER PRIORITY STRATEGY - Maps file patterns to priority scores
// ============================================================================
// Score 90-100: Clinical Authority (Syllabus, Core Protocols)
// Score 75-89:  High Value (Specialty Modules, Reference Texts)
// Score 50-74:  Standard (General Content)
// Score 25-49:  Supplementary (Support Materials)
// Score 0-24:   Low Priority (Deprecated/Archive)
// ============================================================================

const PRIORITY_STRATEGY: Array<{
  pattern: RegExp;
  score: number;
  label: string;
}> = [
  // ★ TIER 1: Clinical Authority (90-100) ★
  { pattern: /syllabus/i, score: 95, label: 'TCM Professional Syllabus' },
  { pattern: /zang.*fu.*syndromes/i, score: 95, label: 'Zang Fu Syndromes Core' },
  { pattern: /clinical.*protocol/i, score: 92, label: 'Clinical Protocols' },
  { pattern: /master.*reference/i, score: 90, label: 'Master Reference' },
  { pattern: /pharmacopeia/i, score: 90, label: 'TCM Pharmacopeia' },
  
  // ★ TIER 2: High Value Specialty (75-89) ★
  { pattern: /sport.*performance/i, score: 88, label: 'Sport Performance' },
  { pattern: /trauma.*treatment/i, score: 88, label: 'Trauma Treatment' },
  { pattern: /anxiety.*mental/i, score: 85, label: 'Mental Health Module' },
  { pattern: /elite.*lifestyle/i, score: 85, label: 'Elite Lifestyle' },
  { pattern: /longevity/i, score: 85, label: 'Longevity Module' },
  { pattern: /pattern.*differentiation/i, score: 82, label: 'Pattern Differentiation' },
  { pattern: /diet.*therapy/i, score: 80, label: 'Diet Therapy' },
  { pattern: /pulse.*diagnosis/i, score: 78, label: 'Pulse Diagnosis' },
  { pattern: /tongue.*diagnosis/i, score: 78, label: 'Tongue Diagnosis' },
  
  // ★ TIER 3: Standard Content (50-74) ★
  { pattern: /acupoint/i, score: 70, label: 'Acupoint Reference' },
  { pattern: /meridian/i, score: 70, label: 'Meridian Reference' },
  { pattern: /herbal.*formula/i, score: 68, label: 'Herbal Formulas' },
  { pattern: /condition/i, score: 65, label: 'Condition Guide' },
  { pattern: /treatment/i, score: 60, label: 'Treatment Guide' },
  { pattern: /faq/i, score: 55, label: 'FAQ Content' },
  
  // ★ TIER 4: Supplementary (25-49) ★
  { pattern: /example/i, score: 40, label: 'Example Content' },
  { pattern: /test/i, score: 30, label: 'Test Content' },
  { pattern: /sample/i, score: 30, label: 'Sample Content' },
];

/**
 * Get priority score for a filename based on strategy patterns
 */
function getPriorityScore(filename: string): { score: number; label: string } {
  for (const strategy of PRIORITY_STRATEGY) {
    if (strategy.pattern.test(filename)) {
      return { score: strategy.score, label: strategy.label };
    }
  }
  // Default score for unmatched files
  return { score: 50, label: 'Standard Content' };
}

interface ApplyPriorityRequest {
  documentId?: string;  // Apply to specific document
  dryRun?: boolean;     // Only report, don't update
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body: ApplyPriorityRequest = await req.json().catch(() => ({}));
    const { documentId, dryRun } = body;

    console.log(`Applying priority scores (dryRun: ${dryRun}, documentId: ${documentId || 'all'})`);

    // Get all documents (or specific one)
    let docsQuery = supabase
      .from('knowledge_documents')
      .select('id, file_name, original_name')
      .eq('status', 'indexed');

    if (documentId) {
      docsQuery = docsQuery.eq('id', documentId);
    }

    const { data: documents, error: docsError } = await docsQuery;

    if (docsError) {
      throw new Error(`Failed to fetch documents: ${docsError.message}`);
    }

    if (!documents || documents.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No documents found', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: Array<{
      document_id: string;
      filename: string;
      priority_score: number;
      priority_label: string;
      chunks_updated: number;
    }> = [];

    for (const doc of documents) {
      const filename = doc.original_name || doc.file_name || '';
      const { score, label } = getPriorityScore(filename);

      if (!dryRun) {
        // Update all chunks for this document with the priority score
        const { error: updateError, count } = await supabase
          .from('knowledge_chunks')
          .update({ priority_score: score })
          .eq('document_id', doc.id);

        if (updateError) {
          console.error(`Failed to update chunks for ${doc.id}:`, updateError);
          results.push({
            document_id: doc.id,
            filename,
            priority_score: score,
            priority_label: label,
            chunks_updated: 0
          });
        } else {
          // Get count of updated chunks
          const { count: chunkCount } = await supabase
            .from('knowledge_chunks')
            .select('id', { count: 'exact', head: true })
            .eq('document_id', doc.id);

          results.push({
            document_id: doc.id,
            filename,
            priority_score: score,
            priority_label: label,
            chunks_updated: chunkCount || 0
          });
        }
      } else {
        // Dry run - just count chunks
        const { count: chunkCount } = await supabase
          .from('knowledge_chunks')
          .select('id', { count: 'exact', head: true })
          .eq('document_id', doc.id);

        results.push({
          document_id: doc.id,
          filename,
          priority_score: score,
          priority_label: label,
          chunks_updated: chunkCount || 0
        });
      }
    }

    // Summary stats
    const totalChunks = results.reduce((sum, r) => sum + r.chunks_updated, 0);
    const tier1Count = results.filter(r => r.priority_score >= 90).length;
    const tier2Count = results.filter(r => r.priority_score >= 75 && r.priority_score < 90).length;
    const tier3Count = results.filter(r => r.priority_score >= 50 && r.priority_score < 75).length;

    console.log(`Priority scores ${dryRun ? 'would be applied' : 'applied'} to ${results.length} documents (${totalChunks} chunks)`);
    console.log(`Tier 1 (90+): ${tier1Count}, Tier 2 (75-89): ${tier2Count}, Tier 3 (50-74): ${tier3Count}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: dryRun ? 'Dry run complete' : 'Priority scores applied',
        documents_processed: results.length,
        chunks_updated: totalChunks,
        tier_distribution: {
          tier1_clinical_authority: tier1Count,
          tier2_high_value: tier2Count,
          tier3_standard: tier3Count
        },
        details: results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in apply-priority-scores:', error);
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Age group configuration with system prompts
const AGE_GROUP_PROMPTS: Record<string, { context: string; filePatterns: string[] }> = {
  newborn: {
    context: 'This is a newborn/infant patient (0-2 years). Treatment must be extremely gentle: minimal needling (often avoid), prefer tuina, moxa, herbal baths. Focus on supporting natural development. Reduce herb doses significantly (1/10-1/20 adult dose).',
    filePatterns: ['tcm-newborn', 'newborn'],
  },
  children: {
    context: 'This is a pediatric patient (3-12 years). Consider school stress, growth patterns, digestive development. Use gentler techniques and reduced dosages. Ask about screen time, sleep, concentration, and social factors.',
    filePatterns: ['tcm-children', 'children', 'pediatric'],
  },
  teenage: {
    context: 'This is a teenage patient (13-18 years). Consider academic pressure, hormonal changes, social/peer stress, identity development, and emotional regulation. Focus on Liver Qi stagnation, Heart-Kidney axis for anxiety, and sleep disruption from screen use. Be sensitive to mental health concerns including depression, anxiety, and exam stress.',
    filePatterns: ['tcm-teenage', 'teenage', 'mental-health'],
  },
  adults_18_50: {
    context: 'This is an adult patient (18-50 years). Consider work stress, lifestyle, fertility/cycles where relevant. Focus on Liver Qi stagnation patterns, digestive issues from irregular eating, and sleep disruption from modern lifestyle.',
    filePatterns: ['tcm-adults-18-50', 'adults_18_50'],
  },
  adults_50_70: {
    context: 'This is a middle-aged patient (50-70 years). Consider chronic disease history, medications, hormonal changes (menopause/andropause). Focus on Kidney Yin/Yang balance, joint health, cardiovascular patterns. Ask about medication interactions.',
    filePatterns: ['adults_50_70', 'adults-50-70'],
  },
  elderly: {
    context: 'This is an elderly patient (70+ years). Treatment must be gentle: shallow needling, fewer points (5-8 max), shorter retention. Reduce herb doses to 1/3-1/2 normal. Focus on quality of life, fall prevention, medication interactions. Coordinate with Western medical care.',
    filePatterns: ['tcm-elderly', 'elderly', 'elderly-lifestyle'],
  },
};

function getAgeGroupSystemPrompt(ageGroup: string): string {
  return AGE_GROUP_PROMPTS[ageGroup]?.context || '';
}

function getAgeGroupFilePatterns(ageGroup: string): string[] {
  return AGE_GROUP_PROMPTS[ageGroup]?.filePatterns || [];
}

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

    const { query, messages, useExternalAI, includeChunkDetails, ageGroup, patientContext } = await req.json();
    const searchQuery = query || messages?.[messages.length - 1]?.content || '';
    const searchTerms = searchQuery.split(' ').slice(0, 5).join(' | ');
    
    // Age group context for specialized knowledge
    const ageGroupContext = ageGroup ? getAgeGroupSystemPrompt(ageGroup) : '';

    console.log('=== RAG TRACE START ===');
    console.log('Query:', searchQuery);
    console.log('Search terms:', searchTerms);
    console.log('Age group:', ageGroup || 'not specified');
    console.log('Using external AI:', useExternalAI || false);
    console.log('Include chunk details:', includeChunkDetails || false);

    // Get age-specific file patterns for prioritized search
    const ageFilePatterns = ageGroup ? getAgeGroupFilePatterns(ageGroup) : [];
    
    // Priority 0: Age-specific knowledge (if age group provided)
    let ageSpecificChunks: any[] = [];
    let ageError: any = null;
    
    if (ageGroup && ageFilePatterns.length > 0) {
      const agePatternQuery = ageFilePatterns.map(p => `file_name.ilike.%${p}%`).join(',');
      const { data, error } = await supabaseClient
        .from('knowledge_chunks')
        .select(`
          id,
          content,
          question,
          answer,
          chunk_index,
          metadata,
          document:knowledge_documents!inner(id, file_name, original_name, category)
        `)
        .or(agePatternQuery, { referencedTable: 'document' })
        .textSearch('content', searchTerms, {
          type: 'websearch',
          config: 'english'
        })
        .limit(6);
      
      ageSpecificChunks = data || [];
      ageError = error;
      console.log(`Age-specific chunks (${ageGroup}): ${ageSpecificChunks.length}`);
    }

    // Search for relevant chunks using full-text search
    // Priority 1: Diagnostics file (should be used first in sessions)
    const { data: diagnosticsChunks, error: diagError } = await supabaseClient
      .from('knowledge_chunks')
      .select(`
        id,
        content,
        question,
        answer,
        chunk_index,
        metadata,
        document:knowledge_documents!inner(id, file_name, original_name, category)
      `)
      .ilike('document.file_name', '%Diagnostics_Professional%')
      .textSearch('content', searchTerms, {
        type: 'websearch',
        config: 'english'
      })
      .limit(5);

    // Priority 2: Pulse and Tongue diagnosis files
    const { data: pulseChunks, error: pulseError } = await supabaseClient
      .from('knowledge_chunks')
      .select(`
        id,
        content,
        question,
        answer,
        chunk_index,
        metadata,
        document:knowledge_documents!inner(id, file_name, original_name, category)
      `)
      .or('file_name.ilike.%pulse%,file_name.ilike.%tongue%', { referencedTable: 'document' })
      .textSearch('content', searchTerms, {
        type: 'websearch',
        config: 'english'
      })
      .limit(5);

    // Priority 3: Zang-Fu symptoms files
    const { data: zangfuChunks, error: zangfuError } = await supabaseClient
      .from('knowledge_chunks')
      .select(`
        id,
        content,
        question,
        answer,
        chunk_index,
        metadata,
        document:knowledge_documents!inner(id, file_name, original_name, category)
      `)
      .or('file_name.ilike.%zang%,file_name.ilike.%fu%,file_name.ilike.%organ%', { referencedTable: 'document' })
      .textSearch('content', searchTerms, {
        type: 'websearch',
        config: 'english'
      })
      .limit(4);

    // Priority 4: Acupuncture points knowledge
    const { data: acuChunks, error: acuError } = await supabaseClient
      .from('knowledge_chunks')
      .select(`
        id,
        content,
        question,
        answer,
        chunk_index,
        metadata,
        document:knowledge_documents!inner(id, file_name, original_name, category)
      `)
      .or('file_name.ilike.%acupuncture%,file_name.ilike.%point%,file_name.ilike.%meridian%', { referencedTable: 'document' })
      .textSearch('content', searchTerms, {
        type: 'websearch',
        config: 'english'
      })
      .limit(4);

    // Priority 5: QA Professional file (clinical Q&A)
    const { data: qaChunks, error: qaError } = await supabaseClient
      .from('knowledge_chunks')
      .select(`
        id,
        content,
        question,
        answer,
        chunk_index,
        metadata,
        document:knowledge_documents!inner(id, file_name, original_name, category)
      `)
      .ilike('document.file_name', '%QA_Professional%')
      .textSearch('content', searchTerms, {
        type: 'websearch',
        config: 'english'
      })
      .limit(4);

    // Priority 6: Treatment Planning Protocols
    const { data: treatmentChunks, error: treatmentError } = await supabaseClient
      .from('knowledge_chunks')
      .select(`
        id,
        content,
        question,
        answer,
        chunk_index,
        metadata,
        document:knowledge_documents!inner(id, file_name, original_name, category)
      `)
      .ilike('document.file_name', '%Treatment_Planning%')
      .textSearch('content', searchTerms, {
        type: 'websearch',
        config: 'english'
      })
      .limit(4);

    // Priority 7: CAF Master Studies (comprehensive clinical framework)
    const { data: cafChunks, error: cafError } = await supabaseClient
      .from('knowledge_chunks')
      .select(`
        id,
        content,
        question,
        answer,
        chunk_index,
        metadata,
        document:knowledge_documents!inner(id, file_name, original_name, category)
      `)
      .or('file_name.ilike.%caf%,file_name.ilike.%comprehensive%', { referencedTable: 'document' })
      .textSearch('content', searchTerms, {
        type: 'websearch',
        config: 'english'
      })
      .limit(5);

    // Priority 8: Vagus Nerve knowledge base
    const { data: vagusChunks, error: vagusError } = await supabaseClient
      .from('knowledge_chunks')
      .select(`
        id,
        content,
        question,
        answer,
        chunk_index,
        metadata,
        document:knowledge_documents!inner(id, file_name, original_name, category)
      `)
      .or('file_name.ilike.%vagus%,file_name.ilike.%vagal%,content_type.eq.vagus-nerve', { referencedTable: 'document' })
      .textSearch('content', searchTerms, {
        type: 'websearch',
        config: 'english'
      })
      .limit(5);
    
    console.log(`Vagus Nerve chunks: ${vagusChunks?.length || 0}`);

    // Priority 9: Neurodegenerative TCM knowledge (Parkinson's, Alzheimer's, Dementia, etc.)
    const hasNeuroTerms = ['parkinson', 'alzheimer', 'dementia', 'tremor', 'neurodegen', 'memory loss', 'cognitive', 'dopamine', 'basal ganglia', 'brain fog', 'rigidity', 'bradykinesia', 'freezing', 'gait', 'dyskinesia', 'apathy', 'hallucination', 'sundowning'].some(
      term => searchQuery.toLowerCase().includes(term)
    );
    
    let neuroChunks: any[] = [];
    if (hasNeuroTerms) {
      const { data: neuroData, error: neuroError } = await supabaseClient
        .from('knowledge_chunks')
        .select(`
          id,
          content,
          question,
          answer,
          chunk_index,
          metadata,
          document:knowledge_documents!inner(id, file_name, original_name, category)
        `)
        .or('file_name.ilike.%neuro%,file_name.ilike.%degenerative%,file_name.ilike.%parkinson%,file_name.ilike.%alzheimer%', { referencedTable: 'document' })
        .textSearch('content', searchTerms, {
          type: 'websearch',
          config: 'english'
        })
        .limit(8);
      
      neuroChunks = neuroData || [];
      console.log(`Neurodegenerative chunks: ${neuroChunks.length}`);
    }

    // Also query CAF Master Studies table directly for pattern matching
    let cafStudies: any[] = [];
    try {
      const searchWords = searchQuery.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2);
      const { data: cafData } = await supabaseClient
        .from('caf_master_studies')
        .select('*')
        .or(searchWords.map((w: string) => `western_label.ilike.%${w}%,tcm_pattern.ilike.%${w}%,key_symptoms.ilike.%${w}%,acupoints_display.ilike.%${w}%`).join(','))
        .limit(3);
      cafStudies = cafData || [];
      console.log(`CAF Studies direct match: ${cafStudies.length}`);
    } catch (cafStudyError) {
      console.error('CAF Study query error:', cafStudyError);
    }

    // Query Retreat Quiz Results for patient wellness assessment data
    let quizResults: any[] = [];
    try {
      const searchWords = searchQuery.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2);
      const hasRetreatTerms = ['retreat', 'quiz', 'wellness', 'assessment', 'burnout', 'stress', 'lifestyle'].some(
        term => searchQuery.toLowerCase().includes(term)
      );
      if (hasRetreatTerms) {
        const { data: quizData } = await supabaseClient
          .from('retreat_quiz_results')
          .select('*, patients(full_name)')
          .order('created_at', { ascending: false })
          .limit(5);
        quizResults = quizData || [];
        console.log(`Retreat Quiz Results: ${quizResults.length}`);
      }
    } catch (quizError) {
      console.error('Quiz Results query error:', quizError);
    }

    // Query Clinical Trials for evidence-based data
    let clinicalTrials: any[] = [];
    try {
      const searchWords = searchQuery.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2);
      const hasTrialTerms = ['study', 'trial', 'research', 'evidence', 'clinical', 'efficacy', 'outcome', 'nct'].some(
        term => searchQuery.toLowerCase().includes(term)
      );
      // Also search if condition/symptom is mentioned
      if (hasTrialTerms || searchWords.length > 0) {
        const { data: trialData } = await supabaseClient
          .from('clinical_trials')
          .select('*')
          .or(searchWords.map((w: string) => `condition.ilike.%${w}%,title.ilike.%${w}%,intervention.ilike.%${w}%,results_summary.ilike.%${w}%`).join(','))
          .order('sapir_verified', { ascending: false })
          .limit(5);
        clinicalTrials = trialData || [];
        console.log(`Clinical Trials matched: ${clinicalTrials.length}`);
      }
    } catch (trialError) {
      console.error('Clinical Trials query error:', trialError);
    }

    // Then get other relevant chunks
    const { data: otherChunks, error: searchError } = await supabaseClient
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
      .limit(8);

    // Fallback: If text search returns few results, try ilike search on key words
    let fallbackChunks: any[] = [];
    const searchWords = searchQuery.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
    const totalPriorityChunks = (neuroChunks?.length || 0) + (cafChunks?.length || 0) + 
      (vagusChunks?.length || 0) + (ageSpecificChunks?.length || 0) + 
      (diagnosticsChunks?.length || 0) + (pulseChunks?.length || 0) + 
      (zangfuChunks?.length || 0) + (acuChunks?.length || 0) + 
      (qaChunks?.length || 0) + (treatmentChunks?.length || 0) + 
      (otherChunks?.length || 0);

    if (totalPriorityChunks < 3 && searchWords.length > 0) {
      console.log('Low chunk count, running fallback ilike search...');
      const ilikeConditions = searchWords.slice(0, 3).map((w: string) => 
        `content.ilike.%${w}%,question.ilike.%${w}%,answer.ilike.%${w}%`
      ).join(',');
      
      const { data: fallbackData, error: fallbackError } = await supabaseClient
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
        .or(ilikeConditions)
        .limit(10);
      
      if (!fallbackError && fallbackData) {
        fallbackChunks = fallbackData;
        console.log(`Fallback search found: ${fallbackChunks.length} chunks`);
      }
    }

    if (searchError || diagError || pulseError || zangfuError || acuError || qaError || treatmentError || ageError || cafError || vagusError) {
      console.error('Search error:', searchError || diagError || pulseError || zangfuError || acuError || qaError || treatmentError || ageError || cafError || vagusError);
    }

    // Merge with priority order: Neurodegenerative (if relevant), CAF studies, vagus nerve, age-specific, diagnostics, pulse/tongue, zang-fu, acupoints, QA, treatment protocols, fallback, then others
    const prioritizedIds = new Set([
      ...neuroChunks.map(c => c.id),
      ...(cafChunks || []).map(c => c.id),
      ...(vagusChunks || []).map(c => c.id),
      ...ageSpecificChunks.map(c => c.id),
      ...(diagnosticsChunks || []).map(c => c.id),
      ...(pulseChunks || []).map(c => c.id),
      ...(zangfuChunks || []).map(c => c.id),
      ...(acuChunks || []).map(c => c.id),
      ...(qaChunks || []).map(c => c.id),
      ...(treatmentChunks || []).map(c => c.id),
      ...(otherChunks || []).map(c => c.id)
    ]);
    
    const chunks = [
      ...neuroChunks,
      ...(cafChunks || []),
      ...(vagusChunks || []),
      ...ageSpecificChunks,
      ...(diagnosticsChunks || []),
      ...(pulseChunks || []),
      ...(zangfuChunks || []),
      ...(acuChunks || []),
      ...(qaChunks || []),
      ...(treatmentChunks || []),
      ...(otherChunks || []).filter(c => !prioritizedIds.has(c.id)),
      ...fallbackChunks.filter(c => !prioritizedIds.has(c.id))
    ].slice(0, 25);

    console.log(`Total chunks after merge: ${chunks.length} (fallback contributed: ${fallbackChunks.filter(c => !prioritizedIds.has(c.id)).length})`);

    // Add CAF studies context as structured clinical data
    let cafStudiesContext = '';
    if (cafStudies.length > 0) {
      cafStudiesContext = '\n\n=== CAF MASTER CLINICAL STUDIES (Deep Thinking Framework) ===\n';
      cafStudiesContext += cafStudies.map((study, i) => `
[CAF Study #${i + 1}: ${study.western_label} - ${study.tcm_pattern}]
System: ${study.system_category}
Key Symptoms: ${study.key_symptoms}
Pulse/Tongue: ${study.pulse_tongue}
Treatment Principle: ${study.treatment_principle}
Acupoints: ${study.acupoints_display}
Formula: ${study.pharmacopeia_formula}
🧠 Clinical Insight: ${study.deep_thinking_note}
`).join('\n---\n');
      cafStudiesContext += '\n=== END CAF STUDIES ===';
    }

    // Add Retreat Quiz Results context for wellness assessments
    let quizResultsContext = '';
    if (quizResults.length > 0) {
      quizResultsContext = '\n\n=== RETREAT QUIZ WELLNESS ASSESSMENTS ===\n';
      quizResultsContext += quizResults.map((result, i) => {
        const tcmData = result.collected_tcm || {};
        return `
[Quiz Result #${i + 1}: ${result.patients?.full_name || 'Anonymous'}]
Date: ${new Date(result.created_at).toLocaleDateString()}
Score: ${result.score}% (${result.answered_yes}/${result.total_questions} wellness indicators)
Status: ${result.status}
TCM Observations:
- Patterns: ${tcmData.patterns?.join(', ') || 'Not recorded'}
- Symptoms: ${tcmData.symptoms?.join(', ') || 'Not recorded'}
- Recommendations: ${tcmData.recommendations?.join(', ') || 'Not recorded'}
`;
      }).join('\n---\n');
      quizResultsContext += '\n=== END QUIZ ASSESSMENTS ===';
    }

    // Add Clinical Trials context for evidence-based data
    let clinicalTrialsContext = '';
    if (clinicalTrials.length > 0) {
      clinicalTrialsContext = '\n\n=== CLINICAL TRIALS EVIDENCE ===\n';
      clinicalTrialsContext += clinicalTrials.map((trial, i) => {
        const verifiedTag = trial.sapir_verified ? '✅ Dr. Sapir Verified' : '⚠️ Unverified';
        return `
[Clinical Trial #${i + 1}: ${trial.nct_id || 'N/A'}] ${verifiedTag}
Title: ${trial.title}
Condition: ${trial.condition} ${trial.icd11_code ? `(ICD-11: ${trial.icd11_code})` : ''}
Intervention: ${trial.intervention || 'Not specified'}
Acupoints Used: ${trial.points_used?.join(', ') || 'Not specified'}
Herbal Formula: ${trial.herbal_formula || 'None'}
Phase: ${trial.phase || 'N/A'} | Enrollment: ${trial.enrollment || 'N/A'}
Status: ${trial.study_status || 'Unknown'}
Primary Outcome: ${trial.primary_outcome || 'Not specified'}
Results: ${trial.results_summary || 'No results available'}
Efficacy Rating: ${trial.efficacy_rating || 'Not rated'}
${trial.sapir_notes ? `Dr. Sapir Notes: ${trial.sapir_notes}` : ''}
Source: ${trial.source_url || trial.citation || 'ClinicalTrials.gov'}
`;
      }).join('\n---\n');
      clinicalTrialsContext += '\n=== END CLINICAL TRIALS ===';
    }

    console.log(`Priority chunks - Age-Specific: ${ageSpecificChunks.length}, Diagnostics: ${diagnosticsChunks?.length || 0}, Pulse/Tongue: ${pulseChunks?.length || 0}, Zang-Fu: ${zangfuChunks?.length || 0}, Acupoints: ${acuChunks?.length || 0}, QA: ${qaChunks?.length || 0}, Treatment: ${treatmentChunks?.length || 0}, Other: ${otherChunks?.length || 0}`);

    // Build context from retrieved chunks
    let context = '';
    const sources: Array<{ fileName: string; chunkIndex: number; preview: string; category: string; documentId: string }> = [];
    const chunksMatched: Array<{ 
      id: string; 
      documentId: string; 
      chunkIndex: number; 
      contentPreview: string;
      fileName: string;
      question?: string;
      answer?: string;
      content: string;
    }> = [];

    console.log('=== CHUNK MATCHING ===');

    if (chunks && chunks.length > 0) {
      context = chunks.map((chunk, i) => {
        const doc = chunk.document as any;
        const fileName = doc?.original_name || doc?.file_name || 'Unknown';
        const category = doc?.category || 'general';
        const documentId = doc?.id || '';
        
        console.log(`Chunk ${i + 1}: ${fileName} #${chunk.chunk_index}`);
        console.log(`  Preview: ${(chunk.question || chunk.content).substring(0, 80)}...`);
        
        sources.push({
          fileName,
          chunkIndex: chunk.chunk_index,
          preview: (chunk.question || chunk.content).substring(0, 100),
          category,
          documentId
        });
        
        // Include full chunk details for trace panel
        chunksMatched.push({
          id: chunk.id,
          documentId,
          chunkIndex: chunk.chunk_index,
          contentPreview: chunk.content.substring(0, 200),
          fileName,
          question: chunk.question || undefined,
          answer: chunk.answer || undefined,
          content: chunk.content
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

    console.log(`=== SEARCH RESULTS ===`);
    console.log(`Found ${chunks?.length || 0} chunks from ${new Set(sources.map(s => s.fileName)).size} unique documents`);

    // Build messages for AI
    let systemMessage: string;
    
    // Build age-specific context prefix if available
    const ageContextPrefix = ageGroupContext ? `\n\n=== PATIENT AGE GROUP CONTEXT ===\n${ageGroupContext}\n=== END AGE CONTEXT ===\n` : '';
    const patientContextPrefix = patientContext ? `\n\n=== PATIENT INFORMATION ===\n${patientContext}\n=== END PATIENT INFO ===\n` : '';
    
    if (useExternalAI) {
      // Using external AI - no RAG context, use general knowledge
      systemMessage = EXTERNAL_AI_SYSTEM_PROMPT + ageContextPrefix + patientContextPrefix;
      console.log('Using external AI mode - no RAG context');
    } else if (context || cafStudiesContext || quizResultsContext || clinicalTrialsContext) {
      systemMessage = `${TCM_RAG_SYSTEM_PROMPT}${ageContextPrefix}${patientContextPrefix}\n\n=== CONTEXT FROM DR. SAPIR'S KNOWLEDGE BASE ===\n\n${context}${cafStudiesContext}${quizResultsContext}${clinicalTrialsContext}\n\n=== END CONTEXT ===`;
    } else {
      systemMessage = `${TCM_RAG_SYSTEM_PROMPT}${ageContextPrefix}${patientContextPrefix}\n\nNOTE: No relevant entries found in the knowledge base for this query.`;
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
        model: 'google/gemini-2.5-pro',
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

    const { data: logRow, error: logError } = await serviceClient
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
      })
      .select('id, created_at')
      .single();

    if (logError) {
      console.error('Failed to log query:', logError);
    } else {
      console.log('Query logged for audit trail', logRow?.id);
    }

    // Get unique documents used
    const uniqueDocuments = [...new Set(sources.map(s => s.fileName))];

    return new Response(JSON.stringify({
      response: responseContent,
      sources: useExternalAI ? [] : sources,
      chunksFound: useExternalAI ? 0 : (chunks?.length || 0),
      documentsSearched: useExternalAI ? 0 : uniqueDocuments.length,
      documentsMatched: useExternalAI ? 0 : uniqueDocuments.length,
      searchTermsUsed: searchTerms,
      auditLogged: !logError,
      auditLogId: logRow?.id ?? null,
      auditLoggedAt: logRow?.created_at ?? null,
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
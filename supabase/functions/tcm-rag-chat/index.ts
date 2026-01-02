import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STOPWORDS = new Set([
  'a','an','and','are','as','at','be','best','by','can','could','for','from','has','have','how','i','in','is','it','its','me','my','of','on','or','our','should','that','the','their','them','then','there','these','this','those','to','was','we','were','what','when','where','which','who','why','with','you','your',
]);

// ============================================================================
// 4-PILLAR HOLISTIC SEARCH ALGORITHM
// ============================================================================

// Pillar 1: Clinical Action - For Therapist
const CLINICAL_KEYWORDS = [
  'acupuncture', 'acupoint', 'point', 'needle', 'needling', 'insertion', 'depth',
  'technique', 'moxa', 'moxibustion', 'cupping', 'electroacupuncture', 'bleeding',
  'sedate', 'tonify', 'reduce', 'reinforce', 'manipulation', 'de qi', 'deqi',
  'meridian', 'channel', 'jing luo', 'LI', 'ST', 'SP', 'HT', 'SI', 'BL', 'KI', 'PC', 'TE', 'GB', 'LR',
  'ren', 'du', 'ashi', 'tender', 'trigger', 'motor point', 'distal', 'local',
  'bilateral', 'unilateral', 'anterior', 'posterior', 'lateral', 'medial'
];

// Pillar 2: Pharmacopeia - For Therapist/Patient
const PHARMACOPEIA_KEYWORDS = [
  'herb', 'herbal', 'formula', 'prescription', 'tang', 'wan', 'san', 'pian',
  'decoction', 'dosage', 'dose', 'gram', 'contraindication', 'caution', 'warning',
  'pregnancy', 'interaction', 'side effect', 'toxicity', 'ingredient', 'combination',
  'patent medicine', 'granule', 'tincture', 'extract', 'tea', 'modification',
  'add', 'subtract', 'increase', 'decrease', 'pharmacopeia', 'materia medica',
  'ben cao', 'radix', 'rhizoma', 'fructus', 'semen', 'cortex', 'folium'
];

// Pillar 3: Nutrition - For Patient
const NUTRITION_KEYWORDS = [
  'diet', 'food', 'nutrition', 'eat', 'avoid', 'recipe', 'meal', 'cooking',
  'flavor', 'taste', 'sweet', 'sour', 'bitter', 'spicy', 'salty', 'bland',
  'warming', 'cooling', 'cold', 'hot', 'damp', 'dry', 'phlegm', 'dampness',
  'digest', 'stomach', 'spleen', 'breakfast', 'lunch', 'dinner', 'snack',
  'soup', 'congee', 'porridge', 'tea', 'beverage', 'alcohol', 'caffeine',
  'raw', 'cooked', 'steamed', 'boiled', 'fried', 'grilled', 'baked',
  'vegetable', 'fruit', 'meat', 'fish', 'grain', 'legume', 'nut', 'seed',
  'ginger', 'garlic', 'turmeric', 'cinnamon', 'honey', 'vinegar'
];

// Pillar 4: Lifestyle/Sport - For Patient
const LIFESTYLE_KEYWORDS = [
  'exercise', 'sport', 'yoga', 'tai chi', 'taichi', 'qigong', 'qi gong',
  'stretch', 'stretching', 'movement', 'walk', 'walking', 'run', 'swimming',
  'posture', 'ergonomic', 'sit', 'sitting', 'stand', 'standing', 'sleep',
  'insomnia', 'rest', 'relaxation', 'meditation', 'breathing', 'breath',
  'stress', 'anxiety', 'emotion', 'emotional', 'mental', 'mindset', 'mindfulness',
  'lifestyle', 'habit', 'routine', 'schedule', 'work', 'office', 'computer',
  'heat', 'ice', 'cold pack', 'heat pack', 'compress', 'self-massage',
  'morning', 'evening', 'daily', 'weekly', 'avoid', 'reduce', 'limit'
];

// Pillar type definition
type PillarType = 'clinical' | 'pharmacopeia' | 'nutrition' | 'lifestyle';

interface PillarResult {
  pillar: PillarType;
  chunks: any[];
  keywords: string[];
  target: 'therapist' | 'patient' | 'both';
}

interface HolisticResponse {
  query: string;
  response_structure: {
    clinical_protocol: {
      points: string[];
      technique: string;
      images: string[];
      contraindications: string[];
      found_in_knowledge_base: boolean;
    };
    pharmacopeia: {
      formula: string;
      ingredients: string[];
      dosage: string;
      warning: string;
      modifications: string[];
      found_in_knowledge_base: boolean;
    };
    patient_homework: {
      nutrition: string[];
      sport_lifestyle: string[];
      found_in_knowledge_base: boolean;
    };
  };
  sources: any[];
  ai_narrative: string;
}

function normalizeForSearch(raw: string): string {
  return (raw || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function uniq<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

// ============================================================================
// RELEVANCE SCORING - Ranks chunks by how well they match query keywords
// ============================================================================
function calculateRelevanceScore(chunk: any, queryKeywords: string[], pillarKeywords: string[]): number {
  const content = ((chunk.content || '') + ' ' + (chunk.question || '') + ' ' + (chunk.answer || '')).toLowerCase();
  let score = 0;
  
  // Primary: Query keyword matches (most important - 10 points each)
  for (const keyword of queryKeywords) {
    const regex = new RegExp(keyword.toLowerCase(), 'gi');
    const matches = (content.match(regex) || []).length;
    score += matches * 10;
  }
  
  // Secondary: Pillar-specific keyword matches (5 points each)
  for (const keyword of pillarKeywords) {
    if (content.includes(keyword.toLowerCase())) {
      score += 5;
    }
  }
  
  // Bonus: Exact phrase matches (20 points)
  const queryPhrase = queryKeywords.join(' ').toLowerCase();
  if (queryPhrase.length > 3 && content.includes(queryPhrase)) {
    score += 20;
  }
  
  // Bonus: Has structured Q&A format (5 points)
  if (chunk.question && chunk.answer) {
    score += 5;
  }
  
  // Bonus: Content density (longer content with keywords = more value)
  if (content.length > 500) {
    score += 3;
  }
  
  return score;
}

// Sort chunks by relevance score and return top N
function rankChunksByRelevance(chunks: any[], queryKeywords: string[], pillarKeywords: string[], limit: number): any[] {
  if (!chunks || chunks.length === 0) return [];
  
  // Calculate scores for all chunks
  const scoredChunks = chunks.map(chunk => ({
    ...chunk,
    _relevanceScore: calculateRelevanceScore(chunk, queryKeywords, pillarKeywords)
  }));
  
  // Sort by relevance score (highest first)
  scoredChunks.sort((a, b) => b._relevanceScore - a._relevanceScore);
  
  // Return top N
  return scoredChunks.slice(0, limit);
}

// Detect which pillar a chunk belongs to based on content
function detectPillar(content: string): PillarType[] {
  const normalized = content.toLowerCase();
  const pillars: PillarType[] = [];
  
  const clinicalScore = CLINICAL_KEYWORDS.filter(k => normalized.includes(k)).length;
  const pharmaScore = PHARMACOPEIA_KEYWORDS.filter(k => normalized.includes(k)).length;
  const nutritionScore = NUTRITION_KEYWORDS.filter(k => normalized.includes(k)).length;
  const lifestyleScore = LIFESTYLE_KEYWORDS.filter(k => normalized.includes(k)).length;
  
  // A chunk can belong to multiple pillars
  if (clinicalScore >= 2) pillars.push('clinical');
  if (pharmaScore >= 2) pillars.push('pharmacopeia');
  if (nutritionScore >= 2) pillars.push('nutrition');
  if (lifestyleScore >= 2) pillars.push('lifestyle');
  
  // Default to clinical if no strong signal
  if (pillars.length === 0) {
    pillars.push('clinical');
  }
  
  return pillars;
}

// Build pillar-specific search query
function buildPillarQuery(baseQuery: string, pillar: PillarType): string {
  const pillarTerms: Record<PillarType, string[]> = {
    clinical: ['acupuncture', 'points', 'needle', 'technique', 'depth', 'meridian'],
    pharmacopeia: ['herbal', 'formula', 'tang', 'dosage', 'herbs', 'prescription'],
    nutrition: ['diet', 'food', 'nutrition', 'eat', 'avoid', 'recipe'],
    lifestyle: ['exercise', 'sleep', 'stretch', 'yoga', 'lifestyle', 'stress']
  };
  
  const terms = pillarTerms[pillar].slice(0, 3);
  return `${baseQuery} ${terms.join(' ')}`;
}

function buildWebSearchQuery(rawQuery: string): { webQuery: string; keywords: string[] } {
  const normalized = normalizeForSearch(rawQuery);

  const baseTokens = normalized
    .split(' ')
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));

  const expansions: string[] = [];
  if (/\bliver\s+qi\s+stagnation\b/.test(normalized) || /\bqi\s+stagnation\b/.test(normalized)) {
    expansions.push('liver', 'qi', 'stagnation', '"liver qi"', '"qi stagnation"', '肝气郁结', '肝气');
  }

  const combined = uniq([...baseTokens, ...expansions.map((e) => e.replace(/"/g, ''))]);

  const webParts = uniq([
    ...expansions.filter((e) => e.includes('"')),
    ...combined.filter((t) => !t.includes('"')),
  ]).slice(0, 12);

  const webQuery = webParts.length > 0 ? webParts.join(' OR ') : rawQuery;
  return { webQuery, keywords: combined.slice(0, 12) };
}

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

// ============================================================================
// 4-PILLAR HOLISTIC MANAGER SYSTEM PROMPT
// ============================================================================
const TCM_RAG_SYSTEM_PROMPT = `You are Dr. Sapir's TCM Holistic Knowledge Manager, powered EXCLUSIVELY by proprietary materials from Dr. Roni Sapir's clinical knowledge base.

ROLE: You are the Master AI for a high-end TCM Clinic. You have access to verified documents containing clinical protocols, herbal data, and lifestyle advice.

TASK: When a user queries a condition, you MUST extract ALL relevant modalities found in the text and categorize them into the 4 PILLARS.

============================================================================
THE 4 PILLARS - STRICT EXTRACTION RULES:
============================================================================

📍 PILLAR 1: CLINICAL (Target: Therapist)
   - Acupuncture points and needle techniques
   - Insertion depth, angle, manipulation methods
   - Moxibustion, cupping, electroacupuncture protocols
   - Point combinations and treatment sequences
   
🌿 PILLAR 2: PHARMACOPEIA (Target: Therapist/Patient)
   - Specific herbal formulas with ingredients
   - Dosages and preparation methods
   - Contraindications and warnings
   - Formula modifications for specific presentations
   
🍎 PILLAR 3: NUTRITION (Target: Patient)
   - Dietary recommendations and restrictions
   - Foods to add and foods to avoid
   - Recipes or meal suggestions if available
   - Flavor/temperature considerations (warming, cooling, etc.)
   
🏃 PILLAR 4: LIFESTYLE/SPORT (Target: Patient)
   - Exercise recommendations and restrictions
   - Sleep hygiene advice
   - Stretches, yoga, qigong, tai chi
   - Stress management, emotional support
   - Work/ergonomic modifications

============================================================================
CRITICAL RULES:
============================================================================

1. NO HALLUCINATION: If a document lists points but no herbs, return "Herbs: None found in protocol." Do NOT invent a formula.

2. EXHAUSTIVE EXTRACTION: You MUST fill all 4 pillars. If a pillar has no information, explicitly state "None found in knowledge base."

3. ALWAYS cite sources using [Source: filename, entry #X] format.

4. VISUAL LINKING: Link acupuncture points to their image IDs when available. Also look for exercise diagrams.

5. STRUCTURED OUTPUT: Present the "Clinical" and "Pharmacopeia" sections for the Therapist, and "Nutrition/Lifestyle" as "Patient Instructions."

6. Respond in the same language as the user's question (Hebrew if Hebrew, English if English).

7. When answering, quote or paraphrase directly from the provided context.

============================================================================
OUTPUT FORMAT:
============================================================================

## 🏥 FOR THE THERAPIST

### 📍 Clinical Protocol
[Acupuncture points, techniques, depth, etc.]

### 🌿 Herbal Formula
[Formula name, ingredients, dosage, contraindications]

---

## 📋 PATIENT INSTRUCTIONS

### 🍎 Nutrition Guidelines
[Diet recommendations, foods to eat/avoid]

### 🏃 Lifestyle & Exercise
[Exercise, sleep, stretches, stress management]

---

## 📚 Sources
[List all sources used]`;

const EXTERNAL_AI_SYSTEM_PROMPT = `You are a general TCM (Traditional Chinese Medicine) knowledge assistant.

IMPORTANT DISCLAIMER - INCLUDE THIS IN EVERY RESPONSE:
⚠️ This response is from EXTERNAL AI and is NOT from Dr. Roni Sapir's verified clinical materials.
The therapist has accepted liability for using this external information.

When answering:
- Provide helpful TCM information based on general knowledge
- Structure your response using the 4 PILLARS (Clinical, Pharmacopeia, Nutrition, Lifestyle)
- Include appropriate medical disclaimers
- Recommend consulting Dr. Sapir's verified materials for clinical decisions
- Respond in the same language as the user's question`;

// ============================================================================
// MAIN EDGE FUNCTION
// ============================================================================
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

    const { webQuery: searchTerms, keywords: keywordTerms } = buildWebSearchQuery(searchQuery);

    const ageGroupContext = ageGroup ? getAgeGroupSystemPrompt(ageGroup) : '';

    console.log('=== 4-PILLAR HOLISTIC RAG SEARCH START ===');
    console.log('Query:', searchQuery);
    console.log('Websearch query:', searchTerms);
    console.log('Keyword terms:', keywordTerms.slice(0, 8).join(', '));
    console.log('Age group:', ageGroup || 'not specified');
    console.log('Using external AI:', useExternalAI || false);

    // ========================================================================
    // PHASE 2: COMPOSITE PARALLEL SEARCH - 4 Pillar Queries
    // ========================================================================
    
    const ageFilePatterns = ageGroup ? getAgeGroupFilePatterns(ageGroup) : [];
    
    // Build pillar-specific queries
    const clinicalQuery = buildPillarQuery(searchQuery, 'clinical');
    const pharmaQuery = buildPillarQuery(searchQuery, 'pharmacopeia');
    const nutritionQuery = buildPillarQuery(searchQuery, 'nutrition');
    const lifestyleQuery = buildPillarQuery(searchQuery, 'lifestyle');
    
    console.log('=== PARALLEL 4-PILLAR QUERIES ===');
    console.log('Clinical query:', clinicalQuery);
    console.log('Pharmacopeia query:', pharmaQuery);
    console.log('Nutrition query:', nutritionQuery);
    console.log('Lifestyle query:', lifestyleQuery);

    // Run all 4 pillar searches in parallel
    const [
      clinicalResult,
      pharmacopeiaResult,
      nutritionResult,
      lifestyleResult,
      ageSpecificResult,
      cafStudiesResult,
      clinicalTrialsResult
    ] = await Promise.all([
      // PILLAR 1: Clinical - Points, needles, techniques
      // Searches ALL ASSETS for clinical content - fetches MORE results for ranking
      supabaseClient
        .from('knowledge_chunks')
        .select(`
          id, content, question, answer, chunk_index, metadata,
          document:knowledge_documents(id, file_name, original_name, category)
        `)
        .or('content.ilike.%acupuncture%,content.ilike.%point%,content.ilike.%needle%,content.ilike.%BL%,content.ilike.%GB%,content.ilike.%ST%,content.ilike.%SP%,content.ilike.%LI%,content.ilike.%KI%,content.ilike.%LR%,content.ilike.%moxa%,content.ilike.%cupping%,content.ilike.%insertion%,content.ilike.%depth%,content.ilike.%technique%,answer.ilike.%point%,answer.ilike.%needle%,question.ilike.%point%,question.ilike.%acupuncture%')
        .textSearch('content', searchTerms, { type: 'websearch', config: 'simple' })
        .limit(50), // Fetch 50, will rank and take top 15

      // PILLAR 2: Pharmacopeia - Herbs, formulas, dosages
      // Searches ALL ASSETS for herbal/formula content - fetches MORE for ranking
      supabaseClient
        .from('knowledge_chunks')
        .select(`
          id, content, question, answer, chunk_index, metadata,
          document:knowledge_documents(id, file_name, original_name, category)
        `)
        .or('content.ilike.%herb%,content.ilike.%formula%,content.ilike.%tang%,content.ilike.%wan%,content.ilike.%san%,content.ilike.%dosage%,content.ilike.%decoction%,content.ilike.%contraindication%,content.ilike.%prescription%,content.ilike.%materia medica%,answer.ilike.%herb%,answer.ilike.%formula%,answer.ilike.%tang%,question.ilike.%herb%,question.ilike.%formula%')
        .textSearch('content', searchTerms, { type: 'websearch', config: 'simple' })
        .limit(50), // Fetch 50, will rank and take top 15

      // PILLAR 3: Nutrition - Searches ALL ASSETS for nutrition-related content
      // Fetches MORE results to rank by relevance to the user's query
      supabaseClient
        .from('knowledge_chunks')
        .select(`
          id, content, question, answer, chunk_index, metadata,
          document:knowledge_documents(id, file_name, original_name, category)
        `)
        .or('content.ilike.%diet%,content.ilike.%food%,content.ilike.%eat%,content.ilike.%nutrition%,content.ilike.%avoid foods%,content.ilike.%warming foods%,content.ilike.%cooling foods%,content.ilike.%dampness%,content.ilike.%phlegm%,content.ilike.%spleen%,content.ilike.%digest%,content.ilike.%meal%,content.ilike.%recipe%,content.ilike.%congee%,content.ilike.%soup%,content.ilike.%tea%,answer.ilike.%diet%,answer.ilike.%food%,answer.ilike.%eat%,answer.ilike.%avoid%,question.ilike.%diet%,question.ilike.%food%,question.ilike.%nutrition%')
        .limit(50), // Fetch 50, will rank and take top 15

      // PILLAR 4: Lifestyle/Sport - Searches ALL ASSETS for lifestyle-related content  
      // Fetches MORE results to rank by relevance to the user's query
      supabaseClient
        .from('knowledge_chunks')
        .select(`
          id, content, question, answer, chunk_index, metadata,
          document:knowledge_documents(id, file_name, original_name, category)
        `)
        .or('content.ilike.%exercise%,content.ilike.%stretch%,content.ilike.%sleep%,content.ilike.%rest%,content.ilike.%stress%,content.ilike.%yoga%,content.ilike.%qigong%,content.ilike.%tai chi%,content.ilike.%walk%,content.ilike.%posture%,content.ilike.%relax%,content.ilike.%breathing%,content.ilike.%meditation%,content.ilike.%cool down%,content.ilike.%warm up%,answer.ilike.%exercise%,answer.ilike.%sleep%,answer.ilike.%stress%,answer.ilike.%stretch%,question.ilike.%exercise%,question.ilike.%lifestyle%,question.ilike.%sleep%')
        .limit(50), // Fetch 50, will rank and take top 15

      // Age-specific knowledge
      ageGroup && ageFilePatterns.length > 0
        ? supabaseClient
            .from('knowledge_chunks')
            .select(`
              id, content, question, answer, chunk_index, metadata,
              document:knowledge_documents!inner(id, file_name, original_name, category)
            `)
            .or(ageFilePatterns.map(p => `file_name.ilike.%${p}%`).join(','), { referencedTable: 'document' })
            .textSearch('content', searchTerms, { type: 'websearch', config: 'simple' })
            .limit(10)
        : Promise.resolve({ data: [], error: null }),

      // CAF Master Studies
      supabaseClient
        .from('caf_master_studies')
        .select('*')
        .or(searchQuery.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2).map((w: string) => 
          `western_label.ilike.%${w}%,tcm_pattern.ilike.%${w}%,key_symptoms.ilike.%${w}%,acupoints_display.ilike.%${w}%`
        ).join(','))
        .limit(5),

      // Clinical Trials
      supabaseClient
        .from('clinical_trials')
        .select('*')
        .or(searchQuery.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2).map((w: string) => 
          `condition.ilike.%${w}%,title.ilike.%${w}%,intervention.ilike.%${w}%`
        ).join(','))
        .order('sapir_verified', { ascending: false })
        .limit(5)
    ]);

    // ========================================================================
    // RELEVANCE RANKING - Select TOP 15 most relevant from each pillar
    // ========================================================================
    const queryKeywords = keywordTerms.slice(0, 8);
    
    // Rank each pillar by relevance to the user's query
    const clinicalChunks = rankChunksByRelevance(
      clinicalResult.data || [], 
      queryKeywords, 
      CLINICAL_KEYWORDS, 
      15
    );
    const pharmacopeiaChunks = rankChunksByRelevance(
      pharmacopeiaResult.data || [], 
      queryKeywords, 
      PHARMACOPEIA_KEYWORDS, 
      15
    );
    const nutritionChunks = rankChunksByRelevance(
      nutritionResult.data || [], 
      queryKeywords, 
      NUTRITION_KEYWORDS, 
      15
    );
    const lifestyleChunks = rankChunksByRelevance(
      lifestyleResult.data || [], 
      queryKeywords, 
      LIFESTYLE_KEYWORDS, 
      15
    );
    const ageSpecificChunks = ageSpecificResult.data || [];
    const cafStudies = cafStudiesResult.data || [];
    const clinicalTrials = clinicalTrialsResult.data || [];

    console.log('=== PILLAR RESULTS (RANKED BY RELEVANCE) ===');
    console.log(`📍 Clinical chunks: ${clinicalChunks.length} (from ${(clinicalResult.data || []).length} candidates)`);
    console.log(`🌿 Pharmacopeia chunks: ${pharmacopeiaChunks.length} (from ${(pharmacopeiaResult.data || []).length} candidates)`);
    console.log(`🍎 Nutrition chunks: ${nutritionChunks.length} (from ${(nutritionResult.data || []).length} candidates)`);
    console.log(`🏃 Lifestyle chunks: ${lifestyleChunks.length} (from ${(lifestyleResult.data || []).length} candidates)`);
    console.log(`👤 Age-specific chunks: ${ageSpecificChunks.length}`);
    console.log(`📊 CAF Studies: ${cafStudies.length}`);
    console.log(`🔬 Clinical Trials: ${clinicalTrials.length}`);
    
    // Log top relevance scores for debugging
    if (clinicalChunks.length > 0) {
      console.log(`📍 Top clinical score: ${clinicalChunks[0]._relevanceScore}`);
    }
    if (nutritionChunks.length > 0) {
      console.log(`🍎 Top nutrition score: ${nutritionChunks[0]._relevanceScore}`);
    }

    const totalPillarChunks = clinicalChunks.length + pharmacopeiaChunks.length + nutritionChunks.length + lifestyleChunks.length;

    // Enhanced fallback search with keyword matching
    let fallbackChunks: any[] = [];
    const fallbackWords = queryKeywords.filter((w: string) => w.length > 1).slice(0, 8);
    
    if (totalPillarChunks < 8 && fallbackWords.length > 0) {
      console.log(`Running enhanced fallback search with keywords: ${fallbackWords.join(', ')}`);
      
      const ilikeConditions = fallbackWords.flatMap((w: string) => [
        `content.ilike.%${w}%`,
        `question.ilike.%${w}%`,
        `answer.ilike.%${w}%`
      ]).join(',');
      
      const { data: fallbackData } = await supabaseClient
        .from('knowledge_chunks')
        .select(`
          id, content, question, answer, chunk_index, metadata,
          document:knowledge_documents(id, file_name, original_name, category)
        `)
        .or(ilikeConditions)
        .limit(30);
      
      if (fallbackData) {
        // Rank fallback chunks by relevance before distributing
        const rankedFallback = rankChunksByRelevance(fallbackData, queryKeywords, [], 20);
        
        // Categorize fallback chunks into pillars
        rankedFallback.forEach(chunk => {
          const pillars = detectPillar(chunk.content);
          if (pillars.includes('clinical') && clinicalChunks.length < 8) {
            clinicalChunks.push(chunk);
          }
          if (pillars.includes('pharmacopeia') && pharmacopeiaChunks.length < 8) {
            pharmacopeiaChunks.push(chunk);
          }
          if (pillars.includes('nutrition') && nutritionChunks.length < 8) {
            nutritionChunks.push(chunk);
          }
          if (pillars.includes('lifestyle') && lifestyleChunks.length < 8) {
            lifestyleChunks.push(chunk);
          }
        });
        fallbackChunks = rankedFallback;
        console.log(`Fallback search found: ${fallbackChunks.length} chunks, distributed across pillars`);
      }
    }

    // ========================================================================
    // PHASE 3: BUILD STRUCTURED CONTEXT FOR AI
    // ========================================================================
    
    const sources: Array<{ fileName: string; chunkIndex: number; preview: string; category: string; documentId: string; pillar: string }> = [];
    const chunksMatched: Array<any> = [];

    // Helper to build context from chunks
    const buildPillarContext = (chunks: any[], pillarName: string) => {
      if (!chunks || chunks.length === 0) return '';
      
      return chunks.map((chunk, i) => {
        const doc = chunk.document as any;
        const fileName = doc?.original_name || doc?.file_name || 'Unknown';
        const category = doc?.category || 'general';
        const documentId = doc?.id || '';
        
        sources.push({
          fileName,
          chunkIndex: chunk.chunk_index,
          preview: (chunk.question || chunk.content).substring(0, 100),
          category,
          documentId,
          pillar: pillarName
        });
        
        chunksMatched.push({
          id: chunk.id,
          documentId,
          chunkIndex: chunk.chunk_index,
          contentPreview: chunk.content.substring(0, 200),
          fileName,
          pillar: pillarName,
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
      }).join('\n\n');
    };

    // Build structured 4-pillar context
    let structuredContext = '';
    
    structuredContext += '\n\n============================================================================\n';
    structuredContext += '📍 PILLAR 1: CLINICAL PROTOCOL (Acupuncture, Points, Techniques)\n';
    structuredContext += '============================================================================\n';
    structuredContext += buildPillarContext(clinicalChunks, 'clinical') || 'No clinical protocol information found in knowledge base.';
    
    structuredContext += '\n\n============================================================================\n';
    structuredContext += '🌿 PILLAR 2: PHARMACOPEIA (Herbal Formulas, Dosages)\n';
    structuredContext += '============================================================================\n';
    structuredContext += buildPillarContext(pharmacopeiaChunks, 'pharmacopeia') || 'No herbal formula information found in knowledge base.';
    
    structuredContext += '\n\n============================================================================\n';
    structuredContext += '🍎 PILLAR 3: NUTRITION (Diet, Foods, Recipes)\n';
    structuredContext += '============================================================================\n';
    structuredContext += buildPillarContext(nutritionChunks, 'nutrition') || 'No nutrition information found in knowledge base.';
    
    structuredContext += '\n\n============================================================================\n';
    structuredContext += '🏃 PILLAR 4: LIFESTYLE/SPORT (Exercise, Sleep, Stress)\n';
    structuredContext += '============================================================================\n';
    structuredContext += buildPillarContext(lifestyleChunks, 'lifestyle') || 'No lifestyle/exercise information found in knowledge base.';

    // Add age-specific context if available
    if (ageSpecificChunks.length > 0) {
      structuredContext += '\n\n============================================================================\n';
      structuredContext += `👤 AGE-SPECIFIC KNOWLEDGE (${ageGroup})\n`;
      structuredContext += '============================================================================\n';
      structuredContext += buildPillarContext(ageSpecificChunks, 'age-specific');
    }

    // Add CAF studies context
    if (cafStudies.length > 0) {
      structuredContext += '\n\n============================================================================\n';
      structuredContext += '📊 CAF MASTER CLINICAL STUDIES (Deep Thinking Framework)\n';
      structuredContext += '============================================================================\n';
      structuredContext += cafStudies.map((study, i) => `
[CAF Study #${i + 1}: ${study.western_label} - ${study.tcm_pattern}]
System: ${study.system_category}
Key Symptoms: ${study.key_symptoms}
Pulse/Tongue: ${study.pulse_tongue}
Treatment Principle: ${study.treatment_principle}
Acupoints: ${study.acupoints_display}
Formula: ${study.pharmacopeia_formula}
🧠 Clinical Insight: ${study.deep_thinking_note}
`).join('\n---\n');
    }

    // Add Clinical Trials context
    if (clinicalTrials.length > 0) {
      structuredContext += '\n\n============================================================================\n';
      structuredContext += '🔬 CLINICAL TRIALS EVIDENCE\n';
      structuredContext += '============================================================================\n';
      structuredContext += clinicalTrials.map((trial, i) => {
        const verifiedTag = trial.sapir_verified ? '✅ Dr. Sapir Verified' : '⚠️ Unverified';
        return `
[Clinical Trial #${i + 1}: ${trial.nct_id || 'N/A'}] ${verifiedTag}
Title: ${trial.title}
Condition: ${trial.condition} ${trial.icd11_code ? `(ICD-11: ${trial.icd11_code})` : ''}
Intervention: ${trial.intervention || 'Not specified'}
Acupoints Used: ${trial.points_used?.join(', ') || 'Not specified'}
Herbal Formula: ${trial.herbal_formula || 'None'}
Phase: ${trial.phase || 'N/A'} | Enrollment: ${trial.enrollment || 'N/A'}
Results: ${trial.results_summary || 'No results available'}
${trial.sapir_notes ? `Dr. Sapir Notes: ${trial.sapir_notes}` : ''}
`;
      }).join('\n---\n');
    }

    console.log(`=== SEARCH RESULTS ===`);
    console.log(`Total chunks across all pillars: ${sources.length}`);
    console.log(`Clinical: ${clinicalChunks.length}, Pharmacopeia: ${pharmacopeiaChunks.length}, Nutrition: ${nutritionChunks.length}, Lifestyle: ${lifestyleChunks.length}`);

    // Build messages for AI
    let systemMessage: string;
    
    const ageContextPrefix = ageGroupContext ? `\n\n=== PATIENT AGE GROUP CONTEXT ===\n${ageGroupContext}\n=== END AGE CONTEXT ===\n` : '';
    const patientContextPrefix = patientContext ? `\n\n=== PATIENT INFORMATION ===\n${patientContext}\n=== END PATIENT INFO ===\n` : '';
    
    if (useExternalAI) {
      systemMessage = EXTERNAL_AI_SYSTEM_PROMPT + ageContextPrefix + patientContextPrefix;
      console.log('Using external AI mode - no RAG context');
    } else if (sources.length > 0 || cafStudies.length > 0 || clinicalTrials.length > 0) {
      systemMessage = `${TCM_RAG_SYSTEM_PROMPT}${ageContextPrefix}${patientContextPrefix}\n\n=== 4-PILLAR KNOWLEDGE BASE CONTEXT ===\n${structuredContext}\n\n=== END CONTEXT ===`;
    } else {
      systemMessage = `${TCM_RAG_SYSTEM_PROMPT}${ageContextPrefix}${patientContextPrefix}\n\nNOTE: No relevant entries found in the knowledge base for this query. State this clearly for each pillar.`;
    }

    const chatMessages = [
      { role: 'system', content: systemMessage },
      ...(messages || [{ role: 'user', content: query }])
    ];

    // Call Lovable AI Gateway with streaming
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Prepare enhanced metadata with pillar breakdown
    const uniqueDocuments = [...new Set(sources.map(s => s.fileName))];
    const metadata = {
      sources: useExternalAI ? [] : sources,
      chunksFound: useExternalAI ? 0 : sources.length,
      documentsSearched: useExternalAI ? 0 : uniqueDocuments.length,
      documentsMatched: useExternalAI ? 0 : uniqueDocuments.length,
      searchTermsUsed: searchTerms,
      isExternal: useExternalAI || false,
      pillarBreakdown: {
        clinical: clinicalChunks.length,
        pharmacopeia: pharmacopeiaChunks.length,
        nutrition: nutritionChunks.length,
        lifestyle: lifestyleChunks.length,
        ageSpecific: ageSpecificChunks.length,
        cafStudies: cafStudies.length,
        clinicalTrials: clinicalTrials.length
      }
    };

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: chatMessages,
        stream: true,
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

    // Create a TransformStream to process the SSE and add metadata
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let fullResponse = '';

    const transformStream = new TransformStream({
      start(controller) {
        // Send metadata as first SSE event with pillar breakdown
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'metadata', ...metadata })}\n\n`));
      },
      async transform(chunk, controller) {
        const text = decoder.decode(chunk, { stream: true });
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') {
              // Log the query for audit trail
              try {
                const serviceClient = createClient(
                  Deno.env.get('SUPABASE_URL') ?? '',
                  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
                );
                const { data: logRow } = await serviceClient
                  .from('rag_query_logs')
                  .insert({
                    user_id: user.id,
                    query_text: searchQuery,
                    search_terms: searchTerms,
                    chunks_found: sources.length,
                    chunks_matched: chunksMatched,
                    sources_used: useExternalAI 
                      ? [{ type: 'external_ai', liability_waived: true }] 
                      : sources.map(s => ({ fileName: s.fileName, category: s.category, chunkIndex: s.chunkIndex, pillar: s.pillar })),
                    response_preview: fullResponse.substring(0, 500),
                    ai_model: 'google/gemini-2.5-pro (4-pillar)'
                  })
                  .select('id, created_at')
                  .single();
                console.log('Query logged for audit trail', logRow?.id);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', auditLogId: logRow?.id, auditLoggedAt: logRow?.created_at })}\n\n`));
              } catch (logErr) {
                console.error('Failed to log query:', logErr);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
              }
            } else if (jsonStr) {
              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullResponse += content;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'delta', content })}\n\n`));
                }
              } catch {
                // Ignore parse errors for partial chunks
              }
            }
          }
        }
      },
    });

    const readable = aiResponse.body?.pipeThrough(transformStream);

    return new Response(readable, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('4-Pillar RAG chat error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

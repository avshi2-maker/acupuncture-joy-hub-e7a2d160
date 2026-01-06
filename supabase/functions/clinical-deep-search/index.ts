import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}


/**
 * Clinical Deep Search Edge Function
 * Implements the "Deep Search" logic for comprehensive clinical reports
 * Cross-references across all knowledge bases for holistic responses
 */

// Module to Knowledge Base mapping (from nanobanan_master_sync.csv)
const MODULE_KNOWLEDGE_MAP: Record<number, { name: string; promptId: string; knowledgeBase: string }> = {
  1: { name: 'TCM Shen Mind Emotions', promptId: 'nanobanan_general', knowledgeBase: 'TCM_Foundations.csv' },
  2: { name: 'TCM Pattern Identification', promptId: 'nanobanan_bianzheng', knowledgeBase: 'tcm_pattern_differentiation_enhanced.csv' },
  3: { name: 'TCM Yin Yang Constitution', promptId: 'nanobanan_general', knowledgeBase: 'TCM_Foundations.csv' },
  4: { name: 'TCM Pulse Diagnosis', promptId: 'nanobanan_general', knowledgeBase: 'TCM_Diagnostics.csv' },
  5: { name: 'TCM Tongue Diagnosis', promptId: 'nanobanan_general', knowledgeBase: 'TCM_Diagnostics.csv' },
  6: { name: 'TCM Qi Blood Fluids', promptId: 'nanobanan_general', knowledgeBase: 'TCM_Foundations.csv' },
  7: { name: 'TCM Six Stages', promptId: 'nanobanan_general', knowledgeBase: 'TCM_Foundations.csv' },
  8: { name: 'TCM San Jiao Wei Qi', promptId: 'nanobanan_general', knowledgeBase: 'TCM_Foundations.csv' },
  9: { name: 'TCM Pediatric', promptId: 'nanobanan_school_age', knowledgeBase: 'tcm_children_7-13_qa_enhanced.csv' },
  10: { name: 'TCM Herbal Medicine', promptId: 'nanobanan_general', knowledgeBase: 'TCM_Herbal_Formulas.csv' },
  11: { name: 'TCM Herbal Formulas', promptId: 'nanobanan_general', knowledgeBase: 'TCM_Herbal_Formulas.csv' },
  12: { name: 'TCM Herbal Matching', promptId: 'nanobanan_general', knowledgeBase: 'TCM_Herbal_Formulas.csv' },
  13: { name: 'TCM Oncology Support', promptId: 'nanobanan_oncology', knowledgeBase: 'TCM_Oncology_Support_Enhanced.csv' },
  14: { name: 'Integrative Oncology', promptId: 'nanobanan_oncology', knowledgeBase: 'TCM_Oncology_Support_Enhanced.csv' },
  18: { name: 'Western to TCM Translator', promptId: 'nanobanan_translator', knowledgeBase: 'TCM_Western_Symptom_Translation_Guide.csv' },
  19: { name: 'Grief Insomnia', promptId: 'nanobanan_insomnia', knowledgeBase: 'TCM_Grief_Insomnia_Acupuncture_Points.csv' },
  20: { name: 'Stress & Biofeedback', promptId: 'nanobanan_stress', knowledgeBase: 'tcm_stress_biofeedback_75qa.csv' },
  22: { name: 'Teen Mental Health', promptId: 'nanobanan_teen_health', knowledgeBase: 'TCM_Teenage_Mental_Health_Enhanced_CLEANED.csv' },
  23: { name: 'Profound Crisis', promptId: 'nanobanan_crisis', knowledgeBase: 'Profound_Crisis_QA_100_CLEANED.csv' },
  24: { name: 'Renovada Skin', promptId: 'nanobanan_skin', knowledgeBase: 'TCM_Renovada_Skin_Renewal_100QA_CLEANED.csv' },
  25: { name: 'Extreme Weather', promptId: 'nanobanan_climate', knowledgeBase: 'Extreme_Weather_Climate_TCM_100QA_CLEANED.csv' },
  26: { name: 'Adults 50-70 Vitality', promptId: 'nanobanan_adults_50_70', knowledgeBase: 'TCM_Adults_50_70_Comprehensive_CONDITIONS.csv' },
  27: { name: 'Adults 18-50 General', promptId: 'nanobanan_adults_18_50', knowledgeBase: 'TCM_Adults_18_50_Comprehensive_CONDITIONS.csv' },
  28: { name: 'Elderly Lifestyle', promptId: 'nanobanan_elderly_life', knowledgeBase: 'Elderly_Lifestyle_TCM_Enhanced.csv' },
  29: { name: 'Geriatrics 70-120', promptId: 'nanobanan_geriatrics', knowledgeBase: 'TCM_Clinic 70-120 _100_Common_Conditions_Complete.csv' },
  30: { name: 'Diet & Nutrition', promptId: 'nanobanan_nutrition', knowledgeBase: 'TCM_Diet_Nutrition_100_QA_Complete.csv' },
  31: { name: 'Mindset Performance', promptId: 'nanobanan_mindset', knowledgeBase: 'TCM_Mindset_Mental_100_QA_Complete.csv' },
  32: { name: 'Trauma & Orthopedics', promptId: 'nanobanan_trauma', knowledgeBase: 'trauma corrected.csv' },
  33: { name: 'Immune Resilience', promptId: 'nanobanan_immune', knowledgeBase: 'immune-resilience.csv' },
  34: { name: 'General Wellness', promptId: 'nanobanan_wellness', knowledgeBase: 'wellness_issue_enhanced_fixed.csv' },
  35: { name: 'Children 7-13 School', promptId: 'nanobanan_school_age', knowledgeBase: 'tcm_children_7-13_qa_enhanced.csv' },
  36: { name: 'Pattern Differentiation', promptId: 'nanobanan_bianzheng', knowledgeBase: 'tcm_pattern_differentiation_enhanced.csv' },
};

// Cross-reference databases for secondary sweep
const CROSS_REFERENCE_MODULES = {
  nutrition: { moduleId: 30, name: 'Diet & Nutrition', knowledgeBase: 'TCM_Diet_Nutrition_100_QA_Complete.csv' },
  lifestyle: { moduleId: 28, name: 'Elderly Lifestyle', knowledgeBase: 'Elderly_Lifestyle_TCM_Enhanced.csv' },
  mindset: { moduleId: 31, name: 'Mindset Performance', knowledgeBase: 'TCM_Mindset_Mental_100_QA_Complete.csv' },
};

// System prompt for Deep Search with structured output
const DEEP_SEARCH_SYSTEM_PROMPT = `You are a TCM Clinical Navigator AI providing comprehensive diagnostic reports.
You MUST structure your response in the following sections with clear headers:

## 🏥 Primary Diagnosis
[Main TCM pattern/syndrome diagnosis from the primary module]

## 🪡 Acupuncture Protocol
**Points:** List all recommended points with format [PT:CODE] (e.g., [PT:ST36], [PT:LI4])
**Technique:** Needling technique, depth, and manipulation
**Contraindications:** Any safety considerations

## 🌿 Herbal Prescription
**Formula:** Primary formula name
**Ingredients:** Key herbs with dosages
**Modifications:** Personalization based on presentation

## 🥗 Nutrition Advice
[Cross-referenced dietary recommendations from the Nutrition database]
- Foods to emphasize
- Foods to avoid
- Meal timing suggestions

## 🧘 Lifestyle & Mindset
[Cross-referenced recommendations from Lifestyle/Mindset databases]
- Exercise recommendations
- Sleep hygiene
- Stress management
- Emotional support

## ⚠️ Important Notes
- Safety warnings
- Follow-up recommendations
- When to seek additional care

CRITICAL RULES:
1. ALWAYS use [PT:CODE] format for acupuncture points (e.g., [PT:ST36], [PT:GB34])
2. Base ALL recommendations on the provided knowledge base context
3. If information is not found in context, clearly state "Not found in knowledge base"
4. Provide Hebrew translations where appropriate
5. Be specific and actionable in recommendations`;

interface DeepSearchRequest {
  moduleId: number;
  questionnaireData: Record<string, any>;
  patientAge?: number;
  patientGender?: string;
  chiefComplaint?: string;
  language?: 'en' | 'he';
}

interface DeepSearchResponse {
  success: boolean;
  report?: {
    primaryDiagnosis: string;
    acupunctureProtocol: {
      points: string[];
      technique: string;
      contraindications: string[];
    };
    herbalPrescription: {
      formula: string;
      ingredients: string[];
      modifications: string[];
    };
    nutritionAdvice: string[];
    lifestyleMindset: string[];
    importantNotes: string[];
    rawResponse: string;
    extractedPoints: string[];
  };
  metadata?: {
    moduleUsed: string;
    knowledgeBasesQueried: string[];
    chunksFound: number;
    crossReferencesFound: number;
    translationBridge?: {
      sourceLanguage: 'en' | 'he';
      rawQuery: string;
      retrievalQuery: string;
    };
  };
  error?: string;
}

// Extract acupuncture point codes from response
function extractPointCodes(text: string): string[] {
  const pointPattern = /\[PT:([A-Z]{1,4}\d{1,2})\]/gi;
  const matches = text.matchAll(pointPattern);
  const points = new Set<string>();
  
  for (const match of matches) {
    points.add(match[1].toUpperCase());
  }
  
  // Also extract standalone point codes (e.g., ST36, LI4)
  const standalonePattern = /\b(ST|SP|LI|LU|HT|SI|BL|KI|PC|TE|GB|LR|RN|DU|EX)\s*-?\s*(\d{1,2})\b/gi;
  const standaloneMatches = text.matchAll(standalonePattern);
  
  for (const match of standaloneMatches) {
    const meridian = match[1].toUpperCase();
    const number = match[2];
    points.add(`${meridian}${number}`);
  }
  
  return Array.from(points);
}

// Build search query from questionnaire data
function buildSearchQuery(data: DeepSearchRequest): string {
  const parts: string[] = [];

  if (data.chiefComplaint?.trim()) {
    parts.push(data.chiefComplaint.trim());
  }

  const isNonSignalAnswer = (v: string) => {
    const s = v.trim().toLowerCase();
    return (
      s === 'yes' ||
      s === 'no' ||
      s === 'true' ||
      s === 'false' ||
      s === 'y' ||
      s === 'n' ||
      s === 'na' ||
      s === 'n/a' ||
      s.length < 3
    );
  };

  // Extract only free-text answers (ignore yes/no style answers)
  for (const value of Object.values(data.questionnaireData || {})) {
    if (typeof value === 'string' && !isNonSignalAnswer(value)) {
      parts.push(value.trim());
      continue;
    }

    if (Array.isArray(value)) {
      const joined = value
        .filter((x) => typeof x === 'string')
        .map((x) => (x as string).trim())
        .filter((x) => x && !isNonSignalAnswer(x))
        .join(' ');
      if (joined) parts.push(joined);
    }
  }

  return parts.join('. ');
}

async function translateHebrewToEnglishQuery({
  apiKey,
  moduleName,
  hebrewText,
}: {
  apiKey: string;
  moduleName: string;
  hebrewText: string;
}): Promise<string> {
  const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content:
            'You convert Hebrew clinical text into a concise English search query for retrieving relevant passages from an English TCM knowledge base. Output ONLY the final English query (5-15 words), no quotes, no bullets, no extra text.',
        },
        {
          role: 'user',
          content: `Module: ${moduleName}\nHebrew input: ${hebrewText}\nReturn the English search query:`,
        },
      ],
      temperature: 0.2,
    }),
  });

  if (!resp.ok) {
    const t = await resp.text();
    console.error('Translation gateway error:', resp.status, t);
    if (resp.status === 429) throw new HttpError(429, 'Rate limits exceeded. Please try again shortly.');
    if (resp.status === 402) throw new HttpError(402, 'AI credits required. Please add credits and try again.');
    throw new HttpError(500, 'Translation step failed.');
  }

  const data = await resp.json();
  const content = (data.choices?.[0]?.message?.content as string | undefined) ?? '';
  const cleaned = content.replace(/[\r\n]+/g, ' ').trim().replace(/^"|"$/g, '');
  return cleaned;
}


serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ code: 401, message: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create auth client with user's token
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ code: 401, message: 'Invalid JWT' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create service client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const requestData: DeepSearchRequest = await req.json();
    const { moduleId, questionnaireData, patientAge, patientGender, chiefComplaint, language = 'en' } = requestData;

    console.log(`=== DEEP SEARCH START ===`);
    console.log(`Module: ${moduleId} - ${MODULE_KNOWLEDGE_MAP[moduleId]?.name}`);
    console.log(`User: ${user.id}`);

    // Validate module
    const moduleInfo = MODULE_KNOWLEDGE_MAP[moduleId];
    if (!moduleInfo) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Invalid module ID: ${moduleId}` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare AI gateway key (used for both translation bridge + report generation)
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build search query
    const rawSearchQuery = buildSearchQuery(requestData);
    console.log(`Raw search query: ${rawSearchQuery.substring(0, 200)}...`);

    let retrievalSearchQuery = rawSearchQuery;
    let translationBridge:
      | {
          sourceLanguage: 'en' | 'he';
          rawQuery: string;
          retrievalQuery: string;
        }
      | undefined;

    // Translation Bridge: Hebrew -> English keywords before searching English CSV knowledge
    if (language === 'he' && rawSearchQuery.trim()) {
      const translated = await translateHebrewToEnglishQuery({
        apiKey: LOVABLE_API_KEY,
        moduleName: moduleInfo.name,
        hebrewText: rawSearchQuery,
      });

      if (translated.trim()) {
        retrievalSearchQuery = translated;
        translationBridge = {
          sourceLanguage: 'he',
          rawQuery: rawSearchQuery,
          retrievalQuery: retrievalSearchQuery,
        };
        console.log(`Translation bridge active. Retrieval query (EN): ${retrievalSearchQuery}`);
      }
    }

    if (!retrievalSearchQuery.trim()) {
      console.log('Warning: empty retrievalSearchQuery (no free-text inputs were provided).');
    }


    // === STEP 1: Primary Retrieval ===
    console.log(`=== PRIMARY RETRIEVAL: ${moduleInfo.knowledgeBase} ===`);
    
    const { data: primaryChunks, error: primaryError } = await supabase
      .from('knowledge_chunks')
      .select(`
        id,
        content,
        question,
        answer,
        chunk_index,
        document_id,
        knowledge_documents!inner(file_name, original_name, category)
      `)
      .ilike('knowledge_documents.original_name', `%${moduleInfo.knowledgeBase.replace('.csv', '')}%`)
      .textSearch('content', retrievalSearchQuery.split(' ').slice(0, 8).join(' | '), {
        type: 'websearch',
        config: 'english'
      })
      .limit(20);

    const primaryResults = primaryChunks || [];
    console.log(`Primary chunks found: ${primaryResults.length}`);

    // === STEP 2: Secondary Sweep - Cross-reference ===
    console.log(`=== SECONDARY SWEEP: Nutrition, Lifestyle, Mindset ===`);
    
    const crossReferencePromises = Object.entries(CROSS_REFERENCE_MODULES).map(async ([key, module]) => {
      // Skip if same as primary
      if (module.moduleId === moduleId) return { key, chunks: [] };

      const { data: chunks } = await supabase
        .from('knowledge_chunks')
        .select(`
          id,
          content,
          question,
          answer,
          chunk_index,
          document_id,
          knowledge_documents!inner(file_name, original_name, category)
        `)
        .ilike('knowledge_documents.original_name', `%${module.knowledgeBase.replace('.csv', '')}%`)
        .textSearch('content', retrievalSearchQuery.split(' ').slice(0, 6).join(' | '), {
          type: 'websearch',
          config: 'english'
        })
        .limit(10);

      return { key, chunks: chunks || [] };
    });

    const crossReferenceResults = await Promise.all(crossReferencePromises);
    
    let nutritionContext = '';
    let lifestyleContext = '';
    let mindsetContext = '';
    let totalCrossRefs = 0;

    for (const result of crossReferenceResults) {
      totalCrossRefs += result.chunks.length;
      const context = result.chunks
        .map((c: any) => c.question && c.answer ? `Q: ${c.question}\nA: ${c.answer}` : c.content)
        .join('\n\n');
      
      if (result.key === 'nutrition') nutritionContext = context;
      if (result.key === 'lifestyle') lifestyleContext = context;
      if (result.key === 'mindset') mindsetContext = context;
    }

    console.log(`Cross-reference chunks found: ${totalCrossRefs}`);

    // === STEP 3: Build Context ===
    const primaryContext = primaryResults
      .map((c: any) => c.question && c.answer ? `Q: ${c.question}\nA: ${c.answer}` : c.content)
      .join('\n\n');

    const fullContext = `
=== PRIMARY MODULE: ${moduleInfo.name} ===
${primaryContext || 'No specific content found in primary module.'}

=== NUTRITION DATABASE ===
${nutritionContext || 'No specific nutrition advice found.'}

=== LIFESTYLE DATABASE ===
${lifestyleContext || 'No specific lifestyle recommendations found.'}

=== MINDSET DATABASE ===
${mindsetContext || 'No specific mindset/mental guidance found.'}
`;

    // === STEP 4: Generate AI Response ===
    // LOVABLE_API_KEY already validated above (also used for the translation bridge)

    const languageInstruction = language === 'he' 
      ? '\n\nIMPORTANT: Respond in Hebrew (עברית). Use Hebrew for all explanatory text while keeping TCM terminology in English/Pinyin.'
      : '\n\nRespond in English.';

    const systemPrompt = DEEP_SEARCH_SYSTEM_PROMPT + languageInstruction + `\n\n=== KNOWLEDGE BASE CONTEXT ===\n${fullContext}\n=== END CONTEXT ===`;

    const userMessage = `
Please provide a comprehensive clinical report for the following case:

Chief Complaint: ${chiefComplaint || 'Not specified'}
Patient Age: ${patientAge || 'Not specified'}
Patient Gender: ${patientGender || 'Not specified'}

Questionnaire Responses:
${JSON.stringify(questionnaireData, null, 2)}

Please analyze this case and provide a complete treatment plan following the structured format.
`;

    console.log(`=== GENERATING AI RESPONSE ===`);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      if (aiResponse.status === 429) throw new HttpError(429, 'Rate limits exceeded. Please try again shortly.');
      if (aiResponse.status === 402) throw new HttpError(402, 'AI credits required. Please add credits and try again.');
      throw new HttpError(500, `AI service error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const rawResponse = aiData.choices?.[0]?.message?.content || '';

    console.log(`AI response length: ${rawResponse.length} chars`);

    // === STEP 5: Extract structured data ===
    const extractedPoints = extractPointCodes(rawResponse);
    console.log(`Extracted points: ${extractedPoints.join(', ')}`);

    // Parse sections from response - flexible regex without requiring emojis
    const sections = {
      primaryDiagnosis: '',
      acupunctureProtocol: { points: extractedPoints, technique: '', contraindications: [] as string[] },
      herbalPrescription: { formula: '', ingredients: [] as string[], modifications: [] as string[] },
      nutritionAdvice: [] as string[],
      lifestyleMindset: [] as string[],
      importantNotes: [] as string[],
    };

    // Extract diagnosis section (flexible - with or without emoji)
    const diagnosisMatch = rawResponse.match(/##\s*(?:🏥\s*)?Primary Diagnosis\s*([\s\S]*?)(?=##|$)/i);
    if (diagnosisMatch) {
      sections.primaryDiagnosis = diagnosisMatch[1].trim();
    } else {
      // Fallback: use the entire rawResponse as diagnosis if no sections found
      const firstParagraph = rawResponse.split('\n\n')[0]?.trim() || rawResponse.substring(0, 500);
      sections.primaryDiagnosis = firstParagraph;
    }

    // Extract acupuncture section (flexible)
    const acuMatch = rawResponse.match(/##\s*(?:🪡\s*)?Acupuncture Protocol\s*([\s\S]*?)(?=##|$)/i);
    if (acuMatch) {
      const acuText = acuMatch[1];
      const techniqueMatch = acuText.match(/\*\*Technique[:\s]*\*\*\s*(.*?)(?=\*\*|\n\n|$)/is);
      if (techniqueMatch) sections.acupunctureProtocol.technique = techniqueMatch[1].trim();
    }

    // Extract herbal section (flexible)
    const herbalMatch = rawResponse.match(/##\s*(?:🌿\s*)?Herbal Prescription\s*([\s\S]*?)(?=##|$)/i);
    if (herbalMatch) {
      const herbalText = herbalMatch[1];
      const formulaMatch = herbalText.match(/\*\*Formula[:\s]*\*\*\s*(.*?)(?=\*\*|\n|$)/is);
      if (formulaMatch) sections.herbalPrescription.formula = formulaMatch[1].trim();
      
      // Extract ingredients as lines starting with -
      sections.herbalPrescription.ingredients = herbalText.split('\n')
        .filter((line: string) => line.trim().startsWith('-'))
        .map((line: string) => line.replace(/^-\s*/, '').trim());
    }

    // Extract nutrition section (flexible)
    const nutritionMatch = rawResponse.match(/##\s*(?:🥗\s*)?Nutrition(?:\s*Advice)?\s*([\s\S]*?)(?=##|$)/i);
    if (nutritionMatch) {
      sections.nutritionAdvice = nutritionMatch[1].split('\n')
        .filter((line: string) => line.trim().startsWith('-') || line.trim().match(/^\d+\./))
        .map((line: string) => line.replace(/^[-\d.]+\s*/, '').trim())
        .filter((line: string) => line.length > 0);
    }

    // Extract lifestyle section (flexible)
    const lifestyleMatch = rawResponse.match(/##\s*(?:🧘\s*)?Lifestyle(?:\s*(?:&|and)\s*Mindset)?\s*([\s\S]*?)(?=##|$)/i);
    if (lifestyleMatch) {
      sections.lifestyleMindset = lifestyleMatch[1].split('\n')
        .filter((line: string) => line.trim().startsWith('-') || line.trim().match(/^\d+\./))
        .map((line: string) => line.replace(/^[-\d.]+\s*/, '').trim())
        .filter((line: string) => line.length > 0);
    }
    
    // Extract important notes (flexible)
    const notesMatch = rawResponse.match(/##\s*(?:⚠️\s*)?Important Notes\s*([\s\S]*?)(?=##|$)/i);
    if (notesMatch) {
      sections.importantNotes = notesMatch[1].split('\n')
        .filter((line: string) => line.trim().startsWith('-') || line.trim().match(/^\d+\./))
        .map((line: string) => line.replace(/^[-\d.]+\s*/, '').trim())
        .filter((line: string) => line.length > 0);
    }
    
    console.log(`Parsed sections: diagnosis=${sections.primaryDiagnosis.length} chars, points=${sections.acupunctureProtocol.points.length}, nutrition=${sections.nutritionAdvice.length}, lifestyle=${sections.lifestyleMindset.length}`);

    // Log usage
    try {
      await supabase.from('usage_logs').insert({
        user_id: user.id,
        action_type: 'clinical_deep_search',
        tokens_used: aiData.usage?.total_tokens || 0,
        metadata: {
          moduleId,
          moduleName: moduleInfo.name,
          pointsFound: extractedPoints.length,
          crossRefsFound: totalCrossRefs,
          translationBridgeActive: !!translationBridge,
          retrievalSearchQuery,
        }
      });
    } catch (logErr) {
      console.error('Failed to log usage:', logErr);
    }

    const response: DeepSearchResponse = {
      success: true,
      report: {
        ...sections,
        rawResponse,
        extractedPoints,
      },
      metadata: {
        moduleUsed: moduleInfo.name,
        knowledgeBasesQueried: [
          moduleInfo.knowledgeBase,
          ...Object.values(CROSS_REFERENCE_MODULES).map(m => m.knowledgeBase)
        ],
        chunksFound: primaryResults.length,
        crossReferencesFound: totalCrossRefs,
        translationBridge,
      },
    };

    console.log(`=== DEEP SEARCH COMPLETE ===`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Deep Search error:', error);

    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'Unknown error';

    return new Response(JSON.stringify({
      success: false,
      error: message,
    }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

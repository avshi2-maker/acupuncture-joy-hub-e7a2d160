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
 * 
 * MASTER CONFIG SOURCE: This config is the single source of truth for module configurations.
 * It links Module ID -> CSV Filename -> System Prompt
 */

// ═══════════════════════════════════════════════════════════════════════════════
// MASTER MODULE CONFIGURATION - THE IRON-CLAD TRUTH SOURCE
// DO NOT USE INTERNAL DEFAULTS - USE THIS CONFIG FOR EVERYTHING
// ═══════════════════════════════════════════════════════════════════════════════

interface MasterModuleConfig {
  id: number;
  name: string;
  csvFilename: string;      // Exact filename in RAG database (knowledge_documents.original_name)
  systemPrompt: string;     // The "Brain" logic for this specific module
}

const MASTER_MODULE_CONFIG: Record<number, MasterModuleConfig> = {
  // === EXISTING MODULES ===
  1: {
    id: 1,
    name: "TCM Shen Mind Emotions",
    csvFilename: "Mental Health TCM Q&A",
    systemPrompt: `ROLE: You are a compassionate TCM Psychiatrist.
LOGIC: Analyze the user's emotional state (Shen).
CONNECTION: If anxiety/insomnia is detected, command the 3D model to ZOOM to Heart-7 (Shenmen) or Yintang.
OUTPUT: Combine emotional validation with specific point prescriptions.`
  },
  2: {
    id: 2,
    name: "TCM Pattern Identification",
    csvFilename: "tcm_pattern_differentiation",
    systemPrompt: `ROLE: You are a TCM Pattern Identification Specialist.
LOGIC: Identify the primary TCM pattern (Bian Zheng) from symptoms.
OUTPUT: Provide pattern name, key differentiating signs, and treatment principle.`
  },
  3: {
    id: 3,
    name: "TCM Yin Yang Constitution",
    csvFilename: "nine_constitutions_qa_100",
    systemPrompt: `ROLE: You are a TCM Constitution Analyst.
LOGIC: Assess the patient's constitutional type based on Yin/Yang balance.
OUTPUT: Identify constitution type and provide personalized lifestyle recommendations.`
  },
  4: {
    id: 4,
    name: "TCM Pulse Diagnosis",
    csvFilename: "Pulse Diagnosis Q&A",
    systemPrompt: `ROLE: You are a TCM Pulse Diagnosis Expert.
LOGIC: Interpret pulse qualities and their clinical significance.
OUTPUT: Describe pulse findings and their relationship to internal organ function.`
  },
  5: {
    id: 5,
    name: "TCM Tongue Diagnosis",
    csvFilename: "tongue-diagnosis",
    systemPrompt: `ROLE: You are a TCM Tongue Diagnosis Specialist.
LOGIC: Analyze tongue body, coating, and features for diagnostic information.
OUTPUT: Correlate tongue findings with internal patterns and provide treatment guidance.`
  },
  6: {
    id: 6,
    name: "TCM Qi Blood Fluids",
    csvFilename: "energy-channels-100-qa",
    systemPrompt: `ROLE: You are a TCM Qi, Blood, and Body Fluids Specialist.
LOGIC: Assess the state of Qi, Blood, and Jin-Ye (Body Fluids).
OUTPUT: Identify deficiencies, stagnation, or pathological accumulation patterns.`
  },
  7: {
    id: 7,
    name: "TCM Six Stages",
    csvFilename: "QA_Professional_Corrected_4Columns",
    systemPrompt: `ROLE: You are a Shang Han Lun (Six Stages) Expert.
LOGIC: Apply the Six Stages theory to externally-contracted diseases.
OUTPUT: Identify the stage of disease progression and appropriate formulas.`
  },
  8: {
    id: 8,
    name: "TCM San Jiao Wei Qi",
    csvFilename: "energy-channels-100-qa",
    systemPrompt: `ROLE: You are a San Jiao and Wei Qi Specialist.
LOGIC: Analyze the Triple Burner and Defensive Qi systems.
OUTPUT: Provide treatment strategies for water metabolism and immune function.`
  },
  9: {
    id: 9,
    name: "TCM Pediatric",
    csvFilename: "tcm_children_7-13",
    systemPrompt: `ROLE: You are a Pediatric TCM Specialist.
LOGIC: Apply age-appropriate TCM principles for children.
OUTPUT: Provide gentle, child-friendly treatment protocols.`
  },
  10: {
    id: 10,
    name: "TCM Herbal Medicine",
    csvFilename: "herbal 200 formula",
    systemPrompt: `ROLE: You are a TCM Herbal Medicine Expert.
LOGIC: Match patterns to appropriate herbal formulas.
OUTPUT: Provide formula recommendations with ingredient explanations.`
  },
  11: {
    id: 11,
    name: "TCM Herbal Formulas",
    csvFilename: "TCM Herbal Formulas Comprehensive",
    systemPrompt: `ROLE: You are a Classical Formula Specialist.
LOGIC: Select and modify classical formulas for specific presentations.
OUTPUT: Explain formula composition, modifications, and dosing.`
  },
  12: {
    id: 12,
    name: "TCM Herbal Matching",
    csvFilename: "herbal 200 formula",
    systemPrompt: `ROLE: You are a Herb Pairing Specialist.
LOGIC: Match individual herbs to patient conditions.
OUTPUT: Provide herb selections with actions and contraindications.`
  },
  13: {
    id: 13,
    name: "TCM Oncology Support",
    csvFilename: "TCM Oncology Comprehensive",
    systemPrompt: `ROLE: You are an Integrative Oncology TCM Specialist.
LOGIC: Support cancer patients with TCM alongside conventional treatment.
OUTPUT: Provide supportive care protocols for side effect management.`
  },
  14: {
    id: 14,
    name: "Integrative Oncology",
    csvFilename: "TCM Oncology Comprehensive",
    systemPrompt: `ROLE: You are an Integrative Oncology Consultant.
LOGIC: Bridge Western oncology with TCM supportive care.
OUTPUT: Coordinate treatment timing and manage interactions.`
  },
  15: {
    id: 15,
    name: "TCM Gynecology",
    csvFilename: "Women Health Guide",
    systemPrompt: `ROLE: You are a TCM Gynecology Specialist.
LOGIC: Address women's health conditions with TCM.
OUTPUT: Provide cycle-aware treatment protocols.`
  },
  16: {
    id: 16,
    name: "TCM Fertility Support",
    csvFilename: "Fertility Protocols",
    systemPrompt: `ROLE: You are a TCM Fertility Specialist.
LOGIC: Support conception through TCM protocols.
OUTPUT: Provide phase-specific treatment for fertility optimization.`
  },
  17: {
    id: 17,
    name: "TCM Pregnancy Care",
    csvFilename: "Pregnancy Trimester Guide",
    systemPrompt: `ROLE: You are a TCM Pregnancy Care Specialist.
LOGIC: Provide safe TCM support during pregnancy.
OUTPUT: Trimester-appropriate treatments with safety considerations.`
  },
  18: {
    id: 18,
    name: "Western to TCM Translator",
    csvFilename: "chief-complaints-tcm",
    systemPrompt: `ROLE: You are a Western-TCM Translation Specialist.
LOGIC: Convert Western diagnoses to TCM pattern equivalents.
OUTPUT: Bridge terminology and explain pattern correlations.`
  },
  19: {
    id: 19,
    name: "Grief Insomnia",
    csvFilename: "Mental Health TCM Q&A",
    systemPrompt: `ROLE: You are a TCM Sleep and Grief Specialist.
LOGIC: Address insomnia and grief with Shen-calming approaches.
OUTPUT: Provide protocols for sleep restoration and emotional healing.`
  },
  20: {
    id: 20,
    name: "Stress & Biofeedback",
    csvFilename: "Work_Stress_Burnout",
    systemPrompt: `ROLE: You are a TCM Stress Management Specialist.
LOGIC: Address burnout and chronic stress patterns.
OUTPUT: Provide stress-reduction protocols and lifestyle modifications.`
  },
  21: {
    id: 21,
    name: "TCM Addiction Recovery",
    csvFilename: "Mental Health TCM Q&A",
    systemPrompt: `ROLE: You are a TCM Addiction Recovery Specialist.
LOGIC: Support recovery with TCM detox and craving management.
OUTPUT: Provide protocols for withdrawal support and long-term recovery.`
  },
  22: {
    id: 22,
    name: "Teen Mental Health",
    csvFilename: "Mental Health TCM Q&A",
    systemPrompt: `ROLE: You are a Teen Mental Health TCM Specialist.
LOGIC: Address adolescent mental health with age-appropriate TCM.
OUTPUT: Provide protocols for anxiety, depression, and stress in teens.`
  },
  23: {
    id: 23,
    name: "Profound Crisis",
    csvFilename: "Profound_Crisis_QA_100",
    systemPrompt: `ROLE: You are a TCM Crisis Intervention Specialist.
LOGIC: Provide TCM support during acute emotional crises.
OUTPUT: Offer stabilization protocols and Shen-anchoring treatments.`
  },
  24: {
    id: 24,
    name: "Renovada Skin",
    csvFilename: "skin_disease_qa_100",
    systemPrompt: `ROLE: You are a TCM Dermatology Specialist.
LOGIC: Address skin conditions through internal TCM patterns.
OUTPUT: Provide internal and external treatment protocols.`
  },
  25: {
    id: 25,
    name: "Extreme Weather",
    csvFilename: "Extreme_Weather_Climate",
    systemPrompt: `ROLE: You are a TCM Climate Adaptation Specialist.
LOGIC: Address health issues from extreme weather exposure.
OUTPUT: Provide seasonal and climate-specific treatment protocols.`
  },
  26: {
    id: 26,
    name: "Adults 50-70 Vitality",
    csvFilename: "adults_50_70",
    systemPrompt: `ROLE: You are a TCM Vitality Specialist for Adults 50-70.
LOGIC: Address age-related decline and maintain vitality.
OUTPUT: Provide longevity-focused treatment protocols.`
  },
  27: {
    id: 27,
    name: "Adults 18-50 General",
    csvFilename: "Age Prompts Adults (18-50)",
    systemPrompt: `ROLE: You are a TCM General Wellness Specialist for Adults.
LOGIC: Address common health concerns for working-age adults.
OUTPUT: Provide practical wellness protocols.`
  },
  28: {
    id: 28,
    name: "Elderly Lifestyle",
    csvFilename: "Elderly_Lifestyle_TCM",
    systemPrompt: `ROLE: You are a TCM Geriatric Lifestyle Specialist.
LOGIC: Support healthy aging with lifestyle modifications.
OUTPUT: Provide gentle, sustainable health recommendations.`
  },
  29: {
    id: 29,
    name: "Geriatrics 70-120",
    csvFilename: "TCM_Clinic 70-120",
    systemPrompt: `ROLE: You are a TCM Geriatric Specialist.
LOGIC: Address complex health needs of elderly patients.
OUTPUT: Provide safe, gentle treatment protocols.`
  },
  30: {
    id: 30,
    name: "Diet & Nutrition",
    csvFilename: "NUTRITION",
    systemPrompt: `ROLE: You are a TCM Dietary Therapy Specialist.
LOGIC: Apply food therapy principles to health conditions.
OUTPUT: Provide dietary recommendations based on pattern and constitution.`
  },
  31: {
    id: 31,
    name: "Mindset Performance",
    csvFilename: "TCM_Mindset_Mental_100",
    systemPrompt: `ROLE: You are a TCM Mental Performance Specialist.
LOGIC: Optimize cognitive function and mental clarity.
OUTPUT: Provide protocols for focus, memory, and mental resilience.`
  },
  32: {
    id: 32,
    name: "Trauma & Orthopedics",
    csvFilename: "TCM_Trauma",
    systemPrompt: `ROLE: You are a TCM Trauma and Orthopedic Specialist.
LOGIC: Address musculoskeletal injuries and trauma.
OUTPUT: Provide recovery protocols combining acupuncture and herbs.`
  },
  33: {
    id: 33,
    name: "Immune Resilience",
    csvFilename: "immune-resilience",
    systemPrompt: `ROLE: You are a TCM Immunology Specialist.
LOGIC: Strengthen Wei Qi and immune function.
OUTPUT: Provide immune-boosting protocols for prevention and recovery.`
  },
  34: {
    id: 34,
    name: "General Wellness",
    csvFilename: "wellness_issue_enhanced",
    systemPrompt: `ROLE: You are a TCM General Wellness Consultant.
LOGIC: Address common wellness concerns with holistic TCM.
OUTPUT: Provide balanced treatment recommendations.`
  },
  35: {
    id: 35,
    name: "Children 7-13 School",
    csvFilename: "tcm_children_7-13",
    systemPrompt: `ROLE: You are a School-Age Pediatric TCM Specialist.
LOGIC: Address health concerns for school-age children.
OUTPUT: Provide child-friendly treatment protocols.`
  },
  36: {
    id: 36,
    name: "Pattern Differentiation",
    csvFilename: "tcm_pattern_differentiation",
    systemPrompt: `ROLE: You are a Bian Zheng (Pattern Differentiation) Master.
LOGIC: Systematically differentiate TCM patterns from symptoms.
OUTPUT: Provide clear pattern diagnosis with treatment principles.`
  },

  // === THE NEW "ROLLS-ROYCE" MODULES ===
  37: {
    id: 37,
    name: "Sports Performance Recovery",
    csvFilename: "sport_performance_100_qa",
    systemPrompt: `ROLE: You are an expert Sports Medicine Physician and TCM Orthopedic Specialist.
CONTEXT: The user is an athlete seeking immediate recovery or performance optimization.
NANO-BANAN PROTOCOL:
1. IDENTIFY: Detect the user's specific sport and injury (e.g., 'Runner's Knee').
2. RETRIEVE: Search 'sport_performance_100_qa.csv' for the exact protocol.
3. 3D LINK:
   - Leg/Knee Issue -> ZOOM to ST36/SP9.
   - Arm/Shoulder Issue -> ZOOM to LI15/SI9.
   - Back Issue -> ROTATE to Posterior View (BL23).
4. OUTPUT: Structure the answer with 'Western Mechanics' (Ice/Rest) + 'TCM Alchemy' (Points/Herbs).
5. ALWAYS include the specific Trigger Points and Pharmacopeia from the knowledge base.`
  },

  38: {
    id: 38,
    name: "Elite Lifestyle & Longevity",
    csvFilename: "elite_lifestyle_longevity",
    systemPrompt: `ROLE: You are a Concierge Longevity Doctor for high-net-worth individuals.
CONTEXT: The user is an executive or elite enthusiast (Golf, Ski, Biohacking, Yachting).
NANO-BANAN PROTOCOL:
1. IDENTIFY: Detect the high-performance stressor (Jet Lag, Burnout, Golf Swing, Ski Injury).
2. RETRIEVE: Search 'elite_lifestyle_longevity.csv' for the executive protocol.
3. 3D LINK:
   - Stress/Burnout -> ZOOM to Head/Face (Shen points).
   - Structural Pain -> ROTATE to specific joint.
4. OUTPUT: Provide sophisticated, efficient advice. Focus on 'Bio-Hacking' combined with ancient wisdom.
5. ALWAYS include the specific Trigger Points and Pharmacopeia from the knowledge base.`
  },

  // === ADDITIONAL MODULES ===
  39: {
    id: 39,
    name: "Brain Health",
    csvFilename: "Brain Health TCM",
    systemPrompt: `ROLE: You are a TCM Neurology and Brain Health Specialist.
LOGIC: Address cognitive decline, neurological symptoms, and brain optimization.
OUTPUT: Provide protocols for brain health and neuroprotection.`
  },
  40: {
    id: 40,
    name: "Vagus Nerve",
    csvFilename: "Vagus Nerve Q&A",
    systemPrompt: `ROLE: You are a Vagus Nerve and Autonomic Specialist.
LOGIC: Optimize vagal tone and parasympathetic function.
OUTPUT: Provide protocols for vagal stimulation and nervous system balance.`
  },
  41: {
    id: 41,
    name: "Digestive Disorders",
    csvFilename: "digestive-disorders",
    systemPrompt: `ROLE: You are a TCM Gastroenterology Specialist.
LOGIC: Address digestive complaints through Spleen/Stomach patterns.
OUTPUT: Provide comprehensive digestive treatment protocols.`
  },
  42: {
    id: 42,
    name: "Gastric Conditions",
    csvFilename: "Gastric Conditions",
    systemPrompt: `ROLE: You are a TCM Gastric Health Specialist.
LOGIC: Address stomach-specific conditions and acid-related issues.
OUTPUT: Provide targeted gastric treatment protocols.`
  }
};

// Helper function to get module config with fallback
function getModuleConfig(moduleId: number): MasterModuleConfig {
  return MASTER_MODULE_CONFIG[moduleId] || {
    id: moduleId,
    name: "General Wellness",
    csvFilename: "QA_Professional_Corrected_4Columns",
    systemPrompt: "You are a helpful TCM Assistant. Provide holistic health advice based on Traditional Chinese Medicine principles."
  };
}

// Default fallback for unknown modules
const DEFAULT_KNOWLEDGE_BASE = 'QA_Professional_Corrected_4Columns';

// Cross-reference databases for secondary sweep
const CROSS_REFERENCE_MODULES = {
  nutrition: { moduleId: 30, name: 'Diet & Nutrition', knowledgeBase: 'NUTRITION', fallbackKB: 'tcm_clinic_diet_nutrition' },
  lifestyle: { moduleId: 28, name: 'Elderly Lifestyle', knowledgeBase: 'Elderly_Lifestyle_TCM', fallbackKB: 'Natural Healing' },
  mindset: { moduleId: 31, name: 'Mindset Performance', knowledgeBase: 'TCM_Mindset_Mental_100', fallbackKB: 'Mental Health TCM Q&A' },
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

interface QuestionAnswer {
  questionId: string;
  questionText: string;
  answer: string | boolean | string[];
}

interface DeepSearchRequest {
  moduleId: number;
  questionnaireData: Record<string, QuestionAnswer>;
  patientAge?: number;
  patientGender?: string;
  chiefComplaint?: string;
  language?: 'en' | 'he';
}

interface SourcedRecommendation {
  text: string;
  source?: string;
}

// 3D Command for controlling body figure display
interface BodyFigureCommand {
  target_point: string;        // Primary point to focus on (e.g., "BL23")
  camera_action: 'focus' | 'highlight' | 'tour';  // What to do with the camera/view
  camera_angle: 'anterior' | 'posterior' | 'lateral_left' | 'lateral_right' | 'superior' | 'auto';
  secondary_points?: string[]; // Additional points to show
}

interface DeepSearchResponse {
  success: boolean;
  report?: {
    primaryDiagnosis: string;
    primaryDiagnosisSources: string[];
    acupunctureProtocol: {
      points: string[];
      technique: string;
      contraindications: string[];
      sources: string[];
    };
    herbalPrescription: {
      formula: string;
      ingredients: string[];
      modifications: string[];
      sources: string[];
    };
    nutritionAdvice: SourcedRecommendation[];
    lifestyleMindset: SourcedRecommendation[];
    importantNotes: string[];
    rawResponse: string;
    extractedPoints: string[];
    // NEW: 3D/Body Figure Control Command
    body_figure_command?: BodyFigureCommand;
  };
  metadata?: {
    moduleUsed: string;
    knowledgeBasesQueried: string[];
    chunksFound: number;
    crossReferencesFound: number;
    sourcesUsed: string[];
    translationBridge?: {
      sourceLanguage: 'en' | 'he';
      rawQuery: string;
      retrievalQuery: string;
    };
    source_file?: string;  // Primary knowledge source file used
    isExternalAIFallback?: boolean;  // Flag when RAG returned 0 results
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

// Determine camera angle based on point meridian locations
function determineCameraAngle(points: string[]): BodyFigureCommand['camera_angle'] {
  if (points.length === 0) return 'auto';
  
  // Check for back/posterior points (BL, DU, back-related)
  const posteriorMeridians = ['BL', 'DU'];
  const anteriorMeridians = ['RN', 'ST', 'SP', 'KI', 'LR'];
  const lateralMeridians = ['GB', 'TE', 'SI'];
  
  let posteriorCount = 0;
  let anteriorCount = 0;
  let lateralCount = 0;
  
  for (const point of points) {
    const meridian = point.replace(/\d+/g, '').toUpperCase();
    if (posteriorMeridians.includes(meridian)) posteriorCount++;
    else if (anteriorMeridians.includes(meridian)) anteriorCount++;
    else if (lateralMeridians.includes(meridian)) lateralCount++;
  }
  
  if (posteriorCount > anteriorCount && posteriorCount > lateralCount) return 'posterior';
  if (lateralCount > anteriorCount && lateralCount > posteriorCount) return 'lateral_left';
  return 'anterior';
}

// Generate body figure command from extracted points
function generateBodyFigureCommand(points: string[]): BodyFigureCommand | undefined {
  if (points.length === 0) return undefined;
  
  return {
    target_point: points[0], // Primary point to focus on
    camera_action: points.length > 3 ? 'tour' : 'focus',
    camera_angle: determineCameraAngle(points),
    secondary_points: points.slice(1),
  };
}

// Build search query from questionnaire data
// Now includes question text for "Yes" answers
function buildSearchQuery(data: DeepSearchRequest): string {
  const parts: string[] = [];

  if (data.chiefComplaint?.trim()) {
    parts.push(data.chiefComplaint.trim());
  }

  const isYesAnswer = (v: string | boolean): boolean => {
    if (typeof v === 'boolean') return v === true;
    const s = String(v).trim().toLowerCase();
    return s === 'yes' || s === 'true' || s === 'y' || s === 'כן';
  };

  const isNoAnswer = (v: string | boolean): boolean => {
    if (typeof v === 'boolean') return v === false;
    const s = String(v).trim().toLowerCase();
    return s === 'no' || s === 'false' || s === 'n' || s === 'לא' || s === 'na' || s === 'n/a';
  };

  const isFreeTextSignificant = (v: string): boolean => {
    const s = v.trim();
    return s.length >= 3 && !isYesAnswer(s) && !isNoAnswer(s);
  };

  // Process each question-answer pair
  for (const [key, qa] of Object.entries(data.questionnaireData || {})) {
    // Handle structured QuestionAnswer objects
    if (qa && typeof qa === 'object' && 'questionText' in qa && 'answer' in qa) {
      const { questionText, answer } = qa as QuestionAnswer;
      
      // If answer is "Yes", include the question text as a positive signal
      if (isYesAnswer(answer as string | boolean) && questionText?.trim()) {
        parts.push(questionText.trim());
        continue;
      }
      
      // If answer is meaningful free text, include it
      if (typeof answer === 'string' && isFreeTextSignificant(answer)) {
        parts.push(answer.trim());
        continue;
      }
      
      // If answer is array of selections, include them
      if (Array.isArray(answer)) {
        const joined = answer
          .filter((x) => typeof x === 'string' && isFreeTextSignificant(x))
          .map((x) => (x as string).trim())
          .join(' ');
        if (joined) parts.push(joined);
      }
      continue;
    }

    // Fallback: handle legacy flat values (any type)
    const value = qa as unknown;
    if (typeof value === 'string' && isFreeTextSignificant(value)) {
      parts.push(value.trim());
      continue;
    }

    if (Array.isArray(value)) {
      const joined = (value as unknown[])
        .filter((x): x is string => typeof x === 'string' && isFreeTextSignificant(x))
        .map((x) => x.trim())
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
    
    // Get module configuration from MASTER_MODULE_CONFIG
    const moduleConfig = getModuleConfig(moduleId);
    console.log(`Module: ${moduleId} - ${moduleConfig.name}`);
    console.log(`CSV Target: ${moduleConfig.csvFilename}`);
    console.log(`User: ${user.id}`);

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
        moduleName: moduleConfig.name,
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
    console.log(`=== PRIMARY RETRIEVAL: ${moduleConfig.csvFilename} ===`);
    
    // Extract clean keywords for search
    const keywords = retrievalSearchQuery
      .replace(/[:\-\/\\()[\]{}'"!@#$%^&*+=<>?,;.]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2)
      .slice(0, 6);
    
    console.log(`Search keywords: ${keywords.join(', ')}`);
    console.log(`Target knowledge base: ${moduleConfig.csvFilename}`);
    
    // === SCOPED PRIMARY SEARCH ===
    let primaryResults: any[] = [];
    
    if (keywords.length > 0) {
      // Build keyword OR conditions
      const keywordConditions = keywords.map(k => `content.ilike.%${k}%`).join(',');
      
      // Strategy 1: Search in primary knowledge base (module-scoped)
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
        .ilike('knowledge_documents.original_name', `%${moduleConfig.csvFilename}%`)
        .or(keywordConditions)
        .limit(20);
      
      if (primaryError) {
        console.error('Primary scoped search error:', primaryError);
      } else {
        primaryResults = primaryChunks || [];
        console.log(`Primary scoped search found: ${primaryResults.length} chunks from ${moduleConfig.csvFilename}`);
      }
      
      // Strategy 2: If no results, try DEFAULT knowledge base
      if (primaryResults.length === 0) {
        console.log(`Trying default KB: ${DEFAULT_KNOWLEDGE_BASE}`);
        const { data: defaultChunks } = await supabase
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
          .ilike('knowledge_documents.original_name', `%${DEFAULT_KNOWLEDGE_BASE.replace('.csv', '')}%`)
          .or(keywordConditions)
          .limit(20);
        
        primaryResults = defaultChunks || [];
        console.log(`Default KB found: ${primaryResults.length} chunks`);
      }
    }

    console.log(`Primary chunks found: ${primaryResults.length}`);

    // === EXTERNAL AI FALLBACK CHECK ===
    // Track if we're using external AI (no RAG results)
    let isExternalAIFallback = false;
    const MIN_CHUNKS_THRESHOLD = 2; // Minimum chunks needed for "confident" response
    
    if (primaryResults.length < MIN_CHUNKS_THRESHOLD) {
      console.log(`⚠️ LOW CONFIDENCE: Only ${primaryResults.length} chunks found. External AI may be needed.`);
      isExternalAIFallback = true;
    }

    // === STEP 2: Secondary Sweep - Cross-reference using scoped knowledge bases ===
    console.log(`=== SECONDARY SWEEP: Nutrition, Lifestyle, Mindset ===`);
    
    const crossReferencePromises = Object.entries(CROSS_REFERENCE_MODULES).map(async ([key, module]) => {
      // Skip if same as primary module
      if (module.moduleId === moduleId) return { key, chunks: [] };

      let chunks: any[] = [];
      
      if (keywords.length > 0) {
        const keywordConditions = keywords.slice(0, 3).map(k => `content.ilike.%${k}%`).join(',');
        
        // Search in the cross-reference knowledge base
        const { data } = await supabase
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
          .ilike('knowledge_documents.original_name', `%${module.knowledgeBase}%`)
          .or(keywordConditions)
          .limit(8);
        
        chunks = data || [];
        
        // Try fallback if no results
        if (chunks.length === 0 && module.fallbackKB) {
          const { data: fallbackData } = await supabase
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
            .ilike('knowledge_documents.original_name', `%${module.fallbackKB}%`)
            .or(keywordConditions)
            .limit(8);
          
          chunks = fallbackData || [];
        }
      }

      return { key, chunks };
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
=== PRIMARY MODULE: ${moduleConfig.name} ===
${primaryContext || 'No specific content found in primary module.'}

=== NUTRITION DATABASE ===
${nutritionContext || 'No specific nutrition advice found.'}

=== LIFESTYLE DATABASE ===
${lifestyleContext || 'No specific lifestyle recommendations found.'}

=== MINDSET DATABASE ===
${mindsetContext || 'No specific mindset/mental guidance found.'}
`;

    // === STEP 4: Generate AI Response ===
    // Use the module-specific system prompt from MASTER_MODULE_CONFIG
    const languageInstruction = language === 'he' 
      ? '\n\nIMPORTANT: Respond in Hebrew (עברית). Use Hebrew for all explanatory text while keeping TCM terminology in English/Pinyin.'
      : '\n\nRespond in English.';

    // Combine: Module-specific prompt + General structure + Language + Context
    const systemPrompt = `${moduleConfig.systemPrompt}

${DEEP_SEARCH_SYSTEM_PROMPT}${languageInstruction}

=== KNOWLEDGE BASE CONTEXT ===
${fullContext}
=== END CONTEXT ===`;

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
    // Collect unique source filenames from retrieved chunks
    const primarySources = [...new Set(primaryResults.map((c: any) => c.knowledge_documents?.original_name || c.knowledge_documents?.file_name || 'Unknown').filter(Boolean))];
    const nutritionSources = [...new Set(crossReferenceResults.find(r => r.key === 'nutrition')?.chunks.map((c: any) => c.knowledge_documents?.original_name || 'Unknown') || [])];
    const lifestyleSources = [...new Set(crossReferenceResults.find(r => r.key === 'lifestyle')?.chunks.map((c: any) => c.knowledge_documents?.original_name || 'Unknown') || [])];
    const mindsetSources = [...new Set(crossReferenceResults.find(r => r.key === 'mindset')?.chunks.map((c: any) => c.knowledge_documents?.original_name || 'Unknown') || [])];
    
    const allSources = [...new Set([...primarySources, ...nutritionSources, ...lifestyleSources, ...mindsetSources])];

    const sections = {
      primaryDiagnosis: '',
      primaryDiagnosisSources: primarySources as string[],
      acupunctureProtocol: { points: extractedPoints, technique: '', contraindications: [] as string[], sources: primarySources as string[] },
      herbalPrescription: { formula: '', ingredients: [] as string[], modifications: [] as string[], sources: primarySources as string[] },
      nutritionAdvice: [] as SourcedRecommendation[],
      lifestyleMindset: [] as SourcedRecommendation[],
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

    // Extract nutrition section (flexible) - with source attribution
    const nutritionMatch = rawResponse.match(/##\s*(?:🥗\s*)?Nutrition(?:\s*Advice)?\s*([\s\S]*?)(?=##|$)/i);
    if (nutritionMatch) {
      const nutritionLines = nutritionMatch[1].split('\n')
        .filter((line: string) => line.trim().startsWith('-') || line.trim().match(/^\d+\./))
        .map((line: string) => line.replace(/^[-\d.]+\s*/, '').trim())
        .filter((line: string) => line.length > 0);
      
      sections.nutritionAdvice = nutritionLines.map((text: string) => ({
        text,
        source: nutritionSources[0] || CROSS_REFERENCE_MODULES.nutrition.knowledgeBase
      }));
    }

    // Extract lifestyle section (flexible) - with source attribution
    const lifestyleMatch = rawResponse.match(/##\s*(?:🧘\s*)?Lifestyle(?:\s*(?:&|and)\s*Mindset)?\s*([\s\S]*?)(?=##|$)/i);
    if (lifestyleMatch) {
      const lifestyleLines = lifestyleMatch[1].split('\n')
        .filter((line: string) => line.trim().startsWith('-') || line.trim().match(/^\d+\./))
        .map((line: string) => line.replace(/^[-\d.]+\s*/, '').trim())
        .filter((line: string) => line.length > 0);
      
      // Combine lifestyle and mindset sources
      const combinedSources = [...lifestyleSources, ...mindsetSources];
      sections.lifestyleMindset = lifestyleLines.map((text: string) => ({
        text,
        source: combinedSources[0] || CROSS_REFERENCE_MODULES.lifestyle.knowledgeBase
      }));
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
    console.log(`Sources used: ${allSources.join(', ')}`);

    // Log usage
    try {
      await supabase.from('usage_logs').insert({
        user_id: user.id,
        action_type: 'clinical_deep_search',
        tokens_used: aiData.usage?.total_tokens || 0,
        metadata: {
          moduleId,
          moduleName: moduleConfig.name,
          pointsFound: extractedPoints.length,
          crossRefsFound: totalCrossRefs,
          translationBridgeActive: !!translationBridge,
          retrievalSearchQuery,
          sourcesUsed: allSources,
        }
      });
    } catch (logErr) {
      console.error('Failed to log usage:', logErr);
    }

    // Generate body figure command for 3D/visualization control
    const bodyFigureCommand = generateBodyFigureCommand(extractedPoints);
    console.log(`Body figure command: ${JSON.stringify(bodyFigureCommand)}`);

    // === EXTERNAL AI DISCLAIMER ===
    // If we had low/no RAG results, append disclaimer to rawResponse
    let finalRawResponse = rawResponse;
    if (isExternalAIFallback && primaryResults.length === 0 && totalCrossRefs < 3) {
      const externalDisclaimer = `

---

⚠️ **EXTERNAL AI NOTICE** ⚠️

This answer was generated by external AI and **does not come from the verified Clinical Database**. 

The proprietary knowledge base did not contain sufficient information for this query. The Therapist acts on their own liability when using this information.

---`;
      finalRawResponse = rawResponse + externalDisclaimer;
      console.log(`⚠️ EXTERNAL AI FALLBACK ACTIVATED - Disclaimer appended`);
    }

    const response: DeepSearchResponse = {
      success: true,
      report: {
        ...sections,
        rawResponse: finalRawResponse,
        extractedPoints,
        body_figure_command: bodyFigureCommand,
      },
      metadata: {
        moduleUsed: moduleConfig.name,
        knowledgeBasesQueried: [
          moduleConfig.csvFilename,
          ...Object.values(CROSS_REFERENCE_MODULES).map(m => m.knowledgeBase)
        ],
        chunksFound: primaryResults.length,
        crossReferencesFound: totalCrossRefs,
        sourcesUsed: allSources,
        translationBridge,
        source_file: moduleConfig.csvFilename,
        isExternalAIFallback, // NEW: Flag for UI to highlight in amber
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

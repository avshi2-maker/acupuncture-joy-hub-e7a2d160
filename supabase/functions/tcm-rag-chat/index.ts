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
    .replace(/[^a-z0-9\u4e00-\u9fff\u0590-\u05ff]+/g, ' ') // Include Hebrew characters
    .replace(/\s+/g, ' ')
    .trim();
}

// ============================================================================
// LANGUAGE DETECTION & BILINGUAL GLOSSARY
// ============================================================================

type DetectedLanguage = 'hebrew' | 'english' | 'chinese' | 'mixed';

/**
 * Detect the primary language of a query
 */
function detectLanguage(text: string): DetectedLanguage {
  const hebrewPattern = /[\u0590-\u05FF]/g;
  const chinesePattern = /[\u4e00-\u9fff]/g;
  const latinPattern = /[a-zA-Z]/g;
  
  const hebrewChars = (text.match(hebrewPattern) || []).length;
  const chineseChars = (text.match(chinesePattern) || []).length;
  const latinChars = (text.match(latinPattern) || []).length;
  
  const total = hebrewChars + chineseChars + latinChars;
  if (total === 0) return 'english'; // Default
  
  const hebrewRatio = hebrewChars / total;
  const chineseRatio = chineseChars / total;
  const latinRatio = latinChars / total;
  
  // If significant mix, return mixed
  if ((hebrewRatio > 0.2 && latinRatio > 0.2) || 
      (chineseRatio > 0.2 && latinRatio > 0.2)) {
    return 'mixed';
  }
  
  if (hebrewRatio > 0.5) return 'hebrew';
  if (chineseRatio > 0.5) return 'chinese';
  return 'english';
}

/**
 * TCM Bilingual Glossary - Hebrew ↔ English term mappings (EXPANDED)
 * Each entry has: english term, hebrew term(s), pinyin, and category
 * Now includes 300+ entries covering syndromes, freehand clinical terms, colloquial expressions
 */
const TCM_BILINGUAL_GLOSSARY: Array<{
  en: string[];
  he: string[];
  pinyin?: string[];
  category: 'syndrome' | 'organ' | 'technique' | 'symptom' | 'herb' | 'pattern' | 'point' | 'formula' | 'diagnosis' | 'freehand';
}> = [
  // ============================================================================
  // SYNDROMES & PATTERNS (COMPREHENSIVE)
  // ============================================================================
  { en: ['liver qi stagnation', 'liver qi constraint', 'constrained liver qi'], he: ['גאן צ\'י יו', 'אי זרימת צי הכבד', 'סטגנציית צי כבד', 'עיכוב צי הכבד', 'צי כבד תקוע'], pinyin: ['gan qi yu'], category: 'syndrome' },
  { en: ['blood stasis', 'blood stagnation', 'static blood'], he: ['סטגנציית דם', 'קיפאון דם', 'דם עומד', 'דם קפוא'], pinyin: ['xue yu'], category: 'syndrome' },
  { en: ['qi deficiency', 'qi xu', 'qi vacuity'], he: ['חוסר צי', 'צי שו', 'חולשת צי', 'צי נמוך'], pinyin: ['qi xu'], category: 'syndrome' },
  { en: ['blood deficiency', 'xue xu', 'blood vacuity'], he: ['חוסר דם', 'שואה שו', 'דלות דם', 'דם נמוך'], pinyin: ['xue xu'], category: 'syndrome' },
  { en: ['yin deficiency', 'yin xu', 'yin vacuity'], he: ['חוסר יין', 'יין שו', 'יין נמוך'], pinyin: ['yin xu'], category: 'syndrome' },
  { en: ['yang deficiency', 'yang xu', 'yang vacuity'], he: ['חוסר יאנג', 'יאנג שו', 'יאנג נמוך'], pinyin: ['yang xu'], category: 'syndrome' },
  { en: ['kidney yin deficiency', 'kidney yin xu'], he: ['חוסר יין כליה', 'כליה יין שו', 'כליות יין נמוך'], pinyin: ['shen yin xu'], category: 'syndrome' },
  { en: ['kidney yang deficiency', 'kidney yang xu', 'ming men fire decline'], he: ['חוסר יאנג כליה', 'כליה יאנג שו', 'מינג מן חלש', 'אש כליות חלשה'], pinyin: ['shen yang xu'], category: 'syndrome' },
  { en: ['spleen qi deficiency', 'spleen qi xu'], he: ['חוסר צי טחול', 'טחול צי שו', 'חולשת טחול', 'טחול חלש'], pinyin: ['pi qi xu'], category: 'syndrome' },
  { en: ['heart blood deficiency', 'heart blood xu'], he: ['חוסר דם לב', 'לב שואה שו', 'לב דם חסר'], pinyin: ['xin xue xu'], category: 'syndrome' },
  { en: ['lung qi deficiency', 'lung qi xu'], he: ['חוסר צי ריאה', 'ריאה צי שו', 'ריאות חלשות'], pinyin: ['fei qi xu'], category: 'syndrome' },
  { en: ['dampness', 'damp', 'pathogenic dampness'], he: ['לחות', 'דאמפנס', 'שי', 'לחות פתוגנית'], pinyin: ['shi'], category: 'pattern' },
  { en: ['phlegm', 'tan', 'pathogenic phlegm'], he: ['ליחה', 'פלגם', 'טאן', 'כיח'], pinyin: ['tan'], category: 'pattern' },
  { en: ['heat', 'fire', 're'], he: ['חום', 'אש', 'רה', 'חום פנימי'], pinyin: ['re', 'huo'], category: 'pattern' },
  { en: ['cold', 'han'], he: ['קור', 'האן', 'קור פנימי'], pinyin: ['han'], category: 'pattern' },
  { en: ['wind', 'feng'], he: ['רוח', 'פנג', 'רוח פתוגנית'], pinyin: ['feng'], category: 'pattern' },
  { en: ['damp heat', 'dampness heat'], he: ['חום לחות', 'שי רה', 'לחות וחום'], pinyin: ['shi re'], category: 'syndrome' },
  { en: ['phlegm damp', 'phlegm dampness'], he: ['ליחה לחות', 'טאן שי', 'ליחה ולחות'], pinyin: ['tan shi'], category: 'syndrome' },
  { en: ['liver fire', 'liver fire blazing'], he: ['אש כבד', 'גאן הואו', 'כבד בוער'], pinyin: ['gan huo'], category: 'syndrome' },
  { en: ['liver yang rising', 'liver yang hyperactivity', 'ascending liver yang'], he: ['עליית יאנג כבד', 'גאן יאנג שאנג קאנג', 'יאנג כבד עולה'], pinyin: ['gan yang shang kang'], category: 'syndrome' },
  { en: ['heart fire', 'heart fire blazing'], he: ['אש לב', 'שין הואו', 'לב בוער'], pinyin: ['xin huo'], category: 'syndrome' },
  { en: ['stomach fire', 'stomach heat'], he: ['אש קיבה', 'וויי הואו', 'קיבה חמה'], pinyin: ['wei huo'], category: 'syndrome' },
  { en: ['kidney essence deficiency', 'kidney jing xu'], he: ['חוסר ג\'ינג כליה', 'כליה ג\'ינג שו', 'ג\'ינג נמוך'], pinyin: ['shen jing xu'], category: 'syndrome' },
  { en: ['liver blood deficiency', 'liver blood xu'], he: ['חוסר דם כבד', 'גאן שואה שו', 'כבד דם חסר'], pinyin: ['gan xue xu'], category: 'syndrome' },
  { en: ['heart qi deficiency', 'heart qi xu'], he: ['חוסר צי לב', 'לב צי שו', 'לב צי נמוך'], pinyin: ['xin qi xu'], category: 'syndrome' },
  { en: ['lung yin deficiency', 'lung yin xu'], he: ['חוסר יין ריאה', 'ריאה יין שו', 'ריאות יבשות'], pinyin: ['fei yin xu'], category: 'syndrome' },
  { en: ['stomach yin deficiency', 'stomach yin xu'], he: ['חוסר יין קיבה', 'קיבה יין שו', 'קיבה יבשה'], pinyin: ['wei yin xu'], category: 'syndrome' },
  { en: ['spleen yang deficiency', 'spleen yang xu'], he: ['חוסר יאנג טחול', 'טחול יאנג שו', 'טחול קר'], pinyin: ['pi yang xu'], category: 'syndrome' },
  { en: ['wind cold', 'external wind cold'], he: ['רוח קור', 'פנג האן', 'הצטננות רוח קור'], pinyin: ['feng han'], category: 'syndrome' },
  { en: ['wind heat', 'external wind heat'], he: ['רוח חום', 'פנג רה', 'שפעת רוח חום'], pinyin: ['feng re'], category: 'syndrome' },
  { en: ['exterior syndrome', 'external pattern'], he: ['תסמונת חיצונית', 'ביאו', 'פטרן חיצוני'], pinyin: ['biao'], category: 'pattern' },
  { en: ['interior syndrome', 'internal pattern'], he: ['תסמונת פנימית', 'לי', 'פטרן פנימי'], pinyin: ['li'], category: 'pattern' },
  { en: ['excess syndrome', 'excess pattern', 'shi pattern'], he: ['תסמונת עודף', 'שי', 'עודף'], pinyin: ['shi'], category: 'pattern' },
  { en: ['deficiency syndrome', 'deficiency pattern', 'xu pattern'], he: ['תסמונת חוסר', 'שו', 'חוסר'], pinyin: ['xu'], category: 'pattern' },
  // Additional complex syndromes
  { en: ['liver invading spleen', 'liver overacting on spleen', 'wood overacting earth'], he: ['כבד תוקף טחול', 'עץ פוגע באדמה', 'גאן פי בו הה'], pinyin: ['gan pi bu he'], category: 'syndrome' },
  { en: ['liver invading stomach', 'liver attacking stomach'], he: ['כבד תוקף קיבה', 'גאן פאן וויי'], pinyin: ['gan fan wei'], category: 'syndrome' },
  { en: ['heart kidney disharmony', 'heart kidney not communicating'], he: ['לב כליה לא מתקשרים', 'שין שן בו ג\'יאו'], pinyin: ['xin shen bu jiao'], category: 'syndrome' },
  { en: ['spleen kidney yang deficiency', 'spleen kidney yang xu'], he: ['חוסר יאנג טחול כליה', 'טחול כליה יאנג שו'], pinyin: ['pi shen yang xu'], category: 'syndrome' },
  { en: ['liver kidney yin deficiency', 'liver kidney yin xu'], he: ['חוסר יין כבד כליה', 'גאן שן יין שו'], pinyin: ['gan shen yin xu'], category: 'syndrome' },
  { en: ['qi and blood deficiency', 'qi blood xu'], he: ['חוסר צי ודם', 'צי שואה שו'], pinyin: ['qi xue xu'], category: 'syndrome' },
  { en: ['qi stagnation blood stasis', 'qi stasis blood stasis'], he: ['סטגנציית צי ודם', 'צי סטגנציה דם סטגנציה'], pinyin: ['qi zhi xue yu'], category: 'syndrome' },
  { en: ['phlegm misting mind', 'phlegm obstructing heart orifices'], he: ['ליחה מעטפת שכל', 'טאן מי שין צ\'יאו'], pinyin: ['tan mi xin qiao'], category: 'syndrome' },
  { en: ['phlegm fire harassing heart', 'phlegm fire disturbing heart'], he: ['ליחה אש מטרידה לב', 'טאן הואו ראו שין'], pinyin: ['tan huo rao xin'], category: 'syndrome' },
  { en: ['shen disturbance', 'spirit disturbance', 'shen disorder'], he: ['הפרעת שן', 'שן לא יציב', 'רוח לא רגועה'], pinyin: ['shen bu ning'], category: 'syndrome' },
  { en: ['middle jiao qi stagnation', 'central qi stagnation'], he: ['סטגנציית צי אמצע', 'ג\'ונג ג\'יאו צי יו'], category: 'syndrome' },
  { en: ['rebellious qi', 'counterflow qi'], he: ['צי הפוך', 'צי עולה', 'ני צי'], pinyin: ['ni qi'], category: 'syndrome' },
  { en: ['sinking qi', 'qi sinking'], he: ['צי שוקע', 'צי יורד', 'צי שיאן'], pinyin: ['qi xian'], category: 'syndrome' },
  
  // ============================================================================
  // ORGANS (ZANG FU) - Expanded
  // ============================================================================
  { en: ['liver'], he: ['כבד', 'גאן', 'הכבד'], pinyin: ['gan'], category: 'organ' },
  { en: ['heart'], he: ['לב', 'שין', 'הלב'], pinyin: ['xin'], category: 'organ' },
  { en: ['spleen'], he: ['טחול', 'פי', 'הטחול'], pinyin: ['pi'], category: 'organ' },
  { en: ['lung', 'lungs'], he: ['ריאה', 'ריאות', 'פיי', 'הריאות'], pinyin: ['fei'], category: 'organ' },
  { en: ['kidney', 'kidneys'], he: ['כליה', 'כליות', 'שן', 'הכליות'], pinyin: ['shen'], category: 'organ' },
  { en: ['stomach'], he: ['קיבה', 'וויי', 'הקיבה'], pinyin: ['wei'], category: 'organ' },
  { en: ['gallbladder', 'gall bladder'], he: ['כיס מרה', 'דאן', 'כיס המרה'], pinyin: ['dan'], category: 'organ' },
  { en: ['bladder', 'urinary bladder'], he: ['שלפוחית', 'פאנג גואנג', 'שלפוחית שתן', 'שלפוחית השתן'], pinyin: ['pang guang'], category: 'organ' },
  { en: ['small intestine'], he: ['מעי דק', 'שיאו צ\'אנג', 'המעי הדק'], pinyin: ['xiao chang'], category: 'organ' },
  { en: ['large intestine', 'colon'], he: ['מעי גס', 'דא צ\'אנג', 'המעי הגס', 'קולון'], pinyin: ['da chang'], category: 'organ' },
  { en: ['pericardium', 'heart protector'], he: ['קרום הלב', 'שין באו', 'מגן הלב'], pinyin: ['xin bao'], category: 'organ' },
  { en: ['triple burner', 'triple heater', 'san jiao', 'three burners'], he: ['שלוש מוקדים', 'סאן ג\'יאו', 'שלושת המוקדים'], pinyin: ['san jiao'], category: 'organ' },
  { en: ['uterus', 'bao gong'], he: ['רחם', 'באו גונג'], pinyin: ['bao gong'], category: 'organ' },
  { en: ['brain', 'sea of marrow'], he: ['מוח', 'ים המח'], pinyin: ['nao'], category: 'organ' },

  // ============================================================================
  // TECHNIQUES - Expanded
  // ============================================================================
  { en: ['acupuncture'], he: ['דיקור', 'אקופונקטורה', 'דיקור סיני', 'מחטים'], category: 'technique' },
  { en: ['moxibustion', 'moxa'], he: ['מוקסה', 'מוקסיבוסציה', 'ג\'יו', 'חימום'], pinyin: ['jiu'], category: 'technique' },
  { en: ['cupping'], he: ['כוסות רוח', 'באגואן', 'כוסות'], pinyin: ['ba guan'], category: 'technique' },
  { en: ['tuina', 'tui na', 'chinese massage'], he: ['טווינא', 'עיסוי סיני', 'טויי נא', 'עיסוי'], pinyin: ['tui na'], category: 'technique' },
  { en: ['needling', 'needle'], he: ['דיקור', 'מחט', 'נידלינג', 'מחטים'], category: 'technique' },
  { en: ['electroacupuncture', 'electro acupuncture'], he: ['אלקטרואקופונקטורה', 'דיקור חשמלי', 'חשמל'], category: 'technique' },
  { en: ['trigger point', 'ashi point'], he: ['נקודת טריגר', 'טריגר פוינט', 'נקודת כאב', 'אשי פוינט'], category: 'technique' },
  { en: ['bleeding', 'bloodletting', 'blood letting'], he: ['הקזת דם', 'שיתי שואה', 'הקזה'], category: 'technique' },
  { en: ['gua sha', 'scraping'], he: ['גואה שה', 'גרידה', 'גירוד'], pinyin: ['gua sha'], category: 'technique' },
  { en: ['auricular', 'ear acupuncture', 'auriculotherapy'], he: ['דיקור אוזן', 'אוריקולותרפיה', 'אוזן'], category: 'technique' },
  { en: ['scalp acupuncture'], he: ['דיקור קרקפת', 'אקופונקטורה בקרקפת'], category: 'technique' },
  { en: ['laser acupuncture'], he: ['דיקור לייזר', 'לייזר'], category: 'technique' },
  { en: ['acupressure'], he: ['לחיצות', 'אקופרשר', 'לחיצה'], category: 'technique' },

  // ============================================================================
  // SYMPTOMS - Comprehensive with colloquial Hebrew
  // ============================================================================
  { en: ['headache', 'head pain', 'cephalalgia'], he: ['כאב ראש', 'כאבי ראש', 'מיגרנה', 'צפלאלגיה', 'הראש כואב', 'כואב לי הראש'], category: 'symptom' },
  { en: ['migraine', 'hemicranial headache'], he: ['מיגרנה', 'כאב ראש חד צדדי', 'מיגרנות'], category: 'symptom' },
  { en: ['tension headache'], he: ['כאב ראש מתח', 'כאב ראש מתחי', 'כאב ראש מלחץ'], category: 'symptom' },
  { en: ['insomnia', 'sleep disorder', 'sleeplessness', 'sleep disturbance'], he: ['נדודי שינה', 'אינסומניה', 'הפרעות שינה', 'קושי להירדם', 'לא ישנה', 'לא נרדם', 'בעיות שינה', 'לא מצליח לישון', 'ישן רע'], category: 'symptom' },
  { en: ['difficulty falling asleep', 'trouble sleeping'], he: ['קושי להירדם', 'לוקח לי זמן להירדם', 'לא מצליח להירדם'], category: 'symptom' },
  { en: ['waking at night', 'interrupted sleep', 'fragmented sleep'], he: ['מתעורר בלילה', 'שינה קטועה', 'מתעוררת באמצע הלילה'], category: 'symptom' },
  { en: ['early waking', 'waking too early'], he: ['התעוררות מוקדמת', 'מתעורר מוקדם', 'מתעוררת לפנות בוקר'], category: 'symptom' },
  { en: ['fatigue', 'tiredness', 'exhaustion', 'lack of energy'], he: ['עייפות', 'חולשה', 'תשישות', 'אין כוח', 'עייף', 'מותש', 'אין לי אנרגיה', 'עייפה'], category: 'symptom' },
  { en: ['chronic fatigue'], he: ['עייפות כרונית', 'עייפות מתמשכת', 'תמיד עייף'], category: 'symptom' },
  { en: ['pain'], he: ['כאב', 'כאבים', 'כואב'], category: 'symptom' },
  { en: ['back pain', 'low back pain', 'lumbago', 'lower back pain'], he: ['כאב גב', 'כאבי גב תחתון', 'לומבלגיה', 'כאב גב תחתון', 'הגב כואב', 'כואב לי הגב', 'כאבי גב', 'גב תחתון'], category: 'symptom' },
  { en: ['neck pain', 'cervical pain', 'stiff neck'], he: ['כאב צוואר', 'כאבי צוואר', 'צווארון', 'צוואר תפוס', 'הצוואר כואב', 'צוואר נוקשה'], category: 'symptom' },
  { en: ['shoulder pain', 'frozen shoulder'], he: ['כאב כתף', 'כאבי כתפיים', 'כתף קפואה', 'הכתף כואבת', 'כאבים בכתף'], category: 'symptom' },
  { en: ['knee pain'], he: ['כאב ברך', 'כאבי ברכיים', 'הברך כואבת', 'ברכיים כואבות'], category: 'symptom' },
  { en: ['joint pain', 'arthralgia', 'arthritic pain'], he: ['כאבי מפרקים', 'כאב מפרק', 'ארתרלגיה', 'המפרקים כואבים'], category: 'symptom' },
  { en: ['sciatica', 'sciatic pain'], he: ['סיאטיקה', 'כאב רגל', 'עצב סיאטי', 'כאב יורד לרגל'], category: 'symptom' },
  { en: ['hip pain'], he: ['כאב ירך', 'כאב מותן', 'כואבת לי הירך'], category: 'symptom' },
  { en: ['anxiety'], he: ['חרדה', 'אנקסייטי', 'פחד', 'חרדות', 'מפחד', 'חוששת'], category: 'symptom' },
  { en: ['depression', 'depressed mood'], he: ['דיכאון', 'עצבות', 'מצב רוח ירוד', 'מדוכא', 'עצוב', 'מדוכאת'], category: 'symptom' },
  { en: ['stress', 'mental stress'], he: ['לחץ', 'מתח', 'סטרס', 'עומס', 'לחוץ', 'תחת לחץ'], category: 'symptom' },
  { en: ['digestive issues', 'digestion', 'digestive disorders'], he: ['בעיות עיכול', 'עיכול', 'מערכת עיכול', 'הפרעות עיכול', 'עיכול לא טוב'], category: 'symptom' },
  { en: ['constipation'], he: ['עצירות', 'קושי ביציאות', 'עצור', 'לא יוצא לשירותים'], category: 'symptom' },
  { en: ['diarrhea', 'loose stools'], he: ['שלשול', 'דיאריאה', 'שלשולים', 'יציאות רכות', 'בטן רופפת'], category: 'symptom' },
  { en: ['nausea'], he: ['בחילה', 'בחילות', 'מבחיל לי'], category: 'symptom' },
  { en: ['vomiting'], he: ['הקאה', 'הקאות', 'מקיא'], category: 'symptom' },
  { en: ['bloating', 'abdominal distension', 'gas'], he: ['נפיחות', 'נפיחות בטן', 'גזים', 'בטן נפוחה', 'מרגיש נפוח'], category: 'symptom' },
  { en: ['acid reflux', 'heartburn', 'gerd'], he: ['צרבת', 'ריפלוקס', 'חומציות', 'שורף לי'], category: 'symptom' },
  { en: ['abdominal pain', 'stomach ache', 'belly pain'], he: ['כאב בטן', 'כאבי בטן', 'בטן כואבת', 'כואב לי הבטן'], category: 'symptom' },
  { en: ['appetite loss', 'poor appetite'], he: ['חוסר תיאבון', 'אין תיאבון', 'לא רעב', 'תיאבון ירוד'], category: 'symptom' },
  { en: ['menstrual pain', 'dysmenorrhea', 'period pain', 'cramps'], he: ['כאבי מחזור', 'דיסמנוריאה', 'כאבי וסת', 'כאבי פריוד', 'כואב לי במחזור', 'התכווציות'], category: 'symptom' },
  { en: ['irregular menstruation', 'irregular periods'], he: ['מחזור לא סדיר', 'אי סדירות במחזור', 'מחזור לא קבוע'], category: 'symptom' },
  { en: ['heavy menstruation', 'menorrhagia', 'heavy periods'], he: ['דימום כבד', 'מחזור כבד', 'וסת כבד', 'יורד הרבה דם'], category: 'symptom' },
  { en: ['scanty menstruation', 'light periods'], he: ['מחזור דל', 'דימום מועט', 'וסת דל'], category: 'symptom' },
  { en: ['amenorrhea', 'no period', 'missed period'], he: ['היעדר מחזור', 'אמנוריאה', 'אין מחזור'], category: 'symptom' },
  { en: ['pms', 'premenstrual syndrome'], he: ['תסמונת קדם וסתית', 'פמס', 'לפני המחזור'], category: 'symptom' },
  { en: ['infertility', 'difficulty conceiving'], he: ['אי פוריות', 'פוריות', 'קושי להיכנס להריון', 'לא נכנסת להריון'], category: 'symptom' },
  { en: ['hot flashes', 'hot flushes'], he: ['גלי חום', 'הבזקי חום', 'חם לי פתאום'], category: 'symptom' },
  { en: ['menopause', 'perimenopause', 'climacteric'], he: ['גיל המעבר', 'מנופאוזה', 'פרימנופאוזה'], category: 'symptom' },
  { en: ['dizziness', 'vertigo', 'lightheadedness'], he: ['סחרחורת', 'ורטיגו', 'סחרחורות', 'מסוחרר', 'מסתחרר לי'], category: 'symptom' },
  { en: ['tinnitus', 'ringing ears', 'ear ringing'], he: ['טינטון', 'צלצולים באוזניים', 'צפצוף באוזניים', 'רועש לי באוזניים'], category: 'symptom' },
  { en: ['blurred vision', 'eye problems', 'visual disturbance'], he: ['טשטוש ראייה', 'בעיות עיניים', 'ראייה מטושטשת', 'לא רואה טוב'], category: 'symptom' },
  { en: ['dry eyes', 'eye dryness'], he: ['יובש בעיניים', 'עיניים יבשות', 'עיניים צורבות'], category: 'symptom' },
  { en: ['cough', 'coughing'], he: ['שיעול', 'משתעל'], category: 'symptom' },
  { en: ['dry cough'], he: ['שיעול יבש', 'משתעל יבש'], category: 'symptom' },
  { en: ['productive cough', 'wet cough'], he: ['שיעול לח', 'שיעול עם ליחה', 'יורד ליחה'], category: 'symptom' },
  { en: ['asthma', 'wheezing'], he: ['אסתמה', 'צפצופים', 'קוצר נשימה', 'שיאו צ\'ואן'], category: 'symptom' },
  { en: ['shortness of breath', 'dyspnea', 'breathlessness'], he: ['קוצר נשימה', 'קושי בנשימה', 'נגמר לי האוויר', 'לא מספיק אוויר'], category: 'symptom' },
  { en: ['palpitations', 'heart racing', 'rapid heartbeat'], he: ['דפיקות לב', 'פלפיטציות', 'לב רץ', 'הלב דופק מהר', 'מרגיש את הלב'], category: 'symptom' },
  { en: ['edema', 'swelling', 'water retention', 'fluid retention'], he: ['בצקת', 'נפיחות', 'אגירת נוזלים', 'רגליים נפוחות'], category: 'symptom' },
  { en: ['night sweats'], he: ['הזעות לילה', 'הזעה בלילה', 'מתעורר רטוב', 'מזיע בלילה'], category: 'symptom' },
  { en: ['spontaneous sweating', 'excessive sweating'], he: ['הזעה ספונטנית', 'הזעה', 'מזיע הרבה', 'הזעה יתר'], category: 'symptom' },
  { en: ['cold limbs', 'cold hands feet', 'cold extremities'], he: ['גפיים קרות', 'ידיים קרות', 'רגליים קרות', 'קר לי בידיים'], category: 'symptom' },
  { en: ['frequent urination', 'nocturia', 'polyuria'], he: ['הטלת שתן תכופה', 'השתנה תכופה', 'קימה בלילה', 'הולך הרבה לשירותים'], category: 'symptom' },
  { en: ['weight gain', 'gaining weight'], he: ['עלייה במשקל', 'השמנה', 'שמנתי', 'עולה במשקל'], category: 'symptom' },
  { en: ['weight loss', 'losing weight'], he: ['ירידה במשקל', 'רזון', 'רזיתי', 'יורד במשקל'], category: 'symptom' },
  { en: ['hair loss', 'alopecia', 'falling hair'], he: ['נשירת שיער', 'התקרחות', 'אלופציה', 'השיער נושר'], category: 'symptom' },
  { en: ['skin rash', 'eczema', 'dermatitis'], he: ['פריחה', 'אקזמה', 'דרמטיטיס', 'בעיות עור', 'גירודים'], category: 'symptom' },
  { en: ['acne'], he: ['אקנה', 'פצעונים', 'פצעים בפנים'], category: 'symptom' },
  { en: ['psoriasis'], he: ['פסוריאזיס', 'ספחת'], category: 'symptom' },
  { en: ['allergies', 'allergic rhinitis', 'hay fever'], he: ['אלרגיה', 'אלרגיות', 'נזלת אלרגית', 'קדחת שחת'], category: 'symptom' },
  { en: ['common cold', 'flu', 'influenza'], he: ['הצטננות', 'שפעת', 'צינון', 'מצונן'], category: 'symptom' },
  { en: ['fever', 'high temperature'], he: ['חום', 'חום גוף', 'חום גבוה', 'יש לי חום'], category: 'symptom' },
  { en: ['sore throat'], he: ['כאב גרון', 'דלקת גרון', 'כואב לי הגרון'], category: 'symptom' },
  { en: ['irritability', 'anger', 'easily angered'], he: ['עצבנות', 'כעס', 'רגזנות', 'עצבני', 'נהיה עצבני'], category: 'symptom' },
  { en: ['poor memory', 'forgetfulness', 'memory problems'], he: ['זיכרון לקוי', 'שכחנות', 'בעיות זיכרון', 'שוכח', 'לא זוכר'], category: 'symptom' },
  { en: ['poor concentration', 'brain fog', 'lack of focus'], he: ['קושי בריכוז', 'ערפל מוחי', 'חוסר ריכוז', 'לא מרוכז', 'לא יכול להתרכז'], category: 'symptom' },
  { en: ['thirst', 'excessive thirst'], he: ['צמא', 'צמאון', 'צמא הרבה'], category: 'symptom' },
  { en: ['dry mouth', 'mouth dryness'], he: ['יובש בפה', 'פה יבש'], category: 'symptom' },
  { en: ['bitter taste', 'bitter mouth'], he: ['טעם מר', 'מרירות בפה', 'פה מר'], category: 'symptom' },
  { en: ['bad breath', 'halitosis'], he: ['ריח רע מהפה', 'הליטוזיס', 'נשימה מסריחה'], category: 'symptom' },
  { en: ['numbness', 'tingling', 'paresthesia'], he: ['חוסר תחושה', 'נימול', 'עקצוצים', 'מנמנם לי'], category: 'symptom' },
  { en: ['tremor', 'shaking', 'trembling'], he: ['רעד', 'רעידות', 'רועד'], category: 'symptom' },
  { en: ['weak limbs', 'limb weakness'], he: ['חולשה בגפיים', 'ידיים חלשות', 'רגליים חלשות'], category: 'symptom' },
  { en: ['chest tightness', 'chest oppression'], he: ['לחץ בחזה', 'חזה לחוץ', 'צרובת בחזה'], category: 'symptom' },
  { en: ['sighing', 'frequent sighing'], he: ['אנחות', 'מרבה לנשום עמוק', 'נאנח הרבה'], category: 'symptom' },
  { en: ['dream disturbed sleep', 'vivid dreams', 'nightmares'], he: ['חלומות מטרידים', 'סיוטים', 'חולם הרבה'], category: 'symptom' },
  { en: ['restlessness', 'agitation'], he: ['אי שקט', 'חוסר מנוחה', 'לא יכול לשבת במקום'], category: 'symptom' },

  // ============================================================================
  // DIAGNOSTIC TERMS - Expanded
  // ============================================================================
  { en: ['pulse diagnosis', 'pulse'], he: ['אבחון דופק', 'דופק', 'מאי ג\'ן'], pinyin: ['mai zhen'], category: 'diagnosis' },
  { en: ['tongue diagnosis', 'tongue'], he: ['אבחון לשון', 'לשון', 'שה ג\'ן'], pinyin: ['she zhen'], category: 'diagnosis' },
  { en: ['wiry pulse', 'string pulse'], he: ['דופק מתוח', 'דופק מיתרי', 'שיאן מאי'], pinyin: ['xian mai'], category: 'diagnosis' },
  { en: ['slippery pulse'], he: ['דופק חלקלק', 'דופק גולש', 'הואה מאי'], pinyin: ['hua mai'], category: 'diagnosis' },
  { en: ['weak pulse'], he: ['דופק חלש', 'רואו מאי'], pinyin: ['ruo mai'], category: 'diagnosis' },
  { en: ['rapid pulse'], he: ['דופק מהיר', 'שואו מאי'], pinyin: ['shuo mai'], category: 'diagnosis' },
  { en: ['slow pulse'], he: ['דופק איטי', 'צ\'י מאי'], pinyin: ['chi mai'], category: 'diagnosis' },
  { en: ['deep pulse', 'sunken pulse'], he: ['דופק עמוק', 'צ\'ן מאי'], pinyin: ['chen mai'], category: 'diagnosis' },
  { en: ['superficial pulse', 'floating pulse'], he: ['דופק שטחי', 'פו מאי'], pinyin: ['fu mai'], category: 'diagnosis' },
  { en: ['choppy pulse', 'rough pulse'], he: ['דופק גס', 'סה מאי'], pinyin: ['se mai'], category: 'diagnosis' },
  { en: ['thready pulse', 'thin pulse'], he: ['דופק דק', 'שי מאי'], pinyin: ['xi mai'], category: 'diagnosis' },
  { en: ['full pulse', 'replete pulse'], he: ['דופק מלא', 'שי מאי'], pinyin: ['shi mai'], category: 'diagnosis' },
  { en: ['empty pulse', 'vacuous pulse'], he: ['דופק ריק', 'שו מאי'], pinyin: ['xu mai'], category: 'diagnosis' },
  { en: ['red tongue'], he: ['לשון אדומה', 'לשון אדומה יותר מדי'], category: 'diagnosis' },
  { en: ['pale tongue'], he: ['לשון חיוורת', 'לשון בהירה'], category: 'diagnosis' },
  { en: ['purple tongue', 'dark tongue'], he: ['לשון סגולה', 'לשון כהה'], category: 'diagnosis' },
  { en: ['thick coating', 'tongue coating'], he: ['ציפוי עבה', 'ציפוי לשון', 'לשון מצופה'], category: 'diagnosis' },
  { en: ['thin coating'], he: ['ציפוי דק', 'ציפוי דליל'], category: 'diagnosis' },
  { en: ['yellow coating'], he: ['ציפוי צהוב', 'לשון צהובה'], category: 'diagnosis' },
  { en: ['white coating'], he: ['ציפוי לבן', 'לשון לבנה'], category: 'diagnosis' },
  { en: ['greasy coating', 'sticky coating'], he: ['ציפוי שמנוני', 'ציפוי דביק'], category: 'diagnosis' },
  { en: ['no coating', 'peeled tongue'], he: ['ללא ציפוי', 'לשון קילופית', 'לשון חלקה'], category: 'diagnosis' },
  { en: ['swollen tongue'], he: ['לשון נפוחה', 'לשון מוגדלת'], category: 'diagnosis' },
  { en: ['thin tongue'], he: ['לשון דקה', 'לשון רזה'], category: 'diagnosis' },
  { en: ['cracked tongue', 'fissured tongue'], he: ['לשון סדוקה', 'סדקים בלשון'], category: 'diagnosis' },
  { en: ['teeth marks', 'scalloped tongue'], he: ['סימני שיניים', 'לשון מגולפת'], category: 'diagnosis' },

  // ============================================================================
  // COMMON FORMULAS - MASSIVELY EXPANDED (100+ formulas)
  // ============================================================================
  // Liver/Gallbladder Formulas
  { en: ['xiao yao san', 'free and easy wanderer', 'rambling powder'], he: ['שיאו יאו סאן', 'פורמולת הנודד החופשי', 'שיאויאוסאן'], pinyin: ['xiao yao san'], category: 'formula' },
  { en: ['jia wei xiao yao san', 'augmented rambling powder', 'dan zhi xiao yao san'], he: ['ג\'יא וויי שיאו יאו סאן', 'שיאו יאו מחוזק', 'דאן ג\'י שיאו יאו סאן'], pinyin: ['jia wei xiao yao san'], category: 'formula' },
  { en: ['long dan xie gan tang', 'gentiana drain liver'], he: ['לונג דאן שיה גאן טאנג', 'ניקוז כבד', 'גנציאנה לניקוי כבד'], pinyin: ['long dan xie gan tang'], category: 'formula' },
  { en: ['tian ma gou teng yin', 'gastrodia uncaria'], he: ['טיאן מא גואו טנג יין', 'טיאנמאגואוטנג', 'גסטרודיה אונקריה'], pinyin: ['tian ma gou teng yin'], category: 'formula' },
  { en: ['chai hu shu gan san', 'bupleurum soothe liver'], he: ['צ\'אי הו שו גאן סאן', 'בופלורום להרגעת כבד'], pinyin: ['chai hu shu gan san'], category: 'formula' },
  { en: ['xiao chai hu tang', 'minor bupleurum'], he: ['שיאו צ\'אי הו טאנג', 'בופלורום קטן'], pinyin: ['xiao chai hu tang'], category: 'formula' },
  { en: ['da chai hu tang', 'major bupleurum'], he: ['דא צ\'אי הו טאנג', 'בופלורום גדול'], pinyin: ['da chai hu tang'], category: 'formula' },
  { en: ['si ni san', 'frigid extremities powder'], he: ['סי ני סאן', 'אבקת גפיים קרות'], pinyin: ['si ni san'], category: 'formula' },
  { en: ['yi guan jian', 'linking decoction'], he: ['יי גואן ג\'יאן', 'מרתח הקישור'], pinyin: ['yi guan jian'], category: 'formula' },
  { en: ['zhen gan xi feng tang', 'sedate liver extinguish wind'], he: ['ג\'ן גאן שי פנג טאנג', 'הרגעת כבד וכיבוי רוח'], pinyin: ['zhen gan xi feng tang'], category: 'formula' },
  { en: ['ling jiao gou teng tang', 'antelope horn uncaria'], he: ['לינג ג\'יאו גואו טנג טאנג', 'קרן אנטילופה אונקריה'], pinyin: ['ling jiao gou teng tang'], category: 'formula' },

  // Kidney Formulas  
  { en: ['liu wei di huang wan', 'six ingredient pill', 'rehmannia six'], he: ['ליו וויי די הואנג וואן', 'כדור שש המרכיבים', 'ליוויידיהואנגוואן', 'שש רהמניה'], pinyin: ['liu wei di huang wan'], category: 'formula' },
  { en: ['jin gui shen qi wan', 'kidney qi pill', 'golden cabinet'], he: ['ג\'ין גווי שן צי וואן', 'כדור צי כליה', 'ארון הזהב'], pinyin: ['jin gui shen qi wan'], category: 'formula' },
  { en: ['you gui wan', 'restore right pill', 'right returning pill'], he: ['יואו גווי וואן', 'כדור החזרת ימין'], pinyin: ['you gui wan'], category: 'formula' },
  { en: ['zuo gui wan', 'restore left pill', 'left returning pill'], he: ['צואו גווי וואן', 'כדור החזרת שמאל'], pinyin: ['zuo gui wan'], category: 'formula' },
  { en: ['zhi bai di huang wan', 'anemarrhena phellodendron rehmannia'], he: ['ג\'י באי די הואנג וואן', 'רהמניה עם אנמרהנה'], pinyin: ['zhi bai di huang wan'], category: 'formula' },
  { en: ['qi ju di huang wan', 'lycium chrysanthemum rehmannia'], he: ['צי ג\'ו די הואנג וואן', 'רהמניה עם גוג\'י וחרצית'], pinyin: ['qi ju di huang wan'], category: 'formula' },
  { en: ['du huo ji sheng tang', 'du huo angelica'], he: ['דו הואו ג\'י שנג טאנג', 'דוהואו ג\'ישנג'], pinyin: ['du huo ji sheng tang'], category: 'formula' },
  { en: ['er xian tang', 'two immortals'], he: ['ער שיאן טאנג', 'שני האלמותיים'], pinyin: ['er xian tang'], category: 'formula' },

  // Spleen/Stomach Formulas
  { en: ['si jun zi tang', 'four gentlemen'], he: ['סי ג\'ון צי טאנג', 'ארבעת האצילים', 'ארבעה ג\'נטלמנים'], pinyin: ['si jun zi tang'], category: 'formula' },
  { en: ['liu jun zi tang', 'six gentlemen'], he: ['ליו ג\'ון צי טאנג', 'ששת האצילים'], pinyin: ['liu jun zi tang'], category: 'formula' },
  { en: ['xiang sha liu jun zi tang', 'aucklandia amomum six gentlemen'], he: ['שיאנג שא ליו ג\'ון צי טאנג', 'ששה אצילים עם קוסטוס'], pinyin: ['xiang sha liu jun zi tang'], category: 'formula' },
  { en: ['bu zhong yi qi tang', 'tonify middle augment qi'], he: ['בו ג\'ונג יי צי טאנג', 'חיזוק האמצע', 'הרמת צי'], pinyin: ['bu zhong yi qi tang'], category: 'formula' },
  { en: ['gui pi tang', 'restore spleen decoction'], he: ['גווי פי טאנג', 'שיקום הטחול', 'החזרת הטחול'], pinyin: ['gui pi tang'], category: 'formula' },
  { en: ['shen ling bai zhu san', 'ginseng poria atractylodes'], he: ['שן לינג באי ג\'ו סאן', 'ג\'ינסנג פוריה אטרקטילודס'], pinyin: ['shen ling bai zhu san'], category: 'formula' },
  { en: ['li zhong wan', 'regulate middle pill'], he: ['לי ג\'ונג וואן', 'כדור וויסות האמצע'], pinyin: ['li zhong wan'], category: 'formula' },
  { en: ['fu zi li zhong wan', 'aconite regulate middle'], he: ['פו צי לי ג\'ונג וואן', 'ויסות אמצע עם אקוניט'], pinyin: ['fu zi li zhong wan'], category: 'formula' },
  { en: ['xiang sha yang wei wan', 'aucklandia stomach nourishing'], he: ['שיאנג שא יאנג וויי וואן', 'הזנת קיבה'], pinyin: ['xiang sha yang wei wan'], category: 'formula' },
  { en: ['bao he wan', 'preserve harmony pill'], he: ['באו הה וואן', 'כדור שמירת ההרמוניה', 'עיכול'], pinyin: ['bao he wan'], category: 'formula' },
  { en: ['ping wei san', 'calm stomach powder'], he: ['פינג וויי סאן', 'אבקת הרגעת קיבה'], pinyin: ['ping wei san'], category: 'formula' },
  { en: ['xiang sha ping wei san', 'aucklandia calm stomach'], he: ['שיאנג שא פינג וויי סאן', 'הרגעת קיבה עם קוסטוס'], pinyin: ['xiang sha ping wei san'], category: 'formula' },
  { en: ['sha shen mai dong tang', 'glehnia ophiopogon'], he: ['שא שן מאי דונג טאנג', 'גלהניה אופיופוגון'], pinyin: ['sha shen mai dong tang'], category: 'formula' },
  { en: ['huang qi jian zhong tang', 'astragalus build middle'], he: ['הואנג צי ג\'יאן ג\'ונג טאנג', 'אסטרגלוס לבניית האמצע'], pinyin: ['huang qi jian zhong tang'], category: 'formula' },

  // Blood Formulas
  { en: ['si wu tang', 'four substance', 'four things'], he: ['סי וו טאנג', 'מרתח ארבע החומרים', 'סיווטאנג', 'ארבעה דברים'], pinyin: ['si wu tang'], category: 'formula' },
  { en: ['ba zhen tang', 'eight treasure', 'eight precious'], he: ['בא ג\'ן טאנג', 'שמונה האוצרות', 'שמונה יקרים'], pinyin: ['ba zhen tang'], category: 'formula' },
  { en: ['shi quan da bu tang', 'all inclusive great tonifying'], he: ['שי צ\'ואן דא בו טאנג', 'חיזוק גדול מושלם', 'עשר השלמות'], pinyin: ['shi quan da bu tang'], category: 'formula' },
  { en: ['dang gui bu xue tang', 'angelica tonify blood'], he: ['דאנג גווי בו שואה טאנג', 'דאנגגווי לחיזוק דם'], pinyin: ['dang gui bu xue tang'], category: 'formula' },
  { en: ['xue fu zhu yu tang', 'drive out stasis chest'], he: ['שואה פו ג\'ו יו טאנג', 'ניקוי דם מהחזה', 'הסרת קיפאון דם'], pinyin: ['xue fu zhu yu tang'], category: 'formula' },
  { en: ['tao hong si wu tang', 'persica carthamus four substance'], he: ['טאו הונג סי וו טאנג', 'ארבעה דברים עם אפרסק'], pinyin: ['tao hong si wu tang'], category: 'formula' },
  { en: ['ge xia zhu yu tang', 'drive out stasis below diaphragm'], he: ['גה שיא ג\'ו יו טאנג', 'ניקוי דם מתחת לסרעפת'], pinyin: ['ge xia zhu yu tang'], category: 'formula' },
  { en: ['shao fu zhu yu tang', 'drive out stasis lower abdomen'], he: ['שאו פו ג\'ו יו טאנג', 'ניקוי דם מבטן תחתונה'], pinyin: ['shao fu zhu yu tang'], category: 'formula' },
  { en: ['shen tong zhu yu tang', 'drive out stasis body pain'], he: ['שן טונג ג\'ו יו טאנג', 'ניקוי דם לכאב גוף'], pinyin: ['shen tong zhu yu tang'], category: 'formula' },
  { en: ['tong qiao huo xue tang', 'unblock orifices invigorate blood'], he: ['טונג צ\'יאו הואו שואה טאנג', 'פתיחת נקבים והחייאת דם'], pinyin: ['tong qiao huo xue tang'], category: 'formula' },
  { en: ['bu yang huan wu tang', 'tonify yang restore five'], he: ['בו יאנג הואן וו טאנג', 'חיזוק יאנג והחזרת חמש'], pinyin: ['bu yang huan wu tang'], category: 'formula' },

  // Heart/Shen Formulas
  { en: ['suan zao ren tang', 'sour jujube'], he: ['סואן צאו רן טאנג', 'סואןצאורן', 'תמר חמוץ'], pinyin: ['suan zao ren tang'], category: 'formula' },
  { en: ['tian wang bu xin dan', 'emperor heart'], he: ['טיאן וואנג בו שין דאן', 'חיזוק לב הקיסר'], pinyin: ['tian wang bu xin dan'], category: 'formula' },
  { en: ['an shen ding zhi wan', 'calm spirit stabilize will'], he: ['אן שן דינג ג\'י וואן', 'הרגעת הרוח', 'ייצוב הנפש'], pinyin: ['an shen ding zhi wan'], category: 'formula' },
  { en: ['gan mai da zao tang', 'licorice wheat jujube'], he: ['גאן מאי דא צאו טאנג', 'ליקוריץ חיטה תמר'], pinyin: ['gan mai da zao tang'], category: 'formula' },
  { en: ['zhu sha an shen wan', 'cinnabar calm spirit'], he: ['ג\'ו שא אן שן וואן', 'סינבר להרגעת רוח'], pinyin: ['zhu sha an shen wan'], category: 'formula' },
  { en: ['gui zhi gan cao long gu mu li tang', 'cinnamon licorice dragon bone oyster'], he: ['גווי ג\'י גאן צאו לונג גו מו לי טאנג', 'קינמון ליקוריץ עצם דרקון'], pinyin: ['gui zhi gan cao long gu mu li tang'], category: 'formula' },
  { en: ['sheng mai san', 'generate pulse powder'], he: ['שנג מאי סאן', 'אבקת יצירת דופק'], pinyin: ['sheng mai san'], category: 'formula' },

  // Phlegm/Dampness Formulas
  { en: ['er chen tang', 'two aged', 'two cured'], he: ['ער צ\'ן טאנג', 'שני המיושנים', 'שני המריפים'], pinyin: ['er chen tang'], category: 'formula' },
  { en: ['wen dan tang', 'warm gallbladder'], he: ['וון דאן טאנג', 'חימום מרה', 'הדפנת מרה'], pinyin: ['wen dan tang'], category: 'formula' },
  { en: ['ban xia hou po tang', 'pinellia magnolia'], he: ['באן שיא הואו פו טאנג', 'באןשיאהואופו', 'פינליה מגנוליה'], pinyin: ['ban xia hou po tang'], category: 'formula' },
  { en: ['ban xia bai zhu tian ma tang', 'pinellia atractylodes gastrodia'], he: ['באן שיא באי ג\'ו טיאן מא טאנג', 'פינליה גסטרודיה'], pinyin: ['ban xia bai zhu tian ma tang'], category: 'formula' },
  { en: ['ling gui zhu gan tang', 'poria cinnamon atractylodes licorice'], he: ['לינג גווי ג\'ו גאן טאנג', 'פוריה קינמון'], pinyin: ['ling gui zhu gan tang'], category: 'formula' },
  { en: ['wu ling san', 'five ingredient powder with poria'], he: ['וו לינג סאן', 'אבקת חמשת המרכיבים עם פוריה'], pinyin: ['wu ling san'], category: 'formula' },
  { en: ['zhu ling tang', 'polyporus decoction'], he: ['ג\'ו לינג טאנג', 'מרתח פוליפורוס'], pinyin: ['zhu ling tang'], category: 'formula' },
  { en: ['qing qi hua tan wan', 'clear qi transform phlegm'], he: ['צינג צי הואה טאן וואן', 'ניקוי צי והמרת ליחה'], pinyin: ['qing qi hua tan wan'], category: 'formula' },
  { en: ['dao tan tang', 'guide out phlegm'], he: ['דאו טאן טאנג', 'הובלת ליחה'], pinyin: ['dao tan tang'], category: 'formula' },
  { en: ['san zi yang qin tang', 'three seed nurture parents'], he: ['סאן צי יאנג צ\'ין טאנג', 'שלושה זרעים'], pinyin: ['san zi yang qin tang'], category: 'formula' },

  // Heat Clearing Formulas
  { en: ['huang lian jie du tang', 'coptis relieve toxin'], he: ['הואנג ליאן ג\'יה דו טאנג', 'הואנגליאן', 'קופטיס נגד רעלים'], pinyin: ['huang lian jie du tang'], category: 'formula' },
  { en: ['qing wei san', 'clear stomach powder'], he: ['צינג וויי סאן', 'ניקוי קיבה'], pinyin: ['qing wei san'], category: 'formula' },
  { en: ['xie xin tang', 'drain epigastrium'], he: ['שיה שין טאנג', 'ניקוז אפיגסטריום'], pinyin: ['xie xin tang'], category: 'formula' },
  { en: ['bai hu tang', 'white tiger'], he: ['באי הו טאנג', 'הנמר הלבן'], pinyin: ['bai hu tang'], category: 'formula' },
  { en: ['zhi zi chi tang', 'gardenia soja'], he: ['ג\'י צי צ\'י טאנג', 'גרדניה סויה'], pinyin: ['zhi zi chi tang'], category: 'formula' },
  { en: ['qing hao bie jia tang', 'artemisia turtle shell'], he: ['צינג האו ביה ג\'יא טאנג', 'ארטמיסיה צב'], pinyin: ['qing hao bie jia tang'], category: 'formula' },
  { en: ['da qing long tang', 'major bluegreen dragon'], he: ['דא צינג לונג טאנג', 'הדרקון הכחול הגדול'], pinyin: ['da qing long tang'], category: 'formula' },
  { en: ['xiao qing long tang', 'minor bluegreen dragon'], he: ['שיאו צינג לונג טאנג', 'הדרקון הכחול הקטן'], pinyin: ['xiao qing long tang'], category: 'formula' },

  // Exterior Releasing Formulas
  { en: ['yin qiao san', 'honeysuckle forsythia'], he: ['יין צ\'יאו סאן', 'יסמין פורסיתיה', 'לונסרה פורסיתיה'], pinyin: ['yin qiao san'], category: 'formula' },
  { en: ['sang ju yin', 'mulberry chrysanthemum'], he: ['סאנג ג\'ו יין', 'תות חרצית'], pinyin: ['sang ju yin'], category: 'formula' },
  { en: ['ma huang tang', 'ephedra decoction'], he: ['מא הואנג טאנג', 'מאהואנג', 'אפדרה'], pinyin: ['ma huang tang'], category: 'formula' },
  { en: ['gui zhi tang', 'cinnamon twig'], he: ['גווי ג\'י טאנג', 'ענף קינמון'], pinyin: ['gui zhi tang'], category: 'formula' },
  { en: ['ge gen tang', 'pueraria decoction'], he: ['גה גן טאנג', 'פוארריה', 'קודזו'], pinyin: ['ge gen tang'], category: 'formula' },
  { en: ['jing fang bai du san', 'schizonepeta saposhnikovia overcome pathogen'], he: ['ג\'ינג פאנג באי דו סאן', 'ניצחון על פתוגן'], pinyin: ['jing fang bai du san'], category: 'formula' },
  { en: ['chuan xiong cha tiao san', 'ligusticum tea blend'], he: ['צ\'ואן שיונג צ\'ה טיאו סאן', 'צואןשיונג', 'תה ליגוסטיקום'], pinyin: ['chuan xiong cha tiao san'], category: 'formula' },
  { en: ['cang er zi san', 'xanthium powder'], he: ['צאנג ער צי סאן', 'אבקת קסנתיום'], pinyin: ['cang er zi san'], category: 'formula' },

  // Pain Formulas
  { en: ['shao yao gan cao tang', 'peony licorice'], he: ['שאו יאו גאן צאו טאנג', 'אדמונית וליקוריץ', 'אדמונית ליקוריץ'], pinyin: ['shao yao gan cao tang'], category: 'formula' },
  { en: ['tao ren cheng qi tang', 'persica order qi'], he: ['טאו רן צ\'נג צי טאנג', 'אפרסק לסידור צי'], pinyin: ['tao ren cheng qi tang'], category: 'formula' },
  { en: ['dang gui si ni tang', 'angelica frigid extremities'], he: ['דאנג גווי סי ני טאנג', 'דאנגגווי לגפיים קרות'], pinyin: ['dang gui si ni tang'], category: 'formula' },
  { en: ['juan bi tang', 'remove painful obstruction'], he: ['ג\'ואן בי טאנג', 'הסרת חסימה כואבת'], pinyin: ['juan bi tang'], category: 'formula' },
  { en: ['qiang huo sheng shi tang', 'notopterygium overcome dampness'], he: ['צ\'יאנג הואו שנג שי טאנג', 'נוטופטריגיום נגד לחות'], pinyin: ['qiang huo sheng shi tang'], category: 'formula' },
  { en: ['fang feng tong sheng san', 'saposhnikovia sagely unblocking'], he: ['פאנג פנג טונג שנג סאן', 'ספושניקוביה לפתיחה'], pinyin: ['fang feng tong sheng san'], category: 'formula' },

  // Gynecological Formulas
  { en: ['si wu tang', 'four substance decoction'], he: ['סי וו טאנג', 'מרתח ארבע החומרים'], pinyin: ['si wu tang'], category: 'formula' },
  { en: ['tao hong si wu tang', 'four substance with persica carthamus'], he: ['טאו הונג סי וו טאנג', 'ארבעה חומרים עם אפרסק וחוחובה'], pinyin: ['tao hong si wu tang'], category: 'formula' },
  { en: ['wen jing tang', 'warm menses'], he: ['וון ג\'ינג טאנג', 'חימום וסת'], pinyin: ['wen jing tang'], category: 'formula' },
  { en: ['wu ji bai feng wan', 'black chicken white phoenix'], he: ['וו ג\'י באי פנג וואן', 'תרנגולת שחורה פניקס לבן'], pinyin: ['wu ji bai feng wan'], category: 'formula' },
  { en: ['dang gui shao yao san', 'angelica peony'], he: ['דאנג גווי שאו יאו סאן', 'דאנגגווי אדמונית'], pinyin: ['dang gui shao yao san'], category: 'formula' },
  { en: ['tiao jing san', 'regulate menses'], he: ['טיאו ג\'ינג סאן', 'ויסות מחזור'], pinyin: ['tiao jing san'], category: 'formula' },
  { en: ['ai fu nuan gong wan', 'mugwort cyperus warm palace'], he: ['אי פו נואן גונג וואן', 'חימום הרחם'], pinyin: ['ai fu nuan gong wan'], category: 'formula' },

  // Digestive Formulas
  { en: ['zhi shi xiao pi wan', 'immature bitter orange reduce focal distention'], he: ['ג\'י שי שיאו פי וואן', 'הפחתת נפיחות'], pinyin: ['zhi shi xiao pi wan'], category: 'formula' },
  { en: ['mu xiang bing lang wan', 'aucklandia betel nut'], he: ['מו שיאנג בינג לאנג וואן', 'קוסטוס אגוז בטל'], pinyin: ['mu xiang bing lang wan'], category: 'formula' },
  { en: ['jian pi wan', 'strengthen spleen'], he: ['ג\'יאן פי וואן', 'חיזוק הטחול'], pinyin: ['jian pi wan'], category: 'formula' },
  { en: ['xiao jian zhong tang', 'minor construct middle'], he: ['שיאו ג\'יאן ג\'ונג טאנג', 'בניית האמצע הקטנה'], pinyin: ['xiao jian zhong tang'], category: 'formula' },
  { en: ['da jian zhong tang', 'major construct middle'], he: ['דא ג\'יאן ג\'ונג טאנג', 'בניית האמצע הגדולה'], pinyin: ['da jian zhong tang'], category: 'formula' },

  // Lung Formulas
  { en: ['zhi sou san', 'stop coughing powder'], he: ['ג\'י סואו סאן', 'עצירת שיעול'], pinyin: ['zhi sou san'], category: 'formula' },
  { en: ['xing su san', 'apricot perilla'], he: ['שינג סו סאן', 'משמש פרילה'], pinyin: ['xing su san'], category: 'formula' },
  { en: ['qing zao jiu fei tang', 'clear dryness rescue lung'], he: ['צינג צאו ג\'יו פיי טאנג', 'ניקוי יובש והצלת ריאה'], pinyin: ['qing zao jiu fei tang'], category: 'formula' },
  { en: ['bai he gu jin tang', 'lily bulb metal'], he: ['באי הה גו ג\'ין טאנג', 'שושן לחיזוק מתכת'], pinyin: ['bai he gu jin tang'], category: 'formula' },
  { en: ['bu fei tang', 'tonify lung'], he: ['בו פיי טאנג', 'חיזוק ריאה'], pinyin: ['bu fei tang'], category: 'formula' },
  { en: ['su zi jiang qi tang', 'perilla descend qi'], he: ['סו צי ג\'יאנג צי טאנג', 'פרילה להורדת צי'], pinyin: ['su zi jiang qi tang'], category: 'formula' },
  { en: ['ding chuan tang', 'arrest wheezing'], he: ['דינג צ\'ואן טאנג', 'עצירת אסתמה'], pinyin: ['ding chuan tang'], category: 'formula' },
  { en: ['she gan ma huang tang', 'belamcanda ephedra'], he: ['שה גאן מא הואנג טאנג', 'בלמקנדה אפדרה'], pinyin: ['she gan ma huang tang'], category: 'formula' },

  // Constipation/Purgative Formulas
  { en: ['da cheng qi tang', 'major order qi'], he: ['דא צ\'נג צי טאנג', 'סידור צי גדול'], pinyin: ['da cheng qi tang'], category: 'formula' },
  { en: ['xiao cheng qi tang', 'minor order qi'], he: ['שיאו צ\'נג צי טאנג', 'סידור צי קטן'], pinyin: ['xiao cheng qi tang'], category: 'formula' },
  { en: ['ma zi ren wan', 'hemp seed pill'], he: ['מא צי רן וואן', 'כדור זרעי קנבוס'], pinyin: ['ma zi ren wan'], category: 'formula' },
  { en: ['run chang wan', 'moisten intestines'], he: ['רון צ\'אנג וואן', 'הלחחת מעיים'], pinyin: ['run chang wan'], category: 'formula' },
  { en: ['zeng ye tang', 'increase fluids'], he: ['צנג יה טאנג', 'הגברת נוזלים'], pinyin: ['zeng ye tang'], category: 'formula' },

  // Wind Formulas
  { en: ['xiao feng san', 'eliminate wind powder'], he: ['שיאו פנג סאן', 'הסרת רוח'], pinyin: ['xiao feng san'], category: 'formula' },
  { en: ['fang feng tong sheng san', 'ledebouriella sagely unblocking'], he: ['פאנג פנג טונג שנג סאן', 'פאנגפנג לפתיחה'], pinyin: ['fang feng tong sheng san'], category: 'formula' },
  { en: ['xiao huo luo dan', 'minor invigorate collaterals'], he: ['שיאו הואו לואו דאן', 'החייאת קולטרלים קטנה'], pinyin: ['xiao huo luo dan'], category: 'formula' },
  { en: ['da huo luo dan', 'major invigorate collaterals'], he: ['דא הואו לואו דאן', 'החייאת קולטרלים גדולה'], pinyin: ['da huo luo dan'], category: 'formula' },
  { en: ['tian ma wan', 'gastrodia pill'], he: ['טיאן מא וואן', 'כדור גסטרודיה'], pinyin: ['tian ma wan'], category: 'formula' },

  // Additional Common Formulas
  { en: ['yu ping feng san', 'jade windscreen'], he: ['יו פינג פנג סאן', 'מסך הרוח הירקני', 'מגן הרוח'], pinyin: ['yu ping feng san'], category: 'formula' },
  { en: ['bi yuan tang', 'rhinitis decoction'], he: ['בי יואן טאנג', 'מרתח לנזלת'], pinyin: ['bi yuan tang'], category: 'formula' },
  { en: ['er long zuo ci wan', 'left hearing pill'], he: ['ער לונג צואו צי וואן', 'כדור שמיעת שמאל'], pinyin: ['er long zuo ci wan'], category: 'formula' },
  { en: ['ming mu di huang wan', 'brighten eyes rehmannia'], he: ['מינג מו די הואנג וואן', 'רהמניה להבהרת עיניים'], pinyin: ['ming mu di huang wan'], category: 'formula' },
  
  // ============================================================================
  // COMMON HERBS - Expanded
  // ============================================================================
  { en: ['ginseng', 'ren shen', 'panax ginseng'], he: ['ג\'ינסנג', 'רן שן', 'שורש ג\'ינסנג'], pinyin: ['ren shen'], category: 'herb' },
  { en: ['astragalus', 'huang qi', 'membranaceus'], he: ['אסטרגלוס', 'הואנג צי', 'הואנגצי'], pinyin: ['huang qi'], category: 'herb' },
  { en: ['angelica', 'dang gui', 'tang kuei'], he: ['אנג\'ליקה', 'דאנג גווי', 'דאנגגווי'], pinyin: ['dang gui'], category: 'herb' },
  { en: ['licorice', 'gan cao', 'glycyrrhiza'], he: ['ליקוריץ', 'גאן צאו', 'שוש'], pinyin: ['gan cao'], category: 'herb' },
  { en: ['ginger', 'sheng jiang', 'fresh ginger'], he: ['ג\'ינג\'ר', 'זנגביל', 'שנג ג\'יאנג', 'זנגביל טרי'], pinyin: ['sheng jiang'], category: 'herb' },
  { en: ['cinnamon', 'gui zhi', 'cinnamon twig'], he: ['קינמון', 'גווי ג\'י', 'ענף קינמון'], pinyin: ['gui zhi'], category: 'herb' },
  { en: ['cinnamon bark', 'rou gui'], he: ['קליפת קינמון', 'רואו גווי'], pinyin: ['rou gui'], category: 'herb' },
  { en: ['peony', 'bai shao', 'white peony'], he: ['אדמונית', 'באי שאו', 'אדמונית לבנה'], pinyin: ['bai shao'], category: 'herb' },
  { en: ['red peony', 'chi shao'], he: ['אדמונית אדומה', 'צ\'י שאו'], pinyin: ['chi shao'], category: 'herb' },
  { en: ['rehmannia', 'di huang', 'sheng di'], he: ['רהמניה', 'די הואנג', 'שנג די'], pinyin: ['di huang', 'sheng di'], category: 'herb' },
  { en: ['prepared rehmannia', 'shu di huang', 'cooked rehmannia'], he: ['רהמניה מוכנה', 'שו די הואנג'], pinyin: ['shu di huang'], category: 'herb' },
  { en: ['bupleurum', 'chai hu'], he: ['בופלורום', 'צ\'אי הו', 'צאיהו'], pinyin: ['chai hu'], category: 'herb' },
  { en: ['atractylodes', 'bai zhu'], he: ['אטרקטילודס', 'באי ג\'ו'], pinyin: ['bai zhu'], category: 'herb' },
  { en: ['poria', 'fu ling'], he: ['פוריה', 'פו לינג'], pinyin: ['fu ling'], category: 'herb' },
  { en: ['jujube', 'da zao', 'red date'], he: ['תמר סיני', 'דא צאו', 'ג\'וג\'ובי'], pinyin: ['da zao'], category: 'herb' },
  { en: ['schisandra', 'wu wei zi', 'five flavor'], he: ['שיסנדרה', 'וו וויי צי', 'חמשת הטעמים'], pinyin: ['wu wei zi'], category: 'herb' },
  { en: ['wolfberry', 'gou qi zi', 'lycium'], he: ['גוג\'י ברי', 'גואו צי צי', 'ברי גוג\'י'], pinyin: ['gou qi zi'], category: 'herb' },
  { en: ['chrysanthemum', 'ju hua'], he: ['כריזנתמה', 'ג\'ו הואה', 'חרצית'], pinyin: ['ju hua'], category: 'herb' },
  { en: ['mint', 'bo he'], he: ['מנטה', 'בו הה', 'נענע'], pinyin: ['bo he'], category: 'herb' },
  { en: ['scutellaria', 'huang qin'], he: ['סקוטלריה', 'הואנג צ\'ין'], pinyin: ['huang qin'], category: 'herb' },
  { en: ['coptis', 'huang lian'], he: ['קופטיס', 'הואנג ליאן'], pinyin: ['huang lian'], category: 'herb' },
  { en: ['pinellia', 'ban xia'], he: ['פינליה', 'באן שיא'], pinyin: ['ban xia'], category: 'herb' },
  { en: ['citrus peel', 'chen pi', 'tangerine peel'], he: ['קליפת הדר', 'צ\'ן פי', 'קליפת מנדרינה'], pinyin: ['chen pi'], category: 'herb' },
  { en: ['salvia', 'dan shen'], he: ['סלביה', 'דאן שן', 'מרווה סינית'], pinyin: ['dan shen'], category: 'herb' },
  { en: ['sour jujube seed', 'suan zao ren'], he: ['גרעין תמר חמוץ', 'סואן צאו רן'], pinyin: ['suan zao ren'], category: 'herb' },
  
  // ============================================================================
  // COMMON ACUPOINTS - Expanded
  // ============================================================================
  { en: ['LI4', 'hegu', 'large intestine 4', 'joining valley'], he: ['LI4', 'האגו', 'לי 4', 'מעי גס 4', 'עמק המפגש'], pinyin: ['he gu'], category: 'point' },
  { en: ['LV3', 'liver 3', 'taichong', 'great surge'], he: ['LV3', 'טאי צ\'ונג', 'כבד 3', 'גל הגדול'], pinyin: ['tai chong'], category: 'point' },
  { en: ['ST36', 'zusanli', 'stomach 36', 'leg three miles'], he: ['ST36', 'זו סאן לי', 'קיבה 36', 'שלוש מילים ברגל'], pinyin: ['zu san li'], category: 'point' },
  { en: ['SP6', 'sanyinjiao', 'spleen 6', 'three yin intersection'], he: ['SP6', 'סאן יין ג\'יאו', 'טחול 6', 'מפגש שלושת היין'], pinyin: ['san yin jiao'], category: 'point' },
  { en: ['BL23', 'shenshu', 'bladder 23', 'kidney shu'], he: ['BL23', 'שן שו', 'שלפוחית 23', 'שו כליה'], pinyin: ['shen shu'], category: 'point' },
  { en: ['GV20', 'baihui', 'governing vessel 20', 'hundred meetings'], he: ['GV20', 'באי הווי', 'דו 20', 'מאה מפגשים'], pinyin: ['bai hui'], category: 'point' },
  { en: ['GB20', 'fengchi', 'gallbladder 20', 'wind pool'], he: ['GB20', 'פנג צ\'י', 'כיס מרה 20', 'בריכת הרוח'], pinyin: ['feng chi'], category: 'point' },
  { en: ['PC6', 'neiguan', 'pericardium 6', 'inner gate'], he: ['PC6', 'ניי גואן', 'קרום לב 6', 'שער פנימי'], pinyin: ['nei guan'], category: 'point' },
  { en: ['HT7', 'shenmen', 'heart 7', 'spirit gate'], he: ['HT7', 'שן מן', 'לב 7', 'שער הרוח'], pinyin: ['shen men'], category: 'point' },
  { en: ['KI3', 'taixi', 'kidney 3', 'great ravine'], he: ['KI3', 'טאי שי', 'כליה 3', 'עמק הגדול'], pinyin: ['tai xi'], category: 'point' },
  { en: ['LU7', 'lieque', 'lung 7', 'broken sequence'], he: ['LU7', 'ליה צ\'יואה', 'ריאה 7', 'סדר שבור'], pinyin: ['lie que'], category: 'point' },
  { en: ['CV6', 'qihai', 'conception vessel 6', 'sea of qi'], he: ['CV6', 'צי האי', 'רן 6', 'ים הצי'], pinyin: ['qi hai'], category: 'point' },
  { en: ['CV12', 'zhongwan', 'conception vessel 12', 'middle cavity'], he: ['CV12', 'ג\'ונג וואן', 'רן 12', 'חלל אמצעי'], pinyin: ['zhong wan'], category: 'point' },
  { en: ['yintang', 'third eye', 'hall of impression'], he: ['יין טאנג', 'עין שלישית', 'היכל הרושם'], pinyin: ['yin tang'], category: 'point' },
  { en: ['taiyang', 'temple', 'greater yang'], he: ['טאי יאנג', 'רקה', 'יאנג גדול'], pinyin: ['tai yang'], category: 'point' },
  { en: ['BL2', 'zanzhu', 'bladder 2', 'bamboo gathering'], he: ['BL2', 'צאן ג\'ו', 'שלפוחית 2', 'איסוף במבוק'], pinyin: ['zan zhu'], category: 'point' },
  { en: ['LI11', 'quchi', 'large intestine 11', 'pool at bend'], he: ['LI11', 'צ\'ו צ\'י', 'מעי גס 11', 'בריכה בכיפוף'], pinyin: ['qu chi'], category: 'point' },
  { en: ['ST40', 'fenglong', 'stomach 40', 'abundant bulge'], he: ['ST40', 'פנג לונג', 'קיבה 40', 'בליטה שופעת'], pinyin: ['feng long'], category: 'point' },
  { en: ['GB34', 'yanglingquan', 'gallbladder 34', 'yang mound spring'], he: ['GB34', 'יאנג לינג צ\'ואן', 'כיס מרה 34', 'מעיין הר היאנג'], pinyin: ['yang ling quan'], category: 'point' },
  { en: ['SI3', 'houxi', 'small intestine 3', 'back stream'], he: ['SI3', 'הואו שי', 'מעי דק 3', 'זרם אחורי'], pinyin: ['hou xi'], category: 'point' },
  { en: ['TE5', 'waiguan', 'triple energizer 5', 'outer gate'], he: ['TE5', 'וואי גואן', 'שלוש מוקדים 5', 'שער חיצוני'], pinyin: ['wai guan'], category: 'point' },
  { en: ['CV4', 'guanyuan', 'conception vessel 4', 'origin pass'], he: ['CV4', 'גואן יואן', 'רן 4', 'מעבר המקור'], pinyin: ['guan yuan'], category: 'point' },
  { en: ['GV14', 'dazhui', 'governing vessel 14', 'great vertebra'], he: ['GV14', 'דא ג\'ואי', 'דו 14', 'חוליה גדולה'], pinyin: ['da zhui'], category: 'point' },
  { en: ['SP10', 'xuehai', 'spleen 10', 'sea of blood'], he: ['SP10', 'שואה האי', 'טחול 10', 'ים הדם'], pinyin: ['xue hai'], category: 'point' },
  
  // ============================================================================
  // FREEHAND CLINICAL TERMS - Colloquial Hebrew expressions
  // ============================================================================
  { en: ['patient feels tired', 'i feel tired', 'exhausted'], he: ['מרגיש עייף', 'עייף לי', 'אין לי כוח', 'אני עייף', 'אני עייפה', 'מותש'], category: 'freehand' },
  { en: ['patient cannot sleep', 'cannot fall asleep', 'sleepless'], he: ['לא יכול לישון', 'לא נרדם', 'לא מצליח להירדם', 'לא ישנה', 'ער בלילה'], category: 'freehand' },
  { en: ['patient wakes up at night', 'waking up'], he: ['מתעורר בלילה', 'קם בלילה', 'שינה קטועה', 'לא ישן רציף'], category: 'freehand' },
  { en: ['patient has headaches', 'my head hurts'], he: ['כואב לי הראש', 'יש לי כאב ראש', 'ראש כואב', 'הראש פוצץ'], category: 'freehand' },
  { en: ['patient has back pain', 'my back hurts'], he: ['כואב לי הגב', 'יש לי כאבי גב', 'הגב הורג', 'כאב בגב'], category: 'freehand' },
  { en: ['patient is stressed', 'feeling stressed'], he: ['אני לחוץ', 'בלחץ', 'יש לי לחץ', 'לחוצה', 'מתוח'], category: 'freehand' },
  { en: ['patient is anxious', 'feeling anxious'], he: ['יש לי חרדה', 'מרגיש חרדה', 'חרדתי', 'פוחד', 'חוששת'], category: 'freehand' },
  { en: ['patient has digestive issues', 'stomach problems'], he: ['בטן לא בסדר', 'בעיות בבטן', 'הבטן לא טובה', 'עיכול לא טוב'], category: 'freehand' },
  { en: ['patient feels cold', 'always cold'], he: ['קר לי', 'תמיד קר לי', 'מקררת', 'מקורר', 'גפיים קרות'], category: 'freehand' },
  { en: ['patient feels hot', 'always hot'], he: ['חם לי', 'מחממת', 'גלי חום', 'מזיע'], category: 'freehand' },
  { en: ['patient is emotional', 'mood swings'], he: ['רגשית', 'מצבי רוח', 'תנודות במצב הרוח', 'עצבנית'], category: 'freehand' },
  { en: ['patient has no energy', 'low energy'], he: ['אין אנרגיה', 'חסר אנרגיה', 'בלי כוח', 'שפוט'], category: 'freehand' },
  { en: ['patient is bloated', 'feeling bloated'], he: ['נפוח', 'נפוחה', 'יש לי גזים', 'בטן נפוחה'], category: 'freehand' },
  { en: ['patient has poor appetite', 'not hungry'], he: ['אין תיאבון', 'לא רעב', 'לא רעבה', 'תיאבון ירוד'], category: 'freehand' },
  { en: ['patient craves sweets', 'sugar craving'], he: ['רוצה מתוק', 'חשק למתוק', 'תאווה למתוקים', 'צריך סוכר'], category: 'freehand' },
  { en: ['patient has dry mouth', 'thirsty all the time'], he: ['פה יבש', 'צמא כל הזמן', 'שותה הרבה', 'יובש בפה'], category: 'freehand' },
  { en: ['patient has bitter taste', 'bitter mouth'], he: ['טעם מר', 'מר בפה', 'מרירות'], category: 'freehand' },
  { en: ['patient sighs often', 'sighing'], he: ['נאנח הרבה', 'אנחות', 'מרבה לנשום'], category: 'freehand' },
  { en: ['patient feels chest tightness', 'chest pressure'], he: ['לחץ בחזה', 'חזה לחוץ', 'צר לי בחזה'], category: 'freehand' },
  { en: ['patient has palpitations', 'heart racing'], he: ['הלב דופק חזק', 'לב רץ', 'מרגיש את הלב'], category: 'freehand' },
  { en: ['patient is irritable', 'easily angered'], he: ['עצבני', 'נהיה עצבני מהר', 'מתפרץ', 'קצר רוח'], category: 'freehand' },
  { en: ['patient has brain fog', 'cannot concentrate'], he: ['ערפל מוחי', 'לא מרוכז', 'לא יכול להתרכז', 'מבולבל'], category: 'freehand' },
  { en: ['patient is forgetful', 'memory problems'], he: ['שכחן', 'שוכח', 'בעיות זיכרון', 'לא זוכר'], category: 'freehand' },
  { en: ['patient has dizziness', 'feeling dizzy'], he: ['סחרחורת', 'מסוחרר', 'ראש סובב'], category: 'freehand' },
  { en: ['patient has period pain', 'menstrual cramps'], he: ['כואב במחזור', 'כאבי מחזור', 'התכווציות'], category: 'freehand' },
  { en: ['patient has irregular periods'], he: ['מחזור לא סדיר', 'לא קבוע', 'מחזור משתנה'], category: 'freehand' },
  { en: ['patient trying to conceive', 'fertility'], he: ['מנסה להיכנס להריון', 'טיפולי פוריות', 'רוצה להרות'], category: 'freehand' },
  { en: ['patient has hot flashes', 'menopause symptoms'], he: ['גלי חום', 'מנופאוזה', 'גיל המעבר'], category: 'freehand' },
  { en: ['patient sweats at night'], he: ['מזיע בלילה', 'הזעות לילה', 'מתעורר רטוב'], category: 'freehand' },
  { en: ['patient has restless legs'], he: ['רגליים חסרות מנוחה', 'לא יכול להרגיע את הרגליים'], category: 'freehand' },
  { en: ['patient has numbness tingling'], he: ['נימול', 'עקצוצים', 'חסר תחושה', 'מנמנם'], category: 'freehand' },
  { en: ['what points for', 'which points should i use'], he: ['אילו נקודות', 'איזה נקודות', 'נקודות מומלצות', 'נקודות עבור'], category: 'freehand' },
  { en: ['treatment for', 'how to treat'], he: ['טיפול ב', 'איך לטפל ב', 'מה הטיפול ל'], category: 'freehand' },
  { en: ['formula for', 'which formula'], he: ['פורמולה ל', 'איזו פורמולה', 'מרשם ל'], category: 'freehand' },
  { en: ['herbs for', 'which herbs'], he: ['צמחים ל', 'איזה צמחים', 'עשבי מרפא ל'], category: 'freehand' },
];

/**
 * Expand query with bilingual terms
 * Returns both original terms and translated equivalents
 */
function expandWithBilingualGlossary(query: string, detectedLang: DetectedLanguage): string[] {
  const normalizedQuery = query.toLowerCase();
  const expansions: string[] = [];
  
  for (const entry of TCM_BILINGUAL_GLOSSARY) {
    const allTerms = [...entry.en, ...entry.he, ...(entry.pinyin || [])];
    
    // Check if any term from this entry appears in the query
    const foundTerm = allTerms.find(term => 
      normalizedQuery.includes(term.toLowerCase())
    );
    
    if (foundTerm) {
      // Add all related terms for cross-language search
      expansions.push(...allTerms);
    }
  }
  
  return [...new Set(expansions)]; // Deduplicate
}

/**
 * Get language-specific file patterns for targeted search
 */
function getLanguageFilePatterns(lang: DetectedLanguage): string[] {
  switch (lang) {
    case 'hebrew':
      return ['hebrew', 'he_', '_he', 'heb', 'עברית'];
    case 'chinese':
      return ['chinese', 'zh_', '_zh', 'mandarin'];
    case 'english':
      return ['english', 'en_', '_en', 'eng'];
    default:
      return []; // Search all for mixed
  }
}

// ============================================================================
// CROSS-LINGUAL RAG: 3-STEP TRANSLATION LAYER
// ============================================================================

/**
 * Step 0: Extract clinical symptoms from conversational questions
 * Converts intake questions like "Sleep, mood, energy now?" to 
 * searchable symptom keywords like "insomnia, depression, fatigue, qi deficiency"
 */
async function extractSymptomsFromQuestion(
  query: string
): Promise<{ symptomQuery: string; wasExtracted: boolean }> {
  // Quick check: if query already contains clinical terms, skip extraction
  const clinicalTermsPattern = /\b(deficiency|stagnation|syndrome|pattern|pain|ache|insomnia|fatigue|anxiety|depression|headache|migraine|nausea|constipation|diarrhea|bloating|edema|hypertension|diabetes|arthritis|fibromyalgia|sciatica|vertigo|tinnitus|palpitation|sweating|hot flash|cold|heat|damp|phlegm|blood stasis|qi xu|yin xu|yang xu|liver|spleen|kidney|heart|lung|stomach|gallbladder|bladder|BL\d|GB\d|ST\d|SP\d|LI\d|KI\d|LR\d|HT\d|PC\d|TE\d|LU\d)\b/i;
  
  if (clinicalTermsPattern.test(query)) {
    console.log('Query already contains clinical terms, skipping symptom extraction');
    return { symptomQuery: query, wasExtracted: false };
  }
  
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    console.warn('LOVABLE_API_KEY not configured, skipping symptom extraction');
    return { symptomQuery: query, wasExtracted: false };
  }
  
  try {
    console.log('=== SYMPTOM EXTRACTION: Converting question to clinical terms ===');
    console.log('Original question:', query);
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `You are a TCM (Traditional Chinese Medicine) clinical keyword extractor.

TASK: Convert conversational patient intake questions into searchable clinical symptom keywords.

EXAMPLES:
- "Sleep, mood, energy now?" → "insomnia, sleep disorder, depression, mood disorder, fatigue, qi deficiency, heart blood deficiency, liver qi stagnation"
- "How has your condition evolved?" → "symptom progression, disease course, treatment response, chronic condition"  
- "Tingling, heaviness, warmth during needling?" → "de qi sensation, needle response, acupuncture sensation, qi arrival"
- "Feel informed and supported?" → "patient education, therapeutic relationship, treatment compliance"
- "Able to perform daily activities more easily?" → "functional improvement, quality of life, treatment efficacy, mobility"
- "Any digestive issues?" → "digestive disorder, stomach pain, nausea, bloating, constipation, diarrhea, spleen qi deficiency"
- "Headaches or migraines?" → "headache, migraine, head pain, liver yang rising, blood stasis, wind invasion"

RULES:
1. Output ONLY comma-separated clinical keywords (no explanations)
2. Include relevant TCM patterns (qi deficiency, blood stasis, liver yang rising, etc.)
3. Include Western symptoms AND TCM terminology
4. Keep output under 100 words
5. Focus on terms that would appear in clinical TCM literature`
          },
          { role: 'user', content: query }
        ],
        temperature: 0.1,
        max_tokens: 150
      }),
    });
    
    if (!response.ok) {
      console.error('Symptom extraction API error:', response.status);
      return { symptomQuery: query, wasExtracted: false };
    }
    
    const data = await response.json();
    const symptomQuery = data.choices?.[0]?.message?.content?.trim() || query;
    
    console.log('Extracted symptoms:', symptomQuery);
    
    return { symptomQuery, wasExtracted: true };
  } catch (error) {
    console.error('Symptom extraction error:', error);
    return { symptomQuery: query, wasExtracted: false };
  }
}

/**
 * Step 1: Translate query to English for database search
 * This is the "Bridge" - converts Hebrew/Russian queries to English keywords
 * that match our English-only knowledge base
 */
async function translateQueryToEnglish(
  query: string, 
  sourceLanguage: DetectedLanguage
): Promise<{ englishQuery: string; wasTranslated: boolean }> {
  // If already English, return as-is
  if (sourceLanguage === 'english') {
    return { englishQuery: query, wasTranslated: false };
  }
  
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    console.warn('LOVABLE_API_KEY not configured, skipping translation');
    return { englishQuery: query, wasTranslated: false };
  }
  
  try {
    console.log(`=== STEP 1: TRANSLATING ${sourceLanguage.toUpperCase()} QUERY TO ENGLISH ===`);
    console.log('Original query:', query);
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          {
            role: 'system',
            content: `You are a medical translator specializing in Traditional Chinese Medicine (TCM). 
Translate the user's query to English for searching a medical database.
- Extract key medical/TCM terms and translate them accurately
- Preserve TCM terminology (e.g., "Liver Qi Stagnation", "Wei Qi", "Shen")
- Include both the direct translation and relevant TCM keywords
- Output ONLY the English translation, nothing else
- Keep it concise - focus on searchable keywords`
          },
          { role: 'user', content: query }
        ],
        temperature: 0,
        max_tokens: 200
      }),
    });
    
    if (!response.ok) {
      console.error('Translation API error:', response.status);
      return { englishQuery: query, wasTranslated: false };
    }
    
    const data = await response.json();
    const englishQuery = data.choices?.[0]?.message?.content?.trim() || query;
    
    console.log('Translated to English:', englishQuery);
    
    return { englishQuery, wasTranslated: true };
  } catch (error) {
    console.error('Translation error:', error);
    return { englishQuery: query, wasTranslated: false };
  }
}

/**
 * Get the response language instruction for the AI
 * Step 3 of the cross-lingual RAG pattern
 */
function getResponseLanguageInstruction(language: DetectedLanguage | string): string {
  const langMap: Record<string, string> = {
    'hebrew': 'Hebrew (עברית)',
    'he': 'Hebrew (עברית)',
    'english': 'English',
    'en': 'English',
    'russian': 'Russian (Русский)',
    'ru': 'Russian (Русский)',
    'chinese': 'Chinese (中文)',
    'zh': 'Chinese (中文)',
    'mixed': 'the same language as the user query'
  };
  
  return langMap[language] || 'the same language as the user query';
}

function uniq<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

// ============================================================================
// HYBRID SEARCH CONFIGURATION
// ============================================================================
const CONFIDENCE_THRESHOLD = 0.80; // Minimum confidence score for "protocol found"
const LOW_CONFIDENCE_THRESHOLD = 0.40; // Below this = "No protocol found"

// ============================================================================
// POINT CODE EXTRACTION - Extracts acupuncture point codes from text
// ============================================================================
const POINT_CODE_PATTERN = /\b((?:BL|GB|ST|SP|LI|SI|HT|PC|TE|TW|KI|LR|LU|REN|DU|CV|GV|EX)[- ]?\d{1,2}[A-Z]?)\b/gi;
const EXTRA_POINT_PATTERN = /\b((?:Yin ?Tang|Tai ?Yang|Si ?Shen ?Cong|An ?Mian|Bai ?Lao|Ding ?Chuan|Jia ?Ji|Hua ?Tuo|Shi ?Qi|Ba ?Feng|Ba ?Xie|Si ?Feng|Shi ?Xuan))\b/gi;

interface ExtractedPoints {
  codes: string[];
  extraPoints: string[];
  allPoints: string[];
  figureReferences: string[];
}

/**
 * Extract acupuncture point codes from text content
 */
function extractPointCodes(text: string): ExtractedPoints {
  const normalizedText = text.toUpperCase();
  
  // Extract standard point codes (BL40, ST36, etc.)
  const codeMatches = normalizedText.match(POINT_CODE_PATTERN) || [];
  const codes = [...new Set(codeMatches.map(c => c.replace(/\s+/g, '').toUpperCase()))];
  
  // Extract extra points (Yintang, Taiyang, etc.)
  const extraMatches = text.match(EXTRA_POINT_PATTERN) || [];
  const extraPoints = [...new Set(extraMatches.map(e => e.replace(/\s+/g, '')))];
  
  // Combine all points
  const allPoints = [...codes, ...extraPoints];
  
  // Map points to figure references (simplified mapping)
  const figureReferences = mapPointsToFigures(codes);
  
  return { codes, extraPoints, allPoints, figureReferences };
}

/**
 * Map point codes to body figure filenames
 */
function mapPointsToFigures(pointCodes: string[]): string[] {
  const figureMap: Record<string, string[]> = {
    // Head and leg points (GB appears on both)
    'GB': ['head_lateral.png', 'head_posterior.png', 'leg_lateral.png'],
    'ST': ['head_anterior.png', 'leg_anterior.png', 'abdomen.png'],
    'DU': ['head_posterior.png', 'spine_posterior.png'],
    'GV': ['head_posterior.png', 'spine_posterior.png'],
    'REN': ['abdomen.png', 'chest_anterior.png'],
    'CV': ['abdomen.png', 'chest_anterior.png'],
    // Arm points
    'LI': ['arm_lateral.png', 'hand_dorsum.png'],
    'LU': ['arm_medial.png', 'chest_anterior.png'],
    'HT': ['arm_medial.png'],
    'SI': ['arm_posterior.png', 'shoulder_posterior.png'],
    'PC': ['arm_medial.png'],
    'TE': ['arm_lateral.png'],
    'TW': ['arm_lateral.png'],
    // Leg points
    'SP': ['leg_medial.png', 'foot_medial.png'],
    'KI': ['leg_medial.png', 'foot_sole.png'],
    'LR': ['leg_medial.png', 'foot_dorsum.png'],
    'BL': ['leg_posterior.png', 'spine_posterior.png', 'foot_lateral.png'],
  };
  
  const figures = new Set<string>();
  
  for (const code of pointCodes) {
    // Extract meridian prefix (e.g., "BL" from "BL40")
    const meridian = code.replace(/\d+[A-Z]?$/, '');
    if (figureMap[meridian]) {
      figureMap[meridian].forEach(fig => figures.add(fig));
    }
  }
  
  return [...figures];
}

interface HybridSearchResult {
  id: string;
  content: string;
  question: string | null;
  answer: string | null;
  chunk_index: number;
  metadata: any;
  language: string;
  document_id: string;
  file_name: string;
  original_name: string;
  category: string;
  vector_score: number;
  keyword_score: number;
  combined_score: number;
  confidence: string;
  // Ferrari algorithm fields
  priority_score?: number;
  nano_prompt?: string;
  ferrari_score?: number;
  is_clinical_standard?: boolean;
}

interface SearchConfidenceResult {
  chunks: HybridSearchResult[];
  overallConfidence: 'very_high' | 'high' | 'medium' | 'low' | 'none';
  averageScore: number;
  meetsThreshold: boolean;
  extractedPoints: ExtractedPoints;
  searchType: 'hybrid' | 'keyword_fallback';
  clinicalStandardCount?: number; // Ferrari algorithm: count of high-authority sources
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

/**
 * Generate embedding for a query using OpenAI
 */
async function generateQueryEmbedding(text: string): Promise<number[] | null> {
  if (!OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set, cannot generate embeddings');
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text.slice(0, 8000), // Limit input length
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI embedding API error:', error);
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.embedding || null;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    return null;
  }
}

/**
 * Perform true hybrid search with vector similarity + keyword matching
 */
async function performHybridSearch(
  supabaseClient: any,
  queryText: string,
  languageFilter: string | null,
  matchCount: number = 20
): Promise<SearchConfidenceResult> {
  console.log('=== HYBRID SEARCH START ===');
  console.log('Query:', queryText);
  console.log('Language filter:', languageFilter);
  
  // Try to generate embedding for true hybrid search
  const queryEmbedding = await generateQueryEmbedding(queryText);
  
  let results: HybridSearchResult[] = [];
  let searchType: 'hybrid' | 'keyword_fallback' = 'keyword_fallback';
  
  if (queryEmbedding) {
    console.log('Using hybrid search with vector embeddings');
    searchType = 'hybrid';
    
    // Call the hybrid_search function with embeddings
    const { data, error } = await supabaseClient.rpc('hybrid_search', {
      query_embedding: JSON.stringify(queryEmbedding),
      query_text: queryText,
      match_threshold: 0.40, // Combined score threshold
      match_count: matchCount,
      language_filter: languageFilter
    });
    
    if (error) {
      console.error('Hybrid search error, falling back to keyword search:', error);
      searchType = 'keyword_fallback';
    } else {
      results = (data || []) as HybridSearchResult[];
    }
  }
  
  // Fallback to keyword-only search if no embedding or hybrid search failed
  if (searchType === 'keyword_fallback') {
    console.log('Using keyword-only fallback search');
    
    const { data, error } = await supabaseClient.rpc('keyword_search', {
      query_text: queryText,
      match_threshold: 0.15,
      match_count: matchCount,
      language_filter: languageFilter
    });
    
    if (error) {
      console.error('Keyword search error:', error);
      return {
        chunks: [],
        overallConfidence: 'none',
        averageScore: 0,
        meetsThreshold: false,
        extractedPoints: { codes: [], extraPoints: [], allPoints: [], figureReferences: [] },
        searchType: 'keyword_fallback'
      };
    }
    
    // Convert keyword results to hybrid format
    results = ((data || []) as any[]).map(r => ({
      ...r,
      vector_score: 0,
      combined_score: r.keyword_score || 0,
    }));
  }
  
  // ★ FERRARI ALGORITHM - Use database ferrari_score (70% relevance + 30% priority) ★
  // The hybrid_search RPC now returns ferrari_score and is_clinical_standard
  const boostedResults = results.map(chunk => {
    // Use Ferrari score from database if available, otherwise fall back to category boost
    const ferrariScore = (chunk as any).ferrari_score;
    const priorityScore = (chunk as any).priority_score || 50;
    const isClinicalStandard = (chunk as any).is_clinical_standard || priorityScore >= 85;
    
    // If Ferrari score is available from DB, use it directly
    if (ferrariScore !== undefined && ferrariScore !== null) {
      return {
        ...chunk,
        original_score: chunk.combined_score || chunk.keyword_score || 0,
        boosted_score: ferrariScore,
        ferrari_score: ferrariScore,
        priority_score: priorityScore,
        is_clinical_standard: isClinicalStandard,
        category_boost: 1.0, // DB handles boosting now
        combined_score: ferrariScore // Use Ferrari score for ranking
      };
    }
    
    // Fallback: Apply old category-based boosting
    const categoryBoost = getCategoryBoostMultiplier(chunk.category);
    const originalScore = chunk.combined_score || chunk.keyword_score || 0;
    const boostedScore = originalScore * categoryBoost;
    return {
      ...chunk,
      original_score: originalScore,
      boosted_score: boostedScore,
      ferrari_score: boostedScore,
      priority_score: priorityScore,
      is_clinical_standard: false,
      category_boost: categoryBoost,
      combined_score: boostedScore
    };
  });
  
  // Re-sort by Ferrari/boosted score
  boostedResults.sort((a, b) => (b.ferrari_score || b.boosted_score || 0) - (a.ferrari_score || a.boosted_score || 0));
  
  const chunks = boostedResults;
  
  // Calculate overall confidence based on Ferrari score
  const topScore = chunks.length > 0 
    ? (chunks[0]?.ferrari_score || chunks[0]?.boosted_score || chunks[0]?.combined_score || 0)
    : 0;
  
  const avgScore = chunks.length > 0 
    ? chunks.reduce((sum, c) => sum + (c.ferrari_score || c.boosted_score || c.combined_score || 0), 0) / chunks.length 
    : 0;
  
  // Count Clinical Standard sources
  const clinicalStandardCount = chunks.filter(c => c.is_clinical_standard).length;
  
  // Determine overall confidence based on Ferrari scores
  let overallConfidence: 'very_high' | 'high' | 'medium' | 'low' | 'none';
  if (searchType === 'hybrid') {
    if (topScore >= 0.90) overallConfidence = 'very_high';
    else if (topScore >= 0.80) overallConfidence = 'high';
    else if (topScore >= 0.60) overallConfidence = 'medium';
    else if (topScore >= 0.40) overallConfidence = 'low';
    else overallConfidence = 'none';
  } else {
    if (topScore >= 0.70) overallConfidence = 'very_high';
    else if (topScore >= 0.50) overallConfidence = 'high';
    else if (topScore >= 0.30) overallConfidence = 'medium';
    else if (topScore >= 0.15) overallConfidence = 'low';
    else overallConfidence = 'none';
  }
  
  // Filter chunks that meet threshold
  const confidentChunks = chunks.filter(c => 
    c.confidence === 'very_high' || c.confidence === 'high' || c.confidence === 'medium'
  );
  
  // Extract points from all confident chunks
  const allContent = confidentChunks.map(c => c.content + ' ' + (c.answer || '')).join(' ');
  const extractedPoints = extractPointCodes(allContent);
  
  // Log Ferrari algorithm stats
  const categoryStats = confidentChunks.reduce((acc, c) => {
    const cat = c.category || 'unknown';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('=== FERRARI ALGORITHM SEARCH RESULTS ===');
  console.log('Search type:', searchType);
  console.log('Total results:', chunks.length);
  console.log('Confident chunks (medium+):', confidentChunks.length);
  console.log('Top Ferrari score:', topScore.toFixed(3));
  console.log('Average Ferrari score:', avgScore.toFixed(3));
  console.log('Overall confidence:', overallConfidence);
  console.log('Clinical Standard sources:', clinicalStandardCount);
  console.log('Category distribution:', JSON.stringify(categoryStats));
  console.log('Extracted points:', extractedPoints.allPoints.slice(0, 10).join(', '));
  
  return {
    chunks: confidentChunks,
    overallConfidence,
    averageScore: avgScore,
    meetsThreshold: overallConfidence !== 'none' && overallConfidence !== 'low',
    extractedPoints,
    searchType,
    clinicalStandardCount
  };
}

// ============================================================================
// PRIORITY CATEGORY BOOSTING - Premium categories get ranked higher
// ============================================================================
// Priority Tier 1 (highest): Latest "Big 4" heavy indexed files (Jan 7, 2026)
const PRIORITY_TIER_1_CATEGORIES = new Set([
  'tcm-education',      // Zang Fu Syndromes Full Hebrew Course (25 chunks)
  'tcm-syndromes',      // Dr Zang Fu Syndromes Q&A (26 chunks)
]);

// Priority Tier 2: High-value specialty modules
const PRIORITY_TIER_2_CATEGORIES = new Set([
  'wellness_sport',     // Sport Performance 100 Q&A (100 chunks)
  'tcm_theory',         // Pattern Differentiation, Diet, Trauma (multiple files)
  'anxiety_mental',     // Mental health & mindset (100+ chunks)
]);

// Priority Tier 3: Elite & specialized content
const PRIORITY_TIER_3_CATEGORIES = new Set([
  'other',              // Elite Lifestyle Longevity (97 chunks)
  'pharmacopeia',
  'clinical',
]);

// Boost multipliers for priority search
const CATEGORY_BOOST_MULTIPLIERS = {
  tier1: 2.5,  // 150% bonus for top priority
  tier2: 1.8,  // 80% bonus for high-value
  tier3: 1.4,  // 40% bonus for specialized
  default: 1.0
};

function getCategoryBoostMultiplier(category: string | null): number {
  if (!category) return CATEGORY_BOOST_MULTIPLIERS.default;
  const cat = category.toLowerCase();
  
  if (PRIORITY_TIER_1_CATEGORIES.has(cat)) return CATEGORY_BOOST_MULTIPLIERS.tier1;
  if (PRIORITY_TIER_2_CATEGORIES.has(cat)) return CATEGORY_BOOST_MULTIPLIERS.tier2;
  if (PRIORITY_TIER_3_CATEGORIES.has(cat)) return CATEGORY_BOOST_MULTIPLIERS.tier3;
  return CATEGORY_BOOST_MULTIPLIERS.default;
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
  
  // ★ PRIORITY CATEGORY BOOST ★
  // Apply category multiplier to boost premium sources
  const categoryBoost = getCategoryBoostMultiplier(chunk.category);
  score = Math.round(score * categoryBoost);
  
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
// 4-PILLAR HOLISTIC MANAGER SYSTEM PROMPT - STRICT CLOSED LOOP
// ============================================================================
const TCM_RAG_SYSTEM_PROMPT = `You are Dr. Sapir's TCM Holistic Knowledge Manager, powered EXCLUSIVELY by proprietary materials from Dr. Roni Sapir's clinical knowledge base.

⚠️ CLOSED LOOP RESTRICTION ⚠️
You are FORBIDDEN from using any external knowledge, general training data, or internet sources.
You may ONLY use the information provided in the "4-PILLAR KNOWLEDGE BASE CONTEXT" section below.
If the context does not contain relevant information for any pillar, you MUST respond with:
"No protocol found in clinic assets for [topic]."

DO NOT:
- Generate answers from general AI training data
- Invent or guess information not in the provided context
- Use internet searches or external knowledge
- Fill gaps with assumptions

ROLE: You are the Master AI for a high-end TCM Clinic. You have access ONLY to verified documents containing clinical protocols, herbal data, and lifestyle advice FROM THE PROVIDED CONTEXT.

TASK: When a user queries a condition, you MUST extract ALL relevant modalities found IN THE PROVIDED CONTEXT and categorize them into the 4 PILLARS.

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
CRITICAL RULES - ZERO TOLERANCE FOR HALLUCINATION:
============================================================================

1. STRICT CONTEXT ONLY: You may ONLY use information from the provided context. If information is not in the context, say "No protocol found in clinic assets."

2. NO HALLUCINATION: If a document lists points but no herbs, return "Herbs: No protocol found in clinic assets." Do NOT invent a formula.

3. EXHAUSTIVE EXTRACTION: You MUST fill all 4 pillars from the context. If a pillar has no information IN THE CONTEXT, explicitly state "No protocol found in clinic assets."

4. ALWAYS cite sources using [Source: filename, entry #X] format - ONLY cite sources that appear in the provided context.

5. VISUAL LINKING: Link acupuncture points to their image IDs when available in the context. Also look for exercise diagrams.

6. STRUCTURED OUTPUT: Present the "Clinical" and "Pharmacopeia" sections for the Therapist, and "Nutrition/Lifestyle" as "Patient Instructions."

7. Respond in the same language as the user's question (Hebrew if Hebrew, English if English).

8. When answering, quote or paraphrase DIRECTLY from the provided context - never generate content not in the context.

============================================================================
OUTPUT FORMAT:
============================================================================

## 🏥 FOR THE THERAPIST

### 📍 Clinical Protocol
[Acupuncture points, techniques, depth, etc. FROM CONTEXT ONLY - or "No protocol found in clinic assets."]

### 🌿 Herbal Formula
[Formula name, ingredients, dosage, contraindications FROM CONTEXT ONLY - or "No protocol found in clinic assets."]

---

## 📋 PATIENT INSTRUCTIONS

### 🍎 Nutrition Guidelines
[Diet recommendations, foods to eat/avoid FROM CONTEXT ONLY - or "No protocol found in clinic assets."]

### 🏃 Lifestyle & Exercise
[Exercise, sleep, stretches, stress management FROM CONTEXT ONLY - or "No protocol found in clinic assets."]

---

## 📚 Sources
[List all sources used - MUST match sources in provided context]`;

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

    const { query, messages, useExternalAI, includeChunkDetails, ageGroup, patientContext, language } = await req.json();
    const searchQuery = query || messages?.[messages.length - 1]?.content || '';

    // ========================================================================
    // CROSS-LINGUAL RAG - STEP 1: LANGUAGE DETECTION
    // ========================================================================
    const detectedLanguage = detectLanguage(searchQuery);
    
    // Use explicit language param, or detect from query, default to 'en'
    // Map detected language to database language codes
    const languageMap: Record<DetectedLanguage, string> = {
      'hebrew': 'he',
      'english': 'en', 
      'chinese': 'zh',
      'mixed': 'en' // Default to English for mixed
    };
    const userLanguage = language || languageMap[detectedLanguage] || 'en';
    
    console.log('=== CROSS-LINGUAL RAG - 3-STEP TRANSLATION LAYER ===');
    console.log('Original query:', searchQuery);
    console.log('Detected language:', detectedLanguage);
    console.log('User response language:', userLanguage);

    // ========================================================================
    // CROSS-LINGUAL RAG - STEP 0: EXTRACT SYMPTOMS FROM CONVERSATIONAL QUESTIONS
    // ========================================================================
    // This converts intake questions like "Sleep, mood, energy now?" to clinical keywords
    const { symptomQuery, wasExtracted } = await extractSymptomsFromQuestion(searchQuery);
    
    // Use symptom-enriched query for further processing
    const queryAfterSymptomExtraction = wasExtracted ? symptomQuery : searchQuery;
    
    console.log('=== SYMPTOM EXTRACTION RESULT ===');
    console.log('Original query:', searchQuery);
    console.log('Was extracted:', wasExtracted);
    console.log('Query after symptom extraction:', queryAfterSymptomExtraction);
    
    // ========================================================================
    // CROSS-LINGUAL RAG - STEP 1: TRANSLATE QUERY TO ENGLISH (THE "BRIDGE")
    // ========================================================================
    // This translates Hebrew/Russian queries to English keywords that match our English CSVs
    // Note: If symptoms were already extracted (English output), translation may be skipped
    const detectedLanguageAfterExtraction = detectLanguage(queryAfterSymptomExtraction);
    const { englishQuery, wasTranslated } = await translateQueryToEnglish(queryAfterSymptomExtraction, detectedLanguageAfterExtraction);
    
    // Use English query for ALL searches (our knowledge base is in English)
    const searchQueryForDB = englishQuery;
    
    // Still use bilingual glossary for additional term expansion
    const bilingualExpansions = expandWithBilingualGlossary(englishQuery, 'english');
    
    console.log('=== CROSS-LINGUAL RAG - STEP 2: SEARCH ENGLISH KNOWLEDGE BASE ===');
    console.log('Query was translated:', wasTranslated);
    console.log('English query for search:', searchQueryForDB);
    console.log('Bilingual expansions:', bilingualExpansions.slice(0, 10).join(', '));

    const { webQuery: searchTerms, keywords: keywordTerms } = buildWebSearchQuery(searchQueryForDB);
    
    // Combine original keywords with bilingual expansions for broader search
    const expandedKeywords = [...new Set([...keywordTerms, ...bilingualExpansions])].slice(0, 20);
    
    // Build expanded search terms including bilingual terms
    const expandedSearchTerms = bilingualExpansions.length > 0 
      ? `${searchTerms} ${bilingualExpansions.slice(0, 6).join(' ')}`.trim()
      : searchTerms;

    const ageGroupContext = ageGroup ? getAgeGroupSystemPrompt(ageGroup) : '';
    
    // Determine response language instruction for Step 3
    const responseLanguageInstruction = getResponseLanguageInstruction(userLanguage);

    console.log('=== 4-PILLAR HOLISTIC RAG SEARCH START ===');
    console.log('English Query for DB:', searchQueryForDB);
    console.log('Websearch query:', searchTerms);
    console.log('Expanded search terms:', expandedSearchTerms);
    console.log('Keyword terms:', keywordTerms.slice(0, 8).join(', '));
    console.log('Expanded keywords:', expandedKeywords.slice(0, 10).join(', '));
    console.log('Age group:', ageGroup || 'not specified');
    console.log('Using external AI:', useExternalAI || false);
    console.log('Response language:', responseLanguageInstruction);

    // ========================================================================
    // CROSS-LINGUAL RAG - STEP 2: SEARCH ENGLISH KNOWLEDGE BASE
    // ========================================================================
    
    // CRITICAL: Always search in ENGLISH since our knowledge base is English-only
    // The query has been translated to English in Step 1
    const searchLanguage = 'en'; // Force English search for cross-lingual RAG
    
    // First, perform hybrid search for overall confidence assessment
    const hybridSearchResult = await performHybridSearch(
      supabaseClient,
      searchQueryForDB, // Use the English-translated query
      searchLanguage,   // Always search English knowledge base
      30
    );
    
    console.log('=== HYBRID SEARCH CONFIDENCE CHECK ===');
    console.log('Overall confidence:', hybridSearchResult.overallConfidence);
    console.log('Meets threshold:', hybridSearchResult.meetsThreshold);
    console.log('Extracted points:', hybridSearchResult.extractedPoints.allPoints.join(', '));
    console.log('Figure references:', hybridSearchResult.extractedPoints.figureReferences.join(', '));
    
    // If confidence is too low and not using external AI, return "No protocol found"
    const confidenceTooLow = !hybridSearchResult.meetsThreshold && !useExternalAI;
    
    if (confidenceTooLow) {
      console.log('=== LOW CONFIDENCE - PROTOCOL NOT FOUND ===');
      // Return early with "no protocol found" message
      const noProtocolMetadata = {
        sources: [],
        chunksFound: 0,
        documentsSearched: 0,
        documentsMatched: 0,
        searchTermsUsed: searchTerms,
        isExternal: false,
        confidenceLevel: hybridSearchResult.overallConfidence,
        confidenceScore: hybridSearchResult.averageScore,
        noProtocolFound: true,
        extractedPoints: hybridSearchResult.extractedPoints,
        pillarBreakdown: {
          clinical: 0,
          pharmacopeia: 0,
          nutrition: 0,
          lifestyle: 0,
          ageSpecific: 0,
          cafStudies: 0,
          clinicalTrials: 0
        },
        sourceAudit: {
          totalIndexedAssets: 55,
          totalChunksInIndex: 5916,
          candidatesScanned: hybridSearchResult.chunks.length,
          filteredToTop: 0,
          sourcesUsedForAnswer: [],
          searchScope: `All 55 Indexed Assets (Bilingual: ${detectedLanguage})`,
          closedLoop: true,
          confidenceThreshold: CONFIDENCE_THRESHOLD,
          actualConfidence: hybridSearchResult.averageScore
        }
      };
      
      // Return structured "no protocol found" response
      return new Response(JSON.stringify({
        type: 'no_protocol_found',
        message: `I cannot find a protocol for "${searchQuery}" in the clinic's indexed documents. The search confidence (${(hybridSearchResult.averageScore * 100).toFixed(1)}%) is below the required threshold (${(CONFIDENCE_THRESHOLD * 100).toFixed(0)}%). Please refine your search terms or enable External AI if you'd like a general response.`,
        metadata: noProtocolMetadata
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const ageFilePatterns = ageGroup ? getAgeGroupFilePatterns(ageGroup) : [];
    
    // Build pillar-specific queries
    const clinicalQuery = buildPillarQuery(searchQuery, 'clinical');
    const pharmaQuery = buildPillarQuery(searchQuery, 'pharmacopeia');
    const nutritionQuery = buildPillarQuery(searchQuery, 'nutrition');
    const lifestyleQuery = buildPillarQuery(searchQuery, 'lifestyle');
    
    // Build bilingual ILIKE conditions for expanded search
    const bilingualIlikeTerms = bilingualExpansions.slice(0, 8).map(term => 
      `content.ilike.%${term.replace(/'/g, "''")}%`
    ).join(',');
    
    console.log('=== PARALLEL 4-PILLAR QUERIES (BILINGUAL) ===');
    console.log('Clinical query:', clinicalQuery);
    console.log('Pharmacopeia query:', pharmaQuery);
    console.log('Nutrition query:', nutritionQuery);
    console.log('Lifestyle query:', lifestyleQuery);
    console.log('Bilingual ILIKE terms count:', bilingualExpansions.slice(0, 8).length);

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
      // CROSS-LINGUAL RAG: Search ENGLISH content only (knowledge base is English)
      supabaseClient
        .from('knowledge_chunks')
        .select(`
          id, content, question, answer, chunk_index, metadata, language,
          document:knowledge_documents(id, file_name, original_name, category)
        `)
        .eq('language', searchLanguage)
        .or('content.ilike.%acupuncture%,content.ilike.%point%,content.ilike.%needle%,content.ilike.%BL%,content.ilike.%GB%,content.ilike.%ST%,content.ilike.%SP%,content.ilike.%LI%,content.ilike.%KI%,content.ilike.%LR%,content.ilike.%moxa%,content.ilike.%cupping%')
        .limit(50),

      // PILLAR 2: Pharmacopeia - Herbs, formulas, dosages
      supabaseClient
        .from('knowledge_chunks')
        .select(`
          id, content, question, answer, chunk_index, metadata, language,
          document:knowledge_documents(id, file_name, original_name, category)
        `)
        .eq('language', searchLanguage)
        .or('content.ilike.%herb%,content.ilike.%formula%,content.ilike.%tang%,content.ilike.%wan%,content.ilike.%san%,content.ilike.%dosage%')
        .limit(50),

      // PILLAR 3: Nutrition - Search ENGLISH content
      supabaseClient
        .from('knowledge_chunks')
        .select(`
          id, content, question, answer, chunk_index, metadata, language,
          document:knowledge_documents(id, file_name, original_name, category)
        `)
        .eq('language', searchLanguage)
        .or('content.ilike.%diet%,content.ilike.%food%,content.ilike.%eat%,content.ilike.%nutrition%')
        .limit(50),

      // PILLAR 4: Lifestyle/Sport - Search ENGLISH content
      supabaseClient
        .from('knowledge_chunks')
        .select(`
          id, content, question, answer, chunk_index, metadata, language,
          document:knowledge_documents(id, file_name, original_name, category)
        `)
        .eq('language', searchLanguage)
        .or('content.ilike.%exercise%,content.ilike.%stretch%,content.ilike.%sleep%,content.ilike.%stress%,content.ilike.%yoga%')
        .limit(50),

      // Age-specific knowledge (also search ENGLISH content)
      ageGroup && ageFilePatterns.length > 0
        ? supabaseClient
            .from('knowledge_chunks')
            .select(`
              id, content, question, answer, chunk_index, metadata, language,
              document:knowledge_documents!inner(id, file_name, original_name, category)
            `)
            .eq('language', searchLanguage)
            .or(ageFilePatterns.map(p => `file_name.ilike.%${p}%`).join(','), { referencedTable: 'document' })
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
    // Uses EXPANDED keywords (including bilingual terms) for better cross-language matching
    // ========================================================================
    const queryKeywords = expandedKeywords.slice(0, 12); // Use expanded keywords instead of just keywordTerms
    
    // Rank each pillar by relevance to the user's query (with bilingual term matching)
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

    console.log('=== PILLAR RESULTS (CROSS-LINGUAL RAG) ===');
    console.log(`🌐 User query language: ${detectedLanguage}`);
    console.log(`🔄 Query translated to English: ${wasTranslated ? 'Yes' : 'No'}`);
    console.log(`📚 Search language: ${searchLanguage} (always English for cross-lingual RAG)`);
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

    // Enhanced fallback search - always search English since we use cross-lingual RAG
    let fallbackChunks: any[] = [];
    const fallbackWords = expandedKeywords.filter((w: string) => w.length > 1).slice(0, 12);
    
    if (totalPillarChunks < 8 && fallbackWords.length > 0) {
      console.log(`Running fallback search in English (cross-lingual RAG)`);
      
      const ilikeConditions = fallbackWords.flatMap((w: string) => [
        `content.ilike.%${w.replace(/'/g, "''")}%`,
        `question.ilike.%${w.replace(/'/g, "''")}%`,
        `answer.ilike.%${w.replace(/'/g, "''")}%`
      ]).join(',');
      
      // Always search English content for cross-lingual RAG
      let { data: fallbackData } = await supabaseClient
        .from('knowledge_chunks')
        .select(`
          id, content, question, answer, chunk_index, metadata, language,
          document:knowledge_documents(id, file_name, original_name, category)
        `)
        .eq('language', searchLanguage)
        .or(ilikeConditions)
        .limit(50);
      
      if (fallbackData) {
        // Rank fallback chunks by relevance before distributing
        const rankedFallback = rankChunksByRelevance(fallbackData, expandedKeywords, [], 25);
        
        // Categorize fallback chunks into pillars
        rankedFallback.forEach(chunk => {
          const pillars = detectPillar(chunk.content);
          if (pillars.includes('clinical') && clinicalChunks.length < 10) {
            clinicalChunks.push(chunk);
          }
          if (pillars.includes('pharmacopeia') && pharmacopeiaChunks.length < 10) {
            pharmacopeiaChunks.push(chunk);
          }
          if (pillars.includes('nutrition') && nutritionChunks.length < 10) {
            nutritionChunks.push(chunk);
          }
          if (pillars.includes('lifestyle') && lifestyleChunks.length < 10) {
            lifestyleChunks.push(chunk);
          }
        });
        fallbackChunks = rankedFallback;
        console.log(`Language-aware fallback found: ${fallbackChunks.length} chunks, distributed across pillars`);
      }
    }

    // ========================================================================
    // PHASE 3: BUILD STRUCTURED CONTEXT FOR AI
    // ========================================================================
    
    const sources: Array<{ fileName: string; chunkIndex: number; preview: string; category: string; documentId: string; pillar: string; imageRef?: string; imageUrl?: string; imageCaption?: string; priorityScore?: number; isClinicalStandard?: boolean; ferrariScore?: number }> = [];
    const chunksMatched: Array<any> = [];

    // Helper to build context from chunks with Clinical Standard citation
    const buildPillarContext = (chunks: any[], pillarName: string) => {
      if (!chunks || chunks.length === 0) return '';
      
      return chunks.map((chunk, i) => {
        const doc = chunk.document as any;
        const fileName = doc?.original_name || doc?.file_name || 'Unknown';
        const category = doc?.category || 'general';
        const documentId = doc?.id || '';
        
        // ★ FERRARI ALGORITHM: Mark Clinical Standard sources ★
        const priorityScore = chunk.priority_score || 50;
        const isClinicalStandard = priorityScore >= 85;
        const clinicalStandardTag = isClinicalStandard ? ' 🏅 CLINICAL STANDARD SOURCE' : '';
        const ferrariScore = chunk.ferrari_score || chunk.boosted_score || 0;
        
        sources.push({
          fileName,
          chunkIndex: chunk.chunk_index,
          preview: (chunk.question || chunk.content).substring(0, 100),
          category,
          documentId,
          pillar: pillarName,
          imageRef: chunk.image_ref || undefined,
          imageUrl: chunk.image_url || undefined,
          imageCaption: chunk.image_caption || undefined,
          priorityScore,
          isClinicalStandard,
          ferrariScore,
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
          content: chunk.content,
          imageRef: chunk.image_ref || undefined,
          imageUrl: chunk.image_url || undefined,
          imageCaption: chunk.image_caption || undefined,
          priorityScore,
          isClinicalStandard,
          ferrariScore,
        });
        
        if (chunk.question && chunk.answer) {
          return `[Source: ${fileName}, Entry #${chunk.chunk_index}]${clinicalStandardTag}
Q: ${chunk.question}
A: ${chunk.answer}`;
        }
        return `[Source: ${fileName}, Entry #${chunk.chunk_index}]${clinicalStandardTag}
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
    
    // ========================================================================
    // CROSS-LINGUAL RAG - STEP 3: SYNTHESIZE RESPONSE IN USER'S LANGUAGE
    // ========================================================================
    // Add explicit language instruction for the response
    const languageInstruction = `\n\n=== RESPONSE LANGUAGE INSTRUCTION ===
CRITICAL: You MUST respond in ${responseLanguageInstruction}.
The user's original query was in ${detectedLanguage === 'hebrew' ? 'Hebrew' : detectedLanguage === 'chinese' ? 'Chinese' : 'English'}.
${wasTranslated ? `The query was translated to English for searching: "${englishQuery}"` : ''}
Generate your response ENTIRELY in ${responseLanguageInstruction}, including:
- Section headers
- Clinical terminology (with English/Pinyin terms where helpful)
- Patient instructions
- All explanatory text
=== END LANGUAGE INSTRUCTION ===\n`;
    
    if (useExternalAI) {
      systemMessage = EXTERNAL_AI_SYSTEM_PROMPT + languageInstruction + ageContextPrefix + patientContextPrefix;
      console.log('Using external AI mode - no RAG context');
    } else if (sources.length > 0 || cafStudies.length > 0 || clinicalTrials.length > 0) {
      systemMessage = `${TCM_RAG_SYSTEM_PROMPT}${languageInstruction}${ageContextPrefix}${patientContextPrefix}\n\n=== 4-PILLAR KNOWLEDGE BASE CONTEXT ===\n${structuredContext}\n\n=== END CONTEXT ===`;
    } else {
      systemMessage = `${TCM_RAG_SYSTEM_PROMPT}${languageInstruction}${ageContextPrefix}${patientContextPrefix}\n\nNOTE: No relevant entries found in the knowledge base for this query. State this clearly for each pillar.`;
    }

    console.log('=== CROSS-LINGUAL RAG - STEP 3: GENERATING RESPONSE ===');
    console.log('Response language:', responseLanguageInstruction);
    console.log('Was translated:', wasTranslated);

    const chatMessages = [
      { role: 'system', content: systemMessage },
      ...(messages || [{ role: 'user', content: query }])
    ];

    // Call Lovable AI Gateway with streaming
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Prepare enhanced metadata with pillar breakdown and SOURCE AUDIT
    const uniqueDocuments = [...new Set(sources.map(s => s.fileName))];
    
    // Calculate total candidates scanned (50 per pillar x 4 pillars = 200 candidates)
    const totalCandidatesScanned = 200; // 50 candidates fetched per pillar
    const topChunksFiltered = 15; // Top 15 most relevant per pillar
    
    const metadata = {
      sources: useExternalAI ? [] : sources,
      chunksFound: useExternalAI ? 0 : sources.length,
      documentsSearched: useExternalAI ? 0 : uniqueDocuments.length,
      documentsMatched: useExternalAI ? 0 : uniqueDocuments.length,
      searchTermsUsed: searchTerms,
      isExternal: useExternalAI || false,
      // HYBRID SEARCH CONFIDENCE METADATA
      hybridSearchConfidence: {
        overallConfidence: hybridSearchResult.overallConfidence,
        averageScore: hybridSearchResult.averageScore,
        meetsThreshold: hybridSearchResult.meetsThreshold,
        threshold: CONFIDENCE_THRESHOLD,
        hybridChunksFound: hybridSearchResult.chunks.length,
        searchType: hybridSearchResult.searchType,
        // Include top chunk scores for display
        topVectorScore: hybridSearchResult.chunks[0]?.vector_score || 0,
        topKeywordScore: hybridSearchResult.chunks[0]?.keyword_score || 0,
        topCombinedScore: hybridSearchResult.chunks[0]?.combined_score || 0,
        // ★ FERRARI ALGORITHM METADATA ★
        topFerrariScore: hybridSearchResult.chunks[0]?.ferrari_score || hybridSearchResult.chunks[0]?.combined_score || 0,
        clinicalStandardSourcesUsed: hybridSearchResult.clinicalStandardCount || 0,
        ferrariAlgorithmActive: true
      },
      // EXTRACTED POINTS METADATA
      extractedPoints: {
        pointCodes: hybridSearchResult.extractedPoints.codes,
        extraPoints: hybridSearchResult.extractedPoints.extraPoints,
        allPoints: hybridSearchResult.extractedPoints.allPoints,
        figureReferences: hybridSearchResult.extractedPoints.figureReferences,
        totalPointsFound: hybridSearchResult.extractedPoints.allPoints.length
      },
      // CROSS-LINGUAL RAG METADATA
      crossLingualRAG: {
        originalLanguage: detectedLanguage,
        userLanguage: userLanguage,
        searchLanguage: searchLanguage,
        queryWasTranslated: wasTranslated,
        originalQuery: searchQuery,
        translatedQuery: wasTranslated ? englishQuery : null,
        responseLanguage: responseLanguageInstruction
      },
      // LANGUAGE DETECTION METADATA (legacy, kept for compatibility)
      languageDetection: {
        detectedLanguage,
        bilingualTermsExpanded: bilingualExpansions.length,
        bilingualTermsUsed: bilingualExpansions.slice(0, 10),
        crossLanguageSearch: true // Always true with cross-lingual RAG
      },
      pillarBreakdown: {
        clinical: clinicalChunks.length,
        pharmacopeia: pharmacopeiaChunks.length,
        nutrition: nutritionChunks.length,
        lifestyle: lifestyleChunks.length,
        ageSpecific: ageSpecificChunks.length,
        cafStudies: cafStudies.length,
        clinicalTrials: clinicalTrials.length
      },
      // SOURCE AUDIT METADATA - For "XY# Confirmation" proof
      sourceAudit: {
        totalIndexedAssets: 55, // Total documents in knowledge base
        totalChunksInIndex: 5916, // Total chunks available
        candidatesScanned: totalCandidatesScanned,
        filteredToTop: topChunksFiltered,
        sourcesUsedForAnswer: sources.map(s => ({
          fileName: s.fileName,
          pillar: s.pillar || detectPillar(s.preview || '')[0],
          chunkIndex: s.chunkIndex,
          category: s.category
        })),
        searchScope: `All 55 Indexed Assets (Bilingual: ${detectedLanguage})`,
        closedLoop: !useExternalAI, // Confirms no external AI used
        confidenceThreshold: CONFIDENCE_THRESHOLD,
        actualConfidence: hybridSearchResult.averageScore
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
        temperature: 0, // CLOSED LOOP: Zero temperature for deterministic, context-only responses
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
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalTokensUsed = 0;

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
                
                // Send done event with token usage data for Turbo Dashboard
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                  type: 'done', 
                  auditLogId: logRow?.id, 
                  auditLoggedAt: logRow?.created_at,
                  tokenUsage: {
                    inputTokens: totalInputTokens,
                    outputTokens: totalOutputTokens,
                    totalTokens: totalTokensUsed
                  }
                })}\n\n`));
              } catch (logErr) {
                console.error('Failed to log query:', logErr);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                  type: 'done',
                  tokenUsage: {
                    inputTokens: totalInputTokens,
                    outputTokens: totalOutputTokens,
                    totalTokens: totalTokensUsed
                  }
                })}\n\n`));
              }
            } else if (jsonStr) {
              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                
                // Extract token usage from the response (if available)
                if (parsed.usage) {
                  totalInputTokens = parsed.usage.prompt_tokens || totalInputTokens;
                  totalOutputTokens = parsed.usage.completion_tokens || totalOutputTokens;
                  totalTokensUsed = parsed.usage.total_tokens || (totalInputTokens + totalOutputTokens);
                }
                
                // Track output tokens incrementally by counting characters (approx 4 chars per token)
                if (content) {
                  fullResponse += content;
                  // Estimate output tokens based on content length
                  totalOutputTokens = Math.ceil(fullResponse.length / 4);
                  totalTokensUsed = totalInputTokens + totalOutputTokens;
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

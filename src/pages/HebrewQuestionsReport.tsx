import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Search, 
  ChevronDown, 
  ChevronRight,
  Eye,
  Activity,
  Heart,
  AlertTriangle,
  Brain,
  Thermometer,
  Battery,
  Sun,
  Shield,
  Utensils,
  Stethoscope,
  MapPin,
  ArrowLeft,
  Filter,
  Compass
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// All questionnaire data consolidated
const questionnairesData = [
  {
    id: 'pulse_tongue_diagnosis',
    name: 'אבחון דופק ולשון',
    nameEn: 'Pulse & Tongue Diagnosis',
    icon: Eye,
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/20',
    route: '/pulse-tongue-diagnosis',
    questions: [
      { id: 'pale_swollen_tongue', textHe: 'מה המשמעות הקלינית של לשון חיוורת ונפוחה עם סימני שיניים?', textEn: 'What is the clinical significance of a pale, swollen tongue with teeth marks?' },
      { id: 'yellow_thick_coating', textHe: 'על מה מעיד חיפוי לשון צהוב ועבה במחמם האמצעי?', textEn: 'What does a thick yellow tongue coating in the Middle Jiao indicate?' },
      { id: 'wiry_pulse', textHe: 'כיצד מתואר דופק "מיתרי" (Wiry) ומה הוא מסמל?', textEn: 'How is a "Wiry" pulse described and what does it signify?' },
      { id: 'purple_vs_crimson', textHe: 'מה ההבדל באבחנה בין לשון סגולה (Purple) לבין לשון אדומה כהה (Crimson)?', textEn: 'What is the diagnostic difference between a Purple tongue and a Crimson tongue?' },
      { id: 'central_crack', textHe: 'מהי המשמעות של חריץ מרכזי המגיע עד קצה הלשון?', textEn: 'What is the significance of a central crack extending to the tip of the tongue?' },
      { id: 'slippery_pulse_phlegm', textHe: 'כיצד נזהה דופק "מתגלגל" (Slippery) ומה הקשר שלו לליחה?', textEn: 'How do we identify a "Slippery" pulse and what is its connection to phlegm?' },
      { id: 'red_tip_points', textHe: 'מה מעיד קצה לשון אדום מאוד עם נקודות אדומות (Red Points)?', textEn: 'What does a very red tongue tip with red points indicate?' },
      { id: 'floating_vs_deep', textHe: 'מהי האינדיקציה של דופק "צף" (Floating) לעומת דופק "שוקע" (Deep)?', textEn: 'What is the indication of a "Floating" pulse versus a "Deep" pulse?' },
      { id: 'peeled_coating', textHe: 'מה מסמל חיפוי לשון "מקורף" (Peeled) או גאוגרפי?', textEn: 'What does a "Peeled" or geographic tongue coating signify?' },
      { id: 'yin_def_tongue', textHe: 'כיצד מתבטא חוסר יין (Yin Def) במראה הלשון?', textEn: 'How does Yin Deficiency manifest in the tongue appearance?' },
      { id: 'thin_vs_weak_pulse', textHe: 'מה ההבדל בין דופק "דק" (Thin/Fine) לדופק "חלש" (Weak)?', textEn: 'What is the difference between a "Thin/Fine" pulse and a "Weak" pulse?' },
      { id: 'sublingual_veins', textHe: 'האם ורידים תת-לשוניים (Sublingual) כהים מוזכרים, ומה משמעותם?', textEn: 'Are dark sublingual veins mentioned, and what is their significance?' },
      { id: 'quivering_tongue', textHe: 'מה המשמעות של לשון רועדת (Quivering) אצל מטופל מבוגר?', textEn: 'What is the significance of a quivering tongue in an elderly patient?' },
      { id: 'damp_heat_coating', textHe: 'כיצד נראה חיפוי של "לחות-חמה" (Damp-Heat) על הלשון?', textEn: 'How does a "Damp-Heat" coating appear on the tongue?' },
      { id: 'rapid_vs_racing', textHe: 'מה ההבדל בין דופק מהיר (Rapid) לדופק דהור (Racing/Hurried)?', textEn: 'What is the difference between a Rapid pulse and a Racing/Hurried pulse?' },
      { id: 'short_contracted', textHe: 'מה המשמעות של לשון קצרה ומכווצת?', textEn: 'What is the significance of a short and contracted tongue?' },
      { id: 'pregnancy_pulse', textHe: 'איזה דופק צפוי להימצא אצל אישה בהריון לפי הקובץ?', textEn: 'What pulse is expected to be found in a pregnant woman according to the source?' },
      { id: 'orange_sides', textHe: 'מה מעיד צבע לשון "כתום" או צהבהב בצדדים?', textEn: 'What does an "orange" or yellowish tongue color on the sides indicate?' },
      { id: 'antibiotic_coating', textHe: 'כיצד משפיעה אנטיביוטיקה על חיפוי הלשון לפי הנחיות האבחון?', textEn: 'How do antibiotics affect the tongue coating according to diagnostic guidelines?' },
      { id: 'shock_pulse', textHe: 'מהו הדופק האופייני למצב של "הלם" או איבוד דם רב?', textEn: 'What is the characteristic pulse for a state of "shock" or severe blood loss?' },
    ]
  },
  {
    id: 'longevity_dignity',
    name: 'אריכות ימים ואיכות חיים',
    nameEn: 'Longevity & Dignity',
    icon: Heart,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
    route: '/longevity-dignity-questionnaire',
    questions: [
      { id: 'chief_complaint', textHe: 'במשפט אחד, מהו הקושי הבריאותי העיקרי שמפריע לאיכות החיים שלך כיום?', textEn: 'In one sentence, what is the main health difficulty affecting your quality of life today?', category: 'Chief Complaint' },
      { id: 'digestion_lower', textHe: 'האם היציאות שלך סדירות, או שאת/ה סובל/ת מעצירות כרונית (צורך במישלשלים) או משלשולים תכופים?', textEn: 'Are your bowel movements regular, or do you suffer from chronic constipation (need for laxatives) or frequent diarrhea?', category: 'Digestion (Lower)' },
      { id: 'digestion_upper', textHe: 'האם את/ה סובל/ת מצרבות, תחושת "שריפה" בחזה, או חוסר נוחות בבטן העליונה לאחר האוכל?', textEn: 'Do you suffer from heartburn, burning sensation in chest, or upper abdominal discomfort after eating?', category: 'Digestion (Upper)' },
      { id: 'nutrition', textHe: 'האם יש לך תיאבון בריא ואת/ה מצליח/ה לשמור על משקל יציב, או שיש ירידה במשקל ובחשק לאכול?', textEn: 'Do you have a healthy appetite and maintain stable weight, or is there weight loss and decreased desire to eat?', category: 'Nutrition' },
      { id: 'breath', textHe: 'האם את/ה חווה קוצר נשימה או התעייפות מהירה גם במאמץ קל (כמו הליכה קצרה או עלייה במדרגות)?', textEn: 'Do you experience shortness of breath or quick fatigue even with mild exertion (like short walks or climbing stairs)?', category: 'Breath' },
      { id: 'sleep', textHe: 'האם שנת הלילה שלך שקטה, או שאת/ה מתעורר/ת לעיתים קרובות (מכאב, צורך בשירותים, או דום נשימה)?', textEn: 'Is your night sleep peaceful, or do you wake up frequently (from pain, bathroom needs, or sleep apnea)?', category: 'Sleep' },
      { id: 'balance', textHe: 'האם את/ה מרגיש/ה לעיתים סחרחורת (ורטיגו), חוסר יציבות בהליכה, או חשש מנפילה?', textEn: 'Do you sometimes feel dizziness (vertigo), unsteady walking, or fear of falling?', category: 'Balance' },
      { id: 'pain', textHe: 'האם כאבים במפרקים (ברכיים, ירכיים) או בגב מגבילים את התנועה שלך בבית או בחוץ?', textEn: 'Do joint pains (knees, hips) or back pain limit your movement at home or outside?', category: 'Pain' },
      { id: 'circulation', textHe: 'האם את/ה סובל/ת מקור קיצוני בכפות הידיים והרגליים (תופעת ריינו), או דווקא מגלי חום והזעה?', textEn: 'Do you suffer from extreme cold in hands and feet (Raynaud\'s), or rather from hot flashes and sweating?', category: 'Circulation' },
      { id: 'memory', textHe: 'האם את/ה או הקרובים אליך מבחינים בשינויים בזיכרון, בלבול, או קושי בריכוז לאחרונה?', textEn: 'Do you or those close to you notice changes in memory, confusion, or difficulty concentrating recently?', category: 'Memory' },
      { id: 'mood', textHe: 'האם מצב הרוח שלך יציב, או שאת/ה חווה תקופות של עצבות עמוקה, חרדה או תחושת בדידות?', textEn: 'Is your mood stable, or do you experience periods of deep sadness, anxiety, or loneliness?', category: 'Mood' },
      { id: 'urinary', textHe: 'האם את/ה נתקל/ת בקושי לשלוט בשתן (דליפה), או בקושי להתחיל במתן שתן (פרוסטטה)?', textEn: 'Do you have difficulty controlling urine (leakage), or difficulty starting urination (prostate)?', category: 'Urinary' },
      { id: 'senses', textHe: 'האם חלה ירידה משמעותית בראייה או בשמיעה (טינטון) שמפריעה לך בתקשורת עם הסביבה?', textEn: 'Has there been significant decline in vision or hearing (tinnitus) that interferes with communication?', category: 'Senses' },
      { id: 'medication', textHe: 'האם את/ה נעזר/ת במטפל/ת סיעודי/ת, והאם ריבוי התרופות גורם לך לתופעות לוואי במערכת העיכול?', textEn: 'Do you have caregiver assistance, and does polypharmacy cause digestive side effects?', category: 'Medication' },
      { id: 'the_goal', textHe: 'מהו הדבר החשוב לך ביותר לשמר בשנים הקרובות? (למשל: צלילות הדעת, הליכה עצמאית, או רוגע נפשי)', textEn: 'What is most important for you to preserve in the coming years? (e.g., mental clarity, independent walking, or peace of mind)', category: 'The Goal' }
    ]
  },
  {
    id: 'balance_strength_adult',
    name: 'איזון וחיזוק (מבוגרים)',
    nameEn: 'Balance & Strength (Adults 18-50)',
    icon: Activity,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    route: '/balance-strength-adult-questionnaire',
    questions: [
      { id: 'chief_complaint', textHe: 'במשפט אחד, מהו האתגר הבריאותי המרכזי שמונע ממך להרגיש במיטבך כיום?', textEn: 'In one sentence, what is the main health challenge preventing you from feeling your best today?', category: 'Chief Complaint' },
      { id: 'stress_liver', textHe: 'כיצד את/ה חווה מתח (סטרס) בחיי היומיום? (למשל: התפרצויות כעס, תחושת \'תקיעות\' בגרון/חזה, או חרדה ודאגה)', textEn: 'How do you experience stress in daily life? (e.g., anger outbursts, feeling of tightness in throat/chest, or anxiety and worry)', category: 'Stress (The Liver)' },
      { id: 'womens_health', textHe: '(לנשים) האם המחזור החודשי שלך סדיר? האם את סובלת מכאבים חזקים, תסמונת קדם-וסתית (PMS) או שינויים קיצוניים במצב הרוח?', textEn: '(For women) Is your menstrual cycle regular? Do you suffer from severe pain, PMS, or extreme mood changes?', category: "Women's Health (Cycle)" },
      { id: 'digestion', textHe: 'האם את/ה סובל/ת מנפיחות בבטן, צרבות, "מעי רגיז" (IBS) או עייפות בולטת לאחר ארוחות?', textEn: 'Do you suffer from bloating, heartburn, IBS, or noticeable fatigue after meals?', category: 'Digestion (The Gut)' },
      { id: 'sleep_quality', textHe: 'האם קשה לך להירדם בגלל "ראש רץ" (מחשבות), או שאת/ה מתעורר/ת עייף/ה גם אחרי שנת לילה?', textEn: 'Is it hard to fall asleep due to racing thoughts, or do you wake up tired even after a full night\'s sleep?', category: 'Sleep Quality' },
      { id: 'energy_levels', textHe: 'בסולם של 1-10, כמה אנרגיה יש לך באמצע היום? האם את/ה זקוק/ה לקפה או מתוק כדי להמשיך לתפקד?', textEn: 'On a scale of 1-10, how much energy do you have midday? Do you need coffee or sweets to keep functioning?', category: 'Energy Levels' },
      { id: 'headaches_tension', textHe: 'האם את/ה סובל/ת מכאבי ראש, מיגרנות, או מתח כרוני באזור הכתפיים והצוואר (במיוחד מול מחשב)?', textEn: 'Do you suffer from headaches, migraines, or chronic tension in shoulders and neck (especially at the computer)?', category: 'Headaches & Tension' },
      { id: 'pain_injury', textHe: 'האם יש לך פציעות ספורט ישנות שחוזרות להציק, או כאבי גב תחתון המוחמרים בישיבה/עמידה ממושכת?', textEn: 'Do you have old sports injuries that keep recurring, or lower back pain worsened by prolonged sitting/standing?', category: 'Pain & Injury' },
      { id: 'temperature', textHe: 'האם הידיים והרגליים שלך נוטות להיות קרות תמיד, או שאת/ה סובל/ת מחום והזעת יתר?', textEn: 'Are your hands and feet always cold, or do you suffer from heat and excessive sweating?', category: 'Temperature' },
      { id: 'immunity', textHe: 'האם את/ה נוטה לחלות לעיתים קרובות (צינון/שפעת), או סובל/ת מאלרגיות עונתיות וסינוסיטיס?', textEn: 'Do you tend to get sick often (cold/flu), or suffer from seasonal allergies and sinusitis?', category: 'Immunity (Wei Qi)' },
      { id: 'skin_health', textHe: 'האם העור שלך נוטה לאקנה, אדמומיות, פריחות או יובש קיצוני המחמיר במצבי לחץ?', textEn: 'Does your skin tend toward acne, redness, rashes, or extreme dryness that worsens under stress?', category: 'Skin Health' },
      { id: 'focus_mind', textHe: 'האם את/ה חווה קושי להתרכז, "ערפל מחשבתי" או מוסחות דעת גבוהה במהלך העבודה/לימודים?', textEn: 'Do you experience difficulty concentrating, brain fog, or high distractibility during work/studies?', category: 'Focus & Mind' },
      { id: 'lifestyle', textHe: 'האם אורח החיים שלך כולל ישיבה ממושכת ומיעוט תנועה, או פעילות גופנית אינטנסיבית (אולי אינטנסיבית מדי)?', textEn: 'Does your lifestyle include prolonged sitting and little movement, or intense (perhaps too intense) physical activity?', category: 'Lifestyle' },
      { id: 'cravings', textHe: 'האם יש לך חשקים עזים וספציפיים (למשל: למתוק, למלוח, או למזון שומני) כשאת/ה עייף/ה או לחוץ/ה?', textEn: 'Do you have intense specific cravings (e.g., sweet, salty, or fatty foods) when tired or stressed?', category: 'Cravings' },
      { id: 'the_goal', textHe: 'אם הטיפול יצליח מעבר למצופה, איך ייראו החיים שלך בעוד 3 חודשים מהיום? (מה תוכל/י לעשות שלא ניתן כיום)', textEn: 'If treatment succeeds beyond expectations, how will your life look 3 months from now? (What could you do that you can\'t today)', category: 'The Goal' }
    ]
  },
  {
    id: 'pain_rehabilitation',
    name: 'שיקום וטיפול בכאב',
    nameEn: 'Pain Rehabilitation',
    icon: AlertTriangle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    route: '/pain-rehabilitation-questionnaire',
    questions: [
      { id: 'injury_details', textHe: 'במשפט אחד, מהי הפציעה או הטראומה העיקרית שמביאה אותך לטיפול היום? (למשל: תאונה, נפילה, פציעת ספורט, או כאב כרוני)', textEn: 'In one sentence, what is the main injury or trauma that brings you to treatment today? (e.g., accident, fall, sports injury, or chronic pain)' },
      { id: 'pain_quality', textHe: 'כיצד היית מתאר/ת את הכאב? האם הוא חד ודוקר (כמו סכין), עמום ולוחץ, או שורף?', textEn: 'How would you describe the pain? Is it sharp and stabbing (like a knife), dull and pressing, or burning?' },
      { id: 'night_pain', textHe: 'האם הכאב מחמיר באופן משמעותי בלילה, או אפילו מעיר אותך משינה?', textEn: 'Does the pain significantly worsen at night, or even wake you from sleep?' },
      { id: 'weather', textHe: 'האם את/ה מרגיש/ה החמרה בכאב או בנוקשות כשמזג האוויר משתנה (קור, גשם, או רוח)?', textEn: 'Do you feel worsening pain or stiffness when the weather changes (cold, rain, or wind)?' },
      { id: 'swelling', textHe: 'האם יש נפיחות נראית לעין, בצקת או תחושת "מלאות" באזור הפגוע?', textEn: 'Is there visible swelling, edema, or a feeling of "fullness" in the affected area?' },
      { id: 'movement', textHe: 'האם הכאב מחמיר בתחילת תנועה ומשתפר לאחר "חימום", או שהוא מחמיר ככל שאת/ה פעיל/ה יותר?', textEn: 'Does the pain worsen at the start of movement and improve after "warming up", or does it worsen the more active you are?' },
      { id: 'stiffness', textHe: 'האם את/ה סובל/ת מנוקשות שמגבילה את טווח התנועה (למשל: קושי להרים יד, להתכופף)?', textEn: 'Do you suffer from stiffness that limits your range of motion (e.g., difficulty raising arm, bending)?' },
      { id: 'temperature', textHe: 'האם המקום הפגוע מרגיש חם למגע ואדום, או קר ונוטה להכחיל?', textEn: 'Does the affected area feel hot to the touch and red, or cold and tends to turn blue?' },
      { id: 'nerve_pain', textHe: 'האם יש תחושת נימול, הירדמות, או זרמים חשמליים המקרינים מהאזור הפגוע לגפיים?', textEn: 'Is there numbness, tingling, or electrical currents radiating from the affected area to the limbs?' },
      { id: 'bruising', textHe: 'האם נוצרים אצלך שטפי דם (סימנים כחולים) בקלות? האם הם נשארים זמן רב?', textEn: 'Do you bruise easily? Do bruises stay for a long time?' },
      { id: 'trauma_memory', textHe: 'האם האירוע שגרם לפציעה עדיין מעורר בך פחד, חרדה או זיכרונות לא נעימים?', textEn: 'Does the event that caused the injury still evoke fear, anxiety, or unpleasant memories?' },
      { id: 'healing_speed', textHe: 'האם באופן כללי פצעים וחתכים מחלימים אצלך לאט, או שאת/ה מחלים/ה במהירות?', textEn: 'In general, do wounds and cuts heal slowly for you, or do you heal quickly?' },
      { id: 'fatigue', textHe: 'מאז הפציעה, האם את/ה מרגיש/ה עייפות כללית גדולה מהרגיל?', textEn: 'Since the injury, do you feel more general fatigue than usual?' },
      { id: 'scars', textHe: 'האם יש צלקות ישנות באזור הכואב שמורגשות כנוקשות או רגישות למגע?', textEn: 'Are there old scars in the painful area that feel stiff or sensitive to touch?' },
      { id: 'goal', textHe: 'מהי הפעולה הספציפית שאת/ה הכי רוצה לחזור לעשות ללא כאב? (למשל: לרוץ, להרים נכדים, לישון בנוחות)', textEn: 'What specific activity do you most want to return to doing without pain? (e.g., run, lift grandchildren, sleep comfortably)' }
    ]
  },
  {
    id: 'mental_clarity',
    name: 'בהירות וחוסן מנטלי',
    nameEn: 'Mental Clarity & Resilience',
    icon: Brain,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
    route: '/mental-clarity-questionnaire',
    questions: [
      { id: 'focus', textHe: 'האם קשה לך להתרכז במשימה אחת לאורך זמן, או שדעתך מוסחת בקלות (תחושת "ערפל")?', textEn: 'Is it difficult for you to concentrate on one task for a long time, or is your mind easily distracted (feeling of "fog")?', category: 'Focus' },
      { id: 'memory', textHe: 'האם את/ה שם/ה לב לירידה בזיכרון לטווח קצר ("שכחתי למה נכנסתי לחדר"), או קושי לשלוף מילים?', textEn: 'Do you notice a decline in memory (forgetting names, words, or where you put things)?', category: 'Memory' },
      { id: 'decisions', textHe: 'האם את/ה מתקשה לקבל החלטות, ולעיתים קרובות מרגיש/ה "שיתוק" מול אפשרויות?', textEn: 'Do you have difficulty making decisions, and often feel "paralyzed" when facing options?', category: 'Decisions' },
      { id: 'overthinking', textHe: 'האם המחשבות שלך נוטות "לרוץ במעגלים" סביב אותו נושא (דאגה), במיוחד לפני השינה?', textEn: 'Do your thoughts tend to "run in circles" around the same topic (worry), especially before sleep?', category: 'Overthinking' },
      { id: 'burnout', textHe: 'האם את/ה חווה תשישות מנטלית, כאילו המוח "מלא" ולא מסוגל לקלוט מידע חדש?', textEn: 'Do you experience mental exhaustion, as if the brain is "full" and unable to absorb new information?', category: 'Burnout' },
      { id: 'pressure', textHe: 'כיצד את/ה מגיב/ה לדד-ליין או ללחץ? האם את/ה נכנס/ת לחרדה וקיפאון, או פועל/ת?', textEn: 'How do you respond to deadlines or pressure? Do you get anxious and freeze, or take action?', category: 'Pressure' },
      { id: 'motivation', textHe: 'האם יש לך רעיונות ורצונות, אך חסר לך ה"דרייב" (הכוח המניע) כדי להתחיל ולבצע?', textEn: 'Do you have ideas and desires, but lack the "drive" (motivating force) to start and execute?', category: 'Motivation' },
      { id: 'creativity', textHe: 'האם את/ה מרגיש/ה חסום/ה יצירתית, ללא השראה או "זרימה"?', textEn: 'Do you feel creatively blocked, without inspiration or "flow"?', category: 'Creativity' },
      { id: 'sensitivity', textHe: 'האם את/ה רגיש/ה מאוד לרעשים חזקים, המונים, או למצבי רוח של אנשים אחרים?', textEn: 'Are you very sensitive to loud noises, crowds, or the moods of other people?', category: 'Sensitivity' },
      { id: 'irritability', textHe: 'האם את/ה מאבד/ת סבלנות מהר או מתרגז/ת בקלות כשדברים לא מסתדרים?', textEn: 'Do you lose patience quickly or get easily irritated when things do not work out?', category: 'Irritability' },
      { id: 'confidence', textHe: 'האם את/ה חווה ספק עצמי לעיתים קרובות, או תחושה שאת/ה "לא מספיק טוב/ה"?', textEn: 'Do you often experience self-doubt, or a feeling that you are "not good enough"?', category: 'Confidence' },
      { id: 'clarity', textHe: 'האם בבוקר המוח שלך צלול, או שאת/ה מתעורר/ת עם תחושת כבדות וערפל?', textEn: 'Is your mind clear in the morning, or do you wake up with a feeling of heaviness and fog?', category: 'Clarity' },
      { id: 'adaptability', textHe: 'האם קשה לך להתמודד עם שינויים בלתי צפויים בתוכניות?', textEn: 'Is it difficult for you to cope with unexpected changes in plans?', category: 'Adaptability' },
      { id: 'social_battery', textHe: 'האם אינטראקציה חברתית ממושכת מרוקנת אותך מאנרגיה מנטלית?', textEn: 'Does prolonged social interaction drain you of mental energy?', category: 'Social Battery' },
      { id: 'goal', textHe: 'מהו הכוח המנטלי שהכי היית רוצה לחזק? (מיקוד, רוגע, זיכרון, או ביטחון עצמי)', textEn: 'What mental strength would you most like to strengthen? (focus, calmness, memory, or self-confidence)', category: 'Goal' }
    ]
  },
  {
    id: 'internal_climate',
    name: 'בקרת אקלים פנימית',
    nameEn: 'Internal Climate Control',
    icon: Thermometer,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    route: '/internal-climate-questionnaire',
    questions: [
      { id: '1', textHe: 'החזאי האישי: האם את/ה מרגיש/ה שינויים פיזיים בגוף (כאבי ראש, מפרקים, עייפות) עוד לפני שמזג האוויר משתנה בחוץ?', textEn: 'Do you feel physical changes in your body before the weather changes outside?', category: 'הרדאר הפנימי' },
      { id: '2', textHe: 'טמפרטורת ליבה: האם את/ה סובל/ת יותר בחום הקיץ (חוסר שקט, הזעה, אדמומיות) או בקור החורף (קיפאון, כיווץ שרירים)?', textEn: 'Do you suffer more in summer heat or winter cold?', category: 'הרדאר הפנימי' },
      { id: '3', textHe: 'לחות וכבדות: בימים לחים ודביקים, האם את/ה מרגיש/ה תחושת "משקולת" על הגוף, נפיחות או ערפל מחשבתי?', textEn: 'On humid days, do you feel heaviness, bloating, or brain fog?', category: 'הרדאר הפנימי' },
      { id: '4', textHe: 'רוח ושינוי: האם חשיפה לרוח חזקה או למזגן ישיר גורמת לך לכאבי ראש, צוואר תפוס או צינון מיידי?', textEn: 'Does exposure to strong wind or direct AC cause headaches or stiff neck?', category: 'הרדאר הפנימי' },
      { id: '5', textHe: 'יובש: האם את/ה נוטה לסבול מיובש קיצוני (עור סדוק, צמא תמידי, שיעול יבש) בסביבות ממוזגות או בעונות מעבר?', textEn: 'Do you suffer from extreme dryness in air-conditioned environments?', category: 'הרדאר הפנימי' },
      { id: '6', textHe: 'כאבי ראש: האם כאבי הראש שלך מופיעים בעיקר כשחם מאוד (פעימות ברקות) או כשיש לחץ ברומטרי נמוך/סופות?', textEn: 'Do your headaches appear mainly in hot weather or during storms?', category: 'תגובות הגוף' },
      { id: '7', textHe: 'נשימה ואלרגיה: האם את/ה חווה קשיי נשימה או החמרה באלרגיות בעונות מעבר (אביב/סתיו) או כשמזג האוויר מאובק?', textEn: 'Do you experience breathing difficulties during seasonal transitions?', category: 'תגובות הגוף' },
      { id: '8', textHe: 'מפרקים: האם המפרקים שלך "נוקשים" וכואבים יותר בימים גשומים וקרים (קור-לחות)?', textEn: 'Are your joints stiffer and more painful on cold, rainy days?', category: 'תגובות הגוף' },
      { id: '9', textHe: 'עיכול עונתי: האם את/ה סובל/ת משלשולים או חוסר נוחות בבטן בקיץ (בגלל לחות-חום) או מכאבי בטן בחורף?', textEn: 'Do you suffer from digestive issues that change with seasons?', category: 'תגובות הגוף' },
      { id: '10', textHe: 'עור: האם העור שלך מגיב בפריחות מגרדות בחום (Heat Rash) או באקזמה וסדקים בקור?', textEn: 'Does your skin react with rashes in heat or eczema in cold?', category: 'תגובות הגוף' },
      { id: '11', textHe: 'שעון ביולוגי: האם את/ה מתקשה להתעורר או לתפקד בימים אפורים וחסרי שמש (SAD - דיכאון חורף)?', textEn: 'Do you have difficulty functioning on gray, sunless days?', category: 'אנרגיה ומחזוריות' },
      { id: '12', textHe: 'נוזלים: האם את/ה מרגיש/ה מיובש/ת באופן כרוני למרות שתייה מרובה, או שאת/ה צובר/ת נוזלים (בצקות) בקלות?', textEn: 'Do you feel chronically dehydrated or easily retain fluids?', category: 'אנרגיה ומחזוריות' },
      { id: '13', textHe: 'שינה: האם השינה שלך מופרעת יותר בלילות חמים (חום פנימי) או שאת/ה מתעורר/ת מקור?', textEn: 'Is your sleep more disturbed on hot nights or do you wake from cold?', category: 'אנרגיה ומחזוריות' },
      { id: '14', textHe: 'הסתגלות: כשאת/ה טס/ה או משנה סביבה גיאוגרפית, האם לוקח לגוף שלך זמן רב "להתאפס" (ג\'ט-לג קשה, עצירות, נדודי שינה)?', textEn: 'Does it take a long time for your body to adjust to new environments?', category: 'אנרגיה ומחזוריות' },
      { id: '15', textHe: 'היעד: אם הטיפול יכול לעזור לך להתמודד עם עונה אחת בלבד בצורה מושלמת – איזו עונה הכי קשה לך כיום?', textEn: 'Which season is most difficult for you currently?', category: 'אנרגיה ומחזוריות' }
    ]
  },
  {
    id: 'vitality_longevity',
    name: 'חיוניות ואריכות ימים',
    nameEn: 'Vitality & Longevity',
    icon: Battery,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    route: '/vitality-longevity-questionnaire',
    questions: [
      { id: '1', textHe: 'הסוללה הפנימית: האם את/ה מרגיש/ה שהאנרגיה שלך נגמרת בשעות הצהריים, או שיש לך כוח יציב לאורך כל היום?', textEn: 'Does your energy run out midday, or do you have stable strength all day?', category: 'המאגר הפנימי' },
      { id: '2', textHe: 'איכות השינה: האם את/ה מתעורר/ת מספר פעמים בלילה (לצורך הליכה לשירותים או מתוך אי-שקט), או מתקשה לחזור לישון לפנות בוקר?', textEn: 'Do you wake up multiple times at night or have difficulty returning to sleep?', category: 'המאגר הפנימי' },
      { id: '3', textHe: 'חום וקור: האם חל שינוי בתחושת הטמפרטורה שלך לאחרונה – גלי חום פתאומיים, או להפך, תחושת קור עמוקה בגב התחתון ובברכיים?', textEn: 'Have you noticed temperature changes - hot flashes or deep cold in lower back and knees?', category: 'המאגר הפנימי' },
      { id: '4', textHe: 'זיכרון ומיקוד: האם את/ה מרגיש/ה ירידה בחדות הזיכרון לטווח קצר ("שכחתי למה נכנסתי לחדר"), או קושי לשלוף מילים?', textEn: 'Do you feel a decline in short-term memory or difficulty retrieving words?', category: 'המאגר הפנימי' },
      { id: '5', textHe: 'התאוששות: כשאת/ה חולה או מבצע/ת מאמץ פיזי, האם לגוף לוקח זמן רב יותר לחזור לעצמו בהשוואה לעבר?', textEn: 'Does your body take longer to recover from illness or physical exertion?', category: 'המאגר הפנימי' },
      { id: '6', textHe: 'פרקים ותנועה: האם את/ה סובל/ת מנוקשות בוקר במפרקים (אצבעות, גב, ברכיים) שמשתחררת רק אחרי תנועה וחימום?', textEn: 'Do you suffer from morning stiffness in joints that releases after movement?', category: 'זרימה ותנועה' },
      { id: '7', textHe: 'לחץ דם וראש: האם את/ה סובל/ת לעיתים מסחרחורות, טינטון (צפצוף באוזניים) או תחושת "לחץ" וכבדות בראש?', textEn: 'Do you sometimes suffer from dizziness, tinnitus, or feeling of pressure in the head?', category: 'זרימה ותנועה' },
      { id: '8', textHe: 'עיכול וחילוף חומרים: האם יש תחושת כבדות או נפיחות בבטן גם אחרי ארוחות קטנות וקלות (חולשת עיכול)?', textEn: 'Do you feel heaviness or bloating even after small meals?', category: 'זרימה ותנועה' },
      { id: '9', textHe: 'זרימת דם: האם את/ה מרגיש/ה נימול או הירדמות של הגפיים (ידיים/רגליים) בזמן מנוחה או בשינה?', textEn: 'Do you feel numbness or tingling in limbs during rest or sleep?', category: 'זרימה ותנועה' },
      { id: '10', textHe: 'כאב כרוני: האם ישנו כאב קבוע המלווה אותך (גב תחתון, צוואר, כתפיים) ומחמיר במזג אוויר קר או לח?', textEn: 'Is there chronic pain that worsens in cold or damp weather?', category: 'זרימה ותנועה' },
      { id: '11', textHe: 'מעברים: האם השינויים בחיים (ילדים עוזבים, פרישה, שינוי קריירה) מעוררים בך תחושת חופש ושמחה, או ריקנות וחרדה?', textEn: 'Do life changes evoke feelings of freedom or emptiness and anxiety?', category: 'רגש ומשמעות' },
      { id: '12', textHe: 'מצב רוח: האם את/ה מוצא/ת את עצמך חסר/ת סבלנות או כעוס/ה יותר מהרגיל, או נוטה למצבי רוח דכדוכיים?', textEn: 'Do you find yourself more impatient or prone to depressive moods?', category: 'רגש ומשמעות' },
      { id: '13', textHe: 'תזונה ותרופות: האם את/ה נוטל/ת מספר תרופות מרשם באופן קבוע? (חשוב לנו להבין את העומס על הכבד).', textEn: 'Do you take multiple prescription medications regularly?', category: 'רגש ומשמעות' },
      { id: '14', textHe: 'יובש: האם את/ה סובל/ת מיובש טורדני – בעיניים, בפה, בעור או בריריות? (סימן לחוסר יין - Yin Deficiency).', textEn: 'Do you suffer from bothersome dryness in eyes, mouth, skin, or mucous membranes?', category: 'רגש ומשמעות' },
      { id: '15', textHe: 'המטרה הבריאותית: מהו הדבר האחד שתרצה/י להמשיך לעשות ב-10 השנים הבאות ללא הגבלה (למשל: לטייל ברגל, לשחק עם הנכדים, לקרוא, לעסוק בספורט)?', textEn: 'What is the one thing you want to continue doing in the next 10 years without limitation?', category: 'רגש ומשמעות' }
    ]
  },
  {
    id: 'golden_age_vitality',
    name: 'חיוניות גיל הזהב',
    nameEn: 'Golden Age Vitality',
    icon: Sun,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    route: '/golden-age-vitality-questionnaire',
    questions: [
      { id: 'cognitive', textHe: 'האם את/ה מרגיש/ה שאת/ה מאתגר/ת את המוח שלך ביומיום (קריאה, תשבצים, לימוד דברים חדשים), או מרגיש/ה ירידה בחדות?', textEn: 'Do you feel you challenge your brain daily, or feel a decline in sharpness?', category: 'Cognitive' },
      { id: 'emotional', textHe: 'האם את/ה קם/ה בבוקר עם תחושת מטרה ועניין, או שאת/ה חווה תחושות של ריקנות ושעמום?', textEn: 'Do you wake up with a sense of purpose, or experience feelings of emptiness and boredom?', category: 'Emotional' },
      { id: 'social', textHe: 'באיזו תדירות את/ה נפגש/ת עם חברים או משפחה? האם את/ה מרגיש/ה בודד/ה לעיתים קרובות?', textEn: 'How often do you meet with friends or family? Do you often feel lonely?', category: 'Social' },
      { id: 'mobility_falls', textHe: 'האם את/ה מרגיש/ה בטוח/ה ביציבות ובהליכה שלך, או שיש לך חשש מנפילות?', textEn: 'Do you feel confident in your stability and walking, or fear falling?', category: 'Mobility (Falls)' },
      { id: 'sleep', textHe: 'האם שנת הלילה שלך רציפה ומרעננת, או שאת/ה מסתמך/ת על כדורי שינה כדי להירדם?', textEn: 'Is your night sleep continuous and refreshing, or do you rely on sleeping pills?', category: 'Sleep' },
      { id: 'appetite', textHe: 'האם התיאבון שלך בריא ואת/ה נהנה/ית מאוכל, או שאת/ה אוכל/ת רק כי "צריך"?', textEn: 'Is your appetite healthy and do you enjoy food, or eat only because you "have to"?', category: 'Appetite' },
      { id: 'family', textHe: 'כיצד היית מתאר/ת את היחסים עם הילדים/נכדים? האם הם מקור לשמחה או לדאגה ומתח?', textEn: 'How would you describe relationships with children/grandchildren?', category: 'Family' },
      { id: 'technology', textHe: 'האם השימוש בטכנולוגיה (סמארטפון, מחשב) גורם לך לתסכול וחרדה, או שאת/ה מסתדר/ת איתו בנוחות?', textEn: 'Does using technology cause you frustration, or do you manage it comfortably?', category: 'Technology' },
      { id: 'energy_adl', textHe: 'האם יש לך מספיק אנרגיה לבצע את כל הפעולות היומיומיות שחשובות לך (קניות, בישול, תחביבים)?', textEn: 'Do you have enough energy for all daily activities important to you?', category: 'Energy (ADL)' },
      { id: 'pain_function', textHe: 'האם כאבים כרוניים (ברכיים, גב) מונעים ממך לצאת מהבית או להשתתף בפעילויות חברתיות?', textEn: 'Do chronic pains prevent you from leaving home or participating in social activities?', category: 'Pain & Function' },
      { id: 'financial_stress', textHe: 'האם דאגות כלכליות מטרידות את מנוחתך ומשפיעות על מצב הרוח שלך?', textEn: 'Do financial worries disturb your peace and affect your mood?', category: 'Financial Stress' },
      { id: 'senses', textHe: 'האם ירידה בשמיעה או בראייה גורמת לך להימנע משיחות או ממפגשים חברתיים?', textEn: 'Does decline in hearing or vision cause you to avoid social interactions?', category: 'Senses' },
      { id: 'meds', textHe: 'האם את/ה מרגיש/ה עומס מריבוי התרופות שאת/ה נוטל/ת? האם יש תופעות לוואי שמפריעות לך?', textEn: 'Do you feel burdened by multiple medications? Are there bothersome side effects?', category: 'Meds' },
      { id: 'outlook', textHe: 'האם את/ה מצפה לעתיד באופטימיות ויש לך תוכניות שאת/ה מחכה להן?', textEn: 'Do you look forward to the future optimistically and have plans you await?', category: 'Outlook' },
      { id: 'the_goal', textHe: 'מהו הדבר האחד שתרצה/י לשפר כדי ליהנות יותר מהתקופה הזו בחייך (למשל: יותר עצמאות, פחות כאב, יותר חברה)?', textEn: 'What is the one thing you would like to improve to enjoy this period more?', category: 'The Goal' }
    ]
  },
  {
    id: 'immune_shield',
    name: 'חוסן חיסוני והתאוששות',
    nameEn: 'Immune Shield & Recovery',
    icon: Shield,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    route: '/immune-shield-questionnaire',
    questions: [
      { id: 'illness_frequency', textHe: 'באיזו תדירות את/ה חולה (צינון/שפעת) במהלך השנה? האם את/ה מרגיש/ה שאת/ה "תופס/ת" כל וירוס שעובר בסביבה?', textEn: 'How often do you get sick during the year?' },
      { id: 'response_to_symptoms', textHe: 'כשאת/ה מרגיש/ה סימנים ראשונים של מחלה, האם את/ה עוצר/ת ונח/ה, או ממשיך/ה בשגרה כרגיל ("להתעלם ולדחוף")?', textEn: 'When you feel first signs of illness, do you rest or continue as usual?' },
      { id: 'recovery_speed', textHe: 'כאשר את/ה חולה, כמה זמן לוקח לך להחלים לחלוטין ולחזור לאנרגיה מלאה? (ימים בודדים או שבועות ארוכים?)', textEn: 'When sick, how long does it take you to fully recover?' },
      { id: 'exposure', textHe: 'האם את/ה חשוף/ה באופן קבוע לאנשים חולים (עבודה בבית ספר, בית חולים, משרד צפוף)?', textEn: 'Are you regularly exposed to sick people?' },
      { id: 'temperature', textHe: 'האם את/ה נוטה לסבול מקור, במיוחד בידיים וברגליים, או מרגיש/ה צמרמורות בקלות כשיש רוח/מזגן?', textEn: 'Do you tend to suffer from cold, especially in hands and feet?' },
      { id: 'sleep_immunity', textHe: 'האם את/ה שם/ה לב שחוסר שינה או תקופות עמוסות מובילים כמעט מייד למחלה?', textEn: 'Do you notice that lack of sleep leads almost immediately to illness?' },
      { id: 'exercise', textHe: 'האם את/ה נוטה לחזור לפעילות גופנית מאומצת מיד כשאת/ה מרגיש/ה מעט יותר טוב, או נותן/ת לגוף זמן להתאושש?', textEn: 'Do you return to strenuous exercise immediately when feeling better?' },
      { id: 'morning_symptoms', textHe: 'האם את/ה מתעורר/ת בבוקר עם גודש באף, ליחה בגרון או התעטשויות (שעוברים בהמשך היום)?', textEn: 'Do you wake up with nasal congestion, phlegm, or sneezing?' },
      { id: 'digestion', textHe: 'האם שינויים בתזונה (כמו אכילת סוכר או מוצרי חלב) משפיעים לרעה על מערכת הנשימה שלך (יותר ליחה/צינונים)?', textEn: 'Do dietary changes negatively affect your respiratory system?' },
      { id: 'stress_pattern', textHe: 'האם את/ה חולה לעיתים קרובות דווקא בסופי שבוע או בחופשות (כשמפלס הלחץ יורד)?', textEn: 'Do you often get sick on weekends or vacations?' },
      { id: 'chronic_cough', textHe: 'האם יש לך נטייה לשיעול מתמשך שנשאר שבועות אחרי שהצינון חלף?', textEn: 'Do you tend to have a persistent cough after a cold?' },
      { id: 'household', textHe: 'האם יש ילדים קטנים בבית ש"מביאים" וירוסים מהגן/בית ספר באופן קבוע?', textEn: 'Are there young children at home who bring viruses regularly?' },
      { id: 'hydration', textHe: 'האם את/ה מקפיד/ה על שתייה מספקת במהלך היום, או שאת/ה נוטה לשכוח לשתות?', textEn: 'Do you make sure to drink enough during the day?' },
      { id: 'seasons', textHe: 'האם יש עונה מסוימת בשנה שבה הבריאות שלך תמיד מתערערת (מעברי עונות, חורף)?', textEn: 'Is there a specific season when your health always deteriorates?' },
      { id: 'goal', textHe: 'מהי המטרה העיקרית שלך בחיזוק המערכת החיסונית? (פחות ימי מחלה, יותר אנרגיה בחורף, או התאוששות מהירה יותר)', textEn: 'What is your main goal in strengthening your immune system?' }
    ]
  },
  {
    id: 'nourishing_life',
    name: 'הזנת החיים',
    nameEn: 'Nourishing Life (Nutrition)',
    icon: Utensils,
    color: 'text-lime-500',
    bgColor: 'bg-lime-500/10',
    borderColor: 'border-lime-500/20',
    route: '/nourishing-life-questionnaire',
    questions: [
      { id: 'challenge', textHe: 'במשפט אחד, מהו האתגר התזונתי הגדול ביותר שלך כיום? (למשל: חשקים למתוק, אי-סדירות, נפיחות, או עייפות אחרי אוכל)', textEn: 'What is your biggest nutritional challenge today?', category: 'Challenge' },
      { id: 'breakfast', textHe: 'האם את/ה אוכל/ת ארוחת בוקר? אם כן, האם היא חמה (דייסה/ביצה) או קרה (יוגורט/שייק)?', textEn: 'Do you eat breakfast? Is it warm or cold?', category: 'Breakfast' },
      { id: 'timing', textHe: 'האם את/ה נוהג/ת לאכול ארוחות כבדות בשעות המאוחרות של הלילה (אחרי 19:00)?', textEn: 'Do you tend to eat heavy meals late at night?', category: 'Timing' },
      { id: 'temperature', textHe: 'מהי העדפת המזון שלך? האם את/ה אוכל/ת בעיקר מזון נא/קר (סלטים, סמודיז) או מזון מבושל וחם?', textEn: 'Do you mainly eat raw/cold food or cooked and warm food?', category: 'Temperature' },
      { id: 'energy_drop', textHe: 'האם את/ה מרגיש/ה "צניחת אנרגיה" (עייפות כבדה) וצורך לישון מיד לאחר האוכל?', textEn: 'Do you feel an "energy drop" and need to sleep immediately after eating?', category: 'Energy Drop' },
      { id: 'bloating', textHe: 'האם את/ה סובל/ת מנפיחות בבטן, גזים או תחושת "בלון" שמתגברת במהלך היום?', textEn: 'Do you suffer from bloating that intensifies during the day?', category: 'Bloating' },
      { id: 'hydration', textHe: 'האם את/ה מעדיף/ה לשתות מים קפואים/קרים מאוד, או שאת/ה נמשך/ת למשקאות חמים/פושרים?', textEn: 'Do you prefer icy water or warm/lukewarm drinks?', category: 'Hydration' },
      { id: 'sweet_cravings', textHe: 'האם יש לך צורך עז במתוקים או בפחמימות (לחם/פסטה), במיוחד בשעות אחר הצהריים?', textEn: 'Do you have strong cravings for sweets or carbohydrates?', category: 'Sweet Cravings' },
      { id: 'salt_spice', textHe: 'האם את/ה מוצא/ת את עצמך ממליח/ה את האוכל בצורה מוגזמת, או מחפש/ת טעמים חריפים?', textEn: 'Do you over-salt food or seek spicy flavors?', category: 'Salt/Spice' },
      { id: 'dairy', textHe: 'האם צריכת מוצרי חלב גורמת לך לליחה (בגרון/סינוסים), נזלת או אי-נוחות בבטן?', textEn: 'Does dairy consumption cause mucus or abdominal discomfort?', category: 'Dairy' },
      { id: 'raw_veg', textHe: 'האם אכילת סלט גדול או ירקות חיים גורמת לך לכאבי בטן או ליציאות רכות?', textEn: 'Does eating raw vegetables cause stomach pain or loose stools?', category: 'Raw Veg' },
      { id: 'appetite', textHe: 'האם את/ה חווה רעב תמידי שלא יודע שובע, או חוסר תיאבון מוחלט?', textEn: 'Do you experience constant hunger or complete lack of appetite?', category: 'Appetite' },
      { id: 'emotions', textHe: 'האם את/ה נוטה לפנות לאוכל (מנחם) בזמנים של מתח, עצב או שעמום?', textEn: 'Do you turn to comfort eating during stress or boredom?', category: 'Emotions' },
      { id: 'caffeine', textHe: 'כמה כוסות קפה את/ה שותה ביום? האם את/ה מרגיש/ה שבלעדיו המערכת לא מתפקדת?', textEn: 'How many cups of coffee do you drink? Do you feel you can\'t function without it?', category: 'Caffeine' },
      { id: 'one_change', textHe: 'אם היית יכול/ה לשנות הרגל תזונתי אחד בלבד שישפר את בריאותך, מה הוא היה?', textEn: 'If you could change one nutritional habit, what would it be?', category: 'One Change' },
      { id: 'diet_veg_vegan', textHe: 'האם התזונה שלך צמחונית או טבעונית? האם את/ה מרגיש/ה קור פנימי או חולשה מאז השינוי?', textEn: 'Is your diet vegetarian or vegan? Do you feel internal cold since the change?', category: 'Diet Style' },
      { id: 'diet_keto', textHe: 'האם את/ה נמנע/ת לחלוטין מפחמימות (דיאטת קיטו/פליאו)? האם את/ה חווה יובש או עצירות?', textEn: 'Do you avoid carbohydrates? Do you experience dryness or constipation?', category: 'Diet Style' },
      { id: 'eating_speed', textHe: 'האם את/ה נוטה לאכול מהר מאוד, "תוך כדי תנועה" או מול מסכים, מבלי ללעוס היטב?', textEn: 'Do you tend to eat very fast, on the go, or in front of screens?', category: 'Eating Speed' },
      { id: 'frequency_omad', textHe: 'האם את/ה אוכל/ת ארוחה אחת גדולה ביום (צום לסירוגין) או מנשנש/ת מנות קטנות כל היום?', textEn: 'Do you eat one large meal a day or snack all day?', category: 'Frequency' },
      { id: 'processed_fried', textHe: 'באיזו תדירות את/ה אוכל/ת מזון מטוגן, מעובד או תעשייתי?', textEn: 'How often do you eat fried, processed, or industrial food?', category: 'Processed/Fried' },
      { id: 'alcohol', textHe: 'מהי תדירות צריכת האלכוהול שלך? (יין, בירה, משקאות חריפים)', textEn: 'What is your alcohol consumption frequency?', category: 'Alcohol' },
      { id: 'red_meat', textHe: 'האם אכילת בשר אדום גורמת לך לתחושת כבדות, חום או אי-נוחות?', textEn: 'Does eating red meat cause feelings of heaviness or discomfort?', category: 'Red Meat' },
      { id: 'wheat_gluten', textHe: 'האם את/ה מרגיש/ה נפיחות או עייפות ספציפית לאחר אכילת לחם, פסטה או מאפים (חיטה)?', textEn: 'Do you feel bloating or fatigue after eating wheat products?', category: 'Wheat/Gluten' },
      { id: 'legumes', textHe: 'האם קטניות (עדשים, שעועית, חומוס) גורמות לך לגזים קשים ונפיחות?', textEn: 'Do legumes cause severe gas and bloating?', category: 'Legumes' },
      { id: 'fruit_excess', textHe: 'האם את/ה אוכל/ת פירות בכמות גדולה (יותר מ-2 ביום), במיוחד פירות טרופיים או הדרים?', textEn: 'Do you eat fruits in large quantities, especially tropical or citrus?', category: 'Fruit Excess' }
    ]
  },
  {
    id: 'zang_fu_syndromes',
    name: 'תסמונות זאנג-פו',
    nameEn: 'Zang Fu Syndromes',
    icon: Stethoscope,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    route: '/zang-fu-syndromes-questionnaire',
    questions: [
      { id: 'kidney_yang_etiology', textHe: 'מהי האטיולוגיה (הסיבה) המרכזית לחוסר יאנג בכליות לפי הקובץ?', textEn: 'What is the main etiology of Kidney Yang Deficiency?' },
      { id: 'spleen_qi_vs_yang', textHe: 'אילו סימפטומים מבדילים בין חוסר צ\'י בטחול לבין חוסר יאנג בטחול?', textEn: 'What symptoms differentiate Spleen Qi Deficiency from Spleen Yang Deficiency?' },
      { id: 'liver_qi_fire', textHe: 'מהו עקרון הטיפול המדויק לסטגנציה של צ\'י הכבד שהפכה לאש?', textEn: 'What is the treatment principle for Liver Qi Stagnation transformed into Fire?' },
      { id: 'tinnitus_pattern', textHe: 'האם טיניטוס (צפצופים באוזניים) המופיע בקובץ שייך לסינדרום עודף או חוסר?', textEn: 'Does tinnitus belong to an Excess or Deficiency syndrome?' },
      { id: 'heart_blood_sleep', textHe: 'מה הקשר בין "חוסר דם בלב" לבין הפרעות שינה לפי הטקסט?', textEn: 'What is the connection between Heart Blood Deficiency and sleep disorders?' },
      { id: 'damp_heat_lower', textHe: 'כיצד מתבטא "חום ולחות במחמם התחתון" אצל גברים לעומת נשים?', textEn: 'How does Damp-Heat in Lower Jiao manifest in men vs women?' },
      { id: 'liver_wind_signs', textHe: 'מנה שלושה סימני מפתח לזיהוי "רוח פנימית של הכבד".', textEn: 'List three key signs for identifying Internal Liver Wind.' },
      { id: 'phlegm_mist_vs_fire', textHe: 'מה ההבדל באבחנה בין ליחה-אל-חומרית (Phlegm-Mist) לבין ליחה-אש בלב?', textEn: 'What is the diagnostic difference between Phlegm-Mist and Phlegm-Fire in Heart?' },
      { id: 'worry_organs', textHe: 'כיצד משפיע רגש ה"דאגה" (Worry) על הטחול והריאות לפי המקורות?', textEn: 'How does Worry affect the Spleen and Lungs?' },
      { id: 'cold_uterus', textHe: 'מהי הפתולוגיה של "קור ברחם" וכיצד היא משפיעה על הפוריות?', textEn: 'What is the pathology of Cold in the Uterus and its effect on fertility?' },
      { id: 'qi_sinking', textHe: 'ציין את הסימנים הקליניים של "צניחת צ\'י" (Qi Sinking).', textEn: 'List the clinical signs of Qi Sinking.' },
      { id: 'lung_dryness_vs_yin', textHe: 'כיצד נבדיל בין יובש בריאות לבין חוסר יין בריאות?', textEn: 'How do we differentiate between Lung Dryness and Lung Yin Deficiency?' },
      { id: 'liver_stomach_disharmony', textHe: 'מהם הביטויים של "דיסהרמוניה בין הכבד לקיבה"?', textEn: 'What are the manifestations of Disharmony between Liver and Stomach?' },
      { id: 'spleen_dampness_factors', textHe: 'אילו מזונות או הרגלים מחמירים את "לחות בטחול" לפי הקובץ?', textEn: 'Which foods or habits worsen Spleen Dampness?' },
      { id: 'liver_yang_rising_headache', textHe: 'מהו ההסבר הפתולוגי לכאבי ראש על רקע "עליית יאנג הכבד"?', textEn: 'What is the pathological explanation for headaches due to Liver Yang Rising?' },
      { id: 'heart_kidney_axis', textHe: 'כיצד מתוארת הדינמיקה בין הלב לכליות (Shaoyin Axis)?', textEn: 'How is the dynamic between Heart and Kidneys described?' },
      { id: 'wind_cold_lung_invasion', textHe: 'מהם הסימנים המבשרים על פלישת רוח-קור לריאות?', textEn: 'What are the signs indicating Wind-Cold invasion of the Lungs?' },
      { id: 'false_cold_true_heat', textHe: 'מהי האסטרטגיה הטיפולית למצבי "קור מדומה וחום אמיתי"?', textEn: 'What is the treatment strategy for False Cold and True Heat conditions?' },
      { id: 'liver_blood_emotions', textHe: 'אילו סימפטומים רגשיים קשורים לחוסר דם בכבד (Liv Blood Def)?', textEn: 'What emotional symptoms are associated with Liver Blood Deficiency?' },
      { id: 'bi_syndrome_definition', textHe: 'מהי ההגדרה המדויקת של "Bi Syndrome" (תסמונת כאב) בקובץ?', textEn: 'What is the precise definition of Bi Syndrome?' }
    ]
  },
  {
    id: 'acupuncture_points',
    name: 'ספר הנקודות',
    nameEn: 'Acupuncture Points',
    icon: MapPin,
    color: 'text-green-600',
    bgColor: 'bg-green-600/10',
    borderColor: 'border-green-600/20',
    route: '/acupuncture-points-questionnaire',
    questions: [
      { id: '1', textHe: 'מהי ה"אנרגיה העמוקה" (Deep Energy) של מרידיאן הריאות לפי הספר?', textEn: 'What is the "Deep Energy" of the Lung meridian?', category: 'אנרגטיקה' },
      { id: '2', textHe: 'מהי נקודת ההשפעה (Influence Point) הטובה ביותר לבעיות גידים?', textEn: 'What is the best Influence Point for tendon problems?', category: 'נקודות השפעה' },
      { id: '3', textHe: 'מהו המיקום המדויק ואזהרות הבטיחות לדיקור ב-BL-1?', textEn: 'What is the exact location and safety warnings for BL-1?', category: 'מיקום ובטיחות' },
      { id: '4', textHe: 'אילו נקודות נחשבות ל"נקודות ים" (He-Sea) ומה תפקידן העיקרי?', textEn: 'Which points are considered He-Sea points and what is their main function?', category: 'נקודות חמש אלמנטים' },
      { id: '5', textHe: 'איזה שילוב נקודות מומלץ לחיזוק ה-Wei Qi (מערכת החיסון)?', textEn: 'What point combination is recommended for strengthening Wei Qi?', category: 'שילובי נקודות' },
      { id: '6', textHe: 'מהי המשמעות האנרגטית של השם של נקודה ST-36 לפי הספר?', textEn: 'What is the energetic meaning of the name of ST-36?', category: 'אנרגטיקה' },
      { id: '7', textHe: 'אילו נקודות מצוינות כאסורות לדיקור בהריון בקובץ זה?', textEn: 'Which points are forbidden during pregnancy?', category: 'התוויות נגד' },
      { id: '8', textHe: 'מהן חמש נקודות ה-Shu העתיקות של מרידיאן הכליות?', textEn: 'What are the five ancient Shu points of the Kidney meridian?', category: 'נקודות חמש אלמנטים' },
      { id: '9', textHe: 'כיצד משתמשים בנקודות ה-Luo כדי לטפל ברגשות?', textEn: 'How are Luo points used to treat emotions?', category: 'נקודות לואו' },
      { id: '10', textHe: 'מהי הנקודה הטובה ביותר להורדת יאנג הכבד במצבי מיגרנה?', textEn: 'What is the best point for lowering Liver Yang in migraines?', category: 'יישומים קליניים' },
      { id: '11', textHe: 'מהו התפקוד הייחודי של נקודת המקור (Yuan) של הלב (HT-7)?', textEn: 'What is the unique function of the Heart Yuan point HT-7?', category: 'נקודות יואן' },
      { id: '12', textHe: 'אילו נקודות מומלצות לטיפול בבחילות והקאות (Rebellious Stomach Qi)?', textEn: 'Which points are recommended for treating nausea and vomiting?', category: 'יישומים קליניים' },
      { id: '13', textHe: 'מהי הקטגוריה של נקודה SP-6 ומה טווח הפעולה שלה?', textEn: 'What is the category of SP-6 and its range of action?', category: 'נקודות מפתח' },
      { id: '14', textHe: 'איזה שילוב נקודות מתאים לטיפול ב"רוח חיצונית"?', textEn: 'What point combination is suitable for treating External Wind?', category: 'שילובי נקודות' },
      { id: '15', textHe: 'הסבר את השימוש בנקודות ה-Mu הקדמיות באבחנה ובטיפול.', textEn: 'Explain the use of Front Mu points in diagnosis and treatment.', category: 'נקודות מו' },
      { id: '16', textHe: 'איזו נקודה נחשבת ל"נקודת הפיקוד" (Command Point) של הגב התחתון?', textEn: 'Which point is the Command Point of the lower back?', category: 'נקודות פיקוד' },
      { id: '17', textHe: 'מהי הטכניקה הנכונה לדיקור בנקודה Ren-12?', textEn: 'What is the correct needling technique for Ren-12?', category: 'טכניקות דיקור' },
      { id: '18', textHe: 'אילו נקודות פותחות את מרידיאן ה-Dai Mai (החגורה)?', textEn: 'Which points open the Dai Mai (Belt) vessel?', category: 'מרידיאנים יוצאי דופן' },
      { id: '19', textHe: 'מהו התפקוד הרוחני/נפשי של נקודה GV-20 (Baihui)?', textEn: 'What is the spiritual/mental function of GV-20 (Baihui)?', category: 'אנרגטיקה' },
      { id: '20', textHe: 'אילו נקודות משמשות להוצאת חום (Clearing Heat) מהגוף?', textEn: 'Which points are used for Clearing Heat from the body?', category: 'יישומים קליניים' }
    ]
  },
  {
    id: 'pattern_differentiation',
    name: 'אבחנה מלאה (ביין ג׳נג)',
    nameEn: 'Complete Pattern Differentiation (Bian Zheng)',
    icon: Compass,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
    route: '/pattern-differentiation-questionnaire',
    questions: [
      { id: 'temperature', textHe: 'האם אתה סובל יותר מקור (גפיים קרות, רתיעה מקור - Yang Def) או מחום (גלי חום, צמא, פנים אדומות - Yin Def/Heat)?', textEn: 'Do you suffer more from cold (cold limbs, aversion to cold - Yang Def) or heat (hot flashes, thirst, red face - Yin Def/Heat)?', category: 'טמפרטורה (קור/חום)' },
      { id: 'energy_qi', textHe: 'האם יש עייפות כרונית, קוצר נשימה במאמץ, או תחושת כבדות ועצלנות לאחר האוכל?', textEn: 'Is there chronic fatigue, shortness of breath on exertion, or feeling of heaviness and sluggishness after eating?', category: 'רמת אנרגיה (צ׳י)' },
      { id: 'fluids_dryness', textHe: 'האם אתה סובל מיובש (פה, עור, עיניים), סחרחורות בקימה, או הזעות לילה?', textEn: 'Do you suffer from dryness (mouth, skin, eyes), dizziness when standing, or night sweats?', category: 'נוזלים ויובש (יין/דם)' },
      { id: 'pain_stagnation', textHe: 'האם יש כאבים המוחמרים בלחץ (Stagnation), או כאבים עמומים המוטבים במגע/חום (Deficiency)?', textEn: 'Are there pains worsened by pressure (Stagnation), or dull pains improved by touch/warmth (Deficiency)?', category: 'כאב ותחושה (סטגנציה)' },
      { id: 'digestion_spleen', textHe: 'האם יש נפיחות בבטן, יציאות רכות, תאבון ירוד או צניחת איברים (טחורים/רחם)?', textEn: 'Is there abdominal bloating, loose stools, poor appetite, or organ prolapse (hemorrhoids/uterus)?', category: 'מערכת העיכול (טחול/קיבה)' },
      { id: 'lungs_immunity', textHe: 'האם יש נטייה להצטננויות תכופות, הזעה ספונטנית ללא מאמץ, או קול חלש?', textEn: 'Is there tendency to frequent colds, spontaneous sweating without exertion, or weak voice?', category: 'נשימה וחיסון (ריאות)' },
      { id: 'heart_shen', textHe: 'האם יש דפיקות לב (פלפיטציות), חרדה, קושי להירדם, או ירידה בזיכרון?', textEn: 'Are there palpitations, anxiety, difficulty falling asleep, or memory decline?', category: 'לב ונפש (שן)' },
      { id: 'liver_emotions', textHe: 'האם יש נטייה לכעס/רוגז, תחושת "תקיעות" בחזה/צלעות, או כאבי ראש בצדדים?', textEn: 'Is there tendency to anger/irritability, feeling of "stuckness" in chest/ribs, or lateral headaches?', category: 'כבד ורגשות' },
      { id: 'kidneys_back', textHe: 'האם יש כאבי גב תחתון/ברכיים, השתנה מרובה בלילה (Nocturia), או ירידה בשמיעה?', textEn: 'Are there lower back/knee pains, frequent nighttime urination (Nocturia), or hearing decline?', category: 'כליות וגב' },
      { id: 'dampness_phlegm', textHe: 'האם יש תחושת כבדות בראש ("קסדה"), בחילות, ליחה בגרון, או השמנה בטנית?', textEn: 'Is there feeling of heaviness in head ("helmet"), nausea, phlegm in throat, or abdominal obesity?', category: 'לחות וליחה' },
      { id: 'menstruation', textHe: 'האם המחזור מקדים/שופע (חום/חסר צ׳י), או מאחר/דליל/כואב (קור/סטגנציה/חסר דם)?', textEn: 'Does menstruation come early/heavy (heat/Qi def), or late/scanty/painful (cold/stagnation/blood def)?', category: 'מחזור (נשים)' },
      { id: 'sleep_patterns', textHe: 'האם הקושי הוא בהירדמות (חסר דם), יקיצות מרובות (חסר יין), או יקיצה מוקדמת בבוקר (חולשת יאנג)?', textEn: 'Is difficulty in falling asleep (blood def), frequent waking (Yin def), or early morning waking (Yang weakness)?', category: 'שינה' },
      { id: 'tongue_body', textHe: 'האם הלשון חיוורת (חסר), אדומה (חום), סגולה (סטגנציה), או תפוחה עם סימני שיניים (לחות/חסר צ׳י)?', textEn: 'Is the tongue pale (deficiency), red (heat), purple (stagnation), or swollen with teeth marks (dampness/Qi def)?', category: 'לשון - גוף' },
      { id: 'tongue_coating', textHe: 'האם החיפוי עבה/שמנוני (לחות), דק/לבן (תקין/קור), או חסר/מתקלף (חסר יין)?', textEn: 'Is the coating thick/greasy (dampness), thin/white (normal/cold), or absent/peeling (Yin def)?', category: 'לשון - חיפוי' },
      { id: 'pulse_quality', textHe: 'האם הדופק חלש/ריק (חסר), מיתרי/מתוח (כבד/כאב), או מתגלגל (ליחה)?', textEn: 'Is the pulse weak/empty (deficiency), wiry/tense (Liver/pain), or slippery (phlegm)?', category: 'דופק' }
    ]
  }
];

export default function HebrewQuestionsReport() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Calculate totals
  const totalQuestions = questionnairesData.reduce((sum, q) => sum + q.questions.length, 0);
  const totalQuestionnaires = questionnairesData.length;

  // Get all unique categories (questionnaire IDs)
  const categories = useMemo(() => {
    return questionnairesData.map(q => ({
      id: q.id,
      name: q.name,
      nameEn: q.nameEn,
      count: q.questions.length
    }));
  }, []);

  // Filter questions based on search and category
  const filteredData = useMemo(() => {
    return questionnairesData
      .filter(questionnaire => selectedCategory === 'all' || questionnaire.id === selectedCategory)
      .map(questionnaire => ({
        ...questionnaire,
        questions: questionnaire.questions.filter(q => 
          q.textHe.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.textEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (q as any).category?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }))
      .filter(q => q.questions.length > 0);
  }, [searchQuery, selectedCategory]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedSections(new Set(questionnairesData.map(q => q.id)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  const exportToCSV = () => {
    let csv = '\uFEFF'; // BOM for Hebrew support
    csv += 'שאלון,מספר,שאלה בעברית,שאלה באנגלית,קטגוריה\n';
    
    questionnairesData.forEach(questionnaire => {
      questionnaire.questions.forEach((q, idx) => {
        const category = (q as any).category || '';
        csv += `"${questionnaire.name}",${idx + 1},"${q.textHe.replace(/"/g, '""')}","${(q.textEn || '').replace(/"/g, '""')}","${category}"\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `hebrew_questions_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            חזרה
          </Button>
          <Button onClick={exportToCSV} className="gap-2">
            <Download className="h-4 w-4" />
            ייצא CSV
          </Button>
        </div>

        {/* Title */}
        <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/20 rounded-full">
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">דו"ח שאלות עברית מלא</CardTitle>
            <p className="text-muted-foreground">כל השאלונים והשאלות במערכת</p>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary">{totalQuestionnaires}</div>
              <div className="text-sm text-muted-foreground">שאלונים</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-500">{totalQuestions}</div>
              <div className="text-sm text-muted-foreground">שאלות סה"כ</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-amber-500">
                {Math.round(totalQuestions / totalQuestionnaires)}
              </div>
              <div className="text-sm text-muted-foreground">ממוצע לשאלון</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-purple-500">
                {filteredData.reduce((sum, q) => sum + q.questions.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">תוצאות חיפוש</div>
            </CardContent>
          </Card>
        </div>

        {/* Search, Filter and Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              {/* Category Filter */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center gap-2 md:min-w-[280px]">
                  <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="בחר שאלון..." />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      <SelectItem value="all">כל השאלונים ({totalQuestions} שאלות)</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name} ({cat.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="חפש שאלה..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={expandAll}>
                    הרחב הכל
                  </Button>
                  <Button variant="outline" size="sm" onClick={collapseAll}>
                    כווץ הכל
                  </Button>
                </div>
                {selectedCategory !== 'all' && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedCategory('all')}
                    className="text-muted-foreground"
                  >
                    נקה סינון
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questionnaires List */}
        <ScrollArea className="h-[calc(100vh-400px)]">
          <div className="space-y-4 pb-8">
            {filteredData.map((questionnaire) => {
              const Icon = questionnaire.icon;
              const isExpanded = expandedSections.has(questionnaire.id);

              return (
                <Collapsible key={questionnaire.id} open={isExpanded}>
                  <Card className={questionnaire.borderColor}>
                    <CollapsibleTrigger
                      onClick={() => toggleSection(questionnaire.id)}
                      className="w-full"
                    >
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${questionnaire.bgColor}`}>
                              <Icon className={`h-5 w-5 ${questionnaire.color}`} />
                            </div>
                            <div className="text-right">
                              <CardTitle className="text-lg">{questionnaire.name}</CardTitle>
                              <p className="text-sm text-muted-foreground">{questionnaire.nameEn}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">
                              {questionnaire.questions.length} שאלות
                            </Badge>
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="border-t pt-4 space-y-3">
                          {questionnaire.questions.map((question, idx) => (
                            <div
                              key={question.id}
                              className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <Badge variant="outline" className="shrink-0 mt-1">
                                  {idx + 1}
                                </Badge>
                                <div className="flex-1 space-y-1">
                                  <p className="font-medium text-foreground leading-relaxed">
                                    {question.textHe}
                                  </p>
                                  {question.textEn && (
                                    <p className="text-sm text-muted-foreground" dir="ltr">
                                      {question.textEn}
                                    </p>
                                  )}
                                  {(question as any).category && (
                                    <Badge variant="secondary" className="text-xs mt-1">
                                      {(question as any).category}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

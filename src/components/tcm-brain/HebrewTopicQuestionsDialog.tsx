import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  MessageCircleQuestion, Search, ChevronDown, ChevronRight,
  Eye, Heart, Activity, AlertTriangle, Brain, Thermometer,
  Battery, Sun, Shield, Utensils, Stethoscope, MapPin, Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Question data structure
interface Question {
  id: string;
  textHe: string;
  textEn: string;
  category?: string;
}

interface QuestionnaireCategory {
  id: string;
  name: string;
  nameEn: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  questions: Question[];
}

// All questionnaire data consolidated
const questionnairesData: QuestionnaireCategory[] = [
  {
    id: 'pulse_tongue_diagnosis',
    name: 'אבחון דופק ולשון',
    nameEn: 'Pulse & Tongue Diagnosis',
    icon: Eye,
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/20',
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
    questions: [
      { id: 'chief_complaint', textHe: 'במשפט אחד, מהו הקושי הבריאותי העיקרי שמפריע לאיכות החיים שלך כיום?', textEn: 'In one sentence, what is the main health difficulty affecting your quality of life today?' },
      { id: 'digestion_lower', textHe: 'האם היציאות שלך סדירות, או שאת/ה סובל/ת מעצירות כרונית או משלשולים תכופים?', textEn: 'Are your bowel movements regular, or do you suffer from chronic constipation or frequent diarrhea?' },
      { id: 'digestion_upper', textHe: 'האם את/ה סובל/ת מצרבות, תחושת "שריפה" בחזה, או חוסר נוחות בבטן העליונה לאחר האוכל?', textEn: 'Do you suffer from heartburn, burning sensation in chest, or upper abdominal discomfort after eating?' },
      { id: 'nutrition', textHe: 'האם יש לך תיאבון בריא ואת/ה מצליח/ה לשמור על משקל יציב, או שיש ירידה במשקל ובחשק לאכול?', textEn: 'Do you have a healthy appetite and maintain stable weight, or is there weight loss and decreased desire to eat?' },
      { id: 'breath', textHe: 'האם את/ה חווה קוצר נשימה או התעייפות מהירה גם במאמץ קל?', textEn: 'Do you experience shortness of breath or quick fatigue even with mild exertion?' },
      { id: 'sleep', textHe: 'האם שנת הלילה שלך שקטה, או שאת/ה מתעורר/ת לעיתים קרובות?', textEn: 'Is your night sleep peaceful, or do you wake up frequently?' },
      { id: 'balance', textHe: 'האם את/ה מרגיש/ה לעיתים סחרחורת, חוסר יציבות בהליכה, או חשש מנפילה?', textEn: 'Do you sometimes feel dizziness, unsteady walking, or fear of falling?' },
      { id: 'pain', textHe: 'האם כאבים במפרקים או בגב מגבילים את התנועה שלך בבית או בחוץ?', textEn: 'Do joint pains or back pain limit your movement at home or outside?' },
      { id: 'circulation', textHe: 'האם את/ה סובל/ת מקור קיצוני בכפות הידיים והרגליים, או דווקא מגלי חום והזעה?', textEn: 'Do you suffer from extreme cold in hands and feet, or rather from hot flashes and sweating?' },
      { id: 'memory', textHe: 'האם את/ה או הקרובים אליך מבחינים בשינויים בזיכרון, בלבול, או קושי בריכוז לאחרונה?', textEn: 'Do you or those close to you notice changes in memory, confusion, or difficulty concentrating recently?' },
      { id: 'mood', textHe: 'האם מצב הרוח שלך יציב, או שאת/ה חווה תקופות של עצבות עמוקה, חרדה או תחושת בדידות?', textEn: 'Is your mood stable, or do you experience periods of deep sadness, anxiety, or loneliness?' },
      { id: 'urinary', textHe: 'האם את/ה נתקל/ת בקושי לשלוט בשתן, או בקושי להתחיל במתן שתן?', textEn: 'Do you have difficulty controlling urine, or difficulty starting urination?' },
      { id: 'senses', textHe: 'האם חלה ירידה משמעותית בראייה או בשמיעה שמפריעה לך בתקשורת עם הסביבה?', textEn: 'Has there been significant decline in vision or hearing that interferes with communication?' },
      { id: 'medication', textHe: 'האם ריבוי התרופות גורם לך לתופעות לוואי במערכת העיכול?', textEn: 'Does polypharmacy cause digestive side effects?' },
      { id: 'the_goal', textHe: 'מהו הדבר החשוב לך ביותר לשמר בשנים הקרובות?', textEn: 'What is most important for you to preserve in the coming years?' },
    ]
  },
  {
    id: 'balance_strength_adult',
    name: 'איזון וחיזוק (מבוגרים)',
    nameEn: 'Balance & Strength (Adults)',
    icon: Activity,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    questions: [
      { id: 'chief_complaint', textHe: 'במשפט אחד, מהו האתגר הבריאותי המרכזי שמונע ממך להרגיש במיטבך כיום?', textEn: 'What is the main health challenge preventing you from feeling your best today?' },
      { id: 'stress_liver', textHe: 'כיצד את/ה חווה מתח בחיי היומיום? (התפרצויות כעס, תחושת תקיעות בגרון/חזה, חרדה)', textEn: 'How do you experience stress in daily life?' },
      { id: 'womens_health', textHe: '(לנשים) האם המחזור החודשי שלך סדיר? האם את סובלת מכאבים חזקים או PMS?', textEn: '(For women) Is your menstrual cycle regular? Do you suffer from severe pain or PMS?' },
      { id: 'digestion', textHe: 'האם את/ה סובל/ת מנפיחות בבטן, צרבות, IBS או עייפות בולטת לאחר ארוחות?', textEn: 'Do you suffer from bloating, heartburn, IBS, or noticeable fatigue after meals?' },
      { id: 'sleep_quality', textHe: 'האם קשה לך להירדם בגלל "ראש רץ", או שאת/ה מתעורר/ת עייף/ה גם אחרי שנת לילה?', textEn: 'Is it hard to fall asleep due to racing thoughts, or do you wake up tired even after a full night\'s sleep?' },
      { id: 'energy_levels', textHe: 'בסולם של 1-10, כמה אנרגיה יש לך באמצע היום? האם את/ה זקוק/ה לקפה כדי לתפקד?', textEn: 'On a scale of 1-10, how much energy do you have midday? Do you need coffee to keep functioning?' },
      { id: 'headaches_tension', textHe: 'האם את/ה סובל/ת מכאבי ראש, מיגרנות, או מתח כרוני באזור הכתפיים והצוואר?', textEn: 'Do you suffer from headaches, migraines, or chronic tension in shoulders and neck?' },
      { id: 'pain_injury', textHe: 'האם יש לך פציעות ספורט ישנות שחוזרות להציק, או כאבי גב תחתון?', textEn: 'Do you have old sports injuries that keep recurring, or lower back pain?' },
      { id: 'temperature', textHe: 'האם הידיים והרגליים שלך נוטות להיות קרות תמיד, או שאת/ה סובל/ת מחום והזעת יתר?', textEn: 'Are your hands and feet always cold, or do you suffer from heat and excessive sweating?' },
      { id: 'immunity', textHe: 'האם את/ה נוטה לחלות לעיתים קרובות, או סובל/ת מאלרגיות עונתיות וסינוסיטיס?', textEn: 'Do you tend to get sick often, or suffer from seasonal allergies and sinusitis?' },
      { id: 'skin_health', textHe: 'האם העור שלך נוטה לאקנה, אדמומיות, פריחות או יובש קיצוני?', textEn: 'Does your skin tend toward acne, redness, rashes, or extreme dryness?' },
      { id: 'focus_mind', textHe: 'האם את/ה חווה קושי להתרכז, "ערפל מחשבתי" או מוסחות דעת גבוהה?', textEn: 'Do you experience difficulty concentrating, brain fog, or high distractibility?' },
      { id: 'lifestyle', textHe: 'האם אורח החיים שלך כולל ישיבה ממושכת, או פעילות גופנית אינטנסיבית מדי?', textEn: 'Does your lifestyle include prolonged sitting or too intense physical activity?' },
      { id: 'cravings', textHe: 'האם יש לך חשקים עזים וספציפיים (מתוק, מלוח, שומני) כשאת/ה עייף/ה או לחוץ/ה?', textEn: 'Do you have intense specific cravings when tired or stressed?' },
      { id: 'the_goal', textHe: 'אם הטיפול יצליח מעבר למצופה, איך ייראו החיים שלך בעוד 3 חודשים מהיום?', textEn: 'If treatment succeeds beyond expectations, how will your life look 3 months from now?' },
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
    questions: [
      { id: 'injury_details', textHe: 'במשפט אחד, מהי הפציעה או הטראומה העיקרית שמביאה אותך לטיפול היום?', textEn: 'What is the main injury or trauma that brings you to treatment today?' },
      { id: 'pain_quality', textHe: 'כיצד היית מתאר/ת את הכאב? האם הוא חד ודוקר, עמום ולוחץ, או שורף?', textEn: 'How would you describe the pain? Is it sharp and stabbing, dull and pressing, or burning?' },
      { id: 'night_pain', textHe: 'האם הכאב מחמיר באופן משמעותי בלילה, או אפילו מעיר אותך משינה?', textEn: 'Does the pain significantly worsen at night, or even wake you from sleep?' },
      { id: 'weather', textHe: 'האם את/ה מרגיש/ה החמרה בכאב או בנוקשות כשמזג האוויר משתנה?', textEn: 'Do you feel worsening pain or stiffness when the weather changes?' },
      { id: 'swelling', textHe: 'האם יש נפיחות נראית לעין, בצקת או תחושת "מלאות" באזור הפגוע?', textEn: 'Is there visible swelling, edema, or a feeling of "fullness" in the affected area?' },
      { id: 'movement', textHe: 'האם הכאב מחמיר בתחילת תנועה ומשתפר לאחר "חימום", או שהוא מחמיר ככל שאת/ה פעיל/ה יותר?', textEn: 'Does the pain worsen at the start of movement and improve after warming up?' },
      { id: 'stiffness', textHe: 'האם את/ה סובל/ת מנוקשות שמגבילה את טווח התנועה?', textEn: 'Do you suffer from stiffness that limits your range of motion?' },
      { id: 'temperature', textHe: 'האם המקום הפגוע מרגיש חם למגע ואדום, או קר ונוטה להכחיל?', textEn: 'Does the affected area feel hot to the touch and red, or cold and tends to turn blue?' },
      { id: 'nerve_pain', textHe: 'האם יש תחושת נימול, הירדמות, או זרמים חשמליים המקרינים מהאזור הפגוע לגפיים?', textEn: 'Is there numbness, tingling, or electrical currents radiating from the affected area?' },
      { id: 'posture', textHe: 'האם הכאב קשור לתנוחת עבודה (ישיבה ממושכת מול מחשב, עמידה על הרגליים)?', textEn: 'Is the pain related to work posture?' },
      { id: 'stress_pain', textHe: 'האם הכאב מוחמר בתקופות של מתח רגשי או עומס נפשי?', textEn: 'Is the pain exacerbated during periods of emotional stress?' },
      { id: 'history', textHe: 'האם הכאב הנוכחי קשור לטראומה ישנה (תאונת דרכים, נפילה מלפני שנים) שמעולם לא טופלה כראוי?', textEn: 'Is the current pain related to old trauma that was never properly treated?' },
      { id: 'medications', textHe: 'אילו תרופות או משככי כאבים את/ה נוטל/ת באופן קבוע, ומה רמת ההקלה שהם מספקים?', textEn: 'What medications or painkillers do you take regularly, and how much relief do they provide?' },
      { id: 'therapies_tried', textHe: 'אילו טיפולים ניסית בעבר לבעיה זו (פיזיותרפיה, כירופרקטיקה, הזרקות)?', textEn: 'What treatments have you tried in the past?' },
      { id: 'goal', textHe: 'מהי הפעולה הספציפית שתרצה/י לחזור לעשות ללא כאב?', textEn: 'What is the specific action you would like to return to doing without pain?' },
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
    questions: [
      { id: 'focus', textHe: 'האם קשה לך להתרכז במשימה אחת לאורך זמן, או שדעתך מוסחת בקלות (תחושת "ערפל")?', textEn: 'Is it difficult for you to concentrate on one task for a long time?' },
      { id: 'memory', textHe: 'האם את/ה שם/ה לב לירידה בזיכרון לטווח קצר, או קושי לשלוף מילים?', textEn: 'Do you notice a decline in memory or difficulty retrieving words?' },
      { id: 'decisions', textHe: 'האם את/ה מתקשה לקבל החלטות, ולעיתים קרובות מרגיש/ה "שיתוק" מול אפשרויות?', textEn: 'Do you have difficulty making decisions, and often feel paralyzed when facing options?' },
      { id: 'overthinking', textHe: 'האם המחשבות שלך נוטות "לרוץ במעגלים" סביב אותו נושא, במיוחד לפני השינה?', textEn: 'Do your thoughts tend to run in circles around the same topic, especially before sleep?' },
      { id: 'burnout', textHe: 'האם את/ה חווה תשישות מנטלית, כאילו המוח "מלא" ולא מסוגל לקלוט מידע חדש?', textEn: 'Do you experience mental exhaustion, as if the brain is full and unable to absorb new information?' },
      { id: 'pressure', textHe: 'כיצד את/ה מגיב/ה לדד-ליין או ללחץ? האם את/ה נכנס/ת לחרדה וקיפאון, או פועל/ת?', textEn: 'How do you respond to deadlines or pressure? Do you get anxious and freeze, or take action?' },
      { id: 'motivation', textHe: 'האם יש לך רעיונות ורצונות, אך חסר לך ה"דרייב" (הכוח המניע) כדי להתחיל ולבצע?', textEn: 'Do you have ideas and desires, but lack the drive to start and execute?' },
      { id: 'creativity', textHe: 'האם את/ה מרגיש/ה חסום/ה יצירתית, ללא השראה או "זרימה"?', textEn: 'Do you feel creatively blocked, without inspiration or flow?' },
      { id: 'sensitivity', textHe: 'האם את/ה רגיש/ה מאוד לרעשים חזקים, המונים, או למצבי רוח של אנשים אחרים?', textEn: 'Are you very sensitive to loud noises, crowds, or the moods of other people?' },
      { id: 'irritability', textHe: 'האם את/ה מאבד/ת סבלנות מהר או מתרגז/ת בקלות כשדברים לא מסתדרים?', textEn: 'Do you lose patience quickly or get easily irritated when things do not work out?' },
      { id: 'confidence', textHe: 'האם את/ה חווה ספק עצמי לעיתים קרובות, או תחושה שאת/ה "לא מספיק טוב/ה"?', textEn: 'Do you often experience self-doubt, or a feeling that you are not good enough?' },
      { id: 'clarity', textHe: 'האם בבוקר המוח שלך צלול, או שאת/ה מתעורר/ת עם תחושת כבדות וערפל?', textEn: 'Is your mind clear in the morning, or do you wake up with a feeling of heaviness and fog?' },
      { id: 'adaptability', textHe: 'האם קשה לך להתמודד עם שינויים בלתי צפויים בתוכניות?', textEn: 'Is it difficult for you to cope with unexpected changes in plans?' },
      { id: 'social_battery', textHe: 'האם אינטראקציה חברתית ממושכת מרוקנת אותך מאנרגיה מנטלית?', textEn: 'Does prolonged social interaction drain you of mental energy?' },
      { id: 'goal', textHe: 'מהו הכוח המנטלי שהכי היית רוצה לחזק? (מיקוד, רוגע, זיכרון, או ביטחון עצמי)', textEn: 'What mental strength would you most like to strengthen?' },
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
    questions: [
      { id: '1', textHe: 'האם את/ה מרגיש/ה שינויים פיזיים בגוף (כאבי ראש, מפרקים, עייפות) עוד לפני שמזג האוויר משתנה בחוץ?', textEn: 'Do you feel physical changes in your body before the weather changes outside?' },
      { id: '2', textHe: 'האם את/ה סובל/ת יותר בחום הקיץ או בקור החורף?', textEn: 'Do you suffer more in summer heat or winter cold?' },
      { id: '3', textHe: 'בימים לחים ודביקים, האם את/ה מרגיש/ה תחושת "משקולת" על הגוף, נפיחות או ערפל מחשבתי?', textEn: 'On humid days, do you feel heaviness, bloating, or brain fog?' },
      { id: '4', textHe: 'האם חשיפה לרוח חזקה או למזגן ישיר גורמת לך לכאבי ראש, צוואר תפוס או צינון מיידי?', textEn: 'Does exposure to strong wind or direct AC cause headaches or stiff neck?' },
      { id: '5', textHe: 'האם את/ה נוטה לסבול מיובש קיצוני (עור סדוק, צמא תמידי, שיעול יבש) בסביבות ממוזגות?', textEn: 'Do you suffer from extreme dryness in air-conditioned environments?' },
      { id: '6', textHe: 'האם כאבי הראש שלך מופיעים בעיקר כשחם מאוד או כשיש לחץ ברומטרי נמוך/סופות?', textEn: 'Do your headaches appear mainly in hot weather or during storms?' },
      { id: '7', textHe: 'האם את/ה חווה קשיי נשימה או החמרה באלרגיות בעונות מעבר?', textEn: 'Do you experience breathing difficulties during seasonal transitions?' },
      { id: '8', textHe: 'האם המפרקים שלך "נוקשים" וכואבים יותר בימים גשומים וקרים?', textEn: 'Are your joints stiffer and more painful on cold, rainy days?' },
      { id: '9', textHe: 'האם את/ה סובל/ת משלשולים או חוסר נוחות בבטן בקיץ או מכאבי בטן בחורף?', textEn: 'Do you suffer from digestive issues that change with seasons?' },
      { id: '10', textHe: 'האם העור שלך מגיב בפריחות מגרדות בחום או באקזמה וסדקים בקור?', textEn: 'Does your skin react with rashes in heat or eczema in cold?' },
      { id: '11', textHe: 'האם את/ה מתקשה להתעורר או לתפקד בימים אפורים וחסרי שמש?', textEn: 'Do you have difficulty functioning on gray, sunless days?' },
      { id: '12', textHe: 'האם את/ה מרגיש/ה מיובש/ת באופן כרוני למרות שתייה מרובה, או שאת/ה צובר/ת נוזלים בקלות?', textEn: 'Do you feel chronically dehydrated or easily retain fluids?' },
      { id: '13', textHe: 'האם השינה שלך מופרעת יותר בלילות חמים או שאת/ה מתעורר/ת מקור?', textEn: 'Is your sleep more disturbed on hot nights or do you wake from cold?' },
      { id: '14', textHe: 'כשאת/ה טס/ה או משנה סביבה גיאוגרפית, האם לוקח לגוף שלך זמן רב "להתאפס"?', textEn: 'Does it take a long time for your body to adjust to new environments?' },
      { id: '15', textHe: 'אם הטיפול יכול לעזור לך להתמודד עם עונה אחת בלבד בצורה מושלמת – איזו עונה הכי קשה לך כיום?', textEn: 'Which season is most difficult for you currently?' },
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
    questions: [
      { id: '1', textHe: 'האם את/ה מרגיש/ה שהאנרגיה שלך נגמרת בשעות הצהריים, או שיש לך כוח יציב לאורך כל היום?', textEn: 'Does your energy run out midday, or do you have stable strength all day?' },
      { id: '2', textHe: 'האם את/ה מתעורר/ת מספר פעמים בלילה, או מתקשה לחזור לישון לפנות בוקר?', textEn: 'Do you wake up multiple times at night or have difficulty returning to sleep?' },
      { id: '3', textHe: 'האם חל שינוי בתחושת הטמפרטורה שלך לאחרונה – גלי חום פתאומיים, או תחושת קור עמוקה?', textEn: 'Have you noticed temperature changes - hot flashes or deep cold?' },
      { id: '4', textHe: 'האם את/ה מרגיש/ה ירידה בחדות הזיכרון לטווח קצר, או קושי לשלוף מילים?', textEn: 'Do you feel a decline in short-term memory or difficulty retrieving words?' },
      { id: '5', textHe: 'כשאת/ה חולה או מבצע/ת מאמץ פיזי, האם לגוף לוקח זמן רב יותר לחזור לעצמו?', textEn: 'Does your body take longer to recover from illness or physical exertion?' },
      { id: '6', textHe: 'האם את/ה סובל/ת מנוקשות בוקר במפרקים שמשתחררת רק אחרי תנועה וחימום?', textEn: 'Do you suffer from morning stiffness in joints that releases after movement?' },
      { id: '7', textHe: 'האם את/ה סובל/ת לעיתים מסחרחורות, טינטון או תחושת "לחץ" וכבדות בראש?', textEn: 'Do you sometimes suffer from dizziness, tinnitus, or feeling of pressure in the head?' },
      { id: '8', textHe: 'האם יש תחושת כבדות או נפיחות בבטן גם אחרי ארוחות קטנות וקלות?', textEn: 'Do you feel heaviness or bloating even after small meals?' },
      { id: '9', textHe: 'האם את/ה מרגיש/ה נימול או הירדמות של הגפיים בזמן מנוחה או בשינה?', textEn: 'Do you feel numbness or tingling in limbs during rest or sleep?' },
      { id: '10', textHe: 'האם ישנו כאב קבוע המלווה אותך ומחמיר במזג אוויר קר או לח?', textEn: 'Is there chronic pain that worsens in cold or damp weather?' },
      { id: '11', textHe: 'האם השינויים בחיים (ילדים עוזבים, פרישה) מעוררים בך תחושת חופש ושמחה, או ריקנות וחרדה?', textEn: 'Do life changes evoke feelings of freedom or emptiness and anxiety?' },
      { id: '12', textHe: 'האם את/ה מוצא/ת את עצמך חסר/ת סבלנות או נוטה למצבי רוח דכדוכיים?', textEn: 'Do you find yourself more impatient or prone to depressive moods?' },
      { id: '13', textHe: 'האם את/ה נוטל/ת מספר תרופות מרשם באופן קבוע?', textEn: 'Do you take multiple prescription medications regularly?' },
      { id: '14', textHe: 'האם את/ה סובל/ת מיובש טורדני – בעיניים, בפה, בעור או בריריות?', textEn: 'Do you suffer from bothersome dryness in eyes, mouth, skin, or mucous membranes?' },
      { id: '15', textHe: 'מהו הדבר האחד שתרצה/י להמשיך לעשות ב-10 השנים הבאות ללא הגבלה?', textEn: 'What is the one thing you want to continue doing in the next 10 years without limitation?' },
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
    questions: [
      { id: 'illness_frequency', textHe: 'באיזו תדירות את/ה חולה במהלך השנה? האם את/ה מרגיש/ה שאת/ה "תופס/ת" כל וירוס?', textEn: 'How often do you get sick during the year?' },
      { id: 'response_to_symptoms', textHe: 'כשאת/ה מרגיש/ה סימנים ראשונים של מחלה, האם את/ה עוצר/ת ונח/ה, או ממשיך/ה בשגרה?', textEn: 'When you feel first signs of illness, do you rest or continue as usual?' },
      { id: 'recovery_speed', textHe: 'כאשר את/ה חולה, כמה זמן לוקח לך להחלים לחלוטין ולחזור לאנרגיה מלאה?', textEn: 'When sick, how long does it take you to fully recover?' },
      { id: 'exposure', textHe: 'האם את/ה חשוף/ה באופן קבוע לאנשים חולים (עבודה בבית ספר, בית חולים)?', textEn: 'Are you regularly exposed to sick people?' },
      { id: 'temperature', textHe: 'האם את/ה נוטה לסבול מקור, במיוחד בידיים וברגליים, או צמרמורות בקלות?', textEn: 'Do you tend to suffer from cold, especially in hands and feet?' },
      { id: 'sleep_immunity', textHe: 'האם את/ה שם/ה לב שחוסר שינה או תקופות עמוסות מובילים כמעט מייד למחלה?', textEn: 'Do you notice that lack of sleep leads almost immediately to illness?' },
      { id: 'exercise', textHe: 'האם את/ה נוטה לחזור לפעילות גופנית מאומצת מיד כשאת/ה מרגיש/ה מעט יותר טוב?', textEn: 'Do you return to strenuous exercise immediately when feeling better?' },
      { id: 'morning_symptoms', textHe: 'האם את/ה מתעורר/ת בבוקר עם גודש באף, ליחה בגרון או התעטשויות?', textEn: 'Do you wake up with nasal congestion, phlegm, or sneezing?' },
      { id: 'digestion', textHe: 'האם שינויים בתזונה (סוכר או מוצרי חלב) משפיעים לרעה על מערכת הנשימה שלך?', textEn: 'Do dietary changes negatively affect your respiratory system?' },
      { id: 'stress_pattern', textHe: 'האם את/ה חולה לעיתים קרובות דווקא בסופי שבוע או בחופשות (כשמפלס הלחץ יורד)?', textEn: 'Do you often get sick on weekends or vacations?' },
      { id: 'chronic_cough', textHe: 'האם יש לך נטייה לשיעול מתמשך שנשאר שבועות אחרי שהצינון חלף?', textEn: 'Do you tend to have a persistent cough after a cold?' },
      { id: 'household', textHe: 'האם יש ילדים קטנים בבית ש"מביאים" וירוסים מהגן/בית ספר באופן קבוע?', textEn: 'Are there young children at home who bring viruses regularly?' },
      { id: 'hydration', textHe: 'האם את/ה מקפיד/ה על שתייה מספקת במהלך היום, או שאת/ה נוטה לשכוח לשתות?', textEn: 'Do you make sure to drink enough during the day?' },
      { id: 'seasons', textHe: 'האם יש עונה מסוימת בשנה שבה הבריאות שלך תמיד מתערערת?', textEn: 'Is there a specific season when your health always deteriorates?' },
      { id: 'goal', textHe: 'מהי המטרה העיקרית שלך בחיזוק המערכת החיסונית?', textEn: 'What is your main goal in strengthening your immune system?' },
    ]
  },
  {
    id: 'nourishing_life',
    name: 'הזנת החיים (תזונה)',
    nameEn: 'Nourishing Life (Nutrition)',
    icon: Utensils,
    color: 'text-lime-500',
    bgColor: 'bg-lime-500/10',
    borderColor: 'border-lime-500/20',
    questions: [
      { id: 'challenge', textHe: 'במשפט אחד, מהו האתגר התזונתי הגדול ביותר שלך כיום?', textEn: 'What is your biggest nutritional challenge today?' },
      { id: 'breakfast', textHe: 'האם את/ה אוכל/ת ארוחת בוקר? אם כן, האם היא חמה או קרה?', textEn: 'Do you eat breakfast? Is it warm or cold?' },
      { id: 'timing', textHe: 'האם את/ה נוהג/ת לאכול ארוחות כבדות בשעות המאוחרות של הלילה?', textEn: 'Do you tend to eat heavy meals late at night?' },
      { id: 'temperature', textHe: 'מהי העדפת המזון שלך? מזון נא/קר או מזון מבושל וחם?', textEn: 'Do you mainly eat raw/cold food or cooked and warm food?' },
      { id: 'energy_drop', textHe: 'האם את/ה מרגיש/ה "צניחת אנרגיה" וצורך לישון מיד לאחר האוכל?', textEn: 'Do you feel an energy drop and need to sleep immediately after eating?' },
      { id: 'bloating', textHe: 'האם את/ה סובל/ת מנפיחות בבטן, גזים או תחושת "בלון" שמתגברת במהלך היום?', textEn: 'Do you suffer from bloating that intensifies during the day?' },
      { id: 'hydration', textHe: 'האם את/ה מעדיף/ה לשתות מים קפואים/קרים מאוד, או משקאות חמים/פושרים?', textEn: 'Do you prefer icy water or warm/lukewarm drinks?' },
      { id: 'sweet_cravings', textHe: 'האם יש לך צורך עז במתוקים או בפחמימות, במיוחד בשעות אחר הצהריים?', textEn: 'Do you have strong cravings for sweets or carbohydrates?' },
      { id: 'salt_spice', textHe: 'האם את/ה מוצא/ת את עצמך ממליח/ה את האוכל בצורה מוגזמת, או מחפש/ת טעמים חריפים?', textEn: 'Do you over-salt food or seek spicy flavors?' },
      { id: 'dairy', textHe: 'האם צריכת מוצרי חלב גורמת לך לליחה, נזלת או אי-נוחות בבטן?', textEn: 'Does dairy consumption cause mucus or abdominal discomfort?' },
      { id: 'raw_veg', textHe: 'האם אכילת סלט גדול או ירקות חיים גורמת לך לכאבי בטן או ליציאות רכות?', textEn: 'Does eating raw vegetables cause stomach pain or loose stools?' },
      { id: 'appetite', textHe: 'האם את/ה חווה רעב תמידי שלא יודע שובע, או חוסר תיאבון מוחלט?', textEn: 'Do you experience constant hunger or complete lack of appetite?' },
      { id: 'emotions', textHe: 'האם את/ה נוטה לפנות לאוכל מנחם בזמנים של מתח, עצב או שעמום?', textEn: 'Do you turn to comfort eating during stress or boredom?' },
      { id: 'caffeine', textHe: 'כמה כוסות קפה את/ה שותה ביום? האם את/ה מרגיש/ה שבלעדיו המערכת לא מתפקדת?', textEn: 'How many cups of coffee do you drink? Do you feel you can\'t function without it?' },
      { id: 'one_change', textHe: 'אם היית יכול/ה לשנות הרגל תזונתי אחד בלבד שישפר את בריאותך, מה הוא היה?', textEn: 'If you could change one nutritional habit, what would it be?' },
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
    questions: [
      { id: 'kidney_yang_etiology', textHe: 'מהי האטיולוגיה המרכזית לחוסר יאנג בכליות?', textEn: 'What is the main etiology of Kidney Yang Deficiency?' },
      { id: 'spleen_qi_vs_yang', textHe: 'אילו סימפטומים מבדילים בין חוסר צ\'י בטחול לבין חוסר יאנג בטחול?', textEn: 'What symptoms differentiate Spleen Qi Deficiency from Spleen Yang Deficiency?' },
      { id: 'liver_qi_fire', textHe: 'מהו עקרון הטיפול המדויק לסטגנציה של צ\'י הכבד שהפכה לאש?', textEn: 'What is the treatment principle for Liver Qi Stagnation transformed into Fire?' },
      { id: 'tinnitus_pattern', textHe: 'האם טיניטוס המופיע בקובץ שייך לסינדרום עודף או חוסר?', textEn: 'Does tinnitus belong to an Excess or Deficiency syndrome?' },
      { id: 'heart_blood_sleep', textHe: 'מה הקשר בין "חוסר דם בלב" לבין הפרעות שינה?', textEn: 'What is the connection between Heart Blood Deficiency and sleep disorders?' },
      { id: 'damp_heat_lower', textHe: 'כיצד מתבטא "חום ולחות במחמם התחתון" אצל גברים לעומת נשים?', textEn: 'How does Damp-Heat in Lower Jiao manifest in men vs women?' },
      { id: 'liver_wind_signs', textHe: 'מנה שלושה סימני מפתח לזיהוי "רוח פנימית של הכבד".', textEn: 'List three key signs for identifying Internal Liver Wind.' },
      { id: 'phlegm_mist_vs_fire', textHe: 'מה ההבדל באבחנה בין ליחה-אל-חומרית לבין ליחה-אש בלב?', textEn: 'What is the diagnostic difference between Phlegm-Mist and Phlegm-Fire in Heart?' },
      { id: 'worry_organs', textHe: 'כיצד משפיע רגש ה"דאגה" על הטחול והריאות?', textEn: 'How does Worry affect the Spleen and Lungs?' },
      { id: 'cold_uterus', textHe: 'מהי הפתולוגיה של "קור ברחם" וכיצד היא משפיעה על הפוריות?', textEn: 'What is the pathology of Cold in the Uterus and its effect on fertility?' },
      { id: 'qi_sinking', textHe: 'ציין את הסימנים הקליניים של "צניחת צ\'י" (Qi Sinking).', textEn: 'List the clinical signs of Qi Sinking.' },
      { id: 'lung_dryness_vs_yin', textHe: 'כיצד נבדיל בין יובש בריאות לבין חוסר יין בריאות?', textEn: 'How do we differentiate between Lung Dryness and Lung Yin Deficiency?' },
      { id: 'liver_stomach_disharmony', textHe: 'מהם הביטויים של "דיסהרמוניה בין הכבד לקיבה"?', textEn: 'What are the manifestations of Disharmony between Liver and Stomach?' },
      { id: 'spleen_dampness_factors', textHe: 'אילו מזונות או הרגלים מחמירים את "לחות בטחול"?', textEn: 'Which foods or habits worsen Spleen Dampness?' },
      { id: 'liver_yang_rising_headache', textHe: 'מהו ההסבר הפתולוגי לכאבי ראש על רקע "עליית יאנג הכבד"?', textEn: 'What is the pathological explanation for headaches due to Liver Yang Rising?' },
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
    questions: [
      { id: '1', textHe: 'מהי ה"אנרגיה העמוקה" של מרידיאן הריאות?', textEn: 'What is the Deep Energy of the Lung meridian?' },
      { id: '2', textHe: 'מהי נקודת ההשפעה הטובה ביותר לבעיות גידים?', textEn: 'What is the best Influence Point for tendon problems?' },
      { id: '3', textHe: 'מהו המיקום המדויק ואזהרות הבטיחות לדיקור ב-BL-1?', textEn: 'What is the exact location and safety warnings for BL-1?' },
      { id: '4', textHe: 'אילו נקודות נחשבות ל"נקודות ים" (He-Sea) ומה תפקידן העיקרי?', textEn: 'Which points are considered He-Sea points and what is their main function?' },
      { id: '5', textHe: 'איזה שילוב נקודות מומלץ לחיזוק ה-Wei Qi (מערכת החיסון)?', textEn: 'What point combination is recommended for strengthening Wei Qi?' },
      { id: '6', textHe: 'מהי המשמעות האנרגטית של השם של נקודה ST-36?', textEn: 'What is the energetic meaning of the name of ST-36?' },
      { id: '7', textHe: 'אילו נקודות אסורות לדיקור בהריון?', textEn: 'Which points are forbidden during pregnancy?' },
      { id: '8', textHe: 'מהן חמש נקודות ה-Shu העתיקות של מרידיאן הכליות?', textEn: 'What are the five ancient Shu points of the Kidney meridian?' },
      { id: '9', textHe: 'כיצד משתמשים בנקודות ה-Luo כדי לטפל ברגשות?', textEn: 'How are Luo points used to treat emotions?' },
      { id: '10', textHe: 'מהי הנקודה הטובה ביותר להורדת יאנג הכבד במצבי מיגרנה?', textEn: 'What is the best point for lowering Liver Yang in migraines?' },
      { id: '11', textHe: 'מהו התפקיד הייחודי של נקודת המקור של הלב (HT-7)?', textEn: 'What is the unique function of the Heart Yuan point HT-7?' },
      { id: '12', textHe: 'אילו נקודות מומלצות לטיפול בבחילות והקאות?', textEn: 'Which points are recommended for treating nausea and vomiting?' },
      { id: '13', textHe: 'כיצד משתמשים בנקודות Xi-Cleft במצבי חירום או כאב חריף?', textEn: 'How are Xi-Cleft points used in emergencies or acute pain?' },
      { id: '14', textHe: 'מהי השפעת נקודת GB-34 על השרירים והגידים?', textEn: 'What is the effect of GB-34 on muscles and tendons?' },
      { id: '15', textHe: 'אילו נקודות משמשות לפתיחת 7 פתחי החושים?', textEn: 'Which points are used to open the 7 sense orifices?' },
    ]
  },
  {
    id: 'clinical_navigation',
    name: 'ניווט קליני TCM',
    nameEn: 'TCM Clinical Navigation',
    icon: Compass,
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/20',
    questions: [
      { id: '1', textHe: 'מהם הסימנים המבדילים בין חוסר יין לחוסר יאנג בכליות?', textEn: 'What are the distinguishing signs between Kidney Yin and Yang Deficiency?' },
      { id: '2', textHe: 'כיצד מבחינים בין סטגנציה של צ\'י הכבד לבין עליית יאנג הכבד?', textEn: 'How do we differentiate between Liver Qi Stagnation and Liver Yang Rising?' },
      { id: '3', textHe: 'איזו אסטרטגיה טיפולית מתאימה למצב של לחות-חמה בטחול?', textEn: 'What treatment strategy is appropriate for Damp-Heat in Spleen?' },
      { id: '4', textHe: 'מהן הנקודות היעילות ביותר להרגעת הנפש (Shen)?', textEn: 'What are the most effective points for calming the Shen?' },
      { id: '5', textHe: 'כיצד משפיע מעגל הבקרה (Ke Cycle) על פתולוגיות בין הכבד לטחול?', textEn: 'How does the Ko Cycle affect Liver-Spleen pathologies?' },
      { id: '6', textHe: 'מה הקשר בין הריאות לכליות בתהליך הנשימה (עיגון הצ\'י)?', textEn: 'What is the connection between Lungs and Kidneys in respiration (Qi anchoring)?' },
      { id: '7', textHe: 'אילו נקודות דיקור מחזקות את ה-Wei Qi (מערכת החיסון)?', textEn: 'Which acupuncture points strengthen Wei Qi?' },
      { id: '8', textHe: 'מה ההבדל באבחנת דופק בין חוסר דם לסטגנציה של דם?', textEn: 'What is the pulse difference between Blood Deficiency and Blood Stasis?' },
      { id: '9', textHe: 'כיצד משתקפת חולשת צ\'י הטחול באבחנת הלשון (סימני שיניים)?', textEn: 'How does Spleen Qi weakness manifest in tongue diagnosis (teeth marks)?' },
      { id: '10', textHe: 'מהם התפקידים העיקריים של ה-San Jiao (המחמם המשולש)?', textEn: 'What are the main functions of the San Jiao (Triple Burner)?' },
      { id: '11', textHe: 'מה ההבדל בין Zong Qi (צ\'י בית החזה) ל-Yuan Qi (צ\'י מקורי)?', textEn: 'What is the difference between Zong Qi and Yuan Qi?' },
      { id: '12', textHe: 'מהו הטיפול המומלץ לסילוק "רוח חיצונית" (התקררות)?', textEn: 'What is the recommended treatment for expelling External Wind (common cold)?' },
      { id: '13', textHe: 'הסבר את הקשר בין הלב לבין ההזעה על פי הרפואה הסינית.', textEn: 'Explain the connection between Heart and sweating in TCM.' },
      { id: '14', textHe: 'כיצד מטפלים בכאב בטן על רקע קור בקיבה (נקודות מומלצות)?', textEn: 'How to treat abdominal pain due to Cold in Stomach?' },
      { id: '15', textHe: 'מהם "שלושת האוצרות" (Jing, Qi, Shen) וכיצד הם משפיעים על האבחנה?', textEn: 'What are the Three Treasures and how do they affect diagnosis?' },
    ]
  },
];

interface HebrewTopicQuestionsDialogProps {
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
}

export function HebrewTopicQuestionsDialog({
  onSelectQuestion,
  disabled = false,
}: HebrewTopicQuestionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSelectQuestion = (question: string) => {
    onSelectQuestion(question);
    setOpen(false);
  };

  // Filter questions based on search
  const filteredData = questionnairesData.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q =>
      q.textHe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.textEn.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => searchTerm === '' || cat.questions.length > 0);

  const totalQuestions = questionnairesData.reduce((acc, cat) => acc + cat.questions.length, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="gap-2 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border-violet-500/30 hover:from-violet-500/20 hover:to-indigo-500/20"
        >
          <MessageCircleQuestion className="h-4 w-4 text-violet-600" />
          <span className="font-medium">שאלות לפי נושאים</span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {questionnairesData.length}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0" dir="rtl">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <MessageCircleQuestion className="h-5 w-5 text-violet-600" />
            שאלות לפי נושאים
            <Badge variant="outline" className="mr-2">
              {totalQuestions} שאלות ב-{questionnairesData.length} נושאים
            </Badge>
          </DialogTitle>
          <div className="relative mt-2">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="חיפוש שאלות..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh]">
          <div className="p-4 space-y-2">
            {filteredData.map((category) => {
              const isExpanded = expandedCategories.includes(category.id);
              const Icon = category.icon;
              
              return (
                <Collapsible
                  key={category.id}
                  open={isExpanded}
                  onOpenChange={() => toggleCategory(category.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between p-3 h-auto",
                        category.bgColor,
                        category.borderColor,
                        "border hover:opacity-80"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("h-5 w-5", category.color)} />
                        <div className="text-right">
                          <p className="font-medium text-sm">{category.name}</p>
                          <p className="text-xs text-muted-foreground">{category.nameEn}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {category.questions.length}
                        </Badge>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1">
                    <div className="space-y-1 pr-4 border-r-2 border-muted mr-4">
                      {category.questions.map((question, idx) => (
                        <Button
                          key={question.id}
                          variant="ghost"
                          className="w-full justify-start text-right h-auto py-2 px-3 hover:bg-muted/50"
                          onClick={() => handleSelectQuestion(question.textHe)}
                        >
                          <span className="text-xs text-muted-foreground ml-2 shrink-0">
                            {idx + 1}.
                          </span>
                          <span className="text-sm leading-relaxed line-clamp-2">
                            {question.textHe}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

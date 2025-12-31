// Bible Video Session Guide - Scripts & Data
// 6-Phase Session Structure for First-Time Patient Consultations

export interface PhaseItem {
  id: string;
  title: string;
  titleHe: string;
  script?: string;
  scriptHe?: string;
  tips?: string[];
  tipsHe?: string[];
  type: 'script' | 'action' | 'demo' | 'question' | 'checkpoint';
}

export interface SessionPhase {
  id: string;
  name: string;
  nameHe: string;
  startMinute: number;
  endMinute: number;
  color: string;
  icon: string;
  description: string;
  descriptionHe: string;
  items: PhaseItem[];
}

export interface ObjectionScript {
  id: string;
  objection: string;
  objectionHe: string;
  category: 'fear' | 'cost' | 'time' | 'skepticism' | 'other';
  response: string;
  responseHe: string;
  followUp?: string;
  followUpHe?: string;
}

export interface SuccessRate {
  condition: string;
  conditionHe: string;
  successRate: string;
  sessions: string;
  evidence: string;
}

export interface BodyLanguageSign {
  sign: string;
  signHe: string;
  meaning: 'positive' | 'resistance' | 'red_flag';
  action: string;
  actionHe: string;
}

// Success Rate Database
export const SUCCESS_RATES: SuccessRate[] = [
  { condition: 'Chronic Pain', conditionHe: 'כאב כרוני', successRate: '75-85%', sessions: '8-12', evidence: 'JAMA 2018, NIH 2020' },
  { condition: 'Migraine', conditionHe: 'מיגרנה', successRate: '70-80%', sessions: '10-15', evidence: 'Cochrane 2016' },
  { condition: 'Anxiety/Depression', conditionHe: 'חרדה/דיכאון', successRate: '65-75%', sessions: '12-16', evidence: 'WHO Guidelines' },
  { condition: 'Insomnia', conditionHe: 'נדודי שינה', successRate: '80-90%', sessions: '6-10', evidence: 'Sleep Medicine 2019' },
  { condition: 'Nausea (Chemo/Pregnancy)', conditionHe: 'בחילות', successRate: '85-95%', sessions: '3-6', evidence: 'Highest Evidence - NIH' },
  { condition: 'Back Pain', conditionHe: 'כאבי גב', successRate: '70-85%', sessions: '6-12', evidence: 'NICE Guidelines UK' },
  { condition: 'Headache', conditionHe: 'כאבי ראש', successRate: '65-80%', sessions: '8-12', evidence: 'Neurology 2017' },
  { condition: 'Stress', conditionHe: 'לחץ', successRate: '75-85%', sessions: '6-10', evidence: 'Acupuncture in Medicine 2018' },
];

// Body Language Monitoring Guide
export const BODY_LANGUAGE_SIGNS: BodyLanguageSign[] = [
  // Positive Signs
  { sign: 'Leaning forward', signHe: 'נשען קדימה', meaning: 'positive', action: 'Good engagement - move toward closing', actionHe: 'מעורבות טובה - התקדם לסגירה' },
  { sign: 'Nodding frequently', signHe: 'מהנהן בראש', meaning: 'positive', action: 'They agree - reinforce points', actionHe: 'הם מסכימים - חזק את הנקודות' },
  { sign: 'Asking about scheduling', signHe: 'שואל על תורים', meaning: 'positive', action: 'Strong buying signal - offer options', actionHe: 'סימן קנייה חזק - הצע אפשרויות' },
  { sign: 'Taking notes', signHe: 'רושם הערות', meaning: 'positive', action: 'Very interested - provide details', actionHe: 'מאוד מעוניין - ספק פרטים' },
  { sign: 'Relaxed posture', signHe: 'ישיבה רגועה', meaning: 'positive', action: 'Comfortable - build rapport', actionHe: 'נוח - בנה אמון' },
  
  // Resistance Signs
  { sign: 'Crossed arms', signHe: 'ידיים שלובות', meaning: 'resistance', action: 'Slow down, ask open questions', actionHe: 'האט, שאל שאלות פתוחות' },
  { sign: 'Looking away', signHe: 'מביט הצידה', meaning: 'resistance', action: 'Re-engage with personal story', actionHe: 'חזור לעניין עם סיפור אישי' },
  { sign: 'Short answers', signHe: 'תשובות קצרות', meaning: 'resistance', action: 'Ask about concerns directly', actionHe: 'שאל על חששות ישירות' },
  { sign: 'Checking phone', signHe: 'בודק טלפון', meaning: 'resistance', action: 'Ask if they need a break', actionHe: 'שאל אם צריכים הפסקה' },
  { sign: 'Mentioning other priorities', signHe: 'מזכיר עניינים אחרים', meaning: 'resistance', action: 'Acknowledge, refocus gently', actionHe: 'הכר בכך, חזור בעדינות' },
  
  // Red Flags - Do NOT Proceed
  { sign: 'Pressure from off-camera person', signHe: 'לחץ מאדם מחוץ למצלמה', meaning: 'red_flag', action: 'STOP - offer to reschedule when alone', actionHe: 'עצור - הצע לתאם כשיהיו לבד' },
  { sign: 'Severe anxiety symptoms', signHe: 'תסמיני חרדה חמורים', meaning: 'red_flag', action: 'STOP - suggest they consult doctor first', actionHe: 'עצור - הצע להתייעץ עם רופא' },
  { sign: 'Unrealistic expectations', signHe: 'ציפיות לא ריאליות', meaning: 'red_flag', action: 'STOP - clarify limitations firmly', actionHe: 'עצור - הבהר מגבלות בנחישות' },
  { sign: 'Mentions cancer cure', signHe: 'מזכיר ריפוי סרטן', meaning: 'red_flag', action: 'STOP - explain supportive role only', actionHe: 'עצור - הסבר תפקיד תומך בלבד' },
];

// Objection Handling Scripts
export const OBJECTION_SCRIPTS: ObjectionScript[] = [
  // Fear-based objections
  {
    id: 'fear-needles',
    objection: "I'm scared of needles",
    objectionHe: 'אני מפחד/ת ממחטים',
    category: 'fear',
    response: "I completely understand - that's one of the most common concerns. Let me show you something: acupuncture needles are incredibly thin - about the width of a human hair. They're 25-40 times thinner than the needles used for blood tests. Most patients describe the sensation as a tiny tap or nothing at all. Would you like me to show you one on camera?",
    responseHe: 'אני לגמרי מבין/ה - זה אחד החששות הנפוצים ביותר. תן/י לי להראות לך משהו: מחטי דיקור דקות להפליא - בערך כעובי שערה. הן 25-40 פעמים דקות יותר ממחטי בדיקת דם. רוב המטופלים מתארים את התחושה כנקישה קלה או בכלל לא מרגישים. האם תרצה שאראה לך אחת במצלמה?',
    followUp: "Also, I always start with just 2-3 needles for first-timers, and we can also try ear seeds - tiny stickers with no needles at all.",
    followUpHe: 'כמו כן, אני תמיד מתחיל עם 2-3 מחטים בלבד למטופלים חדשים, ואפשר גם לנסות זרעי אוזן - מדבקות קטנות בלי מחטים בכלל.'
  },
  {
    id: 'fear-pain',
    objection: "Will it hurt?",
    objectionHe: 'זה יכאב?',
    category: 'fear',
    response: "Great question! Unlike injections, acupuncture needles slide between tissue rather than cutting through. Most patients feel a mild sensation - some describe it as warmth or tingling - which actually means the treatment is working. Many fall asleep during sessions because it's so relaxing.",
    responseHe: 'שאלה מצוינת! בניגוד לזריקות, מחטי דיקור מחליקות בין הרקמות במקום לחתוך. רוב המטופלים מרגישים תחושה עדינה - חום או עקצוץ - שבעצם אומרת שהטיפול עובד. רבים נרדמים במהלך הטיפולים כי זה כל כך מרגיע.'
  },
  {
    id: 'fear-side-effects',
    objection: "What about side effects?",
    objectionHe: 'מה לגבי תופעות לוואי?',
    category: 'fear',
    response: "This is actually one of acupuncture's biggest advantages. Unlike medications that often cause side effects, acupuncture has minimal risks when done by a licensed practitioner. The most common 'side effect' is feeling deeply relaxed! Occasionally there might be a small bruise, which heals quickly.",
    responseHe: 'זה בעצם אחד היתרונות הגדולים של דיקור. בניגוד לתרופות שלעתים גורמות לתופעות לוואי, לדיקור יש סיכונים מינימליים כשנעשה על ידי מטפל מוסמך. תופעת הלוואי הנפוצה ביותר היא הרגשה של רגיעה עמוקה! לפעמים עלולה להופיע חבורה קטנה, שנעלמת במהירות.'
  },
  
  // Cost-based objections
  {
    id: 'cost-expensive',
    objection: "It's too expensive",
    objectionHe: 'זה יקר מדי',
    category: 'cost',
    response: "I hear you, and I want to be upfront about the value. Let's do a quick calculation: if you're spending ₪200-400 per month on painkillers, physical therapy, or other treatments that provide temporary relief, that's ₪2,400-4,800 per year. A course of 8 acupuncture sessions at ₪400 for the starter package often provides lasting relief. Many patients reduce or eliminate their medication costs entirely.",
    responseHe: 'אני שומע אותך, ואני רוצה להיות כנה לגבי הערך. בוא נעשה חישוב מהיר: אם אתה מוציא 200-400 ₪ לחודש על משככי כאבים, פיזיותרפיה, או טיפולים אחרים שנותנים הקלה זמנית, זה 2,400-4,800 ₪ לשנה. קורס של 8 טיפולי דיקור ב-400 ₪ לחבילת הפתיחה לעתים נותן הקלה ארוכת טווח. מטופלים רבים מפחיתים או מבטלים לגמרי את עלויות התרופות.'
  },
  {
    id: 'cost-insurance',
    objection: "Does insurance cover it?",
    objectionHe: 'האם הביטוח מכסה?',
    category: 'cost',
    response: "Great question! Many supplemental health insurance plans in Israel now cover acupuncture - typically 50-80% reimbursement. I can provide you with official receipts for insurance claims. Would you like to check your specific policy? I can also offer flexible payment options.",
    responseHe: 'שאלה מצוינת! הרבה ביטוחים משלימים בישראל מכסים כיום דיקור - בדרך כלל החזר של 50-80%. אני יכול לספק קבלות רשמיות לתביעות ביטוח. האם תרצה לבדוק את הפוליסה הספציפית שלך? אני יכול גם להציע אפשרויות תשלום גמישות.'
  },
  
  // Time-based objections
  {
    id: 'time-busy',
    objection: "I don't have time",
    objectionHe: 'אין לי זמן',
    category: 'time',
    response: "I totally understand how busy life gets. That's actually why many of my patients choose acupuncture - it's a 45-60 minute investment that can save hours of dealing with symptoms. I offer early morning, evening, and weekend appointments. We can also do shorter maintenance sessions once you're feeling better. What times work best for your schedule?",
    responseHe: 'אני לגמרי מבין כמה החיים עמוסים. בעצם זו הסיבה שהרבה מהמטופלים שלי בוחרים בדיקור - זו השקעה של 45-60 דקות שיכולה לחסוך שעות של התמודדות עם תסמינים. אני מציע תורים בבוקר מוקדם, בערב ובסופי שבוע. אפשר גם לעשות טיפולי תחזוקה קצרים יותר אחרי שתרגיש יותר טוב. אילו שעות מתאימות ללוח הזמנים שלך?'
  },
  {
    id: 'time-sessions',
    objection: "How many sessions will I need?",
    objectionHe: 'כמה טיפולים אצטרך?',
    category: 'time',
    response: "It depends on your specific condition. For acute issues, many patients see improvement in 3-4 sessions. Chronic conditions typically need 8-12 sessions for lasting results. I always reassess after 4 sessions so you can see your progress. The good news is that unlike medication, once you feel better, you don't need ongoing treatment - just occasional tune-ups.",
    responseHe: 'זה תלוי במצב הספציפי שלך. לבעיות חריפות, הרבה מטופלים רואים שיפור ב-3-4 טיפולים. מצבים כרוניים בדרך כלל צריכים 8-12 טיפולים לתוצאות ארוכות טווח. אני תמיד עושה הערכה מחדש אחרי 4 טיפולים כדי שתוכל לראות את ההתקדמות. החדשות הטובות הן שבניגוד לתרופות, ברגע שאתה מרגיש טוב יותר, אתה לא צריך טיפול מתמשך - רק כוונונים מדי פעם.'
  },
  
  // Skepticism objections
  {
    id: 'skeptic-work',
    objection: "Does it actually work?",
    objectionHe: 'זה באמת עובד?',
    category: 'skepticism',
    response: "That's a fair question, and I appreciate your skepticism. Let me share some facts: The World Health Organization recognizes acupuncture for over 100 conditions. Research published in JAMA, the most prestigious medical journal, shows it's effective for chronic pain. The NIH in America funds acupuncture research because the evidence is that strong. Would you like me to share some specific studies for your condition?",
    responseHe: 'זו שאלה הוגנת, ואני מעריך את הספקנות שלך. תן לי לשתף כמה עובדות: ארגון הבריאות העולמי מכיר בדיקור ליותר מ-100 מצבים. מחקר שפורסם ב-JAMA, כתב העת הרפואי היוקרתי ביותר, מראה שהוא יעיל לכאב כרוני. ה-NIH באמריקה ממן מחקרי דיקור כי הראיות כל כך חזקות. האם תרצה שאשתף מחקרים ספציפיים למצב שלך?'
  },
  {
    id: 'skeptic-placebo',
    objection: "Isn't it just placebo?",
    objectionHe: 'זה לא פלצבו?',
    category: 'skepticism',
    response: "Great scientific question! Studies using 'sham' acupuncture - where needles are placed in non-therapeutic points - show that real acupuncture consistently outperforms placebo. Also, acupuncture works on babies and animals who can't experience placebo effect. MRI studies show real, measurable changes in brain activity during acupuncture that don't occur with sham treatments.",
    responseHe: 'שאלה מדעית מצוינת! מחקרים שמשתמשים בדיקור מדומה - שבו מחטים מונחות בנקודות לא טיפוליות - מראים שדיקור אמיתי עובד טוב יותר מפלצבו באופן עקבי. כמו כן, דיקור עובד על תינוקות וחיות שלא יכולים לחוות אפקט פלצבו. מחקרי MRI מראים שינויים אמיתיים ומדידים בפעילות מוחית במהלך דיקור שלא מתרחשים עם טיפולים מדומים.'
  },
  
  // General hesitation
  {
    id: 'hesitate-think',
    objection: "I need to think about it",
    objectionHe: 'אני צריך/ה לחשוב על זה',
    category: 'other',
    response: "Of course, this is an important decision. May I ask what specifically you'd like to think about? Sometimes I can address concerns right now. Also, I'd like to offer you a trial session at a reduced rate - just ₪120 for your first session. That way you can experience it firsthand with minimal commitment. Would that help you decide?",
    responseHe: 'כמובן, זו החלטה חשובה. אפשר לשאול על מה ספציפית היית רוצה לחשוב? לפעמים אני יכול לתת מענה לחששות כבר עכשיו. כמו כן, אני רוצה להציע לך טיפול ניסיון במחיר מופחת - רק 120 ₪ לטיפול הראשון. ככה תוכל/י לחוות את זה בעצמך עם מחויבות מינימלית. האם זה יעזור לך להחליט?'
  },
  {
    id: 'hesitate-spouse',
    objection: "I need to talk to my spouse",
    objectionHe: 'אני צריך/ה לדבר עם בן/בת הזוג',
    category: 'other',
    response: "Absolutely, important decisions should be discussed together. Would your spouse like to join our next call? I'm happy to answer their questions too. Alternatively, I can send you a summary of what we discussed today that you can share with them. What would be most helpful?",
    responseHe: 'בהחלט, החלטות חשובות צריכות להידון יחד. האם בן/בת הזוג שלך ירצו להצטרף לשיחה הבאה? אשמח לענות גם על השאלות שלהם. לחלופין, אני יכול לשלוח לך סיכום של מה שדיברנו היום שתוכל לשתף איתם. מה יעזור יותר?'
  },
  {
    id: 'hesitate-guarantee',
    objection: "What if it doesn't work for me?",
    objectionHe: 'מה אם זה לא יעבוד לי?',
    category: 'other',
    response: "That's a completely valid concern. Here's my approach: I offer a 4-session evaluation period. If after 4 sessions you're not seeing meaningful improvement, we'll have an honest conversation about whether to continue. I won't take your money if I can't help you. Most importantly, I'll give you self-care techniques you can use regardless - those are yours to keep.",
    responseHe: 'זו דאגה לגמרי לגיטימית. הנה הגישה שלי: אני מציע תקופת הערכה של 4 טיפולים. אם אחרי 4 טיפולים אתה לא רואה שיפור משמעותי, נקיים שיחה כנה האם להמשיך. אני לא אקח את הכסף שלך אם אני לא יכול לעזור לך. והכי חשוב, אני אתן לך טכניקות טיפול עצמי שתוכל להשתמש בהן בכל מקרה - אלה שלך לשמור.'
  },
];

// Persuasion Psychology Techniques (Cialdini)
export const PERSUASION_TECHNIQUES = [
  { name: 'Social Proof', nameHe: 'הוכחה חברתית', example: '"80% of my patients see improvement within the first 4 sessions"', exampleHe: '"80% מהמטופלים שלי רואים שיפור תוך 4 הטיפולים הראשונים"' },
  { name: 'Authority', nameHe: 'סמכות', example: '"Harvard Medical School research shows..."', exampleHe: '"מחקר של בית הספר לרפואה של הרווארד מראה..."' },
  { name: 'Scarcity', nameHe: 'מחסור', example: '"I only have 2 afternoon slots left this week"', exampleHe: '"נשארו לי רק 2 תורים אחר הצהריים השבוע"' },
  { name: 'Reciprocity', nameHe: 'הדדיות', example: '"Here\'s a free self-care guide for you to use at home"', exampleHe: '"הנה מדריך טיפול עצמי בחינם לשימוש בבית"' },
  { name: 'Consistency', nameHe: 'עקביות', example: '"You mentioned wanting to reduce medication - this aligns perfectly"', exampleHe: '"הזכרת שאתה רוצה להפחית תרופות - זה מתאים בדיוק"' },
  { name: 'Liking', nameHe: 'חיבה', example: 'Mirror their language, use their name, find common ground', exampleHe: 'שקף את השפה שלהם, השתמש בשמם, מצא מכנה משותף' },
  { name: 'Small Commitment', nameHe: 'מחויבות קטנה', example: '"Just try one session and see how you feel"', exampleHe: '"פשוט נסה טיפול אחד ותראה איך אתה מרגיש"' },
];

// Pricing Options
export const PRICING_OPTIONS = [
  { id: 'trial', name: 'Trial Session', nameHe: 'טיפול ניסיון', price: 120, description: 'Single session to experience acupuncture', descriptionHe: 'טיפול בודד לחוויית דיקור' },
  { id: 'starter', name: '4-Session Starter', nameHe: 'חבילת התחלה', price: 400, description: 'Best value for new patients', descriptionHe: 'המחיר הטוב ביותר למטופלים חדשים' },
  { id: 'video-only', name: 'Video Acupressure', nameHe: 'דיקור וידאו', price: 60, description: 'Online guidance without needles', descriptionHe: 'הדרכה מקוונת ללא מחטים' },
];

// 6-Phase Session Structure
export const SESSION_PHASES: SessionPhase[] = [
  {
    id: 'phase-1',
    name: 'Opening & Trust Building',
    nameHe: 'פתיחה ובניית אמון',
    startMinute: 0,
    endMinute: 10,
    color: 'jade',
    icon: '🤝',
    description: 'Build rapport and understand the patient',
    descriptionHe: 'בנה קרבה והבן את המטופל',
    items: [
      {
        id: '1-1',
        title: 'Warm greeting & introduction',
        titleHe: 'ברכה חמה והצגה',
        script: "Hi [Name], it's great to finally meet you! I'm [Your Name], and I've been practicing acupuncture for [X] years. Before we dive in, I want you to know this is a conversation, not a sales pitch. My goal is to understand if I can genuinely help you.",
        scriptHe: 'שלום [שם], נעים מאוד להכיר! אני [השם שלך], ואני מטפל בדיקור כבר [X] שנים. לפני שנתחיל, חשוב לי שתדע/י שזו שיחה, לא מכירה. המטרה שלי היא להבין אם אני באמת יכול לעזור לך.',
        type: 'script'
      },
      {
        id: '1-2',
        title: 'Ice-breaker question',
        titleHe: 'שאלת שבירת קרח',
        script: "Before we talk about what brought you here, I'm curious - have you ever tried any natural or alternative therapies before?",
        scriptHe: 'לפני שנדבר על מה שהביא אותך לכאן, אני סקרן - האם אי פעם ניסית טיפולים טבעיים או אלטרנטיביים?',
        type: 'question'
      },
      {
        id: '1-3',
        title: 'Listen to their story',
        titleHe: 'הקשב לסיפור שלהם',
        script: "Tell me about what's been going on with your health. Take your time - I want to understand the full picture.",
        scriptHe: 'ספר/י לי מה קורה עם הבריאות שלך. קח/י את הזמן - אני רוצה להבין את התמונה המלאה.',
        tips: ['Maintain eye contact', 'Nod to show understanding', 'Take notes visibly', 'Don\'t interrupt'],
        tipsHe: ['שמור על קשר עין', 'הנהן להראות הבנה', 'רשום הערות באופן גלוי', 'אל תפסיק'],
        type: 'action'
      },
      {
        id: '1-4',
        title: 'Empathy statement',
        titleHe: 'הצהרת אמפתיה',
        script: "That sounds really challenging. Living with [their condition] for [time period] must be exhausting. I want you to know that many of my patients have been in similar situations, and there's real hope for improvement.",
        scriptHe: 'זה נשמע מאתגר מאוד. לחיות עם [המצב שלהם] במשך [תקופה] בטח מתיש. אני רוצה שתדע/י שהרבה מהמטופלים שלי היו במצבים דומים, ויש תקווה אמיתית לשיפור.',
        type: 'script'
      },
      {
        id: '1-5',
        title: 'Initial concerns check',
        titleHe: 'בדיקת חששות ראשוניים',
        script: "Before I share more about how acupuncture might help, is there anything specific you're worried about or curious about?",
        scriptHe: 'לפני שאספר עוד על איך דיקור יכול לעזור, יש משהו ספציפי שמדאיג אותך או שאתה סקרן לגביו?',
        type: 'question'
      },
      {
        id: '1-checkpoint',
        title: '✓ Phase 1 Complete - Trust established?',
        titleHe: '✓ שלב 1 הושלם - אמון נוצר?',
        type: 'checkpoint'
      }
    ]
  },
  {
    id: 'phase-2',
    name: 'Evidence-Based Persuasion',
    nameHe: 'שכנוע מבוסס ראיות',
    startMinute: 10,
    endMinute: 20,
    color: 'blue',
    icon: '📊',
    description: 'Share research and success rates',
    descriptionHe: 'שתף מחקרים ושיעורי הצלחה',
    items: [
      {
        id: '2-1',
        title: 'Transition to evidence',
        titleHe: 'מעבר לראיות',
        script: "Now let me share some fascinating research that's relevant to your situation. The evidence for acupuncture has grown tremendously in the past 20 years.",
        scriptHe: 'עכשיו תן לי לשתף מחקרים מרתקים שרלוונטיים למצב שלך. הראיות לדיקור גדלו מאוד ב-20 השנים האחרונות.',
        type: 'script'
      },
      {
        id: '2-2',
        title: 'Present condition-specific success rates',
        titleHe: 'הצג שיעורי הצלחה למצב הספציפי',
        script: "For [their condition], research shows [X-X%] of patients experience significant improvement. That's based on studies published in [journal name].",
        scriptHe: 'עבור [המצב שלהם], מחקרים מראים ש-[X-X%] מהמטופלים חווים שיפור משמעותי. זה מבוסס על מחקרים שפורסמו ב-[שם כתב העת].',
        tips: ['Reference SUCCESS_RATES data', 'Use specific numbers', 'Mention credible sources'],
        tipsHe: ['התייחס לנתוני שיעורי הצלחה', 'השתמש במספרים ספציפיים', 'הזכר מקורות אמינים'],
        type: 'action'
      },
      {
        id: '2-3',
        title: 'WHO/NIH authority mention',
        titleHe: 'אזכור סמכות WHO/NIH',
        script: "The World Health Organization officially recognizes acupuncture for over 100 conditions. The NIH in America - the largest medical research body in the world - continues to fund acupuncture research because the evidence is that compelling.",
        scriptHe: 'ארגון הבריאות העולמי מכיר רשמית בדיקור ליותר מ-100 מצבים. ה-NIH באמריקה - גוף המחקר הרפואי הגדול בעולם - ממשיך לממן מחקרי דיקור כי הראיות כל כך משכנעות.',
        type: 'script'
      },
      {
        id: '2-4',
        title: 'Comparison: Acupuncture vs Medication',
        titleHe: 'השוואה: דיקור מול תרופות',
        script: "Here's what makes acupuncture different from medication: medications often mask symptoms temporarily and can have side effects. Acupuncture addresses the root cause and helps your body heal itself. Many of my patients reduce or eliminate their medications over time.",
        scriptHe: 'הנה מה שמבדיל דיקור מתרופות: תרופות לעתים מסתירות תסמינים באופן זמני ויכולות לגרום לתופעות לוואי. דיקור מטפל בשורש הבעיה ועוזר לגוף שלך לרפא את עצמו. הרבה מהמטופלים שלי מפחיתים או מפסיקים תרופות עם הזמן.',
        type: 'script'
      },
      {
        id: '2-5',
        title: 'Personal success story',
        titleHe: 'סיפור הצלחה אישי',
        script: "Let me share a story about a patient - without revealing any identifying details of course. They came to me with [similar condition] and after [X] sessions, they [specific improvement]. That was [timeframe] ago and they're still doing well.",
        scriptHe: 'תן לי לספר סיפור על מטופל - בלי לחשוף פרטים מזהים כמובן. הם הגיעו אליי עם [מצב דומה] ואחרי [X] טיפולים, הם [שיפור ספציפי]. זה היה לפני [זמן] והם עדיין מרגישים טוב.',
        tips: ['Use a relevant case study', 'Be specific about improvements', 'Maintain patient confidentiality'],
        tipsHe: ['השתמש במקרה רלוונטי', 'היה ספציפי לגבי שיפורים', 'שמור על סודיות המטופל'],
        type: 'action'
      },
      {
        id: '2-checkpoint',
        title: '✓ Phase 2 Complete - Are they convinced by evidence?',
        titleHe: '✓ שלב 2 הושלם - האם הם משוכנעים מהראיות?',
        type: 'checkpoint'
      }
    ]
  },
  {
    id: 'phase-3',
    name: 'Visual Demonstration',
    nameHe: 'הדגמה ויזואלית',
    startMinute: 20,
    endMinute: 30,
    color: 'amber',
    icon: '👁️',
    description: 'Show needles, demonstrate techniques',
    descriptionHe: 'הצג מחטים, הדגם טכניקות',
    items: [
      {
        id: '3-1',
        title: 'Prepare demonstration materials',
        titleHe: 'הכן חומרי הדגמה',
        tips: ['Have needle packages ready', 'Hair for comparison', 'Ear seeds visible', 'Alcohol swabs'],
        tipsHe: ['הכן חבילות מחטים', 'שערה להשוואה', 'זרעי אוזן גלויים', 'מטליות אלכוהול'],
        type: 'action'
      },
      {
        id: '3-2',
        title: 'Needle size comparison',
        titleHe: 'השוואת גודל מחטים',
        script: "Let me show you something that surprises most people. [Hold up package] These are acupuncture needles in their sterile packaging. [Open one] See how thin this is? It's about the width of a human hair - 0.25mm. [Hold up hair] This is 25-40 times thinner than the needles used for blood tests or injections.",
        scriptHe: 'תן לי להראות לך משהו שמפתיע את רוב האנשים. [החזק חבילה] אלה מחטי דיקור באריזה הסטרילית שלהן. [פתח אחת] רואה כמה זה דק? זה בערך כעובי שערה - 0.25 מ"מ. [החזק שערה] זה 25-40 פעמים דק יותר מהמחטים שמשמשות לבדיקות דם או זריקות.',
        type: 'demo'
      },
      {
        id: '3-3',
        title: 'Self-demonstration on hand',
        titleHe: 'הדגמה עצמית על היד',
        script: "Watch this - I'm going to insert a needle into my own hand at the LI4 point, which is commonly used for headaches and stress. [Insert needle] See? There's barely any sensation. Most patients describe it as a tiny tap or nothing at all.",
        scriptHe: 'תראה - אני מכניס מחט ליד שלי בנקודת LI4, שמשמשת בדרך כלל לכאבי ראש ולחץ. [הכנס מחט] רואה? כמעט אין תחושה. רוב המטופלים מתארים את זה כנקישה קטנה או בכלל לא מרגישים.',
        tips: ['Clean the area first', 'Insert confidently', 'Show your relaxed expression', 'Remove and show no blood'],
        tipsHe: ['נקה את האזור קודם', 'הכנס בביטחון', 'הראה הבעת פנים רגועה', 'הסר והראה שאין דם'],
        type: 'demo'
      },
      {
        id: '3-4',
        title: 'Ear seeds alternative',
        titleHe: 'חלופת זרעי אוזן',
        script: "For patients who are still nervous about needles, I also use these - ear seeds. [Show package] They're tiny beads on adhesive, no needles at all. You wear them for a few days and press them when you feel symptoms. Many patients love these for home treatment between sessions.",
        scriptHe: 'למטופלים שעדיין עצבניים ממחטים, אני משתמש גם באלה - זרעי אוזן. [הראה חבילה] אלה חרוזים קטנים על מדבקה, בלי מחטים בכלל. אתה עונד אותם כמה ימים ולוחץ עליהם כשאתה מרגיש תסמינים. הרבה מטופלים אוהבים את אלה לטיפול עצמי בין טיפולים.',
        type: 'demo'
      },
      {
        id: '3-5',
        title: 'Live acupressure teaching - PC6',
        titleHe: 'הדרכת דיקור לחץ - PC6',
        script: "I want to teach you something you can use right now at home. This point is called PC6 or Nei Guan. [Show on your wrist] It's three finger-widths from your wrist crease, between the tendons. Press firmly and breathe deeply for 2 minutes. This helps with nausea, anxiety, and motion sickness. Try it with me now.",
        scriptHe: 'אני רוצה ללמד אותך משהו שתוכל להשתמש בו עכשיו בבית. הנקודה הזו נקראת PC6 או ני גואן. [הראה על פרק היד] זה שלוש אצבעות מקו כף היד, בין הגידים. לחץ חזק ונשום עמוק במשך 2 דקות. זה עוזר לבחילות, חרדה ומחלת תנועה. נסה איתי עכשיו.',
        tips: ['Have them follow along', 'Count breaths together', 'Ask about immediate sensation', 'This is a gift - builds reciprocity'],
        tipsHe: ['תן להם לעקוב אחריך', 'ספור נשימות יחד', 'שאל על תחושה מיידית', 'זו מתנה - בונה הדדיות'],
        type: 'demo'
      },
      {
        id: '3-checkpoint',
        title: '✓ Phase 3 Complete - Fear of needles reduced?',
        titleHe: '✓ שלב 3 הושלם - פחד מהמחטים פחת?',
        type: 'checkpoint'
      }
    ]
  },
  {
    id: 'phase-4',
    name: 'Personalized Treatment Plan',
    nameHe: 'תוכנית טיפול מותאמת אישית',
    startMinute: 30,
    endMinute: 40,
    color: 'purple',
    icon: '📋',
    description: 'Create their specific plan',
    descriptionHe: 'צור תוכנית ספציפית עבורם',
    items: [
      {
        id: '4-1',
        title: 'Transition to treatment planning',
        titleHe: 'מעבר לתכנון טיפול',
        script: "Now let me share what a treatment plan for you might look like. Based on what you've told me about [their condition], here's my recommended approach.",
        scriptHe: 'עכשיו תן לי לשתף איך תוכנית טיפול עבורך עשויה להיראות. בהתבסס על מה שסיפרת לי על [המצב שלהם], הנה הגישה המומלצת שלי.',
        type: 'script'
      },
      {
        id: '4-2',
        title: 'Present treatment timeline',
        titleHe: 'הצג לוח זמנים לטיפול',
        script: "For [their condition], I typically recommend starting with sessions [frequency - weekly/twice weekly]. Most patients begin feeling improvement after [X] sessions. A full treatment course is usually [X-X] sessions over [timeframe]. After that, we move to maintenance - maybe once a month or as needed.",
        scriptHe: 'עבור [המצב שלהם], אני בדרך כלל ממליץ להתחיל עם טיפולים [תדירות - שבועי/פעמיים בשבוע]. רוב המטופלים מתחילים להרגיש שיפור אחרי [X] טיפולים. קורס טיפול מלא הוא בדרך כלל [X-X] טיפולים במשך [תקופה]. אחרי זה, עוברים לתחזוקה - אולי פעם בחודש או לפי הצורך.',
        type: 'script'
      },
      {
        id: '4-3',
        title: 'Explain key points to be used',
        titleHe: 'הסבר נקודות מפתח שישמשו',
        script: "For your treatment, I would focus on these key acupuncture points: [Name specific points like HT7 for anxiety, ST36 for energy, etc.]. Each of these has a specific function - [briefly explain]. I'll also use some points on your back/ears/hands depending on how you respond.",
        scriptHe: 'לטיפול שלך, אתמקד בנקודות הדיקור המפתח האלה: [שמות נקודות ספציפיות כמו HT7 לחרדה, ST36 לאנרגיה, וכו\']. לכל אחת מהן יש תפקיד ספציפי - [הסבר בקצרה]. אני גם אשתמש בנקודות על הגב/אוזניים/ידיים בהתאם לתגובה שלך.',
        tips: ['Mention 3-4 specific points', 'Brief function explanation', 'Show competence without overwhelming'],
        tipsHe: ['הזכר 3-4 נקודות ספציפיות', 'הסבר פונקציה קצר', 'הראה יכולת בלי להציף'],
        type: 'action'
      },
      {
        id: '4-4',
        title: 'Cost breakdown with options',
        titleHe: 'פירוט עלויות עם אפשרויות',
        script: "Let me explain the investment options. [Use PRICING_OPTIONS data]. The starter package gives you the best value per session. Most of my patients choose this because it gives enough sessions to see real results. I also provide receipts for insurance claims.",
        scriptHe: 'תן לי להסביר את אפשרויות ההשקעה. [השתמש בנתוני תמחור]. חבילת הפתיחה נותנת לך את הערך הטוב ביותר לטיפול. רוב המטופלים שלי בוחרים בזה כי זה נותן מספיק טיפולים לראות תוצאות אמיתיות. אני גם מספק קבלות לתביעות ביטוח.',
        type: 'script'
      },
      {
        id: '4-5',
        title: 'Realistic expectations setting',
        titleHe: 'הצבת ציפיות ריאליות',
        script: "I want to be completely honest with you about expectations. Acupuncture isn't magic - it works with your body's natural healing processes. Some patients feel improvement immediately, others take a few sessions. For chronic conditions, lasting change takes time. What I can promise is my complete dedication to helping you get better.",
        scriptHe: 'אני רוצה להיות לגמרי כנה איתך לגבי הציפיות. דיקור זה לא קסם - הוא עובד עם תהליכי הריפוי הטבעיים של הגוף. חלק מהמטופלים מרגישים שיפור מיידית, אחרים לוקחים כמה טיפולים. למצבים כרוניים, שינוי מתמשך לוקח זמן. מה שאני יכול להבטיח זה את המסירות המלאה שלי לעזור לך להשתפר.',
        type: 'script'
      },
      {
        id: '4-checkpoint',
        title: '✓ Phase 4 Complete - Do they understand the plan?',
        titleHe: '✓ שלב 4 הושלם - האם הם מבינים את התוכנית?',
        type: 'checkpoint'
      }
    ]
  },
  {
    id: 'phase-5',
    name: 'Objection Handling',
    nameHe: 'התמודדות עם התנגדויות',
    startMinute: 40,
    endMinute: 50,
    color: 'orange',
    icon: '🛡️',
    description: 'Address remaining concerns',
    descriptionHe: 'טפל בחששות שנותרו',
    items: [
      {
        id: '5-1',
        title: 'Invite objections openly',
        titleHe: 'הזמן התנגדויות בגלוי',
        script: "Before we talk about scheduling, I want to make sure I've addressed all your concerns. What questions or hesitations do you still have? Please be completely honest - I'd rather address them now than have you leave with doubts.",
        scriptHe: 'לפני שנדבר על קביעת תור, אני רוצה לוודא שטיפלתי בכל החששות שלך. אילו שאלות או היסוסים עדיין יש לך? אנא היה לגמרי כנה - אני מעדיף לטפל בהם עכשיו מאשר שתעזוב עם ספקות.',
        type: 'question'
      },
      {
        id: '5-2',
        title: 'Handle "Need to think about it"',
        titleHe: 'התמודד עם "צריך לחשוב על זה"',
        script: "Use the trial session offer: I completely understand wanting to think it over. May I suggest a no-commitment trial session? For just ₪120, you can experience acupuncture firsthand. If you love it, we apply that toward a package. If it's not for you, no pressure at all.",
        scriptHe: 'השתמש בהצעת טיפול ניסיון: אני לגמרי מבין את הרצון לחשוב על זה. אפשר להציע טיפול ניסיון ללא מחויבות? בעבור רק 120 ₪, אתה יכול לחוות דיקור בעצמך. אם אתה אוהב, אנחנו מזכים את זה לחבילה. אם זה לא בשבילך, אין לחץ בכלל.',
        type: 'script'
      },
      {
        id: '5-3',
        title: 'Handle "Too expensive"',
        titleHe: 'התמודד עם "יקר מדי"',
        script: "Long-term savings approach: I hear you about the cost. Let me ask - what are you currently spending on managing [their condition]? [Calculate together]. A treatment course often eliminates or reduces those ongoing costs. Many patients see it as an investment that pays for itself.",
        scriptHe: 'גישת חיסכון לטווח ארוך: אני שומע אותך לגבי העלות. תן לי לשאול - כמה אתה כרגע מוציא על ניהול [המצב שלהם]? [חשב יחד]. קורס טיפול לעתים מבטל או מפחית את העלויות השוטפות האלה. הרבה מטופלים רואים את זה כהשקעה שמחזירה את עצמה.',
        type: 'script'
      },
      {
        id: '5-4',
        title: 'Handle "No time"',
        titleHe: 'התמודד עם "אין זמן"',
        script: "Flexible scheduling emphasis: I work with many busy professionals. I have early morning slots starting at 7am, evening slots until 8pm, and weekend availability. We can also do online consultations for follow-ups. What would work best for your schedule?",
        scriptHe: 'דגש על גמישות תזמון: אני עובד עם הרבה אנשי מקצוע עסוקים. יש לי תורים מוקדמים החל מ-7 בבוקר, תורים בערב עד 8 בערב, וזמינות בסופי שבוע. אפשר גם לעשות ייעוצים מקוונים למעקבים. מה יעבוד הכי טוב ללוח הזמנים שלך?',
        type: 'script'
      },
      {
        id: '5-5',
        title: 'Handle "What if it doesn\'t work?"',
        titleHe: 'התמודד עם "מה אם זה לא יעבוד?"',
        script: "4-session guarantee approach: That's exactly why I recommend the 4-session evaluation. After 4 sessions, we'll have an honest conversation about your progress. If you're not seeing improvement, I won't push you to continue. I'd rather have patients who get results than patients who are disappointed.",
        scriptHe: 'גישת הבטחת 4 טיפולים: בדיוק בשביל זה אני ממליץ על הערכה של 4 טיפולים. אחרי 4 טיפולים, נקיים שיחה כנה על ההתקדמות שלך. אם אתה לא רואה שיפור, אני לא אלחץ עליך להמשיך. אני מעדיף מטופלים שמקבלים תוצאות מאשר מטופלים מאוכזבים.',
        type: 'script'
      },
      {
        id: '5-6',
        title: 'Reference objection scripts',
        titleHe: 'התייחס לתסריטי התנגדות',
        tips: ['Check OBJECTION_SCRIPTS for detailed responses', 'Match objection category', 'Use follow-up questions when available'],
        tipsHe: ['בדוק תסריטי התנגדות לתשובות מפורטות', 'התאם קטגוריית התנגדות', 'השתמש בשאלות המשך כשזמינות'],
        type: 'action'
      },
      {
        id: '5-checkpoint',
        title: '✓ Phase 5 Complete - All objections addressed?',
        titleHe: '✓ שלב 5 הושלם - כל ההתנגדויות טופלו?',
        type: 'checkpoint'
      }
    ]
  },
  {
    id: 'phase-6',
    name: 'Trial Close & Scheduling',
    nameHe: 'סגירת ניסיון וקביעת תור',
    startMinute: 50,
    endMinute: 60,
    color: 'green',
    icon: '🎯',
    description: 'Close the sale and book appointment',
    descriptionHe: 'סגור את המכירה וקבע תור',
    items: [
      {
        id: '6-1',
        title: 'Assumptive close transition',
        titleHe: 'מעבר לסגירה מניחה',
        script: "Based on everything we've discussed, I believe acupuncture can really help you with [their condition]. Let's look at getting you started. Which option feels right for you?",
        scriptHe: 'בהתבסס על כל מה שדיברנו, אני מאמין שדיקור באמת יכול לעזור לך עם [המצב שלהם]. בוא נסתכל על איך להתחיל. איזו אפשרות מרגישה נכונה עבורך?',
        type: 'script'
      },
      {
        id: '6-2',
        title: 'Present three options',
        titleHe: 'הצג שלוש אפשרויות',
        script: "Option A: Single trial session for ₪120 - perfect if you want to experience it first. Option B: 4-session starter package for ₪400 - best value and enough to see real results. Option C: Video acupressure consultation for ₪60 - if you want to start with home techniques only.",
        scriptHe: 'אפשרות א: טיפול ניסיון בודד ב-120 ₪ - מושלם אם אתה רוצה לנסות קודם. אפשרות ב: חבילת התחלה של 4 טיפולים ב-400 ₪ - ערך הכי טוב ומספיק לראות תוצאות אמיתיות. אפשרות ג: ייעוץ דיקור לחץ בווידאו ב-60 ₪ - אם אתה רוצה להתחיל עם טכניקות בית בלבד.',
        type: 'script'
      },
      {
        id: '6-3',
        title: 'Wait for response silently',
        titleHe: 'חכה לתגובה בשקט',
        tips: ['After presenting options, STOP TALKING', 'Let silence work for you', 'Count to 10 in your head if needed', 'First person to speak often loses'],
        tipsHe: ['אחרי הצגת האפשרויות, הפסק לדבר', 'תן לשקט לעבוד בשבילך', 'ספור עד 10 בראש אם צריך', 'הראשון שמדבר לעתים מפסיד'],
        type: 'action'
      },
      {
        id: '6-4',
        title: 'Book immediately when they agree',
        titleHe: 'קבע מיד כשהם מסכימים',
        script: "Perfect! Let me pull up my calendar. [Open scheduling] I have availability on [give 2-3 specific options]. Which works better for you?",
        scriptHe: 'מעולה! תן לי לפתוח את היומן. [פתח תזמון] יש לי זמינות ב-[תן 2-3 אפשרויות ספציפיות]. מה מתאים יותר לך?',
        tips: ['Have calendar ready', 'Offer limited options (2-3)', 'Use assumptive language', 'Send confirmation immediately'],
        tipsHe: ['הכן יומן מראש', 'הצע אפשרויות מוגבלות (2-3)', 'השתמש בשפה מניחה', 'שלח אישור מיד'],
        type: 'action'
      },
      {
        id: '6-5',
        title: 'Send new patient form link',
        titleHe: 'שלח קישור לטופס מטופל חדש',
        script: "Excellent! I'm sending you a confirmation and a brief intake form now. Please fill it out before your appointment so we can make the most of our time together.",
        scriptHe: 'מצוין! אני שולח לך אישור וטופס קבלה קצר עכשיו. אנא מלא אותו לפני התור כדי שנוכל לנצל את הזמן שלנו יחד בצורה הטובה ביותר.',
        type: 'script'
      },
      {
        id: '6-6',
        title: 'Warm closing',
        titleHe: 'סיום חם',
        script: "I'm really looking forward to working with you, [Name]. This is the first step toward feeling better, and I'm honored you're trusting me with your health. See you on [day]!",
        scriptHe: 'אני באמת מצפה לעבוד איתך, [שם]. זה הצעד הראשון לתחושה טובה יותר, ואני מכובד שאתה סומך עליי עם הבריאות שלך. נתראה ביום [יום]!',
        type: 'script'
      },
      {
        id: '6-checkpoint',
        title: '✓ Phase 6 Complete - Appointment booked?',
        titleHe: '✓ שלב 6 הושלם - התור נקבע?',
        type: 'checkpoint'
      }
    ]
  }
];

// Ethical Guidelines
export const ETHICAL_GUIDELINES = {
  mustAlways: [
    'Respect patient autonomy - never pressure unwilling patients',
    'Provide accurate, evidence-based information',
    'Acknowledge treatment limitations honestly',
    'Recommend medical coordination for serious conditions',
    'Maintain patient confidentiality',
    'Get informed consent before treatment'
  ],
  mustAlwaysHe: [
    'כבד את האוטונומיה של המטופל - לעולם אל תלחץ על מטופלים לא מרוצים',
    'ספק מידע מדויק ומבוסס ראיות',
    'הודה במגבלות הטיפול בכנות',
    'המלץ על תיאום רפואי למצבים רציניים',
    'שמור על סודיות המטופל',
    'קבל הסכמה מדעת לפני טיפול'
  ],
  mustNever: [
    'Guarantee specific outcomes',
    'Discourage conventional medical care',
    'Pressure clearly unwilling patients',
    'Violate patient privacy or confidentiality',
    'Make claims about curing cancer or serious diseases',
    'Continue if red flags are present'
  ],
  mustNeverHe: [
    'הבטח תוצאות ספציפיות',
    'הרתע מטיפול רפואי קונבנציונלי',
    'לחץ על מטופלים שברור שלא מעוניינים',
    'הפר את פרטיות או סודיות המטופל',
    'טען על ריפוי סרטן או מחלות רציניות',
    'המשך אם יש דגלים אדומים'
  ]
};

// Post-session tasks
export const POST_SESSION_TASKS = [
  { id: 'summary', task: 'Generate session summary with interest level (1-10)', taskHe: 'צור סיכום פגישה עם רמת עניין (1-10)' },
  { id: 'email', task: 'Send personalized follow-up email', taskHe: 'שלח מייל מעקב מותאם אישית' },
  { id: 'crm', task: 'Update CRM with lead status', taskHe: 'עדכן CRM עם סטטוס ליד' },
  { id: 'reminder', task: 'Schedule follow-up reminder (3-4 days)', taskHe: 'תזמן תזכורת מעקב (3-4 ימים)' },
  { id: 'notes', task: 'Document key concerns and objections', taskHe: 'תעד חששות והתנגדויות מפתח' }
];

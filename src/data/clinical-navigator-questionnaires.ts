/**
 * Clinical Navigator Questionnaires Data
 * Based on nanobanan_master_sync.csv and Hebrew questionnaires 1-36
 */

export interface QuestionItem {
  id: string;
  question_he: string;
  question_en: string;
  type: 'yesno' | 'scale' | 'open' | 'multi';
  options?: string[];
}

export interface QuestionnaireModule {
  id: number;
  module_name: string;
  module_name_he: string;
  nanobanan_prompt_id: string;
  linked_knowledge_base: string;
  icon: string;
  color: string;
  category: 'diagnostic' | 'constitutional' | 'herbal' | 'specialty' | 'lifestyle' | 'age-specific';
  questions: QuestionItem[];
}

export const CLINICAL_QUESTIONNAIRES: QuestionnaireModule[] = [
  // Module 1: TCM Shen Mind Emotions
  {
    id: 1,
    module_name: "TCM Shen Mind Emotions",
    module_name_he: "שן - נפש ורגשות",
    nanobanan_prompt_id: "nanobanan_general",
    linked_knowledge_base: "TCM_Foundations.csv",
    icon: "Brain",
    color: "#E91E63",
    category: "diagnostic",
    questions: [
      { id: "1-1", question_he: "האם יש קושי להירדם או להישאר ישן?", question_en: "Is there difficulty falling asleep or staying asleep?", type: "yesno" },
      { id: "1-2", question_he: "האם יש חלומות מטרידים או סיוטי לילה?", question_en: "Are there disturbing dreams or nightmares?", type: "yesno" },
      { id: "1-3", question_he: "האם יש קושי בריכוז או זיכרון?", question_en: "Is there difficulty with concentration or memory?", type: "yesno" },
      { id: "1-4", question_he: "האם יש חרדה, פחדים או התקפי פאניקה?", question_en: "Is there anxiety, fears, or panic attacks?", type: "yesno" },
      { id: "1-5", question_he: "האם יש דיכאון, עצבות או חוסר מוטיבציה?", question_en: "Is there depression, sadness, or lack of motivation?", type: "yesno" },
      { id: "1-6", question_he: "האם יש כעסים, עצבנות או התפרצויות?", question_en: "Is there anger, irritability, or outbursts?", type: "yesno" },
      { id: "1-7", question_he: "האם יש חשיבה יתרה, דאגות כפייתיות?", question_en: "Is there overthinking or obsessive worrying?", type: "yesno" },
      { id: "1-8", question_he: "האם יש פלפיטציות או תחושת לב דופק חזק?", question_en: "Are there palpitations or feeling of strong heartbeat?", type: "yesno" },
      { id: "1-9", question_he: "האם יש שינויים במצב הרוח במהלך היום?", question_en: "Are there mood changes throughout the day?", type: "yesno" },
      { id: "1-10", question_he: "האם יש תחושת ניתוק או חוסר נוכחות?", question_en: "Is there feeling of disconnection or lack of presence?", type: "yesno" },
      { id: "1-11", question_he: "האם יש רגישות רגשית יתר?", question_en: "Is there excessive emotional sensitivity?", type: "yesno" },
      { id: "1-12", question_he: "האם יש קושי לקבל החלטות?", question_en: "Is there difficulty making decisions?", type: "yesno" },
      { id: "1-13", question_he: "מה רמת האנרגיה הכללית? (1-10)", question_en: "What is the general energy level? (1-10)", type: "scale" },
      { id: "1-14", question_he: "האם יש היסטוריה של טראומה או אובדן?", question_en: "Is there history of trauma or loss?", type: "yesno" },
      { id: "1-15", question_he: "מהו הרגש הדומיננטי כרגע?", question_en: "What is the dominant emotion right now?", type: "open" }
    ]
  },

  // Module 2: TCM Pattern Identification (Bian Zheng)
  {
    id: 2,
    module_name: "TCM Pattern Identification",
    module_name_he: "ביאן ז'נג - זיהוי דפוס",
    nanobanan_prompt_id: "nanobanan_bianzheng",
    linked_knowledge_base: "tcm_pattern_differentiation_enhanced.csv",
    icon: "Search",
    color: "#9C27B0",
    category: "diagnostic",
    questions: [
      { id: "2-1", question_he: "מהי התלונה העיקרית (צ'יף קומפליינט)?", question_en: "What is the chief complaint?", type: "open" },
      { id: "2-2", question_he: "מתי התחילה הבעיה ומה מחמיר/מקל?", question_en: "When did the problem start and what aggravates/relieves it?", type: "open" },
      { id: "2-3", question_he: "האם הבעיה נמצאת בחלק עליון או תחתון של הגוף?", question_en: "Is the problem in the upper or lower part of the body?", type: "multi", options: ["upper", "lower", "both"] },
      { id: "2-4", question_he: "האם הבעיה בצד ימין, שמאל או מרכזי?", question_en: "Is the problem on the right, left, or center?", type: "multi", options: ["right", "left", "center", "both"] },
      { id: "2-5", question_he: "האם יש סימני חום (פנים אדומות, צמא, חום גוף)?", question_en: "Are there heat signs (red face, thirst, body heat)?", type: "yesno" },
      { id: "2-6", question_he: "האם יש סימני קור (פנים חיוורות, עייפות, קור בגפיים)?", question_en: "Are there cold signs (pale face, fatigue, cold extremities)?", type: "yesno" },
      { id: "2-7", question_he: "האם יש סימני עודף (כאב חד, עצירות, לחץ)?", question_en: "Are there excess signs (sharp pain, constipation, pressure)?", type: "yesno" },
      { id: "2-8", question_he: "האם יש סימני חוסר (עייפות, חולשה, כאב עמום)?", question_en: "Are there deficiency signs (fatigue, weakness, dull pain)?", type: "yesno" },
      { id: "2-9", question_he: "האם יש סימני לחות (כבדות, נפיחות, הפרשות)?", question_en: "Are there dampness signs (heaviness, swelling, discharges)?", type: "yesno" },
      { id: "2-10", question_he: "האם יש סימני יובש (עור יבש, צמא, עצירות)?", question_en: "Are there dryness signs (dry skin, thirst, constipation)?", type: "yesno" },
      { id: "2-11", question_he: "מהו אופי הדופק (מהיר/איטי, חזק/חלש)?", question_en: "What is the pulse character (fast/slow, strong/weak)?", type: "open" },
      { id: "2-12", question_he: "מהו מראה הלשון (צבע, חיפוי, צורה)?", question_en: "What is the tongue appearance (color, coating, shape)?", type: "open" },
      { id: "2-13", question_he: "האם הבעיה מחמירה בזמן מסוים ביום?", question_en: "Does the problem worsen at a specific time of day?", type: "open" },
      { id: "2-14", question_he: "האם יש קשר לעונות השנה?", question_en: "Is there a connection to seasons?", type: "yesno" },
      { id: "2-15", question_he: "מהי ההיסטוריה הרפואית הרלוונטית?", question_en: "What is the relevant medical history?", type: "open" }
    ]
  },

  // Module 3: TCM Yin Yang Constitution
  {
    id: 3,
    module_name: "TCM Yin Yang Constitution",
    module_name_he: "יין-יאנג - מבנה גוף",
    nanobanan_prompt_id: "nanobanan_general",
    linked_knowledge_base: "TCM_Foundations.csv",
    icon: "Scale",
    color: "#607D8B",
    category: "constitutional",
    questions: [
      { id: "3-1", question_he: "האם אתה בדרך כלל מרגיש חם או קר?", question_en: "Do you generally feel hot or cold?", type: "multi", options: ["hot", "cold", "balanced"] },
      { id: "3-2", question_he: "האם אתה מעדיף משקאות חמים או קרים?", question_en: "Do you prefer hot or cold drinks?", type: "multi", options: ["hot", "cold", "room temp"] },
      { id: "3-3", question_he: "האם אתה סוג אקטיבי או שקט יותר?", question_en: "Are you an active or quiet type?", type: "multi", options: ["active", "quiet", "balanced"] },
      { id: "3-4", question_he: "האם הצואה נוטה להיות יבשה או רכה?", question_en: "Does stool tend to be dry or loose?", type: "multi", options: ["dry", "loose", "normal"] },
      { id: "3-5", question_he: "האם השתן בהיר או כהה?", question_en: "Is urine light or dark?", type: "multi", options: ["light", "dark", "normal"] },
      { id: "3-6", question_he: "האם יש נטייה לעלייה או ירידה במשקל?", question_en: "Is there tendency to gain or lose weight?", type: "multi", options: ["gain", "lose", "stable"] },
      { id: "3-7", question_he: "האם מרגיש יותר אנרגטי בבוקר או בערב?", question_en: "Do you feel more energetic in morning or evening?", type: "multi", options: ["morning", "evening", "same"] },
      { id: "3-8", question_he: "האם יש הזעה מרובה או מועטה?", question_en: "Is there excessive or minimal sweating?", type: "multi", options: ["excessive", "minimal", "normal"] },
      { id: "3-9", question_he: "האם הקול חזק או חלש?", question_en: "Is the voice strong or weak?", type: "multi", options: ["strong", "weak", "normal"] },
      { id: "3-10", question_he: "האם העור יבש או שומני?", question_en: "Is the skin dry or oily?", type: "multi", options: ["dry", "oily", "normal"] },
      { id: "3-11", question_he: "האם יש נטייה לחום פנימי (אודם, צמא)?", question_en: "Is there tendency to internal heat (redness, thirst)?", type: "yesno" },
      { id: "3-12", question_he: "האם יש נטייה לקור פנימי (חיוורון, עייפות)?", question_en: "Is there tendency to internal cold (pallor, fatigue)?", type: "yesno" },
      { id: "3-13", question_he: "מהי רמת הצמא הכללית?", question_en: "What is the general thirst level?", type: "scale" },
      { id: "3-14", question_he: "האם יש נטייה לדלקות או זיהומים?", question_en: "Is there tendency to inflammations or infections?", type: "yesno" },
      { id: "3-15", question_he: "מהו הסוג הגופני (רזה/בינוני/כבד)?", question_en: "What is the body type (thin/medium/heavy)?", type: "multi", options: ["thin", "medium", "heavy"] }
    ]
  },

  // Module 4: TCM Pulse Diagnosis
  {
    id: 4,
    module_name: "TCM Pulse Diagnosis",
    module_name_he: "אבחון דופק",
    nanobanan_prompt_id: "nanobanan_general",
    linked_knowledge_base: "TCM_Diagnostics.csv",
    icon: "Activity",
    color: "#F44336",
    category: "diagnostic",
    questions: [
      { id: "4-1", question_he: "מהי מהירות הדופק (פעימות לדקה)?", question_en: "What is the pulse rate (beats per minute)?", type: "open" },
      { id: "4-2", question_he: "האם הדופק מהיר (מעל 90) או איטי (מתחת ל-60)?", question_en: "Is the pulse fast (>90) or slow (<60)?", type: "multi", options: ["fast", "slow", "normal"] },
      { id: "4-3", question_he: "האם הדופק חזק וממלא או חלש ועדין?", question_en: "Is the pulse strong/full or weak/thin?", type: "multi", options: ["strong", "weak", "normal"] },
      { id: "4-4", question_he: "האם הדופק שטחי או עמוק?", question_en: "Is the pulse superficial or deep?", type: "multi", options: ["superficial", "deep", "middle"] },
      { id: "4-5", question_he: "האם הדופק חלק וזורם או מחוספס?", question_en: "Is the pulse smooth/slippery or rough?", type: "multi", options: ["slippery", "rough", "normal"] },
      { id: "4-6", question_he: "האם יש הבדל בין דופק ימין לשמאל?", question_en: "Is there difference between right and left pulse?", type: "yesno" },
      { id: "4-7", question_he: "האם הדופק רגיל וקבוע או משתנה?", question_en: "Is the pulse regular or irregular?", type: "multi", options: ["regular", "irregular"] },
      { id: "4-8", question_he: "מהו עומק הדופק (צ'אן/גואן/צ'י)?", question_en: "What is pulse depth at Cun/Guan/Chi positions?", type: "open" },
      { id: "4-9", question_he: "האם הדופק מתוח כמו מיתר?", question_en: "Is the pulse tense like a string (wiry)?", type: "yesno" },
      { id: "4-10", question_he: "האם הדופק דופק בחוזקה?", question_en: "Is the pulse pounding/forceful?", type: "yesno" },
      { id: "4-11", question_he: "האם הדופק נעלם בלחיצה קלה?", question_en: "Does the pulse disappear with light pressure?", type: "yesno" },
      { id: "4-12", question_he: "האם הדופק מרגיש ריק או מלא?", question_en: "Does the pulse feel empty or full?", type: "multi", options: ["empty", "full", "normal"] },
      { id: "4-13", question_he: "האם יש דילוגים או הפסקות?", question_en: "Are there skips or pauses?", type: "yesno" },
      { id: "4-14", question_he: "מהי האיכות הכללית (שוטף, עדין, גס)?", question_en: "What is the overall quality (flowing, thin, thick)?", type: "open" },
      { id: "4-15", question_he: "מהי הרושם הכללי מהדופק?", question_en: "What is the general impression from the pulse?", type: "open" }
    ]
  },

  // Module 5: TCM Tongue Diagnosis
  {
    id: 5,
    module_name: "TCM Tongue Diagnosis",
    module_name_he: "אבחון לשון",
    nanobanan_prompt_id: "nanobanan_general",
    linked_knowledge_base: "TCM_Diagnostics.csv",
    icon: "Eye",
    color: "#E91E63",
    category: "diagnostic",
    questions: [
      { id: "5-1", question_he: "מהו צבע גוף הלשון (חיוור, אדום, סגול, כחלחל)?", question_en: "What is the tongue body color (pale, red, purple, bluish)?", type: "open" },
      { id: "5-2", question_he: "האם הלשון בהירה מדי (חיוורת)?", question_en: "Is the tongue too pale?", type: "yesno" },
      { id: "5-3", question_he: "האם הלשון אדומה מדי?", question_en: "Is the tongue too red?", type: "yesno" },
      { id: "5-4", question_he: "האם יש גוון סגלגל או כחלחל?", question_en: "Is there purple or bluish tint?", type: "yesno" },
      { id: "5-5", question_he: "מהו צבע החיפוי (לבן, צהוב, אפור, שחור)?", question_en: "What is the coating color (white, yellow, grey, black)?", type: "open" },
      { id: "5-6", question_he: "מהי עובי החיפוי (דק, עבה, ללא)?", question_en: "What is the coating thickness (thin, thick, none)?", type: "multi", options: ["thin", "thick", "none"] },
      { id: "5-7", question_he: "האם החיפוי יבש או לח?", question_en: "Is the coating dry or moist?", type: "multi", options: ["dry", "moist", "normal"] },
      { id: "5-8", question_he: "האם יש סדקים בלשון?", question_en: "Are there cracks in the tongue?", type: "yesno" },
      { id: "5-9", question_he: "האם הלשון נפוחה עם סימני שיניים?", question_en: "Is the tongue swollen with teeth marks?", type: "yesno" },
      { id: "5-10", question_he: "האם הלשון רזה או יבשה?", question_en: "Is the tongue thin or dry?", type: "yesno" },
      { id: "5-11", question_he: "האם יש נקודות אדומות על הלשון?", question_en: "Are there red dots on the tongue?", type: "yesno" },
      { id: "5-12", question_he: "האם קצה הלשון אדום יותר מהגוף?", question_en: "Is the tongue tip redder than the body?", type: "yesno" },
      { id: "5-13", question_he: "האם צדדי הלשון אדומים או סגולים?", question_en: "Are the tongue sides red or purple?", type: "yesno" },
      { id: "5-14", question_he: "האם הלשון רועדת או נעה?", question_en: "Is the tongue trembling or moving?", type: "yesno" },
      { id: "5-15", question_he: "מהו הרושם הכללי מהלשון?", question_en: "What is the general impression from the tongue?", type: "open" }
    ]
  },

  // Module 6: TCM Qi Blood Fluids
  {
    id: 6,
    module_name: "TCM Qi Blood Fluids",
    module_name_he: "צ'י, דם ונוזלים",
    nanobanan_prompt_id: "nanobanan_general",
    linked_knowledge_base: "TCM_Foundations.csv",
    icon: "Droplets",
    color: "#2196F3",
    category: "diagnostic",
    questions: [
      { id: "6-1", question_he: "האם יש עייפות כרונית או חולשה?", question_en: "Is there chronic fatigue or weakness?", type: "yesno" },
      { id: "6-2", question_he: "האם יש קוצר נשימה במאמץ קל?", question_en: "Is there shortness of breath with mild exertion?", type: "yesno" },
      { id: "6-3", question_he: "האם הקול חלש או נמוך?", question_en: "Is the voice weak or low?", type: "yesno" },
      { id: "6-4", question_he: "האם יש הזעה ספונטנית ללא מאמץ?", question_en: "Is there spontaneous sweating without exertion?", type: "yesno" },
      { id: "6-5", question_he: "האם יש חיוורון בפנים או בשפתיים?", question_en: "Is there pallor in face or lips?", type: "yesno" },
      { id: "6-6", question_he: "האם יש סחרחורות או טשטוש ראייה?", question_en: "Are there dizziness or blurred vision?", type: "yesno" },
      { id: "6-7", question_he: "האם יש נימול או עקצוץ בגפיים?", question_en: "Is there numbness or tingling in limbs?", type: "yesno" },
      { id: "6-8", question_he: "האם העור יבש או שיער שביר?", question_en: "Is the skin dry or hair brittle?", type: "yesno" },
      { id: "6-9", question_he: "האם יש בעיות במחזור (נשים)?", question_en: "Are there menstrual problems (women)?", type: "yesno" },
      { id: "6-10", question_he: "האם יש כאבים קבועים במקום אחד?", question_en: "Are there fixed pains in one location?", type: "yesno" },
      { id: "6-11", question_he: "האם יש בצקות או נפיחות?", question_en: "Is there edema or swelling?", type: "yesno" },
      { id: "6-12", question_he: "האם יש ליחה או הפרשות מרובות?", question_en: "Is there phlegm or excessive secretions?", type: "yesno" },
      { id: "6-13", question_he: "האם יש תחושת כבדות בגוף?", question_en: "Is there feeling of heaviness in the body?", type: "yesno" },
      { id: "6-14", question_he: "האם יש יובש בפה, עור או עיניים?", question_en: "Is there dryness in mouth, skin, or eyes?", type: "yesno" },
      { id: "6-15", question_he: "האם יש צמא מוגבר?", question_en: "Is there increased thirst?", type: "yesno" }
    ]
  },

  // Module 7: TCM Six Stages
  {
    id: 7,
    module_name: "TCM Six Stages",
    module_name_he: "שש השכבות - מחלות חום/קור",
    nanobanan_prompt_id: "nanobanan_general",
    linked_knowledge_base: "TCM_Foundations.csv",
    icon: "Thermometer",
    color: "#FF5722",
    category: "diagnostic",
    questions: [
      { id: "7-1", question_he: "Tai Yang: האם יש רתיעה מקור, חום, כאבי ראש עורפיים ונוקשות בצוואר?", question_en: "Tai Yang: Is there aversion to cold, fever, occipital headache and neck stiffness?", type: "yesno" },
      { id: "7-2", question_he: "Yang Ming: האם יש חום גבוה, הזעה מרובה, צמא גדול ודופק שופע?", question_en: "Yang Ming: Is there high fever, profuse sweating, great thirst and flooding pulse?", type: "yesno" },
      { id: "7-3", question_he: "Shao Yang: האם יש חום וקור לסירוגין, טעם מר בפה, בחילות וכאב בצד הגוף?", question_en: "Shao Yang: Is there alternating fever/chills, bitter taste, nausea and lateral pain?", type: "yesno" },
      { id: "7-4", question_he: "Tai Yin: האם יש כאבי בטן, שלשולים, הקאות, חוסר צמא ותחושת קור?", question_en: "Tai Yin: Is there abdominal pain, diarrhea, vomiting, no thirst and cold sensation?", type: "yesno" },
      { id: "7-5", question_he: "Shao Yin (קור): האם יש עייפות קיצונית, רצון לישון כל הזמן, קור בגפיים ודופק חלש מאוד?", question_en: "Shao Yin (cold): Is there extreme fatigue, constant sleepiness, cold limbs and very weak pulse?", type: "yesno" },
      { id: "7-6", question_he: "Shao Yin (חום): האם יש אי שקט, נדודי שינה, יובש בפה וגרון, ולשון אדומה?", question_en: "Shao Yin (heat): Is there restlessness, insomnia, dry mouth/throat, and red tongue?", type: "yesno" },
      { id: "7-7", question_he: "Jue Yin: האם יש תחושת קור בגפיים אך חום בחזה, רעב ללא רצון לאכול?", question_en: "Jue Yin: Is there cold limbs but chest heat, hunger without desire to eat?", type: "yesno" },
      { id: "7-8", question_he: "האם ההזעה משפרת את המצב או מחלישה?", question_en: "Does sweating improve or worsen the condition?", type: "multi", options: ["improves", "worsens", "no change"] },
      { id: "7-9", question_he: "האם יש כאבי שרירים כמו בשפעת?", question_en: "Are there muscle aches like in flu?", type: "yesno" },
      { id: "7-10", question_he: "האם מערכת העיכול הפסיקה לתפקד?", question_en: "Has the digestive system stopped functioning?", type: "yesno" },
      { id: "7-11", question_he: "האם הצמא הוא למים קרים או חמים?", question_en: "Is the thirst for cold or warm water?", type: "multi", options: ["cold", "warm", "no thirst"] },
      { id: "7-12", question_he: "האם יש עצבנות או אפאתיות?", question_en: "Is there irritability or apathy?", type: "multi", options: ["irritability", "apathy", "neither"] },
      { id: "7-13", question_he: "האם השתן בהיר ושופע או כהה ומועט?", question_en: "Is the urine clear/copious or dark/scanty?", type: "multi", options: ["clear-copious", "dark-scanty", "normal"] },
      { id: "7-14", question_he: "האם המחלה התחילה כהצטננות והחמירה?", question_en: "Did the illness start as a cold and worsen?", type: "yesno" },
      { id: "7-15", question_he: "האם נלקחה אנטיביוטיקה או תרופות מורידות חום?", question_en: "Were antibiotics or fever-reducing medications taken?", type: "yesno" }
    ]
  },

  // Module 8: TCM San Jiao Wei Qi
  {
    id: 8,
    module_name: "TCM San Jiao Wei Qi",
    module_name_he: "סאן ג'יאו ומערכת החיסון",
    nanobanan_prompt_id: "nanobanan_general",
    linked_knowledge_base: "TCM_Foundations.csv",
    icon: "Shield",
    color: "#4CAF50",
    category: "diagnostic",
    questions: [
      { id: "8-1", question_he: "מחמם עליון: האם יש שיעול, קוצר נשימה, כאב גרון או הזעה בפלג גוף עליון?", question_en: "Upper Jiao: Is there cough, SOB, sore throat or upper body sweating?", type: "yesno" },
      { id: "8-2", question_he: "מחמם אמצעי: האם יש נפיחות בבטן, תחושת כבדות לאחר אוכל, או חום בגוף?", question_en: "Middle Jiao: Is there bloating, post-meal heaviness, or body heat?", type: "yesno" },
      { id: "8-3", question_he: "מחמם תחתון: האם יש עצירות/שלשול, בעיות במתן שתן, או כאבי גב תחתון?", question_en: "Lower Jiao: Is there constipation/diarrhea, urination problems, or low back pain?", type: "yesno" },
      { id: "8-4", question_he: "Wei Qi: האם אתה נדבק בקלות במחלות ויראליות?", question_en: "Wei Qi: Do you catch viral illnesses easily?", type: "yesno" },
      { id: "8-5", question_he: "האם לוקח לך זמן רב להחלים ממחלות פשוטות?", question_en: "Does it take you a long time to recover from simple illnesses?", type: "yesno" },
      { id: "8-6", question_he: "האם אתה מזיע ללא מאמץ או לא מזיע כלל גם בחום?", question_en: "Do you sweat without exertion or not sweat even in heat?", type: "multi", options: ["spontaneous", "none", "normal"] },
      { id: "8-7", question_he: "האם רוח גורמת לך לכאבי ראש, דמעת, או התעטשויות?", question_en: "Does wind cause headaches, tearing, or sneezing?", type: "yesno" },
      { id: "8-8", question_he: "האם יש אלרגיות עונתיות, נזלת כרונית או גירויי עור?", question_en: "Are there seasonal allergies, chronic rhinitis, or skin irritations?", type: "yesno" },
      { id: "8-9", question_he: "האם יש בעיה בפיזור הנוזלים (בצקות, קשיי השתנה)?", question_en: "Is there fluid distribution problem (edema, urination difficulty)?", type: "yesno" },
      { id: "8-10", question_he: "האם יש נפיחות בבלוטות הלימפה או דלקות גרון חוזרות?", question_en: "Is there lymph node swelling or recurrent throat infections?", type: "yesno" },
      { id: "8-11", question_he: "האם אתה סובל משינויים קיצוניים בתחושת החום/קור בגוף?", question_en: "Do you suffer from extreme changes in body temperature sensation?", type: "yesno" },
      { id: "8-12", question_he: "האם העור חוסם פתוגנים (חזק) או רגיש ופגיע?", question_en: "Does the skin block pathogens (strong) or is it sensitive/vulnerable?", type: "multi", options: ["strong", "sensitive", "normal"] },
      { id: "8-13", question_he: "האם יש תחושת גודש לימפתי או נפיחות כרונית?", question_en: "Is there lymphatic congestion or chronic swelling?", type: "yesno" },
      { id: "8-14", question_he: "האם הנשימה עמוקה ומלאה, או שטחית?", question_en: "Is the breathing deep and full, or shallow?", type: "multi", options: ["deep", "shallow", "normal"] },
      { id: "8-15", question_he: "האם אתה מרגיש 'חשוף' לאנרגיות של אחרים או לסביבה?", question_en: "Do you feel 'exposed' to others' energies or the environment?", type: "yesno" }
    ]
  },

  // Module 9: TCM Pediatric
  {
    id: 9,
    module_name: "TCM Pediatric",
    module_name_he: "ילדים - כללי",
    nanobanan_prompt_id: "nanobanan_school_age",
    linked_knowledge_base: "tcm_children_7-13_qa_enhanced.csv",
    icon: "Baby",
    color: "#FFEB3B",
    category: "age-specific",
    questions: [
      { id: "9-1", question_he: "האם הילד ישן לילה רצוף, או מתעורר בבכי/פחד?", question_en: "Does the child sleep through the night or wake with crying/fear?", type: "yesno" },
      { id: "9-2", question_he: "האם יש כאבי בטן, גזים, שלשולים או עצירות?", question_en: "Are there stomach aches, gas, diarrhea, or constipation?", type: "yesno" },
      { id: "9-3", question_he: "האם הילד אכלן בררן, חסר תיאבון, או רעב תמיד?", question_en: "Is the child a picky eater, lacking appetite, or always hungry?", type: "multi", options: ["picky", "no-appetite", "always-hungry", "normal"] },
      { id: "9-4", question_he: "האם הילד חולה לעיתים תכופות (דלקות אוזניים, גרון, נזלת)?", question_en: "Does the child get sick frequently (ear infections, throat, rhinitis)?", type: "yesno" },
      { id: "9-5", question_he: "האם יש עיכוב בהתפתחות מוטורית, שפתית או גדילה?", question_en: "Is there developmental delay in motor, speech, or growth?", type: "yesno" },
      { id: "9-6", question_he: "האם הילד נוטה להתקפי זעם, ביישנות קיצונית, או היפראקטיביות?", question_en: "Does the child tend to tantrums, extreme shyness, or hyperactivity?", type: "multi", options: ["tantrums", "shy", "hyperactive", "none"] },
      { id: "9-7", question_he: "האם יש אקזמה, אטופיק דרמטיטיס, או פריחות?", question_en: "Is there eczema, atopic dermatitis, or rashes?", type: "yesno" },
      { id: "9-8", question_he: "האם יש אסטמה, שיעול כרוני, או נשימה כבדה בשינה?", question_en: "Is there asthma, chronic cough, or heavy breathing during sleep?", type: "yesno" },
      { id: "9-9", question_he: "האם הילד מרטיב בלילה (מעל גיל 5)?", question_en: "Does the child wet the bed at night (over age 5)?", type: "yesno" },
      { id: "9-10", question_he: "האם הילד 'חם' תמיד (מזיע בלילה, זורק שמיכה) או 'קר'?", question_en: "Is the child always 'hot' (night sweating, throws off blanket) or 'cold'?", type: "multi", options: ["hot", "cold", "normal"] },
      { id: "9-11", question_he: "האם יש הזעה בראש בזמן שינה או הזעה בכפות הידיים?", question_en: "Is there head sweating during sleep or palm sweating?", type: "yesno" },
      { id: "9-12", question_he: "האם הילד 'מלא ליחה' (נזלת, שיעול לח, נחירות)?", question_en: "Is the child 'full of phlegm' (rhinitis, wet cough, snoring)?", type: "yesno" },
      { id: "9-13", question_he: "האם התזונה מבוססת על מתוקים, מוצרי חלב ומזון קר?", question_en: "Is the diet based on sweets, dairy, and cold foods?", type: "yesno" },
      { id: "9-14", question_he: "האם הילד קיבל טיפולים אנטיביוטיים רבים בעבר?", question_en: "Has the child received many antibiotic treatments in the past?", type: "yesno" },
      { id: "9-15", question_he: "האם נצפתה תגובה חריגה לחיסונים?", question_en: "Was there an unusual reaction to vaccinations?", type: "yesno" }
    ]
  },

  // Module 10: TCM Herbal Medicine
  {
    id: 10,
    module_name: "TCM Herbal Medicine",
    module_name_he: "אינדיקציות לצמחים",
    nanobanan_prompt_id: "nanobanan_general",
    linked_knowledge_base: "TCM_Herbal_Formulas.csv",
    icon: "Leaf",
    color: "#8BC34A",
    category: "herbal",
    questions: [
      { id: "10-1", question_he: "צורך בחיזוק: האם המטופל חלש, עייף, חיוור וזקוק לבנייה?", question_en: "Need to tonify: Is the patient weak, tired, pale and needs building up?", type: "yesno" },
      { id: "10-2", question_he: "צורך בפיזור: האם יש מצב אקוטי, חום, כאב חזק או דלקת?", question_en: "Need to clear: Is there acute condition, fever, strong pain, or inflammation?", type: "yesno" },
      { id: "10-3", question_he: "צורך בחימום: האם יש קור פנימי, שלשולים קרים, וכאבי בטן המוטבים בחום?", question_en: "Need to warm: Is there internal cold, cold diarrhea, abdominal pain relieved by heat?", type: "yesno" },
      { id: "10-4", question_he: "צורך בקירור: האם יש חום פנימי, צמא, פנים אדומות ודימומים?", question_en: "Need to cool: Is there internal heat, thirst, red face, and bleeding?", type: "yesno" },
      { id: "10-5", question_he: "צורך בהנעה: האם יש סטגנציה של צ'י או דם (כאב, מתח, גושים)?", question_en: "Need to move: Is there Qi or Blood stagnation (pain, tension, masses)?", type: "yesno" },
      { id: "10-6", question_he: "צורך בייבוש: האם יש ליחה, בצקות, כבדות והפרשות מרובות?", question_en: "Need to dry: Is there phlegm, edema, heaviness, and excessive secretions?", type: "yesno" },
      { id: "10-7", question_he: "צורך בלחלוח: האם יש יובש בשיעול, בעור, במעיים?", question_en: "Need to moisten: Is there dryness in cough, skin, intestines?", type: "yesno" },
      { id: "10-8", question_he: "צורך בהרגעה: האם יש נדודי שינה, חרדה ופלפיטציות?", question_en: "Need to calm Shen: Is there insomnia, anxiety, and palpitations?", type: "yesno" },
      { id: "10-9", question_he: "צורך בכיווץ: האם יש הזעה ספונטנית, שלשול כרוני, או בריחת שתן/זרע?", question_en: "Need to astringe: Is there spontaneous sweating, chronic diarrhea, or incontinence?", type: "yesno" },
      { id: "10-10", question_he: "טעמים: האם המטופל זקוק לטעם המתוק, המר, או החריף?", question_en: "Tastes: Does the patient need sweet, bitter, or pungent taste?", type: "multi", options: ["sweet", "bitter", "pungent", "sour", "salty"] },
      { id: "10-11", question_he: "האם מערכת העיכול חזקה מספיק לעכל צמחים 'כבדים'?", question_en: "Is the digestive system strong enough for 'heavy' herbs?", type: "yesno" },
      { id: "10-12", question_he: "האם המטופל נוטל תרופות מרשם (מדללי דם וכו')?", question_en: "Is the patient taking prescription medications (blood thinners, etc.)?", type: "yesno" },
      { id: "10-13", question_he: "צורה מועדפת: האם המטופל יעדיף אבקה, נוזל או כדורים?", question_en: "Preferred form: Would the patient prefer powder, liquid, or pills?", type: "multi", options: ["powder", "liquid", "pills"] },
      { id: "10-14", question_he: "האם יש אלרגיה ידועה לצמחים או מזונות?", question_en: "Is there known allergy to herbs or foods?", type: "yesno" },
      { id: "10-15", question_he: "האם יש צורך בזהירות מיוחדת (הריון/הנקה)?", question_en: "Is there need for special caution (pregnancy/nursing)?", type: "yesno" }
    ]
  },

  // Module 11: TCM Herbal Formulas
  {
    id: 11,
    module_name: "TCM Herbal Formulas",
    module_name_he: "התאמת פורמולה",
    nanobanan_prompt_id: "nanobanan_general",
    linked_knowledge_base: "TCM_Herbal_Formulas.csv",
    icon: "FlaskConical",
    color: "#795548",
    category: "herbal",
    questions: [
      { id: "11-1", question_he: "Gui Pi Tang: האם יש שילוב של נדודי שינה, דאגות, עייפות ופלפיטציות?", question_en: "Gui Pi Tang: Is there insomnia, worry, fatigue, and palpitations?", type: "yesno" },
      { id: "11-2", question_he: "Xiao Yao San: האם יש מתח, עצבנות, PMS וכאבי ראש?", question_en: "Xiao Yao San: Is there tension, irritability, PMS, and headaches?", type: "yesno" },
      { id: "11-3", question_he: "Liu Wei Di Huang Wan: האם יש כאבי גב, הזעות לילה, חום בכפות ידיים/רגליים?", question_en: "Liu Wei Di Huang Wan: Is there back pain, night sweats, palm/sole heat?", type: "yesno" },
      { id: "11-4", question_he: "Bu Zhong Yi Qi Tang: האם יש צניחת איברים, עייפות קשה, וצורך ב'הרמה'?", question_en: "Bu Zhong Yi Qi Tang: Is there organ prolapse, severe fatigue, need for 'lifting'?", type: "yesno" },
      { id: "11-5", question_he: "Si Jun Zi Tang: האם יש חולשת עיכול בסיסית, עייפות וצואה רכה?", question_en: "Si Jun Zi Tang: Is there basic digestive weakness, fatigue, and soft stool?", type: "yesno" },
      { id: "11-6", question_he: "Si Wu Tang: האם יש חיוורון, סחרחורות, וסת דלילה ויובש?", question_en: "Si Wu Tang: Is there pallor, dizziness, scanty menses, and dryness?", type: "yesno" },
      { id: "11-7", question_he: "Er Chen Tang: האם יש ליחה מרובה, בחילות וחיפוי לשון עבה?", question_en: "Er Chen Tang: Is there excessive phlegm, nausea, and thick tongue coating?", type: "yesno" },
      { id: "11-8", question_he: "Ban Xia Hou Po Tang: האם יש תחושת 'גוש בגרון' ולחץ רגשי?", question_en: "Ban Xia Hou Po Tang: Is there 'lump in throat' feeling and emotional pressure?", type: "yesno" },
      { id: "11-9", question_he: "Wen Dan Tang: האם יש ליחה-חום, סחרחורות, בחילות וחלומות רעים?", question_en: "Wen Dan Tang: Is there phlegm-heat, dizziness, nausea, and bad dreams?", type: "yesno" },
      { id: "11-10", question_he: "Ba Zhen Tang: האם יש חולשה משולבת של צ'י ודם?", question_en: "Ba Zhen Tang: Is there combined Qi and Blood weakness?", type: "yesno" },
      { id: "11-11", question_he: "Long Dan Xie Gan Tang: האם יש דלקת בדרכי השתן, הרפס, או מיגרנה חריפה?", question_en: "Long Dan Xie Gan Tang: Is there UTI, herpes, or acute migraine?", type: "yesno" },
      { id: "11-12", question_he: "Suan Zao Ren Tang: האם יש נדודי שינה על רקע חוסר שקט ואי יכולת 'לכבות את הראש'?", question_en: "Suan Zao Ren Tang: Is there insomnia with restlessness and inability to 'turn off the mind'?", type: "yesno" },
      { id: "11-13", question_he: "Yu Ping Feng San: האם יש נטייה להצטננויות חוזרות וחולשה חיסונית?", question_en: "Yu Ping Feng San: Is there tendency to recurrent colds and immune weakness?", type: "yesno" },
      { id: "11-14", question_he: "Sheng Mai San: האם יש קוצר נשימה, הזעה מרובה ותשישות?", question_en: "Sheng Mai San: Is there shortness of breath, profuse sweating, and exhaustion?", type: "yesno" },
      { id: "11-15", question_he: "Tian Wang Bu Xin Dan: האם יש חרדה, יובש, ודופק מהיר?", question_en: "Tian Wang Bu Xin Dan: Is there anxiety, dryness, and rapid pulse?", type: "yesno" }
    ]
  },

  // Module 12: TCM Herbal Matching
  {
    id: 12,
    module_name: "TCM Herbal Matching",
    module_name_he: "התאמה מתקדמת",
    nanobanan_prompt_id: "nanobanan_general",
    linked_knowledge_base: "TCM_Herbal_Formulas.csv",
    icon: "Puzzle",
    color: "#9E9E9E",
    category: "herbal",
    questions: [
      { id: "12-1", question_he: "קור vs חום: האם הפורמולה צריכה להיות מחממת או מקררת?", question_en: "Cold vs Heat: Should the formula be warming or cooling?", type: "multi", options: ["warming", "cooling", "neutral"] },
      { id: "12-2", question_he: "עליון vs תחתון: האם הבעיה היא בראש/ריאות או בכליות/רחם?", question_en: "Upper vs Lower: Is the problem in head/lungs or kidneys/uterus?", type: "multi", options: ["upper", "lower", "both"] },
      { id: "12-3", question_he: "אקוטי vs כרוני: האם המטרה היא סילוק פתוגן או בנייה?", question_en: "Acute vs Chronic: Is the goal pathogen removal or building?", type: "multi", options: ["acute", "chronic"] },
      { id: "12-4", question_he: "חיזוק דם vs הנעת דם: האם יש חסר דם או תקיעות דם?", question_en: "Nourish Blood vs Move Blood: Is there Blood deficiency or stasis?", type: "multi", options: ["deficiency", "stasis"] },
      { id: "12-5", question_he: "לחות חמה vs לחות קרה: האם הליחה צהובה/צמיגה או לבנה/מימית?", question_en: "Damp-Heat vs Damp-Cold: Is phlegm yellow/sticky or white/watery?", type: "multi", options: ["damp-heat", "damp-cold"] },
      { id: "12-6", question_he: "רוח חיצונית vs רוח פנימית: האם יש שפעת/רעד או סחרחורת/שבץ?", question_en: "External Wind vs Internal Wind: Is there flu/tremor or dizziness/stroke?", type: "multi", options: ["external", "internal"] },
      { id: "12-7", question_he: "Yin Def vs Blood Def: האם יש חום בכפות הידיים או סחרחורת וחיוורון?", question_en: "Yin Def vs Blood Def: Is there palm heat or dizziness and pallor?", type: "multi", options: ["yin-def", "blood-def", "both"] },
      { id: "12-8", question_he: "Kidney Yang vs Spleen Yang: האם יש קור בגב ושתן רב או שלשול ועייפות?", question_en: "Kidney Yang vs Spleen Yang: Is there back cold/copious urine or diarrhea/fatigue?", type: "multi", options: ["kidney-yang", "spleen-yang", "both"] },
      { id: "12-9", question_he: "Liver Qi vs Liver Fire: האם יש תחושת לחץ/תקיעות או התפרצויות זעם ופנים אדומות?", question_en: "Liver Qi vs Liver Fire: Is there pressure/stagnation or anger outbursts and red face?", type: "multi", options: ["liver-qi", "liver-fire"] },
      { id: "12-10", question_he: "Heart Fire vs Phlegm Fire: האם יש כיבים בלשון ואי שקט, או מאניה ואיבוד הכרה?", question_en: "Heart Fire vs Phlegm Fire: Is there tongue ulcers/restlessness or mania/unconsciousness?", type: "multi", options: ["heart-fire", "phlegm-fire"] },
      { id: "12-11", question_he: "Stomach Fire vs Stomach Yin: האם יש רעב מוגבר וריח פה, או רעב ללא רצון לאכול?", question_en: "Stomach Fire vs Stomach Yin: Is there increased hunger/bad breath or hunger without wanting to eat?", type: "multi", options: ["stomach-fire", "stomach-yin"] },
      { id: "12-12", question_he: "Lung Dryness vs Lung Phlegm: האם השיעול יבש או מלא ליחה?", question_en: "Lung Dryness vs Lung Phlegm: Is the cough dry or full of phlegm?", type: "multi", options: ["dry", "phlegm"] },
      { id: "12-13", question_he: "מינון: האם המטופל זקוק למינון גבוה או נמוך?", question_en: "Dosage: Does the patient need high or low dosage?", type: "multi", options: ["high", "low", "moderate"] },
      { id: "12-14", question_he: "מודיפיקציות: האם יש צורך להוסיף צמחים ספציפיים לתלונה משנית?", question_en: "Modifications: Is there need to add specific herbs for secondary complaint?", type: "yesno" },
      { id: "12-15", question_he: "מעקב: האם הפורמולה דורשת שינוי לאחר שבוע?", question_en: "Follow-up: Does the formula require change after a week?", type: "yesno" }
    ]
  },

  // Module 13: TCM Oncology Support
  {
    id: 13,
    module_name: "TCM Oncology Support",
    module_name_he: "אונקולוגיה כללי",
    nanobanan_prompt_id: "nanobanan_oncology",
    linked_knowledge_base: "TCM_Oncology_Support_Enhanced.csv",
    icon: "HeartPulse",
    color: "#673AB7",
    category: "specialty",
    questions: [
      { id: "13-1", question_he: "סוג הסרטן: באיזו מערכת נמצא הגידול?", question_en: "Cancer type: In which system is the tumor located?", type: "open" },
      { id: "13-2", question_he: "שלב המחלה: האם המחלה מקומית או גרורתית?", question_en: "Disease stage: Is the disease local or metastatic?", type: "multi", options: ["local", "metastatic"] },
      { id: "13-3", question_he: "סוג הטיפול: כימותרפיה, הקרנות, ביולוגי, אימונותרפיה או ניתוח?", question_en: "Treatment type: Chemo, radiation, biological, immunotherapy, or surgery?", type: "multi", options: ["chemo", "radiation", "biological", "immunotherapy", "surgery", "multiple"] },
      { id: "13-4", question_he: "תופעות לוואי - עיכול: בחילות, הקאות, שלשולים, עצירות?", question_en: "Side effects - GI: Nausea, vomiting, diarrhea, constipation?", type: "yesno" },
      { id: "13-5", question_he: "תופעות לוואי - דם: אנמיה, לויקופניה, טרומבוציטופניה?", question_en: "Side effects - Blood: Anemia, leukopenia, thrombocytopenia?", type: "yesno" },
      { id: "13-6", question_he: "תופעות לוואי - עצבים: נוירופתיה פריפרית?", question_en: "Side effects - Nerves: Peripheral neuropathy?", type: "yesno" },
      { id: "13-7", question_he: "עייפות: רמת האנרגיה מ-1 עד 10?", question_en: "Fatigue: Energy level from 1 to 10?", type: "scale" },
      { id: "13-8", question_he: "כאב: האם יש כאב אונקולוגי או כאב מניתוח?", question_en: "Pain: Is there oncological pain or post-surgery pain?", type: "yesno" },
      { id: "13-9", question_he: "שינה: האם יש נדודי שינה על רקע חרדה או סטרואידים?", question_en: "Sleep: Is there insomnia due to anxiety or steroids?", type: "yesno" },
      { id: "13-10", question_he: "גלי חום: האם יש גלי חום על רקע טיפול הורמונלי?", question_en: "Hot flashes: Are there hot flashes due to hormonal treatment?", type: "yesno" },
      { id: "13-11", question_he: "יובש: האם יש יובש בפה או בעור?", question_en: "Dryness: Is there dry mouth or dry skin?", type: "yesno" },
      { id: "13-12", question_he: "חיסון: האם יש נטייה לזיהומים?", question_en: "Immunity: Is there tendency to infections?", type: "yesno" },
      { id: "13-13", question_he: "מצב רגשי: פחד, דיכאון, חרדה, תקווה?", question_en: "Emotional state: Fear, depression, anxiety, hope?", type: "open" },
      { id: "13-14", question_he: "תזונה: האם המטופל מסוגל לאכול ולשמור על משקל?", question_en: "Nutrition: Is the patient able to eat and maintain weight?", type: "yesno" },
      { id: "13-15", question_he: "תוספים: האם המטופל נוטל תוספים שעלולים להתנגש עם הטיפול?", question_en: "Supplements: Is the patient taking supplements that may conflict with treatment?", type: "yesno" }
    ]
  },

  // Module 14: Integrative Oncology (Extended)
  {
    id: 14,
    module_name: "Integrative Oncology",
    module_name_he: "אונקולוגיה אינטגרטיבית",
    nanobanan_prompt_id: "nanobanan_oncology",
    linked_knowledge_base: "TCM_Oncology_Support_Enhanced.csv",
    icon: "Stethoscope",
    color: "#9C27B0",
    category: "specialty",
    questions: [
      { id: "14-1", question_he: "האם יש תיאום עם הרופא המטפל?", question_en: "Is there coordination with the treating physician?", type: "yesno" },
      { id: "14-2", question_he: "מהם התוצאות של בדיקות דם אחרונות?", question_en: "What are the results of recent blood tests?", type: "open" },
      { id: "14-3", question_he: "האם יש היסטוריה משפחתית של סרטן?", question_en: "Is there family history of cancer?", type: "yesno" },
      { id: "14-4", question_he: "האם המטופל עבר או עובר כימותרפיה?", question_en: "Has the patient undergone or is undergoing chemotherapy?", type: "yesno" },
      { id: "14-5", question_he: "האם יש ירידה בתאי דם לבנים?", question_en: "Is there decrease in white blood cells?", type: "yesno" },
      { id: "14-6", question_he: "האם יש ירידה בהמוגלובין?", question_en: "Is there decrease in hemoglobin?", type: "yesno" },
      { id: "14-7", question_he: "האם יש ירידה בטסיות דם?", question_en: "Is there decrease in platelets?", type: "yesno" },
      { id: "14-8", question_he: "מהי מטרת הטיפול האינטגרטיבי?", question_en: "What is the goal of integrative treatment?", type: "open" },
      { id: "14-9", question_he: "האם המטופל מעוניין בתמיכה רגשית/רוחנית?", question_en: "Is the patient interested in emotional/spiritual support?", type: "yesno" },
      { id: "14-10", question_he: "האם יש תופעות לוואי מהקרנות?", question_en: "Are there side effects from radiation?", type: "yesno" },
      { id: "14-11", question_he: "האם יש בעיות בלוע או בבליעה?", question_en: "Are there throat or swallowing problems?", type: "yesno" },
      { id: "14-12", question_he: "האם יש בצקת לימפתית?", question_en: "Is there lymphedema?", type: "yesno" },
      { id: "14-13", question_he: "מהו מצב התיאבון?", question_en: "What is the appetite status?", type: "scale" },
      { id: "14-14", question_he: "האם יש שינויים בטעם או בריח?", question_en: "Are there changes in taste or smell?", type: "yesno" },
      { id: "14-15", question_he: "האם יש רצון לחיות ולהילחם?", question_en: "Is there will to live and fight?", type: "yesno" }
    ]
  },

  // Module 18: Western to TCM Translator
  {
    id: 18,
    module_name: "Western to TCM Translator",
    module_name_he: "תרגום מערבי ל-TCM",
    nanobanan_prompt_id: "nanobanan_translator",
    linked_knowledge_base: "TCM_Western_Symptom_Translation_Guide.csv",
    icon: "Languages",
    color: "#00BCD4",
    category: "diagnostic",
    questions: [
      { id: "18-1", question_he: "מהי האבחנה המערבית?", question_en: "What is the Western diagnosis?", type: "open" },
      { id: "18-2", question_he: "מהם הסימפטומים העיקריים?", question_en: "What are the main symptoms?", type: "open" },
      { id: "18-3", question_he: "אילו תרופות נלקחות?", question_en: "What medications are being taken?", type: "open" },
      { id: "18-4", question_he: "מהי תוצאת הבדיקות המעבדתיות?", question_en: "What are the laboratory test results?", type: "open" },
      { id: "18-5", question_he: "האם יש ממצאי הדמיה רלוונטיים?", question_en: "Are there relevant imaging findings?", type: "open" },
      { id: "18-6", question_he: "מהו משך המחלה?", question_en: "What is the disease duration?", type: "open" },
      { id: "18-7", question_he: "האם הטיפול המערבי עוזר?", question_en: "Is the Western treatment helping?", type: "yesno" },
      { id: "18-8", question_he: "מהן תופעות הלוואי מהתרופות?", question_en: "What are the medication side effects?", type: "open" },
      { id: "18-9", question_he: "האם יש היסטוריה רפואית נוספת?", question_en: "Is there additional medical history?", type: "open" },
      { id: "18-10", question_he: "האם יש היסטוריה משפחתית רלוונטית?", question_en: "Is there relevant family history?", type: "open" },
      { id: "18-11", question_he: "מהו מצב הדופק והלשון?", question_en: "What is the pulse and tongue status?", type: "open" },
      { id: "18-12", question_he: "מהם הסימפטומים הנלווים?", question_en: "What are the accompanying symptoms?", type: "open" },
      { id: "18-13", question_he: "מה מחמיר ומה מקל?", question_en: "What aggravates and what relieves?", type: "open" },
      { id: "18-14", question_he: "מהו הדפוס הרגשי הדומיננטי?", question_en: "What is the dominant emotional pattern?", type: "open" },
      { id: "18-15", question_he: "מהי מטרת הטיפול האינטגרטיבי?", question_en: "What is the goal of integrative treatment?", type: "open" }
    ]
  },

  // Module 19: Grief Insomnia
  {
    id: 19,
    module_name: "Grief Insomnia",
    module_name_he: "אבל ונדודי שינה",
    nanobanan_prompt_id: "nanobanan_insomnia",
    linked_knowledge_base: "TCM_Grief_Insomnia_Acupuncture_Points.csv",
    icon: "Moon",
    color: "#3F51B5",
    category: "specialty",
    questions: [
      { id: "19-1", question_he: "מתי אירע האובדן?", question_en: "When did the loss occur?", type: "open" },
      { id: "19-2", question_he: "מה סוג האובדן (אדם, עבודה, בריאות)?", question_en: "What type of loss (person, job, health)?", type: "open" },
      { id: "19-3", question_he: "האם יש קושי להירדם או התעוררויות?", question_en: "Is there difficulty falling asleep or awakenings?", type: "multi", options: ["falling-asleep", "awakenings", "both"] },
      { id: "19-4", question_he: "באיזו שעה מתעורר?", question_en: "At what time do you wake up?", type: "open" },
      { id: "19-5", question_he: "האם יש חלומות על הנפטר?", question_en: "Are there dreams about the deceased?", type: "yesno" },
      { id: "19-6", question_he: "האם יש בכי או עצב?", question_en: "Is there crying or sadness?", type: "yesno" },
      { id: "19-7", question_he: "האם יש תחושת אשמה?", question_en: "Is there feeling of guilt?", type: "yesno" },
      { id: "19-8", question_he: "האם יש כעס?", question_en: "Is there anger?", type: "yesno" },
      { id: "19-9", question_he: "האם יש שינויים בתיאבון?", question_en: "Are there changes in appetite?", type: "yesno" },
      { id: "19-10", question_he: "האם יש תחושת ריקנות בחזה?", question_en: "Is there feeling of emptiness in the chest?", type: "yesno" },
      { id: "19-11", question_he: "האם יש אנחות מרובות?", question_en: "Is there frequent sighing?", type: "yesno" },
      { id: "19-12", question_he: "האם יש קושי בנשימה?", question_en: "Is there difficulty breathing?", type: "yesno" },
      { id: "19-13", question_he: "האם יש תמיכה חברתית?", question_en: "Is there social support?", type: "yesno" },
      { id: "19-14", question_he: "האם עברת טיפול פסיכולוגי?", question_en: "Have you undergone psychological treatment?", type: "yesno" },
      { id: "19-15", question_he: "מהי מטרת הטיפול?", question_en: "What is the treatment goal?", type: "open" }
    ]
  },

  // Module 20: Stress & Biofeedback
  {
    id: 20,
    module_name: "Stress & Biofeedback",
    module_name_he: "סטרס וביופידבק",
    nanobanan_prompt_id: "nanobanan_stress",
    linked_knowledge_base: "tcm_stress_biofeedback_75qa.csv",
    icon: "Heart",
    color: "#E91E63",
    category: "lifestyle",
    questions: [
      { id: "20-1", question_he: "מה רמת הסטרס מ-1 עד 10?", question_en: "What is the stress level from 1 to 10?", type: "scale" },
      { id: "20-2", question_he: "מהם מקורות הסטרס העיקריים?", question_en: "What are the main sources of stress?", type: "open" },
      { id: "20-3", question_he: "האם יש מתח בכתפיים ובצוואר?", question_en: "Is there tension in shoulders and neck?", type: "yesno" },
      { id: "20-4", question_he: "האם יש כאבי ראש מתח?", question_en: "Are there tension headaches?", type: "yesno" },
      { id: "20-5", question_he: "האם יש חריקת שיניים?", question_en: "Is there teeth grinding?", type: "yesno" },
      { id: "20-6", question_he: "האם הנשימה שטחית?", question_en: "Is the breathing shallow?", type: "yesno" },
      { id: "20-7", question_he: "האם יש בעיות עיכול מסטרס?", question_en: "Are there digestive problems from stress?", type: "yesno" },
      { id: "20-8", question_he: "האם יש שינויים בדופק?", question_en: "Are there changes in heart rate?", type: "yesno" },
      { id: "20-9", question_he: "האם יש הזעה מוגברת?", question_en: "Is there increased sweating?", type: "yesno" },
      { id: "20-10", question_he: "האם יש קושי בריכוז?", question_en: "Is there difficulty concentrating?", type: "yesno" },
      { id: "20-11", question_he: "האם יש נדודי שינה?", question_en: "Is there insomnia?", type: "yesno" },
      { id: "20-12", question_he: "האם יש שימוש בטכניקות הרפיה?", question_en: "Is there use of relaxation techniques?", type: "yesno" },
      { id: "20-13", question_he: "האם יש פעילות גופנית?", question_en: "Is there physical activity?", type: "yesno" },
      { id: "20-14", question_he: "האם יש תמיכה רגשית?", question_en: "Is there emotional support?", type: "yesno" },
      { id: "20-15", question_he: "מהי מטרת הטיפול?", question_en: "What is the treatment goal?", type: "open" }
    ]
  },

  // Module 22: Teen Mental Health
  {
    id: 22,
    module_name: "Teen Mental Health",
    module_name_he: "בריאות נפשית בני נוער",
    nanobanan_prompt_id: "nanobanan_teen_health",
    linked_knowledge_base: "TCM_Teenage_Mental_Health_Enhanced_CLEANED.csv",
    icon: "Users",
    color: "#FF9800",
    category: "age-specific",
    questions: [
      { id: "22-1", question_he: "מה גיל הנער/ה?", question_en: "What is the teenager's age?", type: "open" },
      { id: "22-2", question_he: "האם יש חרדה חברתית?", question_en: "Is there social anxiety?", type: "yesno" },
      { id: "22-3", question_he: "האם יש דיכאון או עצב מתמשך?", question_en: "Is there depression or persistent sadness?", type: "yesno" },
      { id: "22-4", question_he: "האם יש בעיות בהערכה עצמית?", question_en: "Are there self-esteem issues?", type: "yesno" },
      { id: "22-5", question_he: "האם יש בעיות בבית הספר?", question_en: "Are there problems at school?", type: "yesno" },
      { id: "22-6", question_he: "האם יש בעיות חברתיות?", question_en: "Are there social problems?", type: "yesno" },
      { id: "22-7", question_he: "האם יש שימוש במסכים מוגזם?", question_en: "Is there excessive screen use?", type: "yesno" },
      { id: "22-8", question_he: "האם יש בעיות שינה?", question_en: "Are there sleep problems?", type: "yesno" },
      { id: "22-9", question_he: "האם יש שינויים בתיאבון?", question_en: "Are there changes in appetite?", type: "yesno" },
      { id: "22-10", question_he: "האם יש מחשבות פגיעה עצמית?", question_en: "Are there thoughts of self-harm?", type: "yesno" },
      { id: "22-11", question_he: "האם יש שימוש בחומרים?", question_en: "Is there substance use?", type: "yesno" },
      { id: "22-12", question_he: "האם יש קונפליקטים משפחתיים?", question_en: "Are there family conflicts?", type: "yesno" },
      { id: "22-13", question_he: "האם יש תמיכה הורית?", question_en: "Is there parental support?", type: "yesno" },
      { id: "22-14", question_he: "האם יש טיפול פסיכולוגי נוכחי?", question_en: "Is there current psychological treatment?", type: "yesno" },
      { id: "22-15", question_he: "מהי מטרת הטיפול?", question_en: "What is the treatment goal?", type: "open" }
    ]
  },

  // Module 26: Adults 50-70 Vitality
  {
    id: 26,
    module_name: "Adults 50-70 Vitality",
    module_name_he: "מבוגרים 50-70 חיוניות",
    nanobanan_prompt_id: "nanobanan_adults_50_70",
    linked_knowledge_base: "TCM_Adults_50_70_Comprehensive_CONDITIONS.csv",
    icon: "Sun",
    color: "#FF5722",
    category: "age-specific",
    questions: [
      { id: "26-1", question_he: "מהי רמת האנרגיה הכללית?", question_en: "What is the general energy level?", type: "scale" },
      { id: "26-2", question_he: "האם יש בעיות זיכרון?", question_en: "Are there memory problems?", type: "yesno" },
      { id: "26-3", question_he: "האם יש כאבי מפרקים?", question_en: "Are there joint pains?", type: "yesno" },
      { id: "26-4", question_he: "האם יש בעיות שינה?", question_en: "Are there sleep problems?", type: "yesno" },
      { id: "26-5", question_he: "האם יש בעיות עיכול?", question_en: "Are there digestive problems?", type: "yesno" },
      { id: "26-6", question_he: "האם יש לחץ דם גבוה?", question_en: "Is there high blood pressure?", type: "yesno" },
      { id: "26-7", question_he: "האם יש סוכרת?", question_en: "Is there diabetes?", type: "yesno" },
      { id: "26-8", question_he: "האם יש בעיות לב?", question_en: "Are there heart problems?", type: "yesno" },
      { id: "26-9", question_he: "האם יש אוסטאופורוזיס?", question_en: "Is there osteoporosis?", type: "yesno" },
      { id: "26-10", question_he: "האם יש בעיות ראייה?", question_en: "Are there vision problems?", type: "yesno" },
      { id: "26-11", question_he: "האם יש בעיות שמיעה?", question_en: "Are there hearing problems?", type: "yesno" },
      { id: "26-12", question_he: "האם יש פעילות גופנית סדירה?", question_en: "Is there regular physical activity?", type: "yesno" },
      { id: "26-13", question_he: "האם יש חיי חברה פעילים?", question_en: "Is there active social life?", type: "yesno" },
      { id: "26-14", question_he: "האם יש תחביבים ותחומי עניין?", question_en: "Are there hobbies and interests?", type: "yesno" },
      { id: "26-15", question_he: "מהי מטרת הטיפול?", question_en: "What is the treatment goal?", type: "open" }
    ]
  },

  // Module 27: Adults 18-50 General
  {
    id: 27,
    module_name: "Adults 18-50 General",
    module_name_he: "מבוגרים 18-50 כללי",
    nanobanan_prompt_id: "nanobanan_adults_18_50",
    linked_knowledge_base: "TCM_Adults_18_50_Comprehensive_CONDITIONS.csv",
    icon: "User",
    color: "#2196F3",
    category: "age-specific",
    questions: [
      { id: "27-1", question_he: "מהי התלונה העיקרית?", question_en: "What is the main complaint?", type: "open" },
      { id: "27-2", question_he: "האם יש עייפות כרונית?", question_en: "Is there chronic fatigue?", type: "yesno" },
      { id: "27-3", question_he: "האם יש בעיות שינה?", question_en: "Are there sleep problems?", type: "yesno" },
      { id: "27-4", question_he: "האם יש בעיות עיכול?", question_en: "Are there digestive problems?", type: "yesno" },
      { id: "27-5", question_he: "האם יש כאבים כרוניים?", question_en: "Are there chronic pains?", type: "yesno" },
      { id: "27-6", question_he: "האם יש מתח וחרדה?", question_en: "Is there stress and anxiety?", type: "yesno" },
      { id: "27-7", question_he: "האם יש בעיות פוריות (נשים)?", question_en: "Are there fertility issues (women)?", type: "yesno" },
      { id: "27-8", question_he: "האם יש בעיות מחזור (נשים)?", question_en: "Are there menstrual problems (women)?", type: "yesno" },
      { id: "27-9", question_he: "האם יש בעיות עור?", question_en: "Are there skin problems?", type: "yesno" },
      { id: "27-10", question_he: "האם יש בעיות אלרגיות?", question_en: "Are there allergic problems?", type: "yesno" },
      { id: "27-11", question_he: "האם יש בעיות משקל?", question_en: "Are there weight issues?", type: "yesno" },
      { id: "27-12", question_he: "האם יש פעילות גופנית?", question_en: "Is there physical activity?", type: "yesno" },
      { id: "27-13", question_he: "מהי איכות התזונה?", question_en: "What is the diet quality?", type: "scale" },
      { id: "27-14", question_he: "האם יש שימוש בתרופות?", question_en: "Is there medication use?", type: "yesno" },
      { id: "27-15", question_he: "מהי מטרת הטיפול?", question_en: "What is the treatment goal?", type: "open" }
    ]
  },

  // Module 29: Geriatrics 70-120
  {
    id: 29,
    module_name: "Geriatrics 70-120",
    module_name_he: "גריאטריה 70-120",
    nanobanan_prompt_id: "nanobanan_geriatrics",
    linked_knowledge_base: "TCM_Clinic 70-120 _100_Common_Conditions_Complete.csv",
    icon: "Heart",
    color: "#795548",
    category: "age-specific",
    questions: [
      { id: "29-1", question_he: "מהו הגיל המדויק?", question_en: "What is the exact age?", type: "open" },
      { id: "29-2", question_he: "האם יש בעיות ניידות?", question_en: "Are there mobility problems?", type: "yesno" },
      { id: "29-3", question_he: "האם יש נפילות?", question_en: "Are there falls?", type: "yesno" },
      { id: "29-4", question_he: "האם יש בעיות קוגניטיביות?", question_en: "Are there cognitive problems?", type: "yesno" },
      { id: "29-5", question_he: "האם יש בריחת שתן?", question_en: "Is there urinary incontinence?", type: "yesno" },
      { id: "29-6", question_he: "האם יש עצירות כרונית?", question_en: "Is there chronic constipation?", type: "yesno" },
      { id: "29-7", question_he: "האם יש בעיות בליעה?", question_en: "Are there swallowing problems?", type: "yesno" },
      { id: "29-8", question_he: "האם יש בעיות ראייה?", question_en: "Are there vision problems?", type: "yesno" },
      { id: "29-9", question_he: "האם יש בעיות שמיעה?", question_en: "Are there hearing problems?", type: "yesno" },
      { id: "29-10", question_he: "האם יש כאבים כרוניים?", question_en: "Are there chronic pains?", type: "yesno" },
      { id: "29-11", question_he: "האם יש בדידות?", question_en: "Is there loneliness?", type: "yesno" },
      { id: "29-12", question_he: "האם יש תמיכה משפחתית?", question_en: "Is there family support?", type: "yesno" },
      { id: "29-13", question_he: "האם יש עזרה סיעודית?", question_en: "Is there nursing care?", type: "yesno" },
      { id: "29-14", question_he: "כמה תרופות נלקחות?", question_en: "How many medications are taken?", type: "open" },
      { id: "29-15", question_he: "מהי מטרת הטיפול?", question_en: "What is the treatment goal?", type: "open" }
    ]
  },

  // Module 30: Diet & Nutrition
  {
    id: 30,
    module_name: "Diet & Nutrition",
    module_name_he: "תזונה ודיאטה",
    nanobanan_prompt_id: "nanobanan_nutrition",
    linked_knowledge_base: "TCM_Diet_Nutrition_100_QA_Complete.csv",
    icon: "Apple",
    color: "#4CAF50",
    category: "lifestyle",
    questions: [
      { id: "30-1", question_he: "מהו סוג הגוף (יין/יאנג)?", question_en: "What is the body type (Yin/Yang)?", type: "multi", options: ["yin", "yang", "balanced"] },
      { id: "30-2", question_he: "האם יש עודף לחות בגוף?", question_en: "Is there excess dampness in the body?", type: "yesno" },
      { id: "30-3", question_he: "האם יש סימני חום פנימי?", question_en: "Are there signs of internal heat?", type: "yesno" },
      { id: "30-4", question_he: "האם יש סימני קור פנימי?", question_en: "Are there signs of internal cold?", type: "yesno" },
      { id: "30-5", question_he: "האם יש בעיות עיכול?", question_en: "Are there digestive problems?", type: "yesno" },
      { id: "30-6", question_he: "האם יש אלרגיות למזון?", question_en: "Are there food allergies?", type: "yesno" },
      { id: "30-7", question_he: "האם יש רגישויות תזונתיות?", question_en: "Are there food sensitivities?", type: "yesno" },
      { id: "30-8", question_he: "מהי העדפת הטעמים?", question_en: "What is the taste preference?", type: "open" },
      { id: "30-9", question_he: "האם יש צמא מוגבר?", question_en: "Is there increased thirst?", type: "yesno" },
      { id: "30-10", question_he: "מהי תדירות הארוחות?", question_en: "What is the meal frequency?", type: "open" },
      { id: "30-11", question_he: "האם יש נשנושים?", question_en: "Is there snacking?", type: "yesno" },
      { id: "30-12", question_he: "מהי כמות המים ביום?", question_en: "What is the daily water intake?", type: "open" },
      { id: "30-13", question_he: "האם יש שימוש בקפאין?", question_en: "Is there caffeine use?", type: "yesno" },
      { id: "30-14", question_he: "האם יש שימוש באלכוהול?", question_en: "Is there alcohol use?", type: "yesno" },
      { id: "30-15", question_he: "מהם המטרות התזונתיות?", question_en: "What are the nutritional goals?", type: "open" }
    ]
  },

  // Module 31: Mindset Performance
  {
    id: 31,
    module_name: "Mindset Performance",
    module_name_he: "מיינדסט וביצועים",
    nanobanan_prompt_id: "nanobanan_mindset",
    linked_knowledge_base: "TCM_Mindset_Mental_100_QA_Complete.csv",
    icon: "Target",
    color: "#673AB7",
    category: "lifestyle",
    questions: [
      { id: "31-1", question_he: "מהי המטרה העיקרית?", question_en: "What is the main goal?", type: "open" },
      { id: "31-2", question_he: "האם יש קושי בריכוז?", question_en: "Is there difficulty concentrating?", type: "yesno" },
      { id: "31-3", question_he: "האם יש בעיות זיכרון?", question_en: "Are there memory problems?", type: "yesno" },
      { id: "31-4", question_he: "האם יש חרדת ביצוע?", question_en: "Is there performance anxiety?", type: "yesno" },
      { id: "31-5", question_he: "האם יש פרפקציוניזם?", question_en: "Is there perfectionism?", type: "yesno" },
      { id: "31-6", question_he: "האם יש דחיינות?", question_en: "Is there procrastination?", type: "yesno" },
      { id: "31-7", question_he: "האם יש שחיקה?", question_en: "Is there burnout?", type: "yesno" },
      { id: "31-8", question_he: "האם יש עייפות מנטלית?", question_en: "Is there mental fatigue?", type: "yesno" },
      { id: "31-9", question_he: "האם יש בעיות מוטיבציה?", question_en: "Are there motivation problems?", type: "yesno" },
      { id: "31-10", question_he: "האם יש שינה איכותית?", question_en: "Is there quality sleep?", type: "yesno" },
      { id: "31-11", question_he: "האם יש פעילות גופנית?", question_en: "Is there physical activity?", type: "yesno" },
      { id: "31-12", question_he: "האם יש מדיטציה או מיינדפולנס?", question_en: "Is there meditation or mindfulness?", type: "yesno" },
      { id: "31-13", question_he: "האם יש איזון עבודה-חיים?", question_en: "Is there work-life balance?", type: "yesno" },
      { id: "31-14", question_he: "האם יש תמיכה חברתית?", question_en: "Is there social support?", type: "yesno" },
      { id: "31-15", question_he: "מהי מטרת הטיפול?", question_en: "What is the treatment goal?", type: "open" }
    ]
  },

  // Module 32: Trauma & Orthopedics
  {
    id: 32,
    module_name: "Trauma & Orthopedics",
    module_name_he: "טראומה ואורתופדיה",
    nanobanan_prompt_id: "nanobanan_trauma",
    linked_knowledge_base: "trauma corrected.csv",
    icon: "Bone",
    color: "#FF5722",
    category: "specialty",
    questions: [
      { id: "32-1", question_he: "מהו סוג הפציעה?", question_en: "What is the type of injury?", type: "open" },
      { id: "32-2", question_he: "מתי אירעה הפציעה?", question_en: "When did the injury occur?", type: "open" },
      { id: "32-3", question_he: "האם יש שבר?", question_en: "Is there a fracture?", type: "yesno" },
      { id: "32-4", question_he: "האם יש נפיחות?", question_en: "Is there swelling?", type: "yesno" },
      { id: "32-5", question_he: "האם יש שטף דם?", question_en: "Is there bruising?", type: "yesno" },
      { id: "32-6", question_he: "מהי רמת הכאב (1-10)?", question_en: "What is the pain level (1-10)?", type: "scale" },
      { id: "32-7", question_he: "האם יש הגבלה בתנועה?", question_en: "Is there limited range of motion?", type: "yesno" },
      { id: "32-8", question_he: "האם יש נימול או חולשה?", question_en: "Is there numbness or weakness?", type: "yesno" },
      { id: "32-9", question_he: "האם הייתה פיזיותרפיה?", question_en: "Has there been physiotherapy?", type: "yesno" },
      { id: "32-10", question_he: "האם היה ניתוח?", question_en: "Was there surgery?", type: "yesno" },
      { id: "32-11", question_he: "האם יש בעיה כרונית קודמת באזור?", question_en: "Is there a prior chronic problem in the area?", type: "yesno" },
      { id: "32-12", question_he: "מהי המטרה הפונקציונלית?", question_en: "What is the functional goal?", type: "open" },
      { id: "32-13", question_he: "האם יש בעיות שינה בגלל הכאב?", question_en: "Are there sleep problems due to pain?", type: "yesno" },
      { id: "32-14", question_he: "האם יש השפעה רגשית?", question_en: "Is there emotional impact?", type: "yesno" },
      { id: "32-15", question_he: "מהי מטרת הטיפול?", question_en: "What is the treatment goal?", type: "open" }
    ]
  },

  // Module 33: Immune Resilience
  {
    id: 33,
    module_name: "Immune Resilience",
    module_name_he: "עמידות חיסונית",
    nanobanan_prompt_id: "nanobanan_immune",
    linked_knowledge_base: "immune-resilience.csv",
    icon: "Shield",
    color: "#4CAF50",
    category: "lifestyle",
    questions: [
      { id: "33-1", question_he: "כמה פעמים בשנה אתה חולה?", question_en: "How many times a year do you get sick?", type: "open" },
      { id: "33-2", question_he: "כמה זמן לוקח להחלמה?", question_en: "How long does recovery take?", type: "open" },
      { id: "33-3", question_he: "האם יש אלרגיות?", question_en: "Are there allergies?", type: "yesno" },
      { id: "33-4", question_he: "האם יש מחלה אוטואימונית?", question_en: "Is there autoimmune disease?", type: "yesno" },
      { id: "33-5", question_he: "האם יש זיהומים חוזרים?", question_en: "Are there recurrent infections?", type: "yesno" },
      { id: "33-6", question_he: "האם יש נטייה לדלקות?", question_en: "Is there tendency to inflammations?", type: "yesno" },
      { id: "33-7", question_he: "מהי איכות השינה?", question_en: "What is the sleep quality?", type: "scale" },
      { id: "33-8", question_he: "מהי רמת הסטרס?", question_en: "What is the stress level?", type: "scale" },
      { id: "33-9", question_he: "האם יש פעילות גופנית?", question_en: "Is there physical activity?", type: "yesno" },
      { id: "33-10", question_he: "האם התזונה מאוזנת?", question_en: "Is the diet balanced?", type: "yesno" },
      { id: "33-11", question_he: "האם יש חשיפה לשמש?", question_en: "Is there sun exposure?", type: "yesno" },
      { id: "33-12", question_he: "האם יש נטילת תוספים?", question_en: "Is there supplement intake?", type: "yesno" },
      { id: "33-13", question_he: "האם יש עישון?", question_en: "Is there smoking?", type: "yesno" },
      { id: "33-14", question_he: "האם יש שימוש באלכוהול?", question_en: "Is there alcohol use?", type: "yesno" },
      { id: "33-15", question_he: "מהי מטרת הטיפול?", question_en: "What is the treatment goal?", type: "open" }
    ]
  },

  // Module 34: General Wellness
  {
    id: 34,
    module_name: "General Wellness",
    module_name_he: "בריאות כללית",
    nanobanan_prompt_id: "nanobanan_wellness",
    linked_knowledge_base: "wellness_issue_enhanced_fixed.csv",
    icon: "Sparkles",
    color: "#00BCD4",
    category: "lifestyle",
    questions: [
      { id: "34-1", question_he: "מהי רמת הבריאות הכללית (1-10)?", question_en: "What is the general health level (1-10)?", type: "scale" },
      { id: "34-2", question_he: "מהי רמת האנרגיה?", question_en: "What is the energy level?", type: "scale" },
      { id: "34-3", question_he: "האם יש שינה איכותית?", question_en: "Is there quality sleep?", type: "yesno" },
      { id: "34-4", question_he: "האם יש עיכול תקין?", question_en: "Is there normal digestion?", type: "yesno" },
      { id: "34-5", question_he: "האם יש פעילות גופנית?", question_en: "Is there physical activity?", type: "yesno" },
      { id: "34-6", question_he: "האם יש תזונה מאוזנת?", question_en: "Is there balanced nutrition?", type: "yesno" },
      { id: "34-7", question_he: "האם יש יחסים חברתיים טובים?", question_en: "Are there good social relationships?", type: "yesno" },
      { id: "34-8", question_he: "האם יש משמעות ומטרה בחיים?", question_en: "Is there meaning and purpose in life?", type: "yesno" },
      { id: "34-9", question_he: "האם יש סטרס משמעותי?", question_en: "Is there significant stress?", type: "yesno" },
      { id: "34-10", question_he: "האם יש מצב רוח חיובי?", question_en: "Is there positive mood?", type: "yesno" },
      { id: "34-11", question_he: "האם יש חשיפה לטבע?", question_en: "Is there nature exposure?", type: "yesno" },
      { id: "34-12", question_he: "האם יש זמן לעצמך?", question_en: "Is there time for yourself?", type: "yesno" },
      { id: "34-13", question_he: "האם יש תחביבים?", question_en: "Are there hobbies?", type: "yesno" },
      { id: "34-14", question_he: "האם יש איזון עבודה-חיים?", question_en: "Is there work-life balance?", type: "yesno" },
      { id: "34-15", question_he: "מהי מטרת הטיפול?", question_en: "What is the treatment goal?", type: "open" }
    ]
  },

  // Module 35: Children 7-13 School
  {
    id: 35,
    module_name: "Children 7-13 School",
    module_name_he: "ילדים 7-13 בית ספר",
    nanobanan_prompt_id: "nanobanan_school_age",
    linked_knowledge_base: "tcm_children_7-13_qa_enhanced.csv",
    icon: "GraduationCap",
    color: "#FFC107",
    category: "age-specific",
    questions: [
      { id: "35-1", question_he: "מה גיל הילד?", question_en: "What is the child's age?", type: "open" },
      { id: "35-2", question_he: "האם יש קשיי למידה?", question_en: "Are there learning difficulties?", type: "yesno" },
      { id: "35-3", question_he: "האם יש קשיי ריכוז?", question_en: "Are there concentration difficulties?", type: "yesno" },
      { id: "35-4", question_he: "האם יש היפראקטיביות?", question_en: "Is there hyperactivity?", type: "yesno" },
      { id: "35-5", question_he: "האם יש חרדת בית ספר?", question_en: "Is there school anxiety?", type: "yesno" },
      { id: "35-6", question_he: "האם יש בעיות חברתיות?", question_en: "Are there social problems?", type: "yesno" },
      { id: "35-7", question_he: "האם יש בריונות?", question_en: "Is there bullying?", type: "yesno" },
      { id: "35-8", question_he: "האם יש בעיות שינה?", question_en: "Are there sleep problems?", type: "yesno" },
      { id: "35-9", question_he: "האם יש כאבי בטן לפני בית ספר?", question_en: "Are there stomach aches before school?", type: "yesno" },
      { id: "35-10", question_he: "האם יש כאבי ראש?", question_en: "Are there headaches?", type: "yesno" },
      { id: "35-11", question_he: "האם התזונה מאוזנת?", question_en: "Is the diet balanced?", type: "yesno" },
      { id: "35-12", question_he: "כמה שעות מסך ביום?", question_en: "How many hours of screen time per day?", type: "open" },
      { id: "35-13", question_he: "האם יש פעילות גופנית?", question_en: "Is there physical activity?", type: "yesno" },
      { id: "35-14", question_he: "האם יש תמיכה הורית?", question_en: "Is there parental support?", type: "yesno" },
      { id: "35-15", question_he: "מהי מטרת הטיפול?", question_en: "What is the treatment goal?", type: "open" }
    ]
  },

  // Module 36: Pattern Differentiation (Extended)
  {
    id: 36,
    module_name: "Pattern Differentiation",
    module_name_he: "ביאן ז'נג מורחב",
    nanobanan_prompt_id: "nanobanan_bianzheng",
    linked_knowledge_base: "tcm_pattern_differentiation_enhanced.csv",
    icon: "Compass",
    color: "#9C27B0",
    category: "diagnostic",
    questions: [
      { id: "36-1", question_he: "מהי התלונה העיקרית המפורטת?", question_en: "What is the detailed chief complaint?", type: "open" },
      { id: "36-2", question_he: "מהו הדפוס הראשוני המשוער?", question_en: "What is the initial suspected pattern?", type: "open" },
      { id: "36-3", question_he: "האם יש דפוס משני?", question_en: "Is there a secondary pattern?", type: "open" },
      { id: "36-4", question_he: "מהו האיבר העיקרי המעורב?", question_en: "What is the main organ involved?", type: "open" },
      { id: "36-5", question_he: "האם יש מעורבות של יותר מאיבר אחד?", question_en: "Is more than one organ involved?", type: "yesno" },
      { id: "36-6", question_he: "מהו הפתוגן העיקרי (אם יש)?", question_en: "What is the main pathogen (if any)?", type: "open" },
      { id: "36-7", question_he: "האם המצב חדש או כרוני?", question_en: "Is the condition new or chronic?", type: "multi", options: ["new", "chronic"] },
      { id: "36-8", question_he: "מהו איזון החום-קור?", question_en: "What is the heat-cold balance?", type: "multi", options: ["heat", "cold", "mixed", "neutral"] },
      { id: "36-9", question_he: "מהו איזון העודף-חוסר?", question_en: "What is the excess-deficiency balance?", type: "multi", options: ["excess", "deficiency", "mixed"] },
      { id: "36-10", question_he: "מהו מצב הנוזלים בגוף?", question_en: "What is the fluid status in the body?", type: "open" },
      { id: "36-11", question_he: "מהו מצב הדם?", question_en: "What is the blood status?", type: "open" },
      { id: "36-12", question_he: "מהו מצב הצ'י?", question_en: "What is the Qi status?", type: "open" },
      { id: "36-13", question_he: "מהי עקרון הטיפול המוצע?", question_en: "What is the proposed treatment principle?", type: "open" },
      { id: "36-14", question_he: "האם יש התוויות נגד?", question_en: "Are there contraindications?", type: "open" },
      { id: "36-15", question_he: "מהי תוכנית המעקב?", question_en: "What is the follow-up plan?", type: "open" }
    ]
  }
];

// Module categories for filtering
export const MODULE_CATEGORIES = {
  diagnostic: { en: "Diagnostic", he: "אבחון", color: "#9C27B0" },
  constitutional: { en: "Constitutional", he: "חוקתי", color: "#607D8B" },
  herbal: { en: "Herbal", he: "צמחים", color: "#8BC34A" },
  specialty: { en: "Specialty", he: "התמחות", color: "#673AB7" },
  lifestyle: { en: "Lifestyle", he: "אורח חיים", color: "#4CAF50" },
  "age-specific": { en: "Age-Specific", he: "גיל ספציפי", color: "#FF9800" }
};

// Knowledge base mapping for deep search
export const KNOWLEDGE_BASE_FILES: Record<string, string[]> = {
  primary: [
    "tcm_pattern_differentiation_enhanced.csv",
    "TCM_Herbal_Formulas_Comprehensive.csv",
    "acupoints_master.csv"
  ],
  nutrition: [
    "TCM_Diet_Nutrition_100_QA_Complete.csv"
  ],
  lifestyle: [
    "Elderly_Lifestyle_TCM_Enhanced.csv",
    "TCM_Mindset_Mental_100_QA_Complete.csv",
    "tcm_stress_biofeedback_75qa.csv"
  ],
  oncology: [
    "TCM_Oncology_Comprehensive_All_Ages.csv"
  ],
  pediatric: [
    "tcm_children_7-13_qa_enhanced.csv",
    "Pediatric_Acupuncture_Points_Safety_Guide.csv"
  ],
  geriatric: [
    "TCM_Clinic_70-120_100_Common_Conditions_Complete.csv",
    "TCM_Adults_50_70_Comprehensive_CONDITIONS.csv"
  ]
};

// Complete 36 × 15 Hebrew Questions Data Export Utility

interface Question {
  id: string;
  textHe: string;
  textEn: string;
}

interface QuestionCategory {
  id: string;
  name: string;
  nameEn: string;
  questions: Question[];
}

// Complete Hebrew Questions Data (36 Categories × 15 Questions = 540 Total)
export const hebrewQuestionsData: QuestionCategory[] = [
  {
    id: 'pulse_tongue_diagnosis',
    name: 'אבחון דופק ולשון',
    nameEn: 'Pulse & Tongue Diagnosis',
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
      { id: 'sp_not_holding_blood', textHe: 'מהם הסימפטומים של "טחול אינו שולט בדם"?', textEn: 'What are symptoms of "Spleen Not Controlling Blood"?' },
      { id: 'lu_yin_def_vs_dryness', textHe: 'מה ההבדל בין חוסר יין בריאות לבין יובש בריאות?', textEn: 'What is the difference between Lung Yin Deficiency and Lung Dryness?' },
      { id: 'kid_yin_yang_relation', textHe: 'מהו הקשר בין חוסר יין בכליות לחוסר יאנג בכליות?', textEn: 'What is the relationship between Kidney Yin and Yang Deficiency?' },
      { id: 'bl_stasis_signs', textHe: 'מהם הסימנים הקלאסיים של סטגנציית דם?', textEn: 'What are classic signs of Blood Stasis?' },
      { id: 'cold_in_uterus', textHe: 'כיצד מתבטא "קור ברחם" ומה הנקודות המרכזיות לטיפול?', textEn: 'How does Cold in Uterus manifest and what are key treatment points?' },
      { id: 'shen_disturbance', textHe: 'מהם הסימנים של הפרעה ב-Shen וכיצד מאבחנים את הדפוס?', textEn: 'What are signs of Shen disturbance and how to diagnose the pattern?' },
    ]
  },
  {
    id: 'acupuncture_points',
    name: 'נקודות דיקור',
    nameEn: 'Acupuncture Points',
    questions: [
      { id: '1', textHe: 'מהם המאפיינים המיוחדים של נקודות Yuan (מקור)?', textEn: 'What are special characteristics of Yuan (Source) points?' },
      { id: '2', textHe: 'כיצד משתמשים בנקודות Luo (מחברות)?', textEn: 'How to use Luo (Connecting) points?' },
      { id: '3', textHe: 'מהו תפקיד נקודות Xi-Cleft?', textEn: 'What is the function of Xi-Cleft points?' },
      { id: '4', textHe: 'כיצד נקודות Shu (גב) משמשות לאבחון וטיפול?', textEn: 'How are Back Shu points used for diagnosis and treatment?' },
      { id: '5', textHe: 'מהן נקודות Mu (קדמיות) וכיצד משתמשים בהן?', textEn: 'What are Front Mu points and how to use them?' },
      { id: '6', textHe: 'מהם עקרונות בחירת הנקודות המרוחקות?', textEn: 'What are principles for choosing distal points?' },
      { id: '7', textHe: 'כיצד משלבים נקודות מקומיות עם נקודות מרוחקות?', textEn: 'How to combine local with distal points?' },
      { id: '8', textHe: 'מהן נקודות Hui (השפעה) ולמה הן משמשות?', textEn: 'What are Hui (Influential) points and what are they used for?' },
      { id: '9', textHe: 'כיצד נקודות Jing-Well משמשות במצבי חירום?', textEn: 'How are Jing-Well points used in emergencies?' },
      { id: '10', textHe: 'מהו הקשר בין נקודות Five Elements לטיפול?', textEn: 'What is the relationship between Five Element points and treatment?' },
      { id: '11', textHe: 'כיצד בוחרים נקודות לפי שעון האיברים?', textEn: 'How to choose points according to organ clock?' },
      { id: '12', textHe: 'מהן נקודות Windows of Heaven?', textEn: 'What are Windows of Heaven points?' },
      { id: '13', textHe: 'כיצד נקודות Shen משפיעות על הרוח?', textEn: 'How do Shen points affect the spirit?' },
      { id: '14', textHe: 'מהן הנקודות לטיפול בדם?', textEn: 'What are points for treating Blood?' },
      { id: '15', textHe: 'כיצד משתמשים בנקודות לפי עונות השנה?', textEn: 'How to use points according to seasons?' },
    ]
  },
  {
    id: 'four_examinations',
    name: 'ארבע הבדיקות',
    nameEn: 'Four Examinations',
    questions: [
      { id: '1', textHe: 'מהם ארבעת שלבי הבדיקה ברפואה הסינית?', textEn: 'What are the four examination stages in Chinese Medicine?' },
      { id: '2', textHe: 'כיצד מפרשים את גוון הפנים?', textEn: 'How to interpret facial complexion?' },
      { id: '3', textHe: 'מהם הסימנים החזותיים של חוסר דם?', textEn: 'What are visual signs of Blood deficiency?' },
      { id: '4', textHe: 'כיצד מאבחנים לפי הקול?', textEn: 'How to diagnose by voice?' },
      { id: '5', textHe: 'מהי החשיבות של ריח הגוף באבחון?', textEn: 'What is the importance of body odor in diagnosis?' },
      { id: '6', textHe: 'כיצד שואלים על שינה באנמנזה?', textEn: 'How to ask about sleep in patient history?' },
      { id: '7', textHe: 'מהם שאלות המפתח על העיכול?', textEn: 'What are key questions about digestion?' },
      { id: '8', textHe: 'כיצד מפרשים העדפות טמפרטורה?', textEn: 'How to interpret temperature preferences?' },
      { id: '9', textHe: 'מהי החשיבות של שאלות על צמא ושתייה?', textEn: 'What is importance of questions about thirst and drinking?' },
      { id: '10', textHe: 'כיצד מאבחנים לפי מישוש הבטן?', textEn: 'How to diagnose by abdominal palpation?' },
      { id: '11', textHe: 'מהם הסימנים של חום לעומת קור?', textEn: 'What are signs of Heat versus Cold?' },
      { id: '12', textHe: 'כיצד מזהים דפוסי עודף לעומת חוסר?', textEn: 'How to identify Excess versus Deficiency patterns?' },
      { id: '13', textHe: 'מהי החשיבות של שאלות על הזעה?', textEn: 'What is importance of questions about sweating?' },
      { id: '14', textHe: 'כיצד מפרשים כאבים ותחושות?', textEn: 'How to interpret pain and sensations?' },
      { id: '15', textHe: 'מהם הסימנים של לחות בגוף?', textEn: 'What are signs of Dampness in the body?' },
    ]
  },
  {
    id: 'womens_health',
    name: 'בריאות האישה',
    nameEn: 'Women\'s Health',
    questions: [
      { id: '1', textHe: 'כיצד מאבחנים דפוסי אי-פוריות ב-TCM?', textEn: 'How to diagnose infertility patterns in TCM?' },
      { id: '2', textHe: 'מהו הטיפול בכאבי מחזור (דיסמנוריאה)?', textEn: 'What is treatment for menstrual pain (dysmenorrhea)?' },
      { id: '3', textHe: 'כיצד מטפלים ב-PMS?', textEn: 'How to treat PMS?' },
      { id: '4', textHe: 'מהם הדפוסים השכיחים בהפסקת מחזור?', textEn: 'What are common patterns in amenorrhea?' },
      { id: '5', textHe: 'כיצד מטפלים בדימום רב במחזור (מנורגיה)?', textEn: 'How to treat heavy menstrual bleeding (menorrhagia)?' },
      { id: '6', textHe: 'מהם הנקודות החשובות לפוריות?', textEn: 'What are important points for fertility?' },
      { id: '7', textHe: 'כיצד מטפלים בציסטות שחלתיות?', textEn: 'How to treat ovarian cysts?' },
      { id: '8', textHe: 'מהו הטיפול באנדומטריוזיס?', textEn: 'What is treatment for endometriosis?' },
      { id: '9', textHe: 'כיצד מלווים הריון בטיפול?', textEn: 'How to support pregnancy with treatment?' },
      { id: '10', textHe: 'מהם הנקודות האסורות בהריון?', textEn: 'What are forbidden points during pregnancy?' },
      { id: '11', textHe: 'כיצד מטפלים בבחילות הריון?', textEn: 'How to treat pregnancy nausea?' },
      { id: '12', textHe: 'מהו הטיפול בתסמונת המעבר (מנופאוזה)?', textEn: 'What is treatment for menopause syndrome?' },
      { id: '13', textHe: 'כיצד מטפלים בגלי חום?', textEn: 'How to treat hot flashes?' },
      { id: '14', textHe: 'מהי חשיבות הדם והכבד לבריאות האישה?', textEn: 'What is importance of Blood and Liver for women\'s health?' },
      { id: '15', textHe: 'כיצד מטפלים במסה בשד לפי TCM?', textEn: 'How to treat breast masses according to TCM?' },
    ]
  },
  {
    id: 'pediatric_tcm',
    name: 'רפואה סינית לילדים',
    nameEn: 'Pediatric TCM',
    questions: [
      { id: '1', textHe: 'מהם המאפיינים הייחודיים של פיזיולוגיית הילד ב-TCM?', textEn: 'What are unique characteristics of child physiology in TCM?' },
      { id: '2', textHe: 'כיצד מאבחנים ילדים שלא יכולים לתאר תסמינים?', textEn: 'How to diagnose children who cannot describe symptoms?' },
      { id: '3', textHe: 'מהו הטיפול בשיעול כרוני אצל ילדים?', textEn: 'What is the treatment for chronic cough in children?' },
      { id: '4', textHe: 'כיצד מטפלים בבעיות עיכול שכיחות בילדות?', textEn: 'How to treat common digestive issues in childhood?' },
      { id: '5', textHe: 'מהם הסימנים של חום מזון אצל תינוקות?', textEn: 'What are signs of Food Heat in infants?' },
      { id: '6', textHe: 'כיצד Tuina (עיסוי סיני) מתאים לילדים?', textEn: 'How is Tuina adapted for children?' },
      { id: '7', textHe: 'מהו הטיפול בהרטבת לילה (Enuresis)?', textEn: 'What is the treatment for bedwetting (Enuresis)?' },
      { id: '8', textHe: 'כיצד מחזקים את החסינות של ילדים שחולים תכופות?', textEn: 'How to strengthen immunity of frequently ill children?' },
      { id: '9', textHe: 'מהם הנקודות הבטוחות לדיקור בילדים?', textEn: 'What are safe acupuncture points for children?' },
      { id: '10', textHe: 'כיצד מטפלים באלרגיות עונתיות אצל ילדים?', textEn: 'How to treat seasonal allergies in children?' },
      { id: '11', textHe: 'מהו הטיפול בהפרעות קשב וריכוז (ADHD)?', textEn: 'What is the treatment for ADHD?' },
      { id: '12', textHe: 'כיצד מזהים חולשת טחול אצל ילדים?', textEn: 'How to identify Spleen weakness in children?' },
      { id: '13', textHe: 'מהם המזונות המומלצים לחיזוק ילדים?', textEn: 'What foods are recommended for strengthening children?' },
      { id: '14', textHe: 'כיצד מטפלים בחרדה ופחדים בילדות?', textEn: 'How to treat anxiety and fears in childhood?' },
      { id: '15', textHe: 'מהי גישת TCM לבעיות שינה אצל ילדים?', textEn: 'What is TCM approach to sleep problems in children?' },
    ]
  },
  {
    id: 'geriatric_tcm',
    name: 'רפואה סינית לקשישים',
    nameEn: 'Geriatric TCM',
    questions: [
      { id: '1', textHe: 'מהם השינויים הפיזיולוגיים העיקריים בהזדקנות לפי TCM?', textEn: 'What are main physiological changes in aging according to TCM?' },
      { id: '2', textHe: 'כיצד מטפלים בדמנציה ואובדן זיכרון?', textEn: 'How to treat dementia and memory loss?' },
      { id: '3', textHe: 'מהו הטיפול באוסטאופורוזיס מנקודת מבט TCM?', textEn: 'What is the TCM approach to osteoporosis?' },
      { id: '4', textHe: 'כיצד מחזקים את הכליות לאריכות ימים?', textEn: 'How to strengthen Kidneys for longevity?' },
      { id: '5', textHe: 'מהם הסימנים של דלדול ה-Jing וכיצד מאטים אותו?', textEn: 'What are signs of Jing depletion and how to slow it?' },
      { id: '6', textHe: 'כיצד מטפלים בנוקשות מפרקים בגיל מבוגר?', textEn: 'How to treat joint stiffness in old age?' },
      { id: '7', textHe: 'מהו הטיפול בעצירות כרונית אצל קשישים?', textEn: 'What is the treatment for chronic constipation in elderly?' },
      { id: '8', textHe: 'כיצד מאזנים טיפול בתרופות מרובות (פוליפארמקולוגיה)?', textEn: 'How to balance treatment with polypharmacy?' },
      { id: '9', textHe: 'מהם הנקודות החשובות לשיפור הזרימה הדמית?', textEn: 'What are important points for improving blood flow?' },
      { id: '10', textHe: 'כיצד מטפלים בסחרחורת וחוסר יציבות?', textEn: 'How to treat dizziness and instability?' },
      { id: '11', textHe: 'מהו הטיפול בבעיות שתן שכיחות בגיל מבוגר?', textEn: 'What is treatment for common urinary issues in elderly?' },
      { id: '12', textHe: 'כיצד משמרים את כוח הראייה והשמיעה?', textEn: 'How to preserve vision and hearing strength?' },
      { id: '13', textHe: 'מהם המזונות התומכים בבריאות הקשיש?', textEn: 'What foods support elderly health?' },
      { id: '14', textHe: 'כיצד מטפלים בדיכאון וחרדה בגיל מבוגר?', textEn: 'How to treat depression and anxiety in old age?' },
      { id: '15', textHe: 'מהי גישת TCM למניעת נפילות?', textEn: 'What is TCM approach to fall prevention?' },
    ]
  },
  {
    id: 'emotional_health',
    name: 'בריאות רגשית',
    nameEn: 'Emotional Health',
    questions: [
      { id: '1', textHe: 'מהם שבעת הרגשות ברפואה הסינית וכיצד הם משפיעים על האיברים?', textEn: 'What are the Seven Emotions and how do they affect organs?' },
      { id: '2', textHe: 'כיצד כעס ותסכול פוגעים בכבד?', textEn: 'How do anger and frustration damage the Liver?' },
      { id: '3', textHe: 'מהו הטיפול בחרדה כרונית מנקודת מבט TCM?', textEn: 'What is TCM treatment for chronic anxiety?' },
      { id: '4', textHe: 'כיצד אבל וצער משפיעים על הריאות?', textEn: 'How do grief and sadness affect the Lungs?' },
      { id: '5', textHe: 'מהי הגישה לטיפול בדיכאון ב-TCM?', textEn: 'What is the TCM approach to treating depression?' },
      { id: '6', textHe: 'כיצד פחד משפיע על הכליות ועל אנרגיית הגוף?', textEn: 'How does fear affect Kidneys and body energy?' },
      { id: '7', textHe: 'מהם הנקודות להרגעת הנפש (Shen)?', textEn: 'What are points for calming the Shen?' },
      { id: '8', textHe: 'כיצד מטפלים בנדודי שינה מרקע רגשי?', textEn: 'How to treat insomnia from emotional background?' },
      { id: '9', textHe: 'מהו הקשר בין דאגה יתרה לבעיות עיכול?', textEn: 'What is the connection between worry and digestion?' },
      { id: '10', textHe: 'כיצד טראומה רגשית נשמרת בגוף לפי TCM?', textEn: 'How is emotional trauma stored in the body according to TCM?' },
      { id: '11', textHe: 'מהו הטיפול בהתקפי פאניקה?', textEn: 'What is the treatment for panic attacks?' },
      { id: '12', textHe: 'כיצד שמחה יתרה יכולה לפגוע בלב?', textEn: 'How can excessive joy damage the Heart?' },
      { id: '13', textHe: 'מהם הנקודות לשחרור רגשות כבושים?', textEn: 'What are points for releasing suppressed emotions?' },
      { id: '14', textHe: 'כיצד מאזנים בין עבודה רגשית לטיפול פיזי?', textEn: 'How to balance emotional work with physical treatment?' },
      { id: '15', textHe: 'מהי חשיבות ה-Hun וה-Po לבריאות רגשית?', textEn: 'What is the importance of Hun and Po for emotional health?' },
    ]
  },
  {
    id: 'sleep_disorders',
    name: 'הפרעות שינה',
    nameEn: 'Sleep Disorders',
    questions: [
      { id: '1', textHe: 'מהי הפתופיזיולוגיה של נדודי שינה ב-TCM?', textEn: 'What is the pathophysiology of insomnia in TCM?' },
      { id: '2', textHe: 'כיצד מבחינים בין סוגי נדודי שינה שונים?', textEn: 'How to distinguish between different types of insomnia?' },
      { id: '3', textHe: 'מהו הטיפול בקושי להירדם לעומת התעוררויות ליליות?', textEn: 'What is treatment for difficulty falling vs staying asleep?' },
      { id: '4', textHe: 'כיצד חוסר דם בלב משפיע על השינה?', textEn: 'How does Heart Blood deficiency affect sleep?' },
      { id: '5', textHe: 'מהם הסימנים של אש בלב הגורמת לנדודי שינה?', textEn: 'What are signs of Heart Fire causing insomnia?' },
      { id: '6', textHe: 'כיצד מטפלים בחלומות מטרידים וסיוטים?', textEn: 'How to treat disturbing dreams and nightmares?' },
      { id: '7', textHe: 'מהן הנקודות היעילות ביותר לשיפור איכות השינה?', textEn: 'What are the most effective points for improving sleep quality?' },
      { id: '8', textHe: 'כיצד דאגה יתרה פוגעת בשינה?', textEn: 'How does excessive worry affect sleep?' },
      { id: '9', textHe: 'מהו הטיפול בעייפות כרונית למרות שינה ארוכה?', textEn: 'What is treatment for chronic fatigue despite long sleep?' },
      { id: '10', textHe: 'כיצד מטפלים בדום נשימה בשינה (Sleep Apnea)?', textEn: 'How to treat Sleep Apnea?' },
      { id: '11', textHe: 'מהי חשיבות שעות השינה לפי שעון האיברים?', textEn: 'What is the importance of sleep hours according to organ clock?' },
      { id: '12', textHe: 'כיצד התזונה משפיעה על איכות השינה?', textEn: 'How does diet affect sleep quality?' },
      { id: '13', textHe: 'מהם הצמחים המסייעים לשינה ב-TCM?', textEn: 'What herbs help with sleep in TCM?' },
      { id: '14', textHe: 'כיצד מטפלים בהתעוררות בשעה קבועה כל לילה?', textEn: 'How to treat waking at the same time every night?' },
      { id: '15', textHe: 'מהי הגישה לטיפול בג\'ט לאג מנקודת מבט TCM?', textEn: 'What is TCM approach to treating jet lag?' },
    ]
  },
  {
    id: 'digestive_health',
    name: 'בריאות מערכת העיכול',
    nameEn: 'Digestive Health',
    questions: [
      { id: '1', textHe: 'מהו תפקיד הטחול ב"טרנספורמציה וטרנספורט"?', textEn: 'What is the Spleen\'s role in Transformation and Transportation?' },
      { id: '2', textHe: 'כיצד מאבחנים חולשת טחול?', textEn: 'How to diagnose Spleen weakness?' },
      { id: '3', textHe: 'מהו הטיפול בנפיחות וגזים כרוניים?', textEn: 'What is the treatment for chronic bloating and gas?' },
      { id: '4', textHe: 'כיצד מטפלים ב-IBS (תסמונת המעי הרגיז)?', textEn: 'How to treat IBS (Irritable Bowel Syndrome)?' },
      { id: '5', textHe: 'מהם הסימנים של לחות בטחול?', textEn: 'What are signs of Dampness in Spleen?' },
      { id: '6', textHe: 'כיצד סטגנציה של צ\'י הכבד משפיעה על העיכול?', textEn: 'How does Liver Qi stagnation affect digestion?' },
      { id: '7', textHe: 'מהו הטיפול בצרבת וריפלוקס חומצי?', textEn: 'What is treatment for heartburn and acid reflux?' },
      { id: '8', textHe: 'כיצד מטפלים בעצירות כרונית לפי הדפוס?', textEn: 'How to treat chronic constipation according to pattern?' },
      { id: '9', textHe: 'מהם הסימנים של חום בקיבה?', textEn: 'What are signs of Stomach Heat?' },
      { id: '10', textHe: 'כיצד מטפלים בשלשולים חוזרים?', textEn: 'How to treat recurrent diarrhea?' },
      { id: '11', textHe: 'מהי חשיבות ארוחת הבוקר לפי TCM?', textEn: 'What is the importance of breakfast according to TCM?' },
      { id: '12', textHe: 'כיצד מזונות קרים ונאים פוגעים בעיכול?', textEn: 'How do cold and raw foods harm digestion?' },
      { id: '13', textHe: 'מהם הנקודות החשובות לחיזוק הטחול?', textEn: 'What are important points for strengthening Spleen?' },
      { id: '14', textHe: 'כיצד מטפלים בחוסר תיאבון?', textEn: 'How to treat lack of appetite?' },
      { id: '15', textHe: 'מהי הגישה לטיפול במחלות מעי דלקתיות?', textEn: 'What is the approach to treating inflammatory bowel diseases?' },
    ]
  },
  {
    id: 'respiratory_health',
    name: 'בריאות מערכת הנשימה',
    nameEn: 'Respiratory Health',
    questions: [
      { id: '1', textHe: 'מהם תפקידי הריאות ב-TCM מעבר לנשימה?', textEn: 'What are Lung functions in TCM beyond breathing?' },
      { id: '2', textHe: 'כיצד מטפלים בשיעול יבש לעומת שיעול עם ליחה?', textEn: 'How to treat dry cough vs productive cough?' },
      { id: '3', textHe: 'מהו הטיפול באסתמה מנקודת מבט TCM?', textEn: 'What is TCM treatment for asthma?' },
      { id: '4', textHe: 'כיצד מטפלים בסינוסיטיס כרוני?', textEn: 'How to treat chronic sinusitis?' },
      { id: '5', textHe: 'מהם הסימנים של חוסר יין בריאות?', textEn: 'What are signs of Lung Yin deficiency?' },
      { id: '6', textHe: 'כיצד ליחה בריאות משפיעה על הנשימה?', textEn: 'How does Phlegm in Lungs affect breathing?' },
      { id: '7', textHe: 'מהו הטיפול באלרגיות עונתיות?', textEn: 'What is treatment for seasonal allergies?' },
      { id: '8', textHe: 'כיצד מחזקים את Wei Qi למניעת הצטננויות?', textEn: 'How to strengthen Wei Qi to prevent colds?' },
      { id: '9', textHe: 'מהם הנקודות היעילות לפתיחת דרכי הנשימה?', textEn: 'What are effective points for opening airways?' },
      { id: '10', textHe: 'כיצד מטפלים בקוצר נשימה?', textEn: 'How to treat shortness of breath?' },
      { id: '11', textHe: 'מהו הקשר בין הריאות לעור?', textEn: 'What is the connection between Lungs and skin?' },
      { id: '12', textHe: 'כיצד מטפלים בשיעול כרוני לאחר הצטננות?', textEn: 'How to treat chronic cough after a cold?' },
      { id: '13', textHe: 'מהי חשיבות לחות הריאות?', textEn: 'What is the importance of Lung moisture?' },
      { id: '14', textHe: 'כיצד עשן ואוויר מזוהם פוגעים בריאות?', textEn: 'How do smoke and pollution damage the Lungs?' },
      { id: '15', textHe: 'מהם הצמחים המחזקים את הריאות?', textEn: 'What herbs strengthen the Lungs?' },
    ]
  },
  {
    id: 'musculoskeletal',
    name: 'מערכת השלד והשרירים',
    nameEn: 'Musculoskeletal System',
    questions: [
      { id: '1', textHe: 'מהי הגישה של TCM לכאבי גב תחתון?', textEn: 'What is TCM approach to lower back pain?' },
      { id: '2', textHe: 'כיצד מבחינים בין כאב מעודף לכאב מחוסר?', textEn: 'How to differentiate Excess pain from Deficiency pain?' },
      { id: '3', textHe: 'מהו הטיפול בדלקת מפרקים (ארתריטיס)?', textEn: 'What is treatment for arthritis?' },
      { id: '4', textHe: 'כיצד מטפלים בפריצת דיסק?', textEn: 'How to treat herniated disc?' },
      { id: '5', textHe: 'מהם הסימנים של Bi Syndrome (סינדרום החסימה)?', textEn: 'What are signs of Bi Syndrome?' },
      { id: '6', textHe: 'כיצד מטפלים בכאבי צוואר וכתפיים תפוסות?', textEn: 'How to treat neck pain and frozen shoulder?' },
      { id: '7', textHe: 'מהו תפקיד הכליות בבריאות העצמות?', textEn: 'What is the Kidney\'s role in bone health?' },
      { id: '8', textHe: 'כיצד מטפלים בפציעות ספורט?', textEn: 'How to treat sports injuries?' },
      { id: '9', textHe: 'מהם הנקודות היעילות לכאבי ברכיים?', textEn: 'What are effective points for knee pain?' },
      { id: '10', textHe: 'כיצד מטפלים בתעלת שורש כף היד (Carpal Tunnel)?', textEn: 'How to treat Carpal Tunnel Syndrome?' },
      { id: '11', textHe: 'מהו הטיפול בפיברומיאלגיה?', textEn: 'What is treatment for fibromyalgia?' },
      { id: '12', textHe: 'כיצד דם וצ\'י משפיעים על תפקוד השרירים?', textEn: 'How do Blood and Qi affect muscle function?' },
      { id: '13', textHe: 'מהם הסימנים של רוח-לחות במפרקים?', textEn: 'What are signs of Wind-Damp in joints?' },
      { id: '14', textHe: 'כיצד מטפלים בגיד אכילס דלקתי?', textEn: 'How to treat Achilles tendinitis?' },
      { id: '15', textHe: 'מהי חשיבות התנועה לבריאות הגידים והשרירים?', textEn: 'What is the importance of movement for tendon health?' },
    ]
  },
  {
    id: 'headaches_migraines',
    name: 'כאבי ראש ומיגרנות',
    nameEn: 'Headaches & Migraines',
    questions: [
      { id: '1', textHe: 'כיצד מסווגים כאבי ראש לפי מיקום ב-TCM?', textEn: 'How are headaches classified by location in TCM?' },
      { id: '2', textHe: 'מהו הטיפול בכאב ראש מעליית יאנג הכבד?', textEn: 'What is treatment for Liver Yang Rising headache?' },
      { id: '3', textHe: 'כיצד מבחינים בין מיגרנה לכאב ראש מתח?', textEn: 'How to distinguish migraine from tension headache?' },
      { id: '4', textHe: 'מהם הסימנים של כאב ראש מחוסר דם?', textEn: 'What are signs of Blood Deficiency headache?' },
      { id: '5', textHe: 'כיצד מטפלים בכאב ראש מליחה?', textEn: 'How to treat Phlegm headache?' },
      { id: '6', textHe: 'מהו הטיפול בכאב ראש קדמי (מצח)?', textEn: 'What is treatment for frontal headache?' },
      { id: '7', textHe: 'כיצד מטפלים בכאב ראש צדי (רקות)?', textEn: 'How to treat temporal headache?' },
      { id: '8', textHe: 'מהם הנקודות העיקריות לכאבי ראש?', textEn: 'What are main points for headaches?' },
      { id: '9', textHe: 'כיצד סטגנציה של דם גורמת לכאב ראש כרוני?', textEn: 'How does Blood stasis cause chronic headache?' },
      { id: '10', textHe: 'מהו הקשר בין הורמונים לכאבי ראש?', textEn: 'What is the connection between hormones and headaches?' },
      { id: '11', textHe: 'כיצד מטפלים בכאב ראש המחמיר עם מזג אוויר?', textEn: 'How to treat headache that worsens with weather?' },
      { id: '12', textHe: 'מהי חשיבות הטיפול בין התקפים למניעה?', textEn: 'What is importance of between-attack treatment for prevention?' },
      { id: '13', textHe: 'כיצד מזון ושתייה משפיעים על כאבי ראש?', textEn: 'How do food and drink affect headaches?' },
      { id: '14', textHe: 'מהו הטיפול בכאב ראש עורפי?', textEn: 'What is treatment for occipital headache?' },
      { id: '15', textHe: 'כיצד מטפלים במיגרנה עם אאורה?', textEn: 'How to treat migraine with aura?' },
    ]
  },
  {
    id: 'skin_disorders',
    name: 'מחלות עור',
    nameEn: 'Skin Disorders',
    questions: [
      { id: '1', textHe: 'מהו הקשר בין הריאות לבריאות העור ב-TCM?', textEn: 'What is the connection between Lungs and skin in TCM?' },
      { id: '2', textHe: 'כיצד מטפלים באקזמה (אטופיק דרמטיטיס)?', textEn: 'How to treat eczema (atopic dermatitis)?' },
      { id: '3', textHe: 'מהו הטיפול בפסוריאזיס?', textEn: 'What is treatment for psoriasis?' },
      { id: '4', textHe: 'כיצד מאבחנים דפוסים שונים של אקנה?', textEn: 'How to diagnose different acne patterns?' },
      { id: '5', textHe: 'מהם הסימנים של חום בדם הגורם לפריחות?', textEn: 'What are signs of Blood Heat causing rashes?' },
      { id: '6', textHe: 'כיצד לחות ורעילות משפיעים על העור?', textEn: 'How do Dampness and toxins affect skin?' },
      { id: '7', textHe: 'מהו הטיפול באורטיקריה (סרפדת)?', textEn: 'What is treatment for urticaria (hives)?' },
      { id: '8', textHe: 'כיצד מטפלים בשלבקת חוגרת (Shingles)?', textEn: 'How to treat Shingles?' },
      { id: '9', textHe: 'מהם הנקודות היעילות לטיפול בגרד?', textEn: 'What are effective points for treating itching?' },
      { id: '10', textHe: 'כיצד חוסר דם מתבטא בעור?', textEn: 'How does Blood deficiency manifest in skin?' },
      { id: '11', textHe: 'מהו הטיפול ברוזציאה?', textEn: 'What is treatment for rosacea?' },
      { id: '12', textHe: 'כיצד מטפלים בוויטיליגו?', textEn: 'How to treat vitiligo?' },
      { id: '13', textHe: 'מהי חשיבות התזונה לבריאות העור?', textEn: 'What is importance of diet for skin health?' },
      { id: '14', textHe: 'כיצד רגשות משפיעים על מצב העור?', textEn: 'How do emotions affect skin condition?' },
      { id: '15', textHe: 'מהם הצמחים המטפלים בבעיות עור?', textEn: 'What herbs treat skin problems?' },
    ]
  },
  {
    id: 'cardiovascular',
    name: 'מערכת הלב וכלי הדם',
    nameEn: 'Cardiovascular System',
    questions: [
      { id: '1', textHe: 'מהם תפקידי הלב ב-TCM מעבר לשאיבת דם?', textEn: 'What are Heart functions in TCM beyond pumping blood?' },
      { id: '2', textHe: 'כיצד מטפלים ביתר לחץ דם?', textEn: 'How to treat hypertension?' },
      { id: '3', textHe: 'מהו הטיפול בהפרעות קצב לב?', textEn: 'What is treatment for heart arrhythmias?' },
      { id: '4', textHe: 'כיצד סטגנציה של דם משפיעה על הלב?', textEn: 'How does Blood stasis affect the Heart?' },
      { id: '5', textHe: 'מהם הסימנים של חוסר דם בלב?', textEn: 'What are signs of Heart Blood deficiency?' },
      { id: '6', textHe: 'כיצד מטפלים בחרדה עם דפיקות לב?', textEn: 'How to treat anxiety with palpitations?' },
      { id: '7', textHe: 'מהו הקשר בין הלב לכליות (ציר לב-כליות)?', textEn: 'What is Heart-Kidney axis connection?' },
      { id: '8', textHe: 'כיצד ליחה חוסמת את פתחי הלב?', textEn: 'How does Phlegm block Heart orifices?' },
      { id: '9', textHe: 'מהם הנקודות החשובות לבריאות הלב?', textEn: 'What are important points for heart health?' },
      { id: '10', textHe: 'כיצד מטפלים בכאבים בחזה?', textEn: 'How to treat chest pain?' },
      { id: '11', textHe: 'מהו הטיפול בדליות ובעיות ורידים?', textEn: 'What is treatment for varicose veins?' },
      { id: '12', textHe: 'כיצד משפרים את זרימת הדם?', textEn: 'How to improve blood circulation?' },
      { id: '13', textHe: 'מהי חשיבות השן (Shen) לבריאות הלב?', textEn: 'What is importance of Shen for heart health?' },
      { id: '14', textHe: 'כיצד מונעים מחלות לב לפי TCM?', textEn: 'How to prevent heart disease according to TCM?' },
      { id: '15', textHe: 'מהם הצמחים התומכים בבריאות הלב?', textEn: 'What herbs support heart health?' },
    ]
  },
  {
    id: 'herbal_formulas',
    name: 'נוסחאות צמחים',
    nameEn: 'Herbal Formulas',
    questions: [
      { id: '1', textHe: 'מהם העקרונות לבניית נוסחת צמחים?', textEn: 'What are principles for building an herbal formula?' },
      { id: '2', textHe: 'מה תפקיד ה"מלך" (Jun) בנוסחה?', textEn: 'What is the role of the Emperor (Jun) in a formula?' },
      { id: '3', textHe: 'כיצד בוחרים צמחי "שר" (Chen)?', textEn: 'How to choose Minister (Chen) herbs?' },
      { id: '4', textHe: 'מהו תפקיד צמחי ה"שליח" (Shi)?', textEn: 'What is the function of Envoy (Shi) herbs?' },
      { id: '5', textHe: 'כיצד משנים נוסחה קלאסית למטופל ספציפי?', textEn: 'How to modify a classic formula for a specific patient?' },
      { id: '6', textHe: 'מהי נוסחת Si Jun Zi Tang ולמה היא משמשת?', textEn: 'What is Si Jun Zi Tang and what is it used for?' },
      { id: '7', textHe: 'כיצד משתמשים ב-Xiao Yao San?', textEn: 'How is Xiao Yao San used?' },
      { id: '8', textHe: 'מהי נוסחת Liu Wei Di Huang Wan?', textEn: 'What is Liu Wei Di Huang Wan?' },
      { id: '9', textHe: 'כיצד מטפלים בצינון עם Ma Huang Tang?', textEn: 'How to treat cold with Ma Huang Tang?' },
      { id: '10', textHe: 'מהי נוסחת Gui Pi Tang ומתי משתמשים בה?', textEn: 'What is Gui Pi Tang and when to use it?' },
      { id: '11', textHe: 'כיצד מחליטים על מינון ותדירות נטילה?', textEn: 'How to decide dosage and frequency?' },
      { id: '12', textHe: 'מהם הצמחים האסורים בהריון?', textEn: 'Which herbs are forbidden in pregnancy?' },
      { id: '13', textHe: 'כיצד מתאימים נוסחאות לגילאים שונים?', textEn: 'How to adjust formulas for different ages?' },
      { id: '14', textHe: 'מהן האינטראקציות החשובות בין צמחים לתרופות?', textEn: 'What are important herb-drug interactions?' },
      { id: '15', textHe: 'כיצד מעריכים את איכות הצמחים?', textEn: 'How to evaluate herb quality?' },
    ]
  },
  {
    id: 'moxibustion_cupping',
    name: 'מוקסה וכוסות רוח',
    nameEn: 'Moxibustion & Cupping',
    questions: [
      { id: '1', textHe: 'מהם סוגי המוקסה השונים וכיצד בוחרים ביניהם?', textEn: 'What are different moxa types and how to choose?' },
      { id: '2', textHe: 'מתי מועדפת מוקסה על דיקור?', textEn: 'When is moxa preferred over needling?' },
      { id: '3', textHe: 'מהם הנקודות החשובות לטיפול במוקסה?', textEn: 'What are important points for moxa treatment?' },
      { id: '4', textHe: 'כיצד מוקסה מחממת את הגוף ומגרשת קור?', textEn: 'How does moxa warm body and expel cold?' },
      { id: '5', textHe: 'מהם ההתוויות הנגד למוקסה?', textEn: 'What are contraindications for moxa?' },
      { id: '6', textHe: 'כיצד מבצעים טכניקת מוקסה ישירה?', textEn: 'How to perform direct moxa technique?' },
      { id: '7', textHe: 'מהם סוגי כוסות הרוח השונים?', textEn: 'What are different cupping types?' },
      { id: '8', textHe: 'כיצד מפרשים סימני כוסות רוח?', textEn: 'How to interpret cupping marks?' },
      { id: '9', textHe: 'מתי משתמשים בכוסות רוח נעות?', textEn: 'When to use moving cupping?' },
      { id: '10', textHe: 'מהם היתרונות של כוסות רוח לטיפול בכאב?', textEn: 'What are benefits of cupping for pain?' },
      { id: '11', textHe: 'כיצד משלבים כוסות רוח עם דיקור?', textEn: 'How to combine cupping with acupuncture?' },
      { id: '12', textHe: 'מהם ההתוויות הנגד לכוסות רוח?', textEn: 'What are contraindications for cupping?' },
      { id: '13', textHe: 'כיצד מטפלים בצינון עם מוקסה?', textEn: 'How to treat cold with moxa?' },
      { id: '14', textHe: 'מהי טכניקת ה-"סנדוויץ\'" במוקסה?', textEn: 'What is moxa sandwich technique?' },
      { id: '15', textHe: 'כיצד מלמדים מטופלים לבצע מוקסה עצמית?', textEn: 'How to teach patients self-moxa?' },
    ]
  },
  {
    id: 'extraordinary_vessels',
    name: 'כלי הדם המיוחדים',
    nameEn: 'Extraordinary Vessels',
    questions: [
      { id: '1', textHe: 'מהם שמונת כלי הדם המיוחדים (Qi Jing Ba Mai)?', textEn: 'What are the Eight Extraordinary Vessels?' },
      { id: '2', textHe: 'מה תפקיד ה-Du Mai (כלי השליט)?', textEn: 'What is the function of Du Mai (Governing Vessel)?' },
      { id: '3', textHe: 'כיצד ה-Ren Mai (כלי התפיסה) משפיע על הפוריות?', textEn: 'How does Ren Mai affect fertility?' },
      { id: '4', textHe: 'מהו הקשר בין Chong Mai לדם?', textEn: 'What is the connection between Chong Mai and Blood?' },
      { id: '5', textHe: 'כיצד Dai Mai (כלי החגורה) קשור לבעיות במותניים?', textEn: 'How is Dai Mai related to waist problems?' },
      { id: '6', textHe: 'מהם נקודות הפתיחה והסגירה של כל כלי מיוחד?', textEn: 'What are opening and closing points for each vessel?' },
      { id: '7', textHe: 'כיצד משתמשים ב-Yang Wei Mai לבעיות חוץ?', textEn: 'How to use Yang Wei Mai for exterior issues?' },
      { id: '8', textHe: 'מהו תפקיד Yin Wei Mai?', textEn: 'What is the role of Yin Wei Mai?' },
      { id: '9', textHe: 'כיצד Yang Qiao Mai משפיע על השינה?', textEn: 'How does Yang Qiao Mai affect sleep?' },
      { id: '10', textHe: 'מהו הקשר בין Yin Qiao Mai לעיניים?', textEn: 'What is Yin Qiao Mai connection to eyes?' },
      { id: '11', textHe: 'כיצד משלבים כלים מיוחדים בטיפול?', textEn: 'How to integrate extraordinary vessels in treatment?' },
      { id: '12', textHe: 'מהם הסימפטומים של חוסר איזון בכלים המיוחדים?', textEn: 'What are symptoms of extraordinary vessel imbalance?' },
      { id: '13', textHe: 'כיצד מטפלים בבעיות הורמונליות דרך הכלים המיוחדים?', textEn: 'How to treat hormonal issues through extraordinary vessels?' },
      { id: '14', textHe: 'מהי חשיבות הכלים המיוחדים בטיפול בטראומה?', textEn: 'What is importance of extraordinary vessels in trauma treatment?' },
      { id: '15', textHe: 'כיצד הכלים המיוחדים קשורים לצ\'אקרות?', textEn: 'How are extraordinary vessels related to chakras?' },
    ]
  },
  {
    id: 'auricular_acupuncture',
    name: 'דיקור אוזן',
    nameEn: 'Auricular Acupuncture',
    questions: [
      { id: '1', textHe: 'מהי מפת האוזן ואיך היא משקפת את הגוף?', textEn: 'What is the ear map and how does it reflect the body?' },
      { id: '2', textHe: 'כיצד מאתרים נקודות רגישות באוזן?', textEn: 'How to locate sensitive points on the ear?' },
      { id: '3', textHe: 'מהם הכלים לאבחון באמצעות האוזן?', textEn: 'What are tools for ear diagnosis?' },
      { id: '4', textHe: 'כיצד דיקור אוזן מסייע בהפסקת עישון?', textEn: 'How does ear acupuncture help quit smoking?' },
      { id: '5', textHe: 'מהי פרוטוקול NADA להתמכרויות?', textEn: 'What is NADA protocol for addictions?' },
      { id: '6', textHe: 'כיצד מטפלים בכאב באמצעות דיקור אוזן?', textEn: 'How to treat pain with ear acupuncture?' },
      { id: '7', textHe: 'מהם הנקודות החשובות להרגעת חרדה?', textEn: 'What are important points for calming anxiety?' },
      { id: '8', textHe: 'כיצד משתמשים בזרעי אוזן (ear seeds)?', textEn: 'How to use ear seeds?' },
      { id: '9', textHe: 'מהו הטיפול בנדודי שינה דרך האוזן?', textEn: 'What is ear treatment for insomnia?' },
      { id: '10', textHe: 'כיצד מטפלים בבעיות עיכול באמצעות האוזן?', textEn: 'How to treat digestive issues through the ear?' },
      { id: '11', textHe: 'מהם הנקודות לאיזון הורמונלי?', textEn: 'What are points for hormonal balance?' },
      { id: '12', textHe: 'כיצד דיקור אוזן מסייע בהרזיה?', textEn: 'How does ear acupuncture help weight loss?' },
      { id: '13', textHe: 'מהם ההתוויות הנגד לדיקור אוזן?', textEn: 'What are contraindications for ear acupuncture?' },
      { id: '14', textHe: 'כיצד משלבים דיקור אוזן עם דיקור גוף?', textEn: 'How to combine ear with body acupuncture?' },
      { id: '15', textHe: 'מהי נקודת ה-Shen Men ולמה היא חשובה?', textEn: 'What is Shen Men point and why is it important?' },
    ]
  },
  {
    id: 'seasonal_treatment',
    name: 'טיפול לפי עונות',
    nameEn: 'Seasonal Treatment',
    questions: [
      { id: '1', textHe: 'כיצד עונת האביב משפיעה על הכבד?', textEn: 'How does Spring affect the Liver?' },
      { id: '2', textHe: 'מהו הטיפול המומלץ בקיץ לשמירה על הלב?', textEn: 'What is recommended summer treatment for Heart?' },
      { id: '3', textHe: 'כיצד מכינים את הגוף לסתיו?', textEn: 'How to prepare the body for autumn?' },
      { id: '4', textHe: 'מהי חשיבות שמירת האנרגיה בחורף?', textEn: 'What is importance of preserving energy in winter?' },
      { id: '5', textHe: 'כיצד התזונה משתנה לפי העונות?', textEn: 'How does diet change according to seasons?' },
      { id: '6', textHe: 'מהם הנקודות החשובות לכל עונה?', textEn: 'What are important points for each season?' },
      { id: '7', textHe: 'כיצד מטפלים באלרגיות עונתיות?', textEn: 'How to treat seasonal allergies?' },
      { id: '8', textHe: 'מהו הקשר בין "עונה חמישית" לטחול?', textEn: 'What is connection between Late Summer and Spleen?' },
      { id: '9', textHe: 'כיצד שעות השינה משתנות לפי העונה?', textEn: 'How do sleep hours change with seasons?' },
      { id: '10', textHe: 'מהם הסימנים של חוסר הסתגלות לעונה?', textEn: 'What are signs of poor seasonal adaptation?' },
      { id: '11', textHe: 'כיצד מונעים הצטננויות בתחילת הסתיו?', textEn: 'How to prevent colds at beginning of autumn?' },
      { id: '12', textHe: 'מהי חשיבות "פתיחת האביב" לכבד?', textEn: 'What is importance of Spring opening for Liver?' },
      { id: '13', textHe: 'כיצד מטפלים בדיכאון עונתי (SAD)?', textEn: 'How to treat Seasonal Affective Disorder?' },
      { id: '14', textHe: 'מהם הצמחים המתאימים לכל עונה?', textEn: 'What herbs are suitable for each season?' },
      { id: '15', textHe: 'כיצד פעילות גופנית משתנה לפי העונה?', textEn: 'How does physical activity change with season?' },
    ]
  },
  {
    id: 'five_elements',
    name: 'חמשת היסודות',
    nameEn: 'Five Elements',
    questions: [
      { id: '1', textHe: 'מהם חמשת היסודות (Wu Xing) וכיצד הם קשורים לאיברים?', textEn: 'What are the Five Elements and how are they related to organs?' },
      { id: '2', textHe: 'כיצד מחזור השליטה והחיזוק פועלים?', textEn: 'How do Control and Generation cycles work?' },
      { id: '3', textHe: 'מהו הקשר בין יסוד העץ לכבד ולמרה?', textEn: 'What is the connection between Wood element and Liver/Gallbladder?' },
      { id: '4', textHe: 'כיצד יסוד האש משפיע על הלב והמעי הדק?', textEn: 'How does Fire element affect Heart and Small Intestine?' },
      { id: '5', textHe: 'מהי החשיבות של יסוד האדמה לעיכול?', textEn: 'What is importance of Earth element for digestion?' },
      { id: '6', textHe: 'כיצד יסוד המתכת קשור לריאות?', textEn: 'How is Metal element related to Lungs?' },
      { id: '7', textHe: 'מהו תפקיד יסוד המים לכליות?', textEn: 'What is the role of Water element for Kidneys?' },
      { id: '8', textHe: 'כיצד מאזנים יסוד חלש באמצעות יסוד אחר?', textEn: 'How to balance a weak element using another?' },
      { id: '9', textHe: 'מהם הסימנים של חוסר איזון ביסוד העץ?', textEn: 'What are signs of Wood element imbalance?' },
      { id: '10', textHe: 'כיצד רגשות קשורים לחמשת היסודות?', textEn: 'How are emotions related to Five Elements?' },
      { id: '11', textHe: 'מהו הקשר בין עונות השנה ליסודות?', textEn: 'What is the connection between seasons and elements?' },
      { id: '12', textHe: 'כיצד צבעים משקפים את היסודות?', textEn: 'How do colors reflect the elements?' },
      { id: '13', textHe: 'מהם הטעמים הקשורים לכל יסוד?', textEn: 'What flavors are associated with each element?' },
      { id: '14', textHe: 'כיצד משתמשים בחמשת היסודות בבחירת נקודות?', textEn: 'How to use Five Elements in point selection?' },
      { id: '15', textHe: 'מהי גישת חמשת היסודות לטיפול פסיכו-רגשי?', textEn: 'What is Five Elements approach to psycho-emotional treatment?' },
    ]
  },
  {
    id: 'yin_yang',
    name: 'יין ויאנג',
    nameEn: 'Yin & Yang',
    questions: [
      { id: '1', textHe: 'מהם העקרונות הבסיסיים של תורת הין-יאנג?', textEn: 'What are basic principles of Yin-Yang theory?' },
      { id: '2', textHe: 'כיצד יין ויאנג מתקיימים יחד ובאיזון?', textEn: 'How do Yin and Yang coexist in balance?' },
      { id: '3', textHe: 'מהם הסימנים של עודף יאנג?', textEn: 'What are signs of Yang excess?' },
      { id: '4', textHe: 'כיצד מזהים חוסר יין?', textEn: 'How to identify Yin deficiency?' },
      { id: '5', textHe: 'מהו הקשר בין יין-יאנג לזמנים ביום?', textEn: 'What is the relationship between Yin-Yang and times of day?' },
      { id: '6', textHe: 'כיצד יין ויאנג מתבטאים בגוף?', textEn: 'How do Yin and Yang manifest in the body?' },
      { id: '7', textHe: 'מהי חשיבות האיזון בין יין ליאנג?', textEn: 'What is importance of balance between Yin and Yang?' },
      { id: '8', textHe: 'כיצד מטפלים בחוסר יאנג?', textEn: 'How to treat Yang deficiency?' },
      { id: '9', textHe: 'מהם המזונות שמזינים יין או יאנג?', textEn: 'What foods nourish Yin or Yang?' },
      { id: '10', textHe: 'כיצד יין-יאנג משפיעים על הרגשות?', textEn: 'How do Yin-Yang affect emotions?' },
      { id: '11', textHe: 'מהו הקשר בין יין-יאנג למחלות כרוניות?', textEn: 'What is connection between Yin-Yang and chronic diseases?' },
      { id: '12', textHe: 'כיצד מאבחנים דפוסי יין-יאנג?', textEn: 'How to diagnose Yin-Yang patterns?' },
      { id: '13', textHe: 'מהם הנקודות לחיזוק יין?', textEn: 'What are points for strengthening Yin?' },
      { id: '14', textHe: 'כיצד מגרשים קור (יין עודף)?', textEn: 'How to expel cold (excess Yin)?' },
      { id: '15', textHe: 'מהי הגישה להחלפת יין ויאנג במחלות חמורות?', textEn: 'What is approach to Yin-Yang collapse in severe diseases?' },
    ]
  },
];

/**
 * Get all Hebrew questions data
 */
export function getHebrewQuestionsData(): QuestionCategory[] {
  return hebrewQuestionsData;
}

/**
 * Get total question count
 */
export function getTotalQuestionCount(): number {
  return hebrewQuestionsData.reduce((sum, cat) => sum + cat.questions.length, 0);
}

/**
 * Download questions as CSV file
 */
export function downloadQuestionsAsCSV(): void {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel Hebrew support
  
  let csvContent = BOM + 'מספר שורה,קטגוריה,קטגוריה (אנגלית),מזהה שאלה,שאלה בעברית,שאלה באנגלית\n';
  
  let rowNumber = 1;
  hebrewQuestionsData.forEach((category) => {
    category.questions.forEach((question) => {
      // Escape quotes in text
      const textHe = question.textHe.replace(/"/g, '""');
      const textEn = question.textEn.replace(/"/g, '""');
      const catName = category.name.replace(/"/g, '""');
      const catNameEn = category.nameEn.replace(/"/g, '""');
      
      csvContent += `${rowNumber},"${catName}","${catNameEn}","${question.id}","${textHe}","${textEn}"\n`;
      rowNumber++;
    });
  });
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `TCM_Hebrew_Questions_36x15_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

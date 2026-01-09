// RAG Priority Context Mapping - Indexed Retrieval System
// Uses O(1) Map lookups instead of linear array scans
// These replace short Hebrew text with rich clinical context for direct AI injection

export type PromptRole = 'Clinical Differential' | 'Treatment Strategy' | 'Point Selection' | 'Pathology Analysis' | 'Physiology' | 'Preventive' | 'Diagnosis' | 'Five Elements' | 'Orthopedic' | 'Gynecology' | 'System';

export interface PromptMapping {
  id: string;
  hebrewLabel: string;
  ragPriorityContext: string;
  role: PromptRole;
  icon: string;
  fullAiPrompt: string;
  voiceText: string; // Hebrew text for speech synthesis on hover
}

export const PROMPT_MAPPINGS: PromptMapping[] = [
  // === SECTION 1: YIN-YANG CATEGORY (15 items) ===
  {
    id: 'yy_balance',
    hebrewLabel: 'יין ויאנג',
    ragPriorityContext: 'RAG PRIORITY: Yin-Yang Balance. Fundamental opposing forces analysis.',
    role: 'Clinical Differential',
    icon: '☯️',
    fullAiPrompt: 'RAG PRIORITY: Yin-Yang Balance. Analyze fundamental opposing forces in the body. Compare internal manifestations and treatment strategies.',
    voiceText: 'זהו הבסיס. כאן נבדוק את האיזון הכללי בין כוחות מנוגדים בגוף.'
  },
  {
    id: 'yy_yin_organs',
    hebrewLabel: 'איברי יין',
    ragPriorityContext: 'RAG PRIORITY: Yin Organs (Zang). Solid organs storing vital substances.',
    role: 'Physiology',
    icon: '🫀',
    fullAiPrompt: 'RAG PRIORITY: Yin Organs. Focus on solid organs (Heart, Liver, Spleen, Lung, Kidney) storing vital substances like blood and Qi.',
    voiceText: 'התמקדות באיברים המוצקים האוגרים חומרים חיוניים כמו דם וצ׳י.'
  },
  {
    id: 'yy_yin_def_face',
    hebrewLabel: 'חוסר יין בפנים',
    ragPriorityContext: 'RAG PRIORITY: Yin Deficiency facial signs. Visual diagnosis of malar flush and dryness.',
    role: 'Diagnosis',
    icon: '😶',
    fullAiPrompt: 'RAG PRIORITY: Yin Deficiency facial diagnosis. Search for malar flush, dry skin, red lips indicators.',
    voiceText: 'חיפוש אחר סימנים ויזואליים כמו סומק בלחיים ויובש בעור.'
  },
  {
    id: 'yy_yin_def_treat',
    hebrewLabel: 'טיפול בחוסר יין',
    ragPriorityContext: 'RAG PRIORITY: Yin Deficiency treatment. Nourishing fluids, cooling empty heat.',
    role: 'Treatment Strategy',
    icon: '💧',
    fullAiPrompt: 'RAG PRIORITY: Yin Deficiency treatment protocols. Nourish fluids, cool empty heat, calm Shen. KEY POINTS: KI6, SP6, LU7. HERBS: Liu Wei Di Huang Wan.',
    voiceText: 'אסטרטגיה להזנת נוזלים, קירור חום ריק והרגעת הנפש.'
  },
  {
    id: 'yy_yang_strengthen',
    hebrewLabel: 'חיזוק יאנג',
    ragPriorityContext: 'RAG PRIORITY: Yang tonification. Treating cold, chronic fatigue, warming energy.',
    role: 'Treatment Strategy',
    icon: '🔥',
    fullAiPrompt: 'RAG PRIORITY: Yang tonification. Treat cold conditions, chronic fatigue, weak warming energy. KEY POINTS: GV4, CV4, ST36 with moxa. HERBS: Jin Gui Shen Qi Wan.',
    voiceText: 'טיפול במצבי קור, עייפות כרונית וחולשה של האנרגיה המחממת.'
  },
  {
    id: 'yy_exercise',
    hebrewLabel: 'פעילות גופנית',
    ragPriorityContext: 'RAG PRIORITY: Exercise recommendations. Grounding movement preventing fluid loss.',
    role: 'Preventive',
    icon: '🏃',
    fullAiPrompt: 'RAG PRIORITY: Exercise for Yin-Yang balance. Recommend grounding movements preventing fluid and Yin loss.',
    voiceText: 'המלצות לתנועה מקרקעת המונעת איבוד נוזלים ויין.'
  },
  {
    id: 'yy_insomnia',
    hebrewLabel: 'נדודי שינה',
    ragPriorityContext: 'RAG PRIORITY: Insomnia. Heart-Kidney connection and sleep quality.',
    role: 'Clinical Differential',
    icon: '😴',
    fullAiPrompt: 'RAG PRIORITY: Insomnia diagnosis. Analyze Heart-Kidney disconnection. KEY POINTS: HT7, KI6, SP6, Yintang. HERBS: Tian Wang Bu Xin Dan.',
    voiceText: 'ניתוח הקשר בין הלב לכליות והשפעתו על איכות השינה.'
  },
  {
    id: 'yy_depression',
    hebrewLabel: 'דיכאון',
    ragPriorityContext: 'RAG PRIORITY: Depression. Emotional diagnosis by Yin excess or Yang deficiency.',
    role: 'Clinical Differential',
    icon: '😔',
    fullAiPrompt: 'RAG PRIORITY: Depression differential. Diagnose emotional source by Yin excess or Yang deficiency patterns.',
    voiceText: 'אבחון המקור הרגשי לפי עודף יין או חוסר יאנג.'
  },
  {
    id: 'yy_five_elements',
    hebrewLabel: 'חמשת האלמנטים',
    ragPriorityContext: 'RAG PRIORITY: Five Elements overview. Connection to Yin-Yang division.',
    role: 'Five Elements',
    icon: '🌟',
    fullAiPrompt: 'RAG PRIORITY: Five Elements introduction. Understand connection between Yin-Yang and Five Element division of nature.',
    voiceText: 'הבנת הקשר בין יין ויאנג לחלוקה המחומשת של הטבע.'
  },
  {
    id: 'yy_kidney_balance',
    hebrewLabel: 'איזון הכליות',
    ragPriorityContext: 'RAG PRIORITY: Kidney balance. Root of body energy, source of Yin and Yang.',
    role: 'Treatment Strategy',
    icon: '🫘',
    fullAiPrompt: 'RAG PRIORITY: Kidney balance treatment. Treat root of body energy, source of Yin and Yang. KEY POINTS: KI3, KI6, KI7, BL23, GV4.',
    voiceText: 'טיפול בשורש האנרגיה של הגוף ובמקור היין והיאנג.'
  },
  {
    id: 'yy_liver_yang',
    hebrewLabel: 'יאנג הכבד',
    ragPriorityContext: 'RAG PRIORITY: Liver Yang Rising. Hot energy rising to head causing anger and headaches.',
    role: 'Clinical Differential',
    icon: '🌿',
    fullAiPrompt: 'RAG PRIORITY: Liver Yang Rising. Identify hot energy ascending to head causing anger, headaches. KEY POINTS: LV3, GB20, LV2, KI3.',
    voiceText: 'זיהוי עלייה של אנרגיה חמה לראש הגורמת לכעס וכאבי ראש.'
  },
  {
    id: 'yy_yang_type',
    hebrewLabel: 'טיפוס יאנג',
    ragPriorityContext: 'RAG PRIORITY: Yang constitution type. Lifestyle management for heat-prone individuals.',
    role: 'Preventive',
    icon: '☀️',
    fullAiPrompt: 'RAG PRIORITY: Yang constitution lifestyle. Preventive management for individuals prone to excess heat and activity.',
    voiceText: 'ניהול אורח חיים מונע לאנשים עם נטייה לעודף חום ופעילות.'
  },
  {
    id: 'yy_symptom_sort',
    hebrewLabel: 'אבחון סימפטומים',
    ragPriorityContext: 'RAG PRIORITY: Symptom sorting. Quick categorization by heat and cold.',
    role: 'Diagnosis',
    icon: '🔍',
    fullAiPrompt: 'RAG PRIORITY: Symptom differentiation. Quick sorting of patient complaints by heat vs cold categories.',
    voiceText: 'מיון מהיר של תלונות המטופל לפי קטגוריות של חום וקור.'
  },
  {
    id: 'yy_constitutional',
    hebrewLabel: 'טיפול קונסטיטוציוני',
    ragPriorityContext: 'RAG PRIORITY: Constitutional treatment. Long-term plan based on innate structure.',
    role: 'Treatment Strategy',
    icon: '🧬',
    fullAiPrompt: 'RAG PRIORITY: Constitutional treatment planning. Build long-term protocol based on patient innate constitution.',
    voiceText: 'בניית תוכנית טיפול ארוכת טווח לפי המבנה המולד של המטופל.'
  },
  {
    id: 'yy_western_integration',
    hebrewLabel: 'שילוב מערבי',
    ragPriorityContext: 'RAG PRIORITY: Western integration. Cross-reference TCM with Western medicine terms.',
    role: 'Clinical Differential',
    icon: '🏥',
    fullAiPrompt: 'RAG PRIORITY: East-West integration. Cross-reference Chinese diagnosis with Western medical terminology and pathologies.',
    voiceText: 'הצלבת האבחנה הסינית עם המונחים והפתולוגיות של הרפואה המערבית.'
  },

  // === SECTION 2: ORTHOPEDIC & PAIN CATEGORY (15 items) ===
  {
    id: 'ortho_wind',
    hebrewLabel: 'רוח נודדת',
    ragPriorityContext: 'RAG PRIORITY: Wandering Bi Syndrome. Migratory pain, wind expulsion.',
    role: 'Orthopedic',
    icon: '🌬️',
    fullAiPrompt: 'RAG PRIORITY: Wandering Bi (Wind). Migratory pain moving from place to place. Focus on releasing exterior, expelling wind. KEY POINTS: GB20, BL12, LI4, GB31.',
    voiceText: 'לכאב שזז ממקום למקום. נתמקד בשחרור החיצון וסילוק רוח.'
  },
  {
    id: 'ortho_cold',
    hebrewLabel: 'כאב קור',
    ragPriorityContext: 'RAG PRIORITY: Cold Bi Syndrome. Fixed intense pain improved by warmth.',
    role: 'Orthopedic',
    icon: '❄️',
    fullAiPrompt: 'RAG PRIORITY: Cold Bi. Fixed, intense pain improved by warming. Use moxa and warm meridians. KEY POINTS: ST36 moxa, local Ashi, BL60.',
    voiceText: 'לכאב עז וממוקד המשתפר בחימום. נשתמש במוקסה וחימום מרידיאנים.'
  },
  {
    id: 'ortho_damp',
    hebrewLabel: 'לחות קבועה',
    ragPriorityContext: 'RAG PRIORITY: Damp Bi Syndrome. Pain with heaviness and swelling.',
    role: 'Orthopedic',
    icon: '💦',
    fullAiPrompt: 'RAG PRIORITY: Damp Bi. Pain accompanied by heaviness and swelling. Focus on transforming dampness. KEY POINTS: SP9, SP6, ST36, CV9.',
    voiceText: 'לכאב המלווה בכבדות ונפיחות. נתמקד בהתמרת לחות.'
  },
  {
    id: 'ortho_heat',
    hebrewLabel: 'חום במפרקים',
    ragPriorityContext: 'RAG PRIORITY: Heat Bi Syndrome. Red, hot joints, cooling and draining.',
    role: 'Orthopedic',
    icon: '🔴',
    fullAiPrompt: 'RAG PRIORITY: Heat Bi. Red and hot joints. Cooling and drainage strategy. KEY POINTS: LI11, SP10, ST44, local bleeding.',
    voiceText: 'למפרקים אדומים וחמים. אסטרטגיה של קירור וניקוז דלקת.'
  },
  {
    id: 'ortho_back_trauma',
    hebrewLabel: 'טראומה בגב',
    ragPriorityContext: 'RAG PRIORITY: Acute back trauma. Strong blood-moving points.',
    role: 'Orthopedic',
    icon: '🦴',
    fullAiPrompt: 'RAG PRIORITY: Acute back trauma. Use strong blood-moving points for injury. KEY POINTS: BL40 bleeding, BL60, Yaotongxue, local Ashi.',
    voiceText: 'למקרים אקוטיים של פציעה. נשתמש בנקודות מניעות דם חזקות.'
  },
  {
    id: 'ortho_neck',
    hebrewLabel: 'תפיסות בצוואר',
    ragPriorityContext: 'RAG PRIORITY: Neck stiffness. Release Qi and blood in shoulders and neck.',
    role: 'Orthopedic',
    icon: '🦒',
    fullAiPrompt: 'RAG PRIORITY: Neck stiffness. Release Qi and blood stagnation in shoulders and neck, often stress-related. KEY POINTS: GB21, GB20, SI3, BL10.',
    voiceText: 'שחרור תקיעות צ׳י ודם באזור הכתפיים והצוואר, לרוב על רקע סטרס.'
  },
  {
    id: 'ortho_tennis_elbow',
    hebrewLabel: 'מרפק טניס',
    ragPriorityContext: 'RAG PRIORITY: Tennis elbow. LI meridian blockage, blood flow to joint.',
    role: 'Orthopedic',
    icon: '🎾',
    fullAiPrompt: 'RAG PRIORITY: Tennis elbow (lateral epicondylitis). Treat LI meridian blockage, blood flow to elbow joint. KEY POINTS: LI11, LI10, LI4, Ashi.',
    voiceText: 'טיפול בחסימה של מרידיאן המעי הגס והזרמת דם למפרק.'
  },
  {
    id: 'ortho_sciatica',
    hebrewLabel: 'סיאטיקה',
    ragPriorityContext: 'RAG PRIORITY: Sciatica. Radiating leg pain, Bladder meridian focus.',
    role: 'Orthopedic',
    icon: '⚡',
    fullAiPrompt: 'RAG PRIORITY: Sciatica. Radiating pain along leg, Bladder meridian emphasis. KEY POINTS: BL40, BL57, BL60, GB30, GB34, Huatuojiaji.',
    voiceText: 'טיפול בהקרנה לאורך הרגל תוך דגש על מרידיאן השלפוחית.'
  },
  {
    id: 'ortho_cartilage',
    hebrewLabel: 'שחיקת סחוס',
    ragPriorityContext: 'RAG PRIORITY: Cartilage erosion. Strengthen Kidneys, nourish bones.',
    role: 'Orthopedic',
    icon: '🦿',
    fullAiPrompt: 'RAG PRIORITY: Cartilage erosion/OA. Strengthen Kidneys, nourish bones for chronic joint pain. KEY POINTS: KI3, BL23, GB34, local points.',
    voiceText: 'חיזוק הכליות והזנת העצמות למניעת כאב כרוני במפרקים.'
  },
  {
    id: 'ortho_carpal',
    hebrewLabel: 'תעלה קרפלית',
    ragPriorityContext: 'RAG PRIORITY: Carpal tunnel. Pericardium meridian blockage at wrist.',
    role: 'Orthopedic',
    icon: '🖐️',
    fullAiPrompt: 'RAG PRIORITY: Carpal tunnel syndrome. Open blockages in Pericardium meridian at wrist. KEY POINTS: PC7, PC6, LI4, SJ5.',
    voiceText: 'פתיחת חסימות במרידיאן המעטפת בפרק כף היד.'
  },
  {
    id: 'ortho_shoulder',
    hebrewLabel: 'כאב כתף כרוני',
    ragPriorityContext: 'RAG PRIORITY: Chronic shoulder pain. Move stagnant blood in tendons.',
    role: 'Orthopedic',
    icon: '💪',
    fullAiPrompt: 'RAG PRIORITY: Chronic shoulder pain. Move stagnant blood in shoulder tendons for improved ROM. KEY POINTS: LI15, SJ14, SI9, GB21.',
    voiceText: 'הנעת דם תקוע בגידי הכתף לשיפור טווח התנועה.'
  },
  {
    id: 'ortho_fibromyalgia',
    hebrewLabel: 'פיברומיאלגיה',
    ragPriorityContext: 'RAG PRIORITY: Fibromyalgia. Systemic treatment, calm Liver, strengthen blood.',
    role: 'Orthopedic',
    icon: '🌐',
    fullAiPrompt: 'RAG PRIORITY: Fibromyalgia. Systemic treatment combining Liver calming with blood and Qi strengthening. KEY POINTS: LV3, SP6, ST36, GB34.',
    voiceText: 'טיפול מערכתי המשלב הרגעת כבד וחיזוק דם וצ׳י.'
  },
  {
    id: 'ortho_heel_spur',
    hebrewLabel: 'דורבן בכף הרגל',
    ragPriorityContext: 'RAG PRIORITY: Heel spur/plantar fasciitis. Local treatment with Kidney support.',
    role: 'Orthopedic',
    icon: '🦶',
    fullAiPrompt: 'RAG PRIORITY: Heel spur/plantar fasciitis. Local treatment combined with Kidney meridian strengthening. KEY POINTS: KI1, KI3, BL60, Ashi.',
    voiceText: 'טיפול מקומי בשילוב חיזוק מרידיאן הכליות.'
  },
  {
    id: 'ortho_gout',
    hebrewLabel: 'גאוט',
    ragPriorityContext: 'RAG PRIORITY: Gout. Clear damp-heat from small joints, diet advice.',
    role: 'Orthopedic',
    icon: '🍖',
    fullAiPrompt: 'RAG PRIORITY: Gout. Clear damp-heat from small joints, provide adapted nutrition advice. KEY POINTS: SP9, LI11, SP6, local bleeding.',
    voiceText: 'סילוק לחות חמה מהמפרקים הקטנים ותזונה מותאמת.'
  },
  {
    id: 'ortho_ankle_sprain',
    hebrewLabel: 'נקע בקרסול',
    ragPriorityContext: 'RAG PRIORITY: Ankle sprain. Reduce swelling, accelerate local trauma recovery.',
    role: 'Orthopedic',
    icon: '🩹',
    fullAiPrompt: 'RAG PRIORITY: Ankle sprain. Reduce swelling, accelerate recovery from local trauma. KEY POINTS: GB40, ST41, BL60, Ashi.',
    voiceText: 'הפחתת נפיחות והאצת החלמה בטראומה מקומית.'
  },

  // === SECTION 3: WOMEN & FERTILITY CATEGORY (15 items) ===
  {
    id: 'gyn_late_period',
    hebrewLabel: 'מחזור מאחר',
    ragPriorityContext: 'RAG PRIORITY: Delayed menstruation. Cold uterus or blood deficiency.',
    role: 'Gynecology',
    icon: '📅',
    fullAiPrompt: 'RAG PRIORITY: Delayed menstruation. Usually indicates cold uterus or blood deficiency. Use warming points. KEY POINTS: CV4, SP6, ST36, Zigong moxa.',
    voiceText: 'מצביע לרוב על קור ברחם או חוסר דם. נשתמש בנקודות מחממות.'
  },
  {
    id: 'gyn_early_period',
    hebrewLabel: 'מחזור מקדים',
    ragPriorityContext: 'RAG PRIORITY: Early menstruation. Blood heat pushing cycle forward.',
    role: 'Gynecology',
    icon: '⏰',
    fullAiPrompt: 'RAG PRIORITY: Early menstruation. Blood heat pushing the cycle. Cool and calm. KEY POINTS: SP10, LV2, SP1, KI2.',
    voiceText: 'מצביע על חום בדם הדוחף את המחזור. נקרר ונרגיע.'
  },
  {
    id: 'gyn_irregular',
    hebrewLabel: 'מחזור לא סדיר',
    ragPriorityContext: 'RAG PRIORITY: Irregular menstruation. Liver Qi stagnation, regulation.',
    role: 'Gynecology',
    icon: '🔄',
    fullAiPrompt: 'RAG PRIORITY: Irregular menstruation. Usually related to Liver Qi stagnation. Focus on regulation and harmony. KEY POINTS: LV3, SP6, CV6, LV14.',
    voiceText: 'קשור לרוב לתקיעות צ׳י הכבד. נתמקד בוויסות והרמוניה.'
  },
  {
    id: 'gyn_dysmenorrhea',
    hebrewLabel: 'כאבי מחזור',
    ragPriorityContext: 'RAG PRIORITY: Dysmenorrhea. Intense pain with clots, move blood in uterus.',
    role: 'Gynecology',
    icon: '😣',
    fullAiPrompt: 'RAG PRIORITY: Dysmenorrhea. Intense pain with blood clots, move blood in uterus. KEY POINTS: SP6, SP8, CV3, LV3, Zigong.',
    voiceText: 'טיפול בכאב עז עם קרישי דם דרך הנעת דם ברחם.'
  },
  {
    id: 'gyn_amenorrhea',
    hebrewLabel: 'אל-וסת',
    ragPriorityContext: 'RAG PRIORITY: Amenorrhea. Rebuild blood and Qi reserves in Spleen and Kidneys.',
    role: 'Gynecology',
    icon: '🚫',
    fullAiPrompt: 'RAG PRIORITY: Amenorrhea. Rebuild blood and Qi reserves in Spleen and Kidneys. KEY POINTS: ST36, SP6, CV4, BL20, BL23.',
    voiceText: 'בנייה מחדש של מאגרי הדם והצ׳י בטחול ובכליות.'
  },
  {
    id: 'gyn_fertility_cold',
    hebrewLabel: 'פוריות וקור',
    ragPriorityContext: 'RAG PRIORITY: Fertility with cold. Warm Gate of Life and uterus.',
    role: 'Gynecology',
    icon: '❄️',
    fullAiPrompt: 'RAG PRIORITY: Fertility and cold. Warm Ming Men and uterus for receptive environment. KEY POINTS: GV4, CV4, ST36 moxa, Zigong.',
    voiceText: 'חימום ״שער החיים״ והרחם ליצירת סביבה קולטת להריון.'
  },
  {
    id: 'gyn_fertility_yin',
    hebrewLabel: 'פוריות ויין',
    ragPriorityContext: 'RAG PRIORITY: Fertility with Yin deficiency. Nourish fluids and blood.',
    role: 'Gynecology',
    icon: '💧',
    fullAiPrompt: 'RAG PRIORITY: Fertility and Yin. Nourish fluids and blood for lining and egg quality. KEY POINTS: KI6, SP6, CV4, LV8.',
    voiceText: 'הזנת נוזלים ודם לשיפור איכות הרירית והביציות.'
  },
  {
    id: 'gyn_pcos',
    hebrewLabel: 'שחלות פוליציסטיות',
    ragPriorityContext: 'RAG PRIORITY: PCOS. Clear phlegm and dampness blocking ovulation.',
    role: 'Gynecology',
    icon: '🔵',
    fullAiPrompt: 'RAG PRIORITY: PCOS. Clear phlegm and dampness blocking ovulation. KEY POINTS: SP9, SP6, CV3, ST40, Zigong.',
    voiceText: 'סילוק ליחה ולחות המעכבים את הביוץ.'
  },
  {
    id: 'gyn_endometriosis',
    hebrewLabel: 'אנדומטריוזיס',
    ragPriorityContext: 'RAG PRIORITY: Endometriosis. Intensive blood stasis treatment in pelvis.',
    role: 'Gynecology',
    icon: '🩸',
    fullAiPrompt: 'RAG PRIORITY: Endometriosis. Intensive blood stasis treatment in pelvis. KEY POINTS: SP10, SP6, CV3, LV3, BL32.',
    voiceText: 'טיפול אינטנסיבי בתקיעות דם וסטזיס באגן.'
  },
  {
    id: 'gyn_pms',
    hebrewLabel: 'תסמונת קדם וסתית',
    ragPriorityContext: 'RAG PRIORITY: PMS. Regulate Liver for mental tension and breast distension.',
    role: 'Gynecology',
    icon: '😤',
    fullAiPrompt: 'RAG PRIORITY: PMS. Regulate Liver to reduce mental tension and breast distension. KEY POINTS: LV3, LV14, PC6, GB34.',
    voiceText: 'ויסות הכבד להפחתת מתח נפשי וגודש בשדיים.'
  },
  {
    id: 'gyn_menopause',
    hebrewLabel: 'גיל המעבר',
    ragPriorityContext: 'RAG PRIORITY: Menopause. Nourish Yin for hot flashes and night sweats.',
    role: 'Gynecology',
    icon: '🌡️',
    fullAiPrompt: 'RAG PRIORITY: Menopause. Nourish Yin for hot flashes, night sweats, restlessness. KEY POINTS: KI6, SP6, HT6, LV3.',
    voiceText: 'הזנת היין לטיפול בגלי חום, הזעות לילה וחוסר שקט.'
  },
  {
    id: 'gyn_postpartum',
    hebrewLabel: 'שיקום לאחר לידה',
    ragPriorityContext: 'RAG PRIORITY: Postpartum recovery. Strengthen body after blood and Qi loss.',
    role: 'Gynecology',
    icon: '👶',
    fullAiPrompt: 'RAG PRIORITY: Postpartum recovery. Strengthen body after blood and Qi loss in childbirth. KEY POINTS: ST36, SP6, CV6, BL20.',
    voiceText: 'חיזוק הגוף לאחר אובדן דם וצ׳י בתהליך הלידה.'
  },
  {
    id: 'gyn_threatened_miscarriage',
    hebrewLabel: 'הפלה מאיימת',
    ragPriorityContext: 'RAG PRIORITY: Threatened miscarriage. Strengthen Spleen Qi, raise energy.',
    role: 'Gynecology',
    icon: '⚠️',
    fullAiPrompt: 'RAG PRIORITY: Threatened miscarriage. Strengthen Spleen Qi, raise energy to hold fetus. KEY POINTS: GV20, ST36, SP6, CV4.',
    voiceText: 'חיזוק צ׳י הטחול והרמת האנרגיה כדי לשמור על העובר.'
  },
  {
    id: 'gyn_morning_sickness',
    hebrewLabel: 'בחילות בוקר',
    ragPriorityContext: 'RAG PRIORITY: Morning sickness. Descend rebellious Stomach Qi.',
    role: 'Gynecology',
    icon: '🤢',
    fullAiPrompt: 'RAG PRIORITY: Morning sickness. Descend rebellious Stomach Qi, calm digestion. KEY POINTS: PC6, ST36, CV12, SP4.',
    voiceText: 'הורדת צ׳י הקיבה המורד והרגעת מערכת העיכול.'
  },
  {
    id: 'gyn_pregnancy_forbidden',
    hebrewLabel: 'איסורי הריון',
    ragPriorityContext: 'RAG PRIORITY: Pregnancy contraindications. Forbidden points during pregnancy.',
    role: 'Gynecology',
    icon: '🚷',
    fullAiPrompt: 'RAG PRIORITY: Pregnancy contraindications. Forbidden points for acupuncture during pregnancy. Caution is paramount. FORBIDDEN: LI4, SP6, BL60, BL67, GB21, sacral points.',
    voiceText: 'נקודות אסורות לדיקור בזמן הריון. זהירות היא ערך עליון כאן.'
  },

  // === SECTION 4: SYSTEM & MANAGEMENT (15 items) ===
  {
    id: 'sys_stack',
    hebrewLabel: 'סל הניתוח',
    ragPriorityContext: 'SYSTEM: Analysis basket. Collection of selected queries before final analysis.',
    role: 'System',
    icon: '🧺',
    fullAiPrompt: 'SYSTEM: Analysis basket functionality. All selections are collected here before final synthesis.',
    voiceText: 'כאן נאספות כל הבחירות שלך לפני הניתוח הסופי.'
  },
  {
    id: 'sys_synthesis',
    hebrewLabel: 'כפתור סינתזה',
    ragPriorityContext: 'SYSTEM: Synthesis button. Unifies all data into one smart report.',
    role: 'System',
    icon: '🔮',
    fullAiPrompt: 'SYSTEM: Synthesis button functionality. The most important click - unifies all information into one intelligent report.',
    voiceText: 'הקליק החשוב ביותר. הוא מאחד את כל המידע לדו״ח חכם אחד.'
  },
  {
    id: 'sys_economy',
    hebrewLabel: 'מוניטור כלכלי',
    ragPriorityContext: 'SYSTEM: Economy monitor. Real-time query cost tracking.',
    role: 'System',
    icon: '💰',
    fullAiPrompt: 'SYSTEM: Economy monitor functionality. Real-time tracking of query cost. We save you money.',
    voiceText: 'מעקב אחר עלות השאילתה בזמן אמת. אנחנו חוסכים לך כסף.'
  },
  {
    id: 'sys_rag_report',
    hebrewLabel: 'דוח RAG',
    ragPriorityContext: 'SYSTEM: RAG report. Final answer based on knowledge base.',
    role: 'System',
    icon: '📋',
    fullAiPrompt: 'SYSTEM: RAG report output. Here you receive the final answer based on our knowledge base.',
    voiceText: 'כאן תקבל את התשובה הסופית המבוססת על מאגר הידע שלנו.'
  },
  {
    id: 'sys_free_search',
    hebrewLabel: 'חיפוש חופשי',
    ragPriorityContext: 'SYSTEM: Free text search. Add custom text to refine AI analysis.',
    role: 'System',
    icon: '🔍',
    fullAiPrompt: 'SYSTEM: Free text search. Add custom text to refine AI analysis precision.',
    voiceText: 'ניתן להוסיף טקסט חופשי כדי לדייק את הניתוח של הבינה המלאכותית.'
  },
  {
    id: 'sys_body_map',
    hebrewLabel: 'מפת הגוף',
    ragPriorityContext: 'SYSTEM: Body map. Visual anatomical reference for point selection.',
    role: 'System',
    icon: '🧍',
    fullAiPrompt: 'SYSTEM: Body map functionality. Visual anatomical reference for acupoint selection.',
    voiceText: 'מפת הגוף הוויזואלית לבחירת נקודות דיקור.'
  },
  {
    id: 'sys_clear',
    hebrewLabel: 'ניקוי הכל',
    ragPriorityContext: 'SYSTEM: Clear all. Reset all selections and start fresh.',
    role: 'System',
    icon: '🗑️',
    fullAiPrompt: 'SYSTEM: Clear all functionality. Reset all selections and start a fresh session.',
    voiceText: 'איפוס כל הבחירות והתחלה מחדש.'
  },
  {
    id: 'sys_export',
    hebrewLabel: 'ייצוא לPDF',
    ragPriorityContext: 'SYSTEM: Export to PDF. Generate professional clinical report.',
    role: 'System',
    icon: '📄',
    fullAiPrompt: 'SYSTEM: PDF export functionality. Generate professional clinical report for documentation.',
    voiceText: 'יצירת דוח קליני מקצועי לתיעוד.'
  },
  {
    id: 'sys_history',
    hebrewLabel: 'היסטוריית שאילתות',
    ragPriorityContext: 'SYSTEM: Query history. View past analysis sessions.',
    role: 'System',
    icon: '📚',
    fullAiPrompt: 'SYSTEM: Query history functionality. View and reference past analysis sessions.',
    voiceText: 'צפייה בניתוחים קודמים לעיון והשוואה.'
  },
  {
    id: 'sys_favorites',
    hebrewLabel: 'מועדפים',
    ragPriorityContext: 'SYSTEM: Favorites. Save frequently used query combinations.',
    role: 'System',
    icon: '⭐',
    fullAiPrompt: 'SYSTEM: Favorites functionality. Save frequently used query combinations for quick access.',
    voiceText: 'שמירת שילובי שאילתות נפוצים לגישה מהירה.'
  },
  {
    id: 'sys_settings',
    hebrewLabel: 'הגדרות',
    ragPriorityContext: 'SYSTEM: Settings. Customize interface and preferences.',
    role: 'System',
    icon: '⚙️',
    fullAiPrompt: 'SYSTEM: Settings panel. Customize interface, language, and user preferences.',
    voiceText: 'התאמה אישית של הממשק וההעדפות שלך.'
  },
  {
    id: 'sys_help',
    hebrewLabel: 'עזרה',
    ragPriorityContext: 'SYSTEM: Help guide. Tutorial and documentation.',
    role: 'System',
    icon: '❓',
    fullAiPrompt: 'SYSTEM: Help and documentation. Access tutorials and usage guides.',
    voiceText: 'גישה למדריכים והסברים על השימוש במערכת.'
  },
  {
    id: 'sys_voice',
    hebrewLabel: 'הקראה קולית',
    ragPriorityContext: 'SYSTEM: Voice narration. Read results aloud.',
    role: 'System',
    icon: '🔊',
    fullAiPrompt: 'SYSTEM: Voice narration functionality. Read analysis results aloud for accessibility.',
    voiceText: 'הקראת תוצאות הניתוח בקול לנגישות מירבית.'
  },
  {
    id: 'sys_feedback',
    hebrewLabel: 'משוב',
    ragPriorityContext: 'SYSTEM: Feedback. Rate and improve AI responses.',
    role: 'System',
    icon: '💬',
    fullAiPrompt: 'SYSTEM: Feedback functionality. Rate responses and help improve AI accuracy.',
    voiceText: 'דירוג תשובות ועזרה בשיפור דיוק הבינה המלאכותית.'
  },
  {
    id: 'sys_token_counter',
    hebrewLabel: 'מונה טוקנים',
    ragPriorityContext: 'SYSTEM: Token counter. Track API usage in real-time.',
    role: 'System',
    icon: '🔢',
    fullAiPrompt: 'SYSTEM: Token counter. Track API token usage in real-time for cost awareness.',
    voiceText: 'מעקב בזמן אמת אחר שימוש בטוקנים לחיסכון בעלויות.'
  }
];

// === INDEXED RETRIEVAL SYSTEM ===
// O(1) lookups using Map instead of O(n) array scans

// Pre-built index maps for instant access
const MAPPING_BY_ID = new Map<string, PromptMapping>(
  PROMPT_MAPPINGS.map(m => [m.id, m])
);

const MAPPING_BY_LABEL = new Map<string, PromptMapping>(
  PROMPT_MAPPINGS.map(m => [m.hebrewLabel, m])
);

// O(1) lookup by Hebrew label
export const getMappingByLabel = (label: string): PromptMapping | undefined => {
  return MAPPING_BY_LABEL.get(label);
};

// O(1) lookup by ID
export const getMappingById = (id: string): PromptMapping | undefined => {
  return MAPPING_BY_ID.get(id);
};

// Get multiple mappings by IDs efficiently
export const getMappingsById = (ids: string[]): PromptMapping[] => {
  return ids.map(id => MAPPING_BY_ID.get(id)).filter(Boolean) as PromptMapping[];
};

// Group mappings by role
export const getMappingsByRole = (): Record<string, PromptMapping[]> => {
  return PROMPT_MAPPINGS.reduce((acc, mapping) => {
    if (!acc[mapping.role]) {
      acc[mapping.role] = [];
    }
    acc[mapping.role].push(mapping);
    return acc;
  }, {} as Record<string, PromptMapping[]>);
};

// Get voice text for speech synthesis
export const getVoiceText = (id: string): string | undefined => {
  return MAPPING_BY_ID.get(id)?.voiceText;
};

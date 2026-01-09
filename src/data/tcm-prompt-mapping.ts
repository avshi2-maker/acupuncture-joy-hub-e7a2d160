// RAG Priority Context Mapping - Indexed Retrieval System
// Uses O(1) Map lookups instead of linear array scans
// These replace short Hebrew text with rich clinical context for direct AI injection

export type PromptRole = 'Clinical Differential' | 'Treatment Strategy' | 'Point Selection' | 'Pathology Analysis' | 'Physiology' | 'Preventive' | 'Diagnosis' | 'Five Elements';

export interface PromptMapping {
  id: string;
  hebrewLabel: string;
  ragPriorityContext: string;
  role: PromptRole;
  icon: string;
  fullAiPrompt: string;
}

export const PROMPT_MAPPINGS: PromptMapping[] = [
  // === SECTION 1: CORE CLINICAL DIFFERENTIALS (15 items) ===
  {
    id: 'yy_kidney',
    hebrewLabel: 'סימנים יין/יאנג כליות',
    ragPriorityContext: 'RAG PRIORITY: Kidney Pathology. Compare Yin/Yang deficiency signs (Heat vs Cold). Use embedded point table.',
    role: 'Clinical Differential',
    icon: '🫘',
    fullAiPrompt: 'RAG PRIORITY: Kidney Pathology. Compare Yin and Yang deficiency signs (Deficiency Heat vs Internal Cold). Retrieve specific point combinations for Kidney Yin vs Kidney Yang tonification from internal CSV. KEY POINTS: KI3 (tonify both), KI6 (Yin), KI7 (Yang), GV4 (Yang), CV4 (both). HERBS: Liu Wei Di Huang Wan (Yin), Jin Gui Shen Qi Wan (Yang).'
  },
  {
    id: 'yy_liver',
    hebrewLabel: 'סטגנציה מול עליית יאנג',
    ragPriorityContext: 'RAG PRIORITY: Liver Dynamics. Differentiate Qi Stagnation vs Yang Rising. Focus on pulse/tongue.',
    role: 'Clinical Differential',
    icon: '🌿',
    fullAiPrompt: 'RAG PRIORITY: Liver Dynamics. Differentiate Liver Qi Stagnation vs Liver Yang Rising. Analyze pulse/tongue indicators. Provide sedation points for Yang rising and moving points for stagnation. KEY POINTS: LV3 (both), LV2 (Yang Rising), GB20 (Yang Rising), PC6 (Stagnation), GB34 (Stagnation). HERBS: Xiao Yao San (Stagnation), Tian Ma Gou Teng Yin (Yang Rising).'
  },
  {
    id: 'yy_spleen_damp',
    hebrewLabel: 'לחות חמה בטחול',
    ragPriorityContext: 'RAG PRIORITY: Spleen/Damp-Heat. Search herbs for draining dampness. Prioritize clinical strategy.',
    role: 'Treatment Strategy',
    icon: '💧',
    fullAiPrompt: 'RAG PRIORITY: Spleen/Damp-Heat. Retrieve herbal strategies for draining dampness and clearing heat. Focus on Spleen 9 and ST 44. Prioritize clinical results from internal RAG index. KEY POINTS: SP9 (drain damp), SP6, ST36, CV12, LI11 (clear heat). HERBS: Yin Chen Hao Tang, Long Dan Xie Gan Tang.'
  },
  {
    id: 'yy_shen_ear',
    hebrewLabel: 'נקודות Shen באוזן',
    ragPriorityContext: 'RAG PRIORITY: Auricular Medicine. Retrieve specific Shen-calming ear points. Output concise list.',
    role: 'Point Selection',
    icon: '👂',
    fullAiPrompt: 'RAG PRIORITY: Auricular Medicine. Retrieve specific Shen-calming ear points (Shen Men, Zero Point, Heart). Provide a concise clinical list for psychological stabilization. EAR POINTS: Shenmen (primary), Heart, Sympathetic, Subcortex, Zero Point, Brain Stem, Tranquilizer Point. TECHNIQUE: Retain seeds 3-5 days, bilateral.'
  },
  {
    id: 'yy_ke_cycle',
    hebrewLabel: 'מעגל הבקרה כבד/טחול',
    ragPriorityContext: 'RAG PRIORITY: Ke Cycle. Analyze Wood overacting on Earth. Retrieve internal case studies.',
    role: 'Pathology Analysis',
    icon: '🔄',
    fullAiPrompt: 'RAG PRIORITY: Ke Cycle Analysis. Analyze "Wood overacting on Earth" (Liver attacking Spleen). Retrieve internal case studies for digestive protocols triggered by stress. KEY POINTS: LV3+ST36 (harmonize), LV13 (Spleen Mu), SP6, CV12. HERBS: Xiao Yao San, Tong Xie Yao Fang.'
  },
  {
    id: 'yy_lung_kidney',
    hebrewLabel: 'ריאות וכליות - נשימה',
    ragPriorityContext: "RAG PRIORITY: Respiratory/Kidney. Search 'Grasping the Qi'. Focus on LU7 and KI6 relationship.",
    role: 'Physiology',
    icon: '🫁',
    fullAiPrompt: 'RAG PRIORITY: Respiratory/Kidney connection. Search for "Kidney failing to grasp Qi". Focus on the LU7 and KI6 relationship for chronic asthma or shortness of breath. MASTER PAIR: LU7+KI6 (Ren Mai opening). KEY POINTS: KI3, KI7, CV4, CV6, BL23, LU9. MOXA: CV4, GV4, BL23.'
  },
  {
    id: 'yy_wei_qi',
    hebrewLabel: 'חיזוק Wei Qi',
    ragPriorityContext: 'RAG PRIORITY: Immune Defense. Retrieve points for strengthening external shield (Wei Qi).',
    role: 'Preventive',
    icon: '🛡️',
    fullAiPrompt: 'RAG PRIORITY: Immune Defense. Retrieve top 5 points for strengthening Wei Qi (Immune Shield). Focus on ST36 and LU7. Keep response concise to save tokens. KEY POINTS: ST36, LI4, LU7, GV14, BL12, BL13. HERBS: Yu Ping Feng San, Huang Qi.'
  },
  {
    id: 'yy_pulse_blood',
    hebrewLabel: 'דופק חוסר מול סטגנציה',
    ragPriorityContext: 'RAG PRIORITY: Pulse Diagnosis. Compare Choppy vs Thready/Weak pulses. Use reference table.',
    role: 'Diagnosis',
    icon: '💓',
    fullAiPrompt: 'RAG PRIORITY: Pulse Diagnosis metadata. Compare "Choppy" (Stagnation) vs "Thready/Weak" (Deficiency) pulses. Match with Blood Stasis vs Blood Deficiency treatment protocols. KEY: Choppy=movement blocked, Thready=substance lacking. CLINICAL: Choppy needs movement, Thready needs nourishing.'
  },
  {
    id: 'yy_tongue_spleen',
    hebrewLabel: 'חולשת צ׳י בטחול',
    ragPriorityContext: "RAG PRIORITY: Tongue Diagnosis. Search 'Scalloped edges' and 'Teeth marks'. Match Spleen Qi Def.",
    role: 'Diagnosis',
    icon: '👅',
    fullAiPrompt: 'RAG PRIORITY: Tongue Diagnosis. Search RAG for "Scalloped edges" and "Teeth marks". Match with Spleen Qi Deficiency. Suggest dietary changes and tonification points. KEY POINTS: ST36, SP3, SP6, CV12, BL20. HERBS: Si Jun Zi Tang, Bu Zhong Yi Qi Tang.'
  },
  {
    id: 'yy_sanjiao',
    hebrewLabel: 'San Jiao תפקודים',
    ragPriorityContext: 'RAG PRIORITY: Triple Burner. Retrieve functions of the 3 chambers. Focus on fluid metabolism.',
    role: 'Physiology',
    icon: '🔥',
    fullAiPrompt: 'RAG PRIORITY: Triple Burner Physiology. Retrieve functions of the 3 chambers (Upper, Middle, Lower). Focus on fluid metabolism and "Mist, Mud, and Drainage" analogies. UPPER JIAO: Mist - Heart/Lung. MIDDLE JIAO: Foam - Spleen/Stomach. LOWER JIAO: Swamp - Kidney/Bladder.'
  },
  {
    id: 'yy_zong_yuan',
    hebrewLabel: 'Zong Qi vs Yuan Qi',
    ragPriorityContext: 'RAG PRIORITY: Qi Types differentiation. Compare Pectoral Qi vs Source Qi.',
    role: 'Physiology',
    icon: '⚡',
    fullAiPrompt: 'RAG PRIORITY: Qi Types differentiation. Compare Pectoral Qi (Chest) vs Source Qi (Kidneys). Retrieve source locations, functions, and relevant tonification points. ZONG QI: CV17, LU1, ST36. YUAN QI: CV4, GV4, KI3.'
  },
  {
    id: 'yy_ext_wind',
    hebrewLabel: 'סילוק רוח חיצונית',
    ragPriorityContext: 'RAG PRIORITY: Exterior Wind pathology. Wind-Heat vs Wind-Cold differentiation.',
    role: 'Clinical Differential',
    icon: '🌬️',
    fullAiPrompt: 'RAG PRIORITY: Exterior Wind pathology. Search for Wind-Heat vs Wind-Cold differentiation. Retrieve immediate acupuncture relief points. KEY POINTS: LI4, LU7, BL12, GV14 (Wind-Heat), GB20. HERBS: Gui Zhi Tang (Cold), Yin Qiao San (Heat).'
  },
  {
    id: 'yy_heart_sweat',
    hebrewLabel: 'לב והזעה',
    ragPriorityContext: 'RAG PRIORITY: Heart/Fluid relationship. Connection between sweat and Heart blood.',
    role: 'Physiology',
    icon: '💦',
    fullAiPrompt: 'RAG PRIORITY: Heart/Fluid relationship. Explain clinical connection between sweat and Heart blood. Retrieve pathology for night sweats vs spontaneous daytime sweating. NIGHT SWEATS: Yin Deficiency - HT6, KI6. SPONTANEOUS: Qi Deficiency - ST36, LU9.'
  },
  {
    id: 'yy_stomach_cold',
    hebrewLabel: 'קור בקיבה - כאב בטן',
    ragPriorityContext: 'RAG PRIORITY: Stomach Cold. Warming protocols for abdominal pain.',
    role: 'Treatment Strategy',
    icon: '🥶',
    fullAiPrompt: 'RAG PRIORITY: Stomach Cold. Search RAG for warming protocols. Focus on pain quality that is relieved by warmth. KEY POINTS: ST36, CV12, Moxa essential. HERBS: Li Zhong Wan, Xiao Jian Zhong Tang.'
  },
  {
    id: 'yy_treasures',
    hebrewLabel: 'שלושת האוצרות',
    ragPriorityContext: 'RAG PRIORITY: Three Treasures (Jing, Qi, Shen). Definitions and diagnostic weights.',
    role: 'Physiology',
    icon: '💎',
    fullAiPrompt: 'RAG PRIORITY: Three Treasures (Jing, Qi, Shen). Retrieve definitions and diagnostic weights. Explain how depletion of one affects the others in a clinical context. JING: KI3, GV4. QI: ST36, CV6. SHEN: HT7, GV20.'
  },

  // === SECTION 2: FIVE ELEMENTS (15 items) ===
  {
    id: 'fe_wood',
    hebrewLabel: 'יסוד העץ - כבד/מרה',
    ragPriorityContext: 'RAG PRIORITY: Wood Element. Liver/Gallbladder pair. Spring, growth, planning functions.',
    role: 'Five Elements',
    icon: '🌳',
    fullAiPrompt: 'RAG PRIORITY: Wood Element. ORGANS: Liver/Gallbladder. SEASON: Spring. EMOTION: Anger. COLOR: Green. TASTE: Sour. KEY POINTS: LV3, LV14, GB34, GB40. FUNCTIONS: Planning, decision-making, smooth flow of Qi. PATHOLOGY: Stagnation, rising Yang, Wind.'
  },
  {
    id: 'fe_fire',
    hebrewLabel: 'יסוד האש - לב/מעי דק',
    ragPriorityContext: 'RAG PRIORITY: Fire Element. Heart/Small Intestine pair. Summer, joy, Shen residence.',
    role: 'Five Elements',
    icon: '🔥',
    fullAiPrompt: 'RAG PRIORITY: Fire Element. ORGANS: Heart/Small Intestine (+Pericardium/San Jiao). SEASON: Summer. EMOTION: Joy. COLOR: Red. TASTE: Bitter. KEY POINTS: HT7, HT5, SI3, PC6. FUNCTIONS: Shen residence, blood circulation, consciousness. PATHOLOGY: Shen disturbance, heat, insomnia.'
  },
  {
    id: 'fe_earth',
    hebrewLabel: 'יסוד האדמה - טחול/קיבה',
    ragPriorityContext: 'RAG PRIORITY: Earth Element. Spleen/Stomach pair. Late summer, transformation, nourishment.',
    role: 'Five Elements',
    icon: '🏔️',
    fullAiPrompt: 'RAG PRIORITY: Earth Element. ORGANS: Spleen/Stomach. SEASON: Late Summer. EMOTION: Worry/Pensiveness. COLOR: Yellow. TASTE: Sweet. KEY POINTS: ST36, SP6, SP3, CV12. FUNCTIONS: Transformation, transportation, holding blood. PATHOLOGY: Dampness, prolapse, bleeding.'
  },
  {
    id: 'fe_metal',
    hebrewLabel: 'יסוד המתכת - ריאות/מעי גס',
    ragPriorityContext: 'RAG PRIORITY: Metal Element. Lung/Large Intestine pair. Autumn, letting go, Wei Qi.',
    role: 'Five Elements',
    icon: '⚙️',
    fullAiPrompt: 'RAG PRIORITY: Metal Element. ORGANS: Lung/Large Intestine. SEASON: Autumn. EMOTION: Grief/Sadness. COLOR: White. TASTE: Pungent. KEY POINTS: LU7, LU9, LI4, LI11. FUNCTIONS: Wei Qi, respiration, elimination, boundaries. PATHOLOGY: Dryness, weak defense, constipation.'
  },
  {
    id: 'fe_water',
    hebrewLabel: 'יסוד המים - כליות/שלפוחית',
    ragPriorityContext: 'RAG PRIORITY: Water Element. Kidney/Bladder pair. Winter, storage, willpower.',
    role: 'Five Elements',
    icon: '💧',
    fullAiPrompt: 'RAG PRIORITY: Water Element. ORGANS: Kidney/Bladder. SEASON: Winter. EMOTION: Fear. COLOR: Black/Blue. TASTE: Salty. KEY POINTS: KI3, KI6, KI7, BL23, BL52. FUNCTIONS: Jing storage, bones, willpower, reproduction. PATHOLOGY: Deficiency (Yin/Yang), fear, deafness.'
  },
  {
    id: 'fe_sheng_cycle',
    hebrewLabel: 'מעגל השנג - יצירה',
    ragPriorityContext: 'RAG PRIORITY: Sheng Cycle. Mother-Child generating sequence. Tonification strategies.',
    role: 'Five Elements',
    icon: '🔄',
    fullAiPrompt: 'RAG PRIORITY: Sheng (Generating) Cycle. SEQUENCE: Wood→Fire→Earth→Metal→Water→Wood. CLINICAL: Tonify mother to strengthen child. EXAMPLES: KI weak → tonify LU (Metal generates Water). SP weak → tonify HT (Fire generates Earth). POINTS: Use mother point on affected meridian.'
  },
  {
    id: 'fe_ke_cycle',
    hebrewLabel: 'מעגל הקה - שליטה',
    ragPriorityContext: 'RAG PRIORITY: Ke Cycle. Control/restraint sequence. Sedation strategies.',
    role: 'Five Elements',
    icon: '⚖️',
    fullAiPrompt: 'RAG PRIORITY: Ke (Control) Cycle. SEQUENCE: Wood→Earth→Water→Fire→Metal→Wood. CLINICAL: Control excess by strengthening controller. OVERACTING: Wood invades Earth (stress→digestion). INSULTING: Reverse control (Water insults Fire). STRATEGY: Sedate excess, support controlled organ.'
  },
  {
    id: 'fe_wood_fire',
    hebrewLabel: 'עץ מזין אש',
    ragPriorityContext: 'RAG PRIORITY: Wood-Fire relationship. Liver blood nourishes Heart. Clinical applications.',
    role: 'Five Elements',
    icon: '🔥',
    fullAiPrompt: 'RAG PRIORITY: Wood-Fire Sheng. Liver blood nourishes Heart blood. DEFICIENCY: Liver Blood Def → Heart Blood Def (palpitations, insomnia, pale). KEY POINTS: LV8 (nourish LV blood), HT7, SP6, BL17. HERBS: Si Wu Tang + Gui Pi Tang.'
  },
  {
    id: 'fe_fire_earth',
    hebrewLabel: 'אש מזינה אדמה',
    ragPriorityContext: 'RAG PRIORITY: Fire-Earth relationship. Heart Yang warms Spleen. Digestive support.',
    role: 'Five Elements',
    icon: '🏔️',
    fullAiPrompt: 'RAG PRIORITY: Fire-Earth Sheng. Heart Yang/Ming Men Fire warms Middle Jiao for digestion. DEFICIENCY: Poor transformation, cold abdomen, loose stools. KEY POINTS: CV8 (moxa), CV12, ST36, GV4. HERBS: Li Zhong Wan, Fu Zi Li Zhong Wan.'
  },
  {
    id: 'fe_earth_metal',
    hebrewLabel: 'אדמה מזינה מתכת',
    ragPriorityContext: 'RAG PRIORITY: Earth-Metal relationship. Spleen Qi supports Lung Qi. Immune connection.',
    role: 'Five Elements',
    icon: '⚙️',
    fullAiPrompt: 'RAG PRIORITY: Earth-Metal Sheng. Spleen produces post-heaven Qi for Lung. DEFICIENCY: Weak SP → weak LU → frequent colds. KEY POINTS: ST36, SP3, LU9, BL13, BL20. HERBS: Bu Zhong Yi Qi Tang, Yu Ping Feng San.'
  },
  {
    id: 'fe_metal_water',
    hebrewLabel: 'מתכת מזינה מים',
    ragPriorityContext: 'RAG PRIORITY: Metal-Water relationship. Lung descends fluids to Kidney.',
    role: 'Five Elements',
    icon: '💧',
    fullAiPrompt: 'RAG PRIORITY: Metal-Water Sheng. Lung descends Qi and fluids to Kidney. PATHOLOGY: Lung fails to descend → edema, urinary issues. KEY POINTS: LU7+KI6 (Ren Mai), LU5 (descend), KI3. HERBS: Ma Xing Shi Gan Tang (acute), Liu Wei Di Huang Wan (chronic).'
  },
  {
    id: 'fe_water_wood',
    hebrewLabel: 'מים מזינים עץ',
    ragPriorityContext: 'RAG PRIORITY: Water-Wood relationship. Kidney Yin nourishes Liver blood.',
    role: 'Five Elements',
    icon: '🌳',
    fullAiPrompt: 'RAG PRIORITY: Water-Wood Sheng. Kidney Yin nourishes Liver Blood. DEFICIENCY: KI Yin Def → LV Blood Def → Yang Rising. KEY POINTS: KI3, KI6, LV8, SP6. HERBS: Liu Wei Di Huang Wan + Qi Ju Di Huang Wan. SIGNS: Dizziness, tinnitus, blurred vision, irritability.'
  },
  {
    id: 'fe_constitutional',
    hebrewLabel: 'אבחון חוקתי חמישה יסודות',
    ragPriorityContext: 'RAG PRIORITY: Constitutional Five Element diagnosis. Facial features, body type, preferences.',
    role: 'Five Elements',
    icon: '👤',
    fullAiPrompt: 'RAG PRIORITY: Constitutional Diagnosis. WOOD: Tall, tense, green tinge, anger-prone. FIRE: Pointed features, ruddy, excitable. EARTH: Round, yellow tinge, worrier. METAL: Pale, defined features, melancholic. WATER: Dark circles, fearful, rounded back. Use for treatment prioritization.'
  },
  {
    id: 'fe_emotion_organs',
    hebrewLabel: 'רגשות ואיברים',
    ragPriorityContext: 'RAG PRIORITY: Emotion-Organ correspondences. Psychosomatic connections in TCM.',
    role: 'Five Elements',
    icon: '💭',
    fullAiPrompt: 'RAG PRIORITY: Emotion-Organ Map. ANGER→Liver (LV3, GB34). JOY→Heart (HT7, PC6). WORRY→Spleen (SP3, ST36). GRIEF→Lung (LU7, LU3). FEAR→Kidney (KI3, BL52). CLINICAL: Treat organ to calm emotion; treat emotion to heal organ. HERBS by emotion provided.'
  },
  {
    id: 'fe_seasonal_treatment',
    hebrewLabel: 'טיפול עונתי',
    ragPriorityContext: 'RAG PRIORITY: Seasonal treatment according to Five Elements. Prevention and optimization.',
    role: 'Five Elements',
    icon: '📅',
    fullAiPrompt: 'RAG PRIORITY: Seasonal Treatment. SPRING: Soothe LV, avoid wind. SUMMER: Clear HT heat, stay cool. LATE SUMMER: Strengthen SP, avoid damp. AUTUMN: Moisten LU, avoid dryness. WINTER: Tonify KI, conserve energy. POINTS: Seasonal point selection for prevention.'
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

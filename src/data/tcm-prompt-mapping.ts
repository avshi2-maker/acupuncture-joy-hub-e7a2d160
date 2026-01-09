// RAG Priority Context Mapping - Indexed Retrieval System
// Uses O(1) Map lookups instead of linear array scans
// These replace short Hebrew text with rich clinical context for direct AI injection

export type PromptRole = 'Clinical Differential' | 'Treatment Strategy' | 'Point Selection' | 'Pathology Analysis' | 'Physiology' | 'Preventive' | 'Diagnosis';

export interface PromptMapping {
  id: string;
  hebrewLabel: string;
  ragPriorityContext: string;
  role: PromptRole;
  icon: string;
  // Direct context injection - no RAG search needed
  fullAiPrompt: string;
}

export const PROMPT_MAPPINGS: PromptMapping[] = [
  {
    id: 'kidney-yin-yang',
    hebrewLabel: 'סימנים יין/יאנג כליות',
    ragPriorityContext: 'RAG PRIORITY: Kidney Pathology. Compare Yin/Yang deficiency signs (Heat vs Cold). Use embedded point table.',
    role: 'Clinical Differential',
    icon: '🫘',
    fullAiPrompt: 'CONTEXT: Kidney Yin Deficiency shows night sweats, malar flush, 5-palm heat, thin-rapid pulse. Kidney Yang Deficiency shows cold limbs, pale face, deep-weak pulse, clear urine. KEY POINTS: KI3 (tonify both), KI6 (Yin), KI7 (Yang), GV4 (Yang), CV4 (both). HERBS: Liu Wei Di Huang Wan (Yin), Jin Gui Shen Qi Wan (Yang).'
  },
  {
    id: 'liver-stagnation-rising',
    hebrewLabel: 'סטגנציה מול עליית יאנג',
    ragPriorityContext: 'RAG PRIORITY: Liver Dynamics. Differentiate Qi Stagnation vs Yang Rising. Focus on pulse/tongue.',
    role: 'Clinical Differential',
    icon: '🌿',
    fullAiPrompt: 'CONTEXT: Liver Qi Stagnation shows distension, sighing, wiry pulse, mood swings. Liver Yang Rising shows headache, dizziness, tinnitus, irritability, red face. KEY POINTS: LV3 (both), LV2 (Yang Rising), GB20 (Yang Rising), PC6 (Stagnation), GB34 (Stagnation). HERBS: Xiao Yao San (Stagnation), Tian Ma Gou Teng Yin (Yang Rising).'
  },
  {
    id: 'spleen-damp-heat',
    hebrewLabel: 'לחות חמה בטחול',
    ragPriorityContext: 'RAG PRIORITY: Spleen/Damp-Heat. Search herbs for draining dampness. Prioritize clinical strategy.',
    role: 'Treatment Strategy',
    icon: '💧',
    fullAiPrompt: 'CONTEXT: Spleen Damp-Heat shows heavy limbs, loose stools with odor, yellow greasy tongue coating, slippery-rapid pulse. KEY POINTS: SP9 (drain damp), SP6, ST36, CV12, LI11 (clear heat). HERBS: Yin Chen Hao Tang, Long Dan Xie Gan Tang. STRATEGY: Clear heat first, then resolve dampness.'
  },
  {
    id: 'auricular-shen',
    hebrewLabel: 'נקודות Shen באוזן',
    ragPriorityContext: 'RAG PRIORITY: Auricular Medicine. Retrieve specific Shen-calming ear points. Output concise list.',
    role: 'Point Selection',
    icon: '👂',
    fullAiPrompt: 'CONTEXT: Auricular Shen-calming protocol. EAR POINTS: Shenmen (primary), Heart, Sympathetic, Subcortex, Zero Point, Brain Stem, Tranquilizer Point. TECHNIQUE: Retain seeds 3-5 days, bilateral. INDICATIONS: Anxiety, insomnia, stress, emotional disturbance.'
  },
  {
    id: 'liver-spleen-ke',
    hebrewLabel: 'מעגל הבקרה כבד/טחול',
    ragPriorityContext: 'RAG PRIORITY: Ke Cycle. Analyze Wood overacting on Earth. Retrieve internal case studies.',
    role: 'Pathology Analysis',
    icon: '🔄',
    fullAiPrompt: 'CONTEXT: Wood overacting on Earth (Liver invading Spleen). Signs: Stress causes digestive issues, IBS pattern, alternating constipation/diarrhea. KEY POINTS: LV3+ST36 (harmonize), LV13 (Spleen Mu), SP6, CV12. HERBS: Xiao Yao San, Tong Xie Yao Fang. PRINCIPLE: Soothe Liver, strengthen Spleen.'
  },
  {
    id: 'lung-kidney-respiration',
    hebrewLabel: 'ריאות וכליות - נשימה',
    ragPriorityContext: "RAG PRIORITY: Respiratory/Kidney. Search 'Grasping the Qi'. Focus on LU7 and KI6 relationship.",
    role: 'Physiology',
    icon: '🫁',
    fullAiPrompt: 'CONTEXT: Kidney fails to grasp Lung Qi. Signs: Dyspnea on exertion, weak inhalation, asthma worse with activity, cold limbs. MASTER PAIR: LU7+KI6 (Ren Mai opening). KEY POINTS: KI3, KI7, CV4, CV6, BL23, LU9. HERBS: Jin Gui Shen Qi Wan + Bu Fei Tang. MOXA: CV4, GV4, BL23.'
  },
  {
    id: 'wei-qi-strengthen',
    hebrewLabel: 'חיזוק Wei Qi',
    ragPriorityContext: 'RAG PRIORITY: Immune Defense. Retrieve points for strengthening external shield (Wei Qi).',
    role: 'Preventive',
    icon: '🛡️',
    fullAiPrompt: 'CONTEXT: Strengthen Wei Qi (Defensive Qi). Signs of deficiency: Frequent colds, spontaneous sweating, aversion to wind. KEY POINTS: ST36, LI4, LU7, GV14, BL12, BL13. HERBS: Yu Ping Feng San, Huang Qi. LIFESTYLE: Regular sleep, avoid drafts, moderate exercise. MOXA: ST36, GV14 preventively.'
  },
  {
    id: 'pulse-deficiency-stagnation',
    hebrewLabel: 'דופק חוסר מול סטגנציה',
    ragPriorityContext: 'RAG PRIORITY: Pulse Diagnosis. Compare Choppy vs Thready/Weak pulses. Use reference table.',
    role: 'Diagnosis',
    icon: '💓',
    fullAiPrompt: 'CONTEXT: Pulse differential. CHOPPY: Uneven, hesitant - Blood Stasis or Blood/Yin deficiency with stagnation. THREADY: Thin, weak - Blood/Qi/Yin deficiency. WEAK: Soft, forceless - Qi/Yang deficiency. KEY: Choppy=movement blocked, Thready=substance lacking. CLINICAL: Choppy needs movement, Thready needs nourishing.'
  },
  {
    id: 'tongue-spleen-qi',
    hebrewLabel: 'חולשת צ׳י בטחול',
    ragPriorityContext: "RAG PRIORITY: Tongue Diagnosis. Search 'Scalloped edges' and 'Teeth marks'. Match Spleen Qi Def.",
    role: 'Diagnosis',
    icon: '👅',
    fullAiPrompt: 'CONTEXT: Tongue diagnosis for Spleen Qi Deficiency. SIGNS: Swollen tongue with scalloped edges (teeth marks), pale color, thin white coating. RELATED: Fatigue, loose stools, poor appetite, weak limbs. KEY POINTS: ST36, SP3, SP6, CV12, BL20. HERBS: Si Jun Zi Tang, Bu Zhong Yi Qi Tang.'
  },
  {
    id: 'san-jiao-functions',
    hebrewLabel: 'San Jiao תפקודים',
    ragPriorityContext: 'RAG PRIORITY: Triple Burner. Retrieve functions of the 3 chambers. Focus on fluid metabolism.',
    role: 'Physiology',
    icon: '🔥',
    fullAiPrompt: 'CONTEXT: San Jiao (Triple Burner) functions. UPPER JIAO: Mist - Heart/Lung, distributes fluids. MIDDLE JIAO: Foam - Spleen/Stomach, transformation. LOWER JIAO: Swamp - Kidney/Bladder, excretion. KEY POINTS: SJ5 (exterior), SJ6 (constipation), SJ4 (source), CV5 (front Mu). PATHOLOGY: Edema, urinary issues, water metabolism disorders.'
  },
  // Additional clinical contexts
  {
    id: 'blood-stasis',
    hebrewLabel: 'סטגנציית דם',
    ragPriorityContext: 'RAG PRIORITY: Blood Stasis Patterns. Identify fixed pain, dark complexion, purple tongue signs. Focus on SP10, LV3, BL17.',
    role: 'Clinical Differential',
    icon: '🩸',
    fullAiPrompt: 'CONTEXT: Blood Stasis pattern. SIGNS: Fixed stabbing pain, dark/purple complexion, purple tongue with spots, choppy pulse. KEY POINTS: SP10 (Sea of Blood), LV3, BL17 (Blood Hui), SP6, LI4+SP6 (move blood). HERBS: Xue Fu Zhu Yu Tang, Tao Hong Si Wu Tang. CAUTION: Check for bleeding disorders.'
  },
  {
    id: 'phlegm-patterns',
    hebrewLabel: 'דפוסי ליחה',
    ragPriorityContext: 'RAG PRIORITY: Phlegm Pathology. Differentiate substantial vs insubstantial phlegm. ST40, CV12, SP9 protocols.',
    role: 'Treatment Strategy',
    icon: '☁️',
    fullAiPrompt: 'CONTEXT: Phlegm differentiation. SUBSTANTIAL: Visible - cough, nodules, obesity. INSUBSTANTIAL: Mental fog, dizziness, numbness. KEY POINTS: ST40 (primary), CV12, SP9, PC5 (phlegm-fire), GV20 (clear head). HERBS: Er Chen Tang (base), Wen Dan Tang (phlegm-heat). PRINCIPLE: Transform phlegm, strengthen Spleen.'
  },
  {
    id: 'heart-kidney-axis',
    hebrewLabel: 'ציר לב-כליות',
    ragPriorityContext: 'RAG PRIORITY: Heart-Kidney Communication. Water-Fire balance, insomnia patterns. HT7, KI6, SP6 combinations.',
    role: 'Physiology',
    icon: '❤️',
    fullAiPrompt: 'CONTEXT: Heart-Kidney disharmony. SIGNS: Insomnia, palpitations, anxiety, night sweats, dream-disturbed sleep, hot flashes. KEY POINTS: HT7+KI6 (primary), KI3, HT6, PC6, SP6. HERBS: Tian Wang Bu Xin Dan, Huang Lian E Jiao Tang. PRINCIPLE: Nourish Kidney Yin, calm Heart Fire, restore Water-Fire communication.'
  },
  {
    id: 'wind-patterns',
    hebrewLabel: 'דפוסי רוח',
    ragPriorityContext: 'RAG PRIORITY: Wind Pathology. Internal vs External wind differentiation. GB20, LV3, GV16 for wind elimination.',
    role: 'Pathology Analysis',
    icon: '🌬️',
    fullAiPrompt: 'CONTEXT: Wind differentiation. EXTERNAL: Sudden onset, wandering symptoms, aversion to wind, floating pulse. INTERNAL: Tremors, spasms, tics, stroke, vertigo. KEY POINTS: GB20 (both), LV3 (internal), GV16, LI4 (external), GB34 (spasm). HERBS: Tian Ma Gou Teng Yin (internal), Gui Zhi Tang (external).'
  },
  {
    id: 'jing-essence',
    hebrewLabel: 'ג׳ינג - מהות',
    ragPriorityContext: 'RAG PRIORITY: Essence/Jing Deficiency. Developmental issues, premature aging. KI3, GV4, CV4 tonification.',
    role: 'Physiology',
    icon: '✨',
    fullAiPrompt: 'CONTEXT: Jing (Essence) deficiency. SIGNS: Developmental delays, premature aging, weak bones/teeth, poor memory, infertility, early greying. KEY POINTS: KI3, GV4 (Ming Men), CV4 (Gate of Origin), BL23, GB39 (Marrow Hui). HERBS: Liu Wei Di Huang Wan, Gui Lu Er Xian Jiao. MOXA: GV4, CV4, BL23.'
  },
  {
    id: 'zang-fu-relationships',
    hebrewLabel: 'יחסי זאנג-פו',
    ragPriorityContext: 'RAG PRIORITY: Organ Relationships. Mother-Child, Ke cycle interactions. Holistic pattern analysis.',
    role: 'Pathology Analysis',
    icon: '🏛️',
    fullAiPrompt: 'CONTEXT: Zang-Fu relationships. SHENG (Mother-Child): Water→Wood→Fire→Earth→Metal→Water. KE (Control): Wood→Earth→Water→Fire→Metal→Wood. CLINICAL: Tonify mother for deficiency, sedate child for excess. KEY PAIRS: LV-SP (Wood/Earth), HT-KI (Fire/Water), LU-KI (Metal/Water), SP-LU (Earth/Metal).'
  },
  {
    id: 'qi-flow-disorders',
    hebrewLabel: 'הפרעות זרימת צ׳י',
    ragPriorityContext: 'RAG PRIORITY: Qi Flow Patterns. Rebellious Qi, Sinking Qi, Qi Stagnation differentiation and treatment.',
    role: 'Clinical Differential',
    icon: '🌊',
    fullAiPrompt: 'CONTEXT: Qi flow disorders. REBELLIOUS: Qi goes wrong direction - nausea, hiccup, cough, headache. SINKING: Qi fails to hold - prolapse, fatigue, bearing down. STAGNATION: Qi stuck - distension, pain, emotional. KEY POINTS: CV6 (all), ST36 (sinking), LV3 (stagnation), PC6 (rebellious). HERBS: Bu Zhong Yi Qi Tang (sinking), Xiao Yao San (stagnation).'
  },
  {
    id: 'yin-deficiency-heat',
    hebrewLabel: 'חום מחוסר יין',
    ragPriorityContext: 'RAG PRIORITY: Empty Heat. Night sweats, five-palm heat, malar flush. Nourish Yin, clear deficiency heat protocols.',
    role: 'Treatment Strategy',
    icon: '🌙',
    fullAiPrompt: 'CONTEXT: Yin Deficiency with Empty Heat. SIGNS: Night sweats, 5-palm heat, malar flush, dry mouth at night, thin-rapid pulse, red tongue no coat. KEY POINTS: KI6, KI3, SP6, HT6, LU10 (Ying point). HERBS: Liu Wei Di Huang Wan, Zhi Bai Di Huang Wan, Da Bu Yin Wan. PRINCIPLE: Nourish Yin, clear deficiency heat - NO cold herbs.'
  },
  {
    id: 'yang-deficiency-cold',
    hebrewLabel: 'קור מחוסר יאנג',
    ragPriorityContext: 'RAG PRIORITY: Yang Deficiency Cold. Cold limbs, loose stools, pale complexion. Moxa protocols, warming herbs.',
    role: 'Treatment Strategy',
    icon: '❄️',
    fullAiPrompt: 'CONTEXT: Yang Deficiency Cold pattern. SIGNS: Cold limbs, pale face, loose stools, clear urine, deep-weak pulse, pale wet tongue. KEY POINTS: GV4, CV4, ST36, KI7, BL23. MOXA: Essential - GV4, CV4, CV8 (salt moxa), ST36. HERBS: Jin Gui Shen Qi Wan, Fu Zi Li Zhong Wan. LIFESTYLE: Avoid cold foods, keep warm.'
  },
  {
    id: 'shen-disturbance',
    hebrewLabel: 'הפרעות שן',
    ragPriorityContext: 'RAG PRIORITY: Shen Disorders. Anxiety, insomnia, palpitations. HT7, PC6, GV20 for calming Shen.',
    role: 'Point Selection',
    icon: '🧠',
    fullAiPrompt: 'CONTEXT: Shen disturbance patterns. SIGNS: Anxiety, insomnia, palpitations, poor concentration, restlessness, dream-disturbed sleep. KEY POINTS: HT7 (anchor Shen), PC6 (calm mind), GV20 (lift spirit), Yintang (frontal calm), Anmian (sleep). HERBS: Suan Zao Ren Tang, Gui Pi Tang, An Shen Ding Zhi Wan. AURICULAR: Shenmen, Heart, Subcortex.'
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

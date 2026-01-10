/**
 * Point Technical Data - Needle Depth, Angle, and Clinical Actions
 * Phase 4: Visual HUD - Precision Layer
 */

export interface PointTechnicalInfo {
  code: string;
  hebrewName: string;
  pinyinName: string;
  chineseName: string;
  meridian: string;
  meridianCode: string;
  depth: {
    min: number;
    max: number;
    unit: 'cun';
  };
  angle: 'perpendicular' | 'oblique' | 'horizontal';
  angleHebrew: string;
  angleDegrees?: string;
  clinicalAction: string;
  clinicalActionHebrew: string;
  deQiSensation: string;
  contraindications?: string[];
  specialNotes?: string;
}

export const pointTechnicalData: Record<string, PointTechnicalInfo> = {
  // Stomach Meridian
  'ST36': {
    code: 'ST36',
    hebrewName: 'צו-סאן-לי',
    pinyinName: 'Zusanli',
    chineseName: '足三里',
    meridian: 'Stomach',
    meridianCode: 'ST',
    depth: { min: 1.0, max: 2.0, unit: 'cun' },
    angle: 'perpendicular',
    angleHebrew: 'ניצבת',
    clinicalAction: 'Tonifies Qi and Blood, strengthens the body, harmonizes the Stomach',
    clinicalActionHebrew: 'מחזקת צ\'י ודם, מחזקת את הגוף, מאזנת את הקיבה',
    deQiSensation: 'Distension and numbness radiating to foot',
  },
  'ST40': {
    code: 'ST40',
    hebrewName: 'פנג-לונג',
    pinyinName: 'Fenglong',
    chineseName: '丰隆',
    meridian: 'Stomach',
    meridianCode: 'ST',
    depth: { min: 0.5, max: 1.0, unit: 'cun' },
    angle: 'perpendicular',
    angleHebrew: 'ניצבת',
    clinicalAction: 'Transforms phlegm and dampness, calms the mind',
    clinicalActionHebrew: 'נקודה מרכזית להתמרת ליחה וניקוז לחות',
    deQiSensation: 'Local distension, numbness to ankle',
  },
  'ST25': {
    code: 'ST25',
    hebrewName: 'טיאן-שו',
    pinyinName: 'Tianshu',
    chineseName: '天枢',
    meridian: 'Stomach',
    meridianCode: 'ST',
    depth: { min: 0.7, max: 1.2, unit: 'cun' },
    angle: 'perpendicular',
    angleHebrew: 'ניצבת',
    clinicalAction: 'Regulates intestines, resolves dampness, moves Qi stagnation',
    clinicalActionHebrew: 'מסדירה את המעיים, מפזרת לחות, מניעה סטגנציית צ\'י',
    deQiSensation: 'Deep distension around umbilicus',
  },

  // Large Intestine Meridian
  'LI4': {
    code: 'LI4',
    hebrewName: 'חה-גו',
    pinyinName: 'Hegu',
    chineseName: '合谷',
    meridian: 'Large Intestine',
    meridianCode: 'LI',
    depth: { min: 0.5, max: 1.0, unit: 'cun' },
    angle: 'perpendicular',
    angleHebrew: 'ניצבת',
    clinicalAction: 'Releases exterior, expels wind, clears heat, stops pain',
    clinicalActionHebrew: 'משחררת שטח, מגרשת רוח, מנקה חום, מפסיקה כאב',
    deQiSensation: 'Numbness radiating to fingers',
    contraindications: ['Pregnancy'],
  },
  'LI11': {
    code: 'LI11',
    hebrewName: 'צ\'ו-צ\'י',
    pinyinName: 'Quchi',
    chineseName: '曲池',
    meridian: 'Large Intestine',
    meridianCode: 'LI',
    depth: { min: 1.0, max: 1.5, unit: 'cun' },
    angle: 'perpendicular',
    angleHebrew: 'ניצבת',
    clinicalAction: 'Clears heat, cools blood, resolves dampness',
    clinicalActionHebrew: 'מנקה חום, מקררת דם, מפזרת לחות',
    deQiSensation: 'Electric sensation to fingers',
  },

  // Spleen Meridian
  'SP6': {
    code: 'SP6',
    hebrewName: 'סאן-יין-ג\'יאו',
    pinyinName: 'Sanyinjiao',
    chineseName: '三阴交',
    meridian: 'Spleen',
    meridianCode: 'SP',
    depth: { min: 1.0, max: 1.5, unit: 'cun' },
    angle: 'perpendicular',
    angleHebrew: 'ניצבת',
    clinicalAction: 'Nourishes Yin, tonifies Spleen, regulates menstruation',
    clinicalActionHebrew: 'מזינה יין, מחזקת טחול, מסדירה מחזור',
    deQiSensation: 'Distension radiating up leg',
    contraindications: ['Pregnancy'],
  },
  'SP9': {
    code: 'SP9',
    hebrewName: 'יין-לינג-צ\'ואן',
    pinyinName: 'Yinlingquan',
    chineseName: '阴陵泉',
    meridian: 'Spleen',
    meridianCode: 'SP',
    depth: { min: 1.0, max: 2.0, unit: 'cun' },
    angle: 'perpendicular',
    angleHebrew: 'ניצבת',
    clinicalAction: 'Resolves dampness, benefits urination, regulates Spleen',
    clinicalActionHebrew: 'מפזרת לחות, מקדמת השתנה, מאזנת טחול',
    deQiSensation: 'Local distension and soreness',
  },
  'SP10': {
    code: 'SP10',
    hebrewName: 'שואה-האי',
    pinyinName: 'Xuehai',
    chineseName: '血海',
    meridian: 'Spleen',
    meridianCode: 'SP',
    depth: { min: 1.0, max: 1.5, unit: 'cun' },
    angle: 'perpendicular',
    angleHebrew: 'ניצבת',
    clinicalAction: 'Invigorates blood, cools blood, benefits menstruation',
    clinicalActionHebrew: 'מחייה דם, מקררת דם, מועילה למחזור',
    deQiSensation: 'Aching sensation in thigh',
  },

  // Liver Meridian
  'LV3': {
    code: 'LV3',
    hebrewName: 'טאי-צ\'ונג',
    pinyinName: 'Taichong',
    chineseName: '太冲',
    meridian: 'Liver',
    meridianCode: 'LV',
    depth: { min: 0.5, max: 0.8, unit: 'cun' },
    angle: 'perpendicular',
    angleHebrew: 'ניצבת',
    clinicalAction: 'Spreads Liver Qi, subdues Yang, nourishes Blood',
    clinicalActionHebrew: 'מפזרת צ\'י כבד, מרגיעה יאנג, מזינה דם',
    deQiSensation: 'Distension radiating to toes',
  },

  // Kidney Meridian
  'KI6': {
    code: 'KI6',
    hebrewName: 'ז\'או-האי',
    pinyinName: 'Zhaohai',
    chineseName: '照海',
    meridian: 'Kidney',
    meridianCode: 'KI',
    depth: { min: 0.3, max: 0.5, unit: 'cun' },
    angle: 'perpendicular',
    angleHebrew: 'ניצבת',
    clinicalAction: 'Nourishes Kidney Yin, clears deficiency heat, calms spirit',
    clinicalActionHebrew: 'מזינה יין כליה, מנקה חום מחסור, מרגיעה רוח',
    deQiSensation: 'Local distension and numbness',
  },
  'KI3': {
    code: 'KI3',
    hebrewName: 'טאי-שי',
    pinyinName: 'Taixi',
    chineseName: '太溪',
    meridian: 'Kidney',
    meridianCode: 'KI',
    depth: { min: 0.3, max: 0.5, unit: 'cun' },
    angle: 'perpendicular',
    angleHebrew: 'ניצבת',
    clinicalAction: 'Tonifies Kidney, nourishes Yin, anchors Qi',
    clinicalActionHebrew: 'מחזקת כליה, מזינה יין, מעגנת צ\'י',
    deQiSensation: 'Local soreness and distension',
  },

  // Pericardium Meridian
  'PC6': {
    code: 'PC6',
    hebrewName: 'נאי-גואן',
    pinyinName: 'Neiguan',
    chineseName: '内关',
    meridian: 'Pericardium',
    meridianCode: 'PC',
    depth: { min: 0.5, max: 1.0, unit: 'cun' },
    angle: 'perpendicular',
    angleHebrew: 'ניצבת',
    clinicalAction: 'Opens chest, regulates Qi, calms the heart and spirit',
    clinicalActionHebrew: 'פותחת חזה, מסדירה צ\'י, מרגיעה לב ורוח',
    deQiSensation: 'Numbness to middle finger',
  },

  // Gallbladder Meridian
  'GB20': {
    code: 'GB20',
    hebrewName: 'פנג-צ\'י',
    pinyinName: 'Fengchi',
    chineseName: '风池',
    meridian: 'Gallbladder',
    meridianCode: 'GB',
    depth: { min: 0.8, max: 1.2, unit: 'cun' },
    angle: 'oblique',
    angleHebrew: 'אלכסונית',
    angleDegrees: '45° toward opposite eye',
    clinicalAction: 'Expels wind, benefits eyes and ears, clears head',
    clinicalActionHebrew: 'מגרשת רוח, מועילה לעיניים ואוזניים, מנקה ראש',
    deQiSensation: 'Distension radiating to forehead or eyes',
  },
  'GB34': {
    code: 'GB34',
    hebrewName: 'יאנג-לינג-צ\'ואן',
    pinyinName: 'Yanglingquan',
    chineseName: '阳陵泉',
    meridian: 'Gallbladder',
    meridianCode: 'GB',
    depth: { min: 1.0, max: 1.5, unit: 'cun' },
    angle: 'perpendicular',
    angleHebrew: 'ניצבת',
    clinicalAction: 'Benefits sinews, spreads Liver Qi, clears damp-heat',
    clinicalActionHebrew: 'מועילה לגידים, מפזרת צ\'י כבד, מנקה לחות-חום',
    deQiSensation: 'Electric sensation to ankle',
  },

  // Governing Vessel
  'GV14': {
    code: 'GV14',
    hebrewName: 'דא-ז\'ואי',
    pinyinName: 'Dazhui',
    chineseName: '大椎',
    meridian: 'Governing Vessel',
    meridianCode: 'GV',
    depth: { min: 0.5, max: 1.0, unit: 'cun' },
    angle: 'oblique',
    angleHebrew: 'אלכסונית',
    angleDegrees: '45° upward',
    clinicalAction: 'Clears heat, releases exterior, tonifies Yang',
    clinicalActionHebrew: 'מנקה חום, משחררת שטח, מחזקת יאנג',
    deQiSensation: 'Local distension, warmth spreading',
  },
  'GV20': {
    code: 'GV20',
    hebrewName: 'באי-הואי',
    pinyinName: 'Baihui',
    chineseName: '百会',
    meridian: 'Governing Vessel',
    meridianCode: 'GV',
    depth: { min: 0.3, max: 0.5, unit: 'cun' },
    angle: 'horizontal',
    angleHebrew: 'אופקית',
    angleDegrees: 'Subcutaneous toward back',
    clinicalAction: 'Raises Yang, lifts the spirit, benefits brain',
    clinicalActionHebrew: 'מעלה יאנג, מרימה רוח, מועילה למוח',
    deQiSensation: 'Slight distension at scalp',
  },

  // Conception Vessel
  'CV4': {
    code: 'CV4',
    hebrewName: 'גואן-יואן',
    pinyinName: 'Guanyuan',
    chineseName: '关元',
    meridian: 'Conception Vessel',
    meridianCode: 'CV',
    depth: { min: 1.0, max: 1.5, unit: 'cun' },
    angle: 'perpendicular',
    angleHebrew: 'ניצבת',
    clinicalAction: 'Tonifies Yuan Qi, nourishes Yin, warms Yang',
    clinicalActionHebrew: 'מחזקת יואן צ\'י, מזינה יין, מחממת יאנג',
    deQiSensation: 'Deep warmth and distension',
  },
  'CV6': {
    code: 'CV6',
    hebrewName: 'צ\'י-האי',
    pinyinName: 'Qihai',
    chineseName: '气海',
    meridian: 'Conception Vessel',
    meridianCode: 'CV',
    depth: { min: 1.0, max: 1.5, unit: 'cun' },
    angle: 'perpendicular',
    angleHebrew: 'ניצבת',
    clinicalAction: 'Tonifies Qi, moves blood, regulates menstruation',
    clinicalActionHebrew: 'מחזקת צ\'י, מניעה דם, מסדירה מחזור',
    deQiSensation: 'Deep warmth spreading in abdomen',
  },
  'CV12': {
    code: 'CV12',
    hebrewName: 'ז\'ונג-וואן',
    pinyinName: 'Zhongwan',
    chineseName: '中脘',
    meridian: 'Conception Vessel',
    meridianCode: 'CV',
    depth: { min: 1.0, max: 1.5, unit: 'cun' },
    angle: 'perpendicular',
    angleHebrew: 'ניצבת',
    clinicalAction: 'Harmonizes Stomach, transforms dampness, tonifies Spleen',
    clinicalActionHebrew: 'מאזנת קיבה, מתמירה לחות, מחזקת טחול',
    deQiSensation: 'Local distension and warmth',
  },

  // Lung Meridian
  'LU7': {
    code: 'LU7',
    hebrewName: 'ליה-צ\'וה',
    pinyinName: 'Lieque',
    chineseName: '列缺',
    meridian: 'Lung',
    meridianCode: 'LU',
    depth: { min: 0.3, max: 0.5, unit: 'cun' },
    angle: 'oblique',
    angleHebrew: 'אלכסונית',
    angleDegrees: '45° toward elbow',
    clinicalAction: 'Releases exterior, opens Conception Vessel, benefits head',
    clinicalActionHebrew: 'משחררת שטח, פותחת כלי קיבול, מועילה לראש',
    deQiSensation: 'Distension radiating to thumb',
  },

  // Bladder Meridian
  'BL12': {
    code: 'BL12',
    hebrewName: 'פנג-מן',
    pinyinName: 'Fengmen',
    chineseName: '风门',
    meridian: 'Bladder',
    meridianCode: 'BL',
    depth: { min: 0.5, max: 0.8, unit: 'cun' },
    angle: 'oblique',
    angleHebrew: 'אלכסונית',
    angleDegrees: '45° toward spine',
    clinicalAction: 'Releases exterior, expels wind, benefits Lung',
    clinicalActionHebrew: 'משחררת שטח, מגרשת רוח, מועילה לריאות',
    deQiSensation: 'Local distension and warmth',
  },
  'BL17': {
    code: 'BL17',
    hebrewName: 'גה-שו',
    pinyinName: 'Geshu',
    chineseName: '膈俞',
    meridian: 'Bladder',
    meridianCode: 'BL',
    depth: { min: 0.5, max: 0.8, unit: 'cun' },
    angle: 'oblique',
    angleHebrew: 'אלכסונית',
    angleDegrees: '45° toward spine',
    clinicalAction: 'Invigorates blood, nourishes blood, stops bleeding',
    clinicalActionHebrew: 'מחייה דם, מזינה דם, עוצרת דימום',
    deQiSensation: 'Deep aching sensation',
  },

  // Heart Meridian
  'HT7': {
    code: 'HT7',
    hebrewName: 'שן-מן',
    pinyinName: 'Shenmen',
    chineseName: '神门',
    meridian: 'Heart',
    meridianCode: 'HT',
    depth: { min: 0.3, max: 0.5, unit: 'cun' },
    angle: 'perpendicular',
    angleHebrew: 'ניצבת',
    clinicalAction: 'Calms spirit, nourishes Heart, clears heat',
    clinicalActionHebrew: 'מרגיעה רוח, מזינה לב, מנקה חום',
    deQiSensation: 'Numbness to little finger',
  },
};

/**
 * Get technical info for a point code
 */
export function getPointTechnicalInfo(code: string): PointTechnicalInfo | null {
  const normalized = code.replace(/[-\s]/g, '').toUpperCase();
  return pointTechnicalData[normalized] || null;
}

/**
 * Get meridian color for visualization
 */
export const meridianColors: Record<string, string> = {
  'LU': '#1E90FF', // Lung - Blue
  'LI': '#FFD700', // Large Intestine - Gold
  'ST': '#FFA500', // Stomach - Orange
  'SP': '#FFFF00', // Spleen - Yellow
  'HT': '#FF0000', // Heart - Red
  'SI': '#FF6347', // Small Intestine - Tomato
  'BL': '#4169E1', // Bladder - Royal Blue
  'KI': '#000080', // Kidney - Navy
  'PC': '#FF69B4', // Pericardium - Hot Pink
  'TE': '#FF4500', // Triple Energizer - Orange Red
  'SJ': '#FF4500', // San Jiao (same as TE)
  'GB': '#32CD32', // Gallbladder - Lime Green
  'LV': '#228B22', // Liver - Forest Green
  'GV': '#9400D3', // Governing Vessel - Violet
  'CV': '#BA55D3', // Conception Vessel - Medium Orchid
  'RN': '#BA55D3', // Ren Mai (same as CV)
};

/**
 * Get meridian display name
 */
export const meridianNames: Record<string, { english: string; hebrew: string; chinese: string }> = {
  'LU': { english: 'Lung', hebrew: 'ריאות', chinese: '肺经' },
  'LI': { english: 'Large Intestine', hebrew: 'מעי גס', chinese: '大肠经' },
  'ST': { english: 'Stomach', hebrew: 'קיבה', chinese: '胃经' },
  'SP': { english: 'Spleen', hebrew: 'טחול', chinese: '脾经' },
  'HT': { english: 'Heart', hebrew: 'לב', chinese: '心经' },
  'SI': { english: 'Small Intestine', hebrew: 'מעי דק', chinese: '小肠经' },
  'BL': { english: 'Bladder', hebrew: 'שלפוחית', chinese: '膀胱经' },
  'KI': { english: 'Kidney', hebrew: 'כליה', chinese: '肾经' },
  'PC': { english: 'Pericardium', hebrew: 'קרום הלב', chinese: '心包经' },
  'TE': { english: 'Triple Energizer', hebrew: 'משולש חמם', chinese: '三焦经' },
  'SJ': { english: 'San Jiao', hebrew: 'סאן ג\'יאו', chinese: '三焦经' },
  'GB': { english: 'Gallbladder', hebrew: 'כיס מרה', chinese: '胆经' },
  'LV': { english: 'Liver', hebrew: 'כבד', chinese: '肝经' },
  'GV': { english: 'Governing Vessel', hebrew: 'כלי מנחה', chinese: '督脉' },
  'CV': { english: 'Conception Vessel', hebrew: 'כלי קיבול', chinese: '任脉' },
  'RN': { english: 'Ren Mai', hebrew: 'רן מאי', chinese: '任脉' },
};

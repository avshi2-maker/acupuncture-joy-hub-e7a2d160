/**
 * Clinical Map Data - Hardcoded from CSV until GitHub sync catches up
 * Maps asset files to acupuncture points with Hebrew names and clinical functions
 */

export interface ClinicalPoint {
  assetFileName: string;
  pointCode: string;
  hebrewName: string;
  clinicalFunction: string;
  xPercentage: number;
  yPercentage: number;
}

export type ViewType = 'body' | 'tongue' | 'ear';

export const CLINICAL_POINTS: ClinicalPoint[] = [
  {
    assetFileName: 'chest.png',
    pointCode: 'Entry',
    hebrewName: 'מרכז החזה',
    clinicalFunction: "חיזוק הצ'י המגן ותמיכה בנשימה עמוקה",
    xPercentage: 50,
    yPercentage: 40,
  },
  {
    assetFileName: 'abdomen_female.png',
    pointCode: 'CV-12',
    hebrewName: 'Zhongwan',
    clinicalFunction: 'נקודת התראה של הקיבה וויסות עיכול',
    xPercentage: 50,
    yPercentage: 30,
  },
  {
    assetFileName: 'hand_dorsum.png',
    pointCode: 'LI-4',
    hebrewName: 'Hegu (אדיר)',
    clinicalFunction: 'שחרור רוח ושיכוך כאב',
    xPercentage: 38,
    yPercentage: 42,
  },
  {
    assetFileName: 'lower_leg.png',
    pointCode: 'ST-36',
    hebrewName: 'Zusanli (שלושת המיילים)',
    clinicalFunction: "חיזוק צ'י ודם וויסות קיבה",
    xPercentage: 42,
    yPercentage: 35,
  },
  {
    assetFileName: 'foot_top.png',
    pointCode: 'LV-3',
    hebrewName: 'Taichong (צומת גדולה)',
    clinicalFunction: "הנעת צ'י הכבד והרגעת נפש",
    xPercentage: 45,
    yPercentage: 65,
  },
  {
    assetFileName: 'tongue.png',
    pointCode: 'Center',
    hebrewName: 'מרכז הלשון',
    clinicalFunction: 'מצב הטחול והקיבה (מערכת העיכול)',
    xPercentage: 50,
    yPercentage: 50,
  },
  {
    assetFileName: 'ear.png',
    pointCode: 'Shen-Men',
    hebrewName: 'שן מן (Ear)',
    clinicalFunction: 'הרגעת הנפש והורדת סטרס',
    xPercentage: 45,
    yPercentage: 35,
  },
];

/**
 * Get points for a specific view type
 */
export function getPointsForView(view: ViewType): ClinicalPoint[] {
  switch (view) {
    case 'tongue':
      return CLINICAL_POINTS.filter(p => p.assetFileName === 'tongue.png');
    case 'ear':
      return CLINICAL_POINTS.filter(p => p.assetFileName === 'ear.png');
    case 'body':
    default:
      return CLINICAL_POINTS.filter(p => 
        !['tongue.png', 'ear.png'].includes(p.assetFileName)
      );
  }
}

/**
 * Get the default asset for a view type
 */
export function getDefaultAssetForView(view: ViewType): string {
  switch (view) {
    case 'tongue':
      return 'tongue.png';
    case 'ear':
      return 'ear.png'; // User requested: show ear.png for proof-of-life
    case 'body':
    default:
      return 'chest.png'; // Default to chest as requested
  }
}

/**
 * Get all points for a specific asset file
 */
export function getPointsForAsset(assetFileName: string): ClinicalPoint[] {
  return CLINICAL_POINTS.filter(p => p.assetFileName === assetFileName);
}

/**
 * Parse point code to standard format
 */
export function normalizePointCode(code: string): string {
  return code.toUpperCase().replace(/[_\s]/g, '-');
}

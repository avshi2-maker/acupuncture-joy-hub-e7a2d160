/**
 * Mapping of acupuncture point codes to body figure images
 * Based on anatomical-views-master.csv Key_Meridians data
 * Used for RAG/AI to automatically display the correct body figure
 */

export interface FigureMapping {
  filename: string;
  bodyPart: string;
  view: string;
  keyMeridians: string[];
  pointCodes: string[];
  clinicalPriority: 'High' | 'Medium' | 'Low';
  gender?: 'male' | 'female' | 'neutral'; // Gender-specific figure
  ageGroup?: 'pediatric' | 'adult' | 'elderly'; // Age-specific figure
}

// Master mapping from CSV with expanded point codes
export const FIGURE_MAPPINGS: FigureMapping[] = [
  {
    filename: 'abdomen.png',
    bodyPart: 'Abdomen',
    view: 'Anterior',
    keyMeridians: ['CV', 'ST', 'KI', 'SP'],
    pointCodes: ['CV2', 'CV3', 'CV4', 'CV5', 'CV6', 'CV7', 'CV8', 'CV9', 'CV10', 'CV11', 'CV12', 'CV13', 'CV14',
                 'ST19', 'ST20', 'ST21', 'ST22', 'ST23', 'ST24', 'ST25', 'ST26', 'ST27', 'ST28', 'ST29', 'ST30',
                 'KI11', 'KI12', 'KI13', 'KI14', 'KI15', 'KI16', 'KI17', 'KI18', 'KI19', 'KI20', 'KI21',
                 'SP13', 'SP14', 'SP15', 'SP16'],
    clinicalPriority: 'High',
    gender: 'male'
  },
  {
    filename: 'shoulder_side.png',
    bodyPart: 'Shoulder',
    view: 'Lateral',
    keyMeridians: ['LI', 'SI', 'TE', 'GB'],
    pointCodes: ['LI15', 'LI16', 'SI9', 'SI10', 'TE13', 'TE14', 'GB21'],
    clinicalPriority: 'High'
  },
  {
    filename: 'neck_posterior.png',
    bodyPart: 'Neck',
    view: 'Posterior',
    keyMeridians: ['BL', 'SI', 'GB', 'GV'],
    pointCodes: ['BL10', 'SI14', 'SI15', 'GB20', 'GB21', 'GV14', 'GV15', 'GV16'],
    clinicalPriority: 'High'
  },
  {
    filename: 'hand.png',
    bodyPart: 'Hand',
    view: 'Palmar',
    keyMeridians: ['PC', 'HT', 'LU'],
    pointCodes: ['PC7', 'PC8', 'HT7', 'HT8', 'HT9', 'LU10', 'LU11'],
    clinicalPriority: 'High'
  },
  {
    filename: 'hand_dorsum.png',
    bodyPart: 'Hand',
    view: 'Dorsal',
    keyMeridians: ['LI', 'SI', 'TE'],
    pointCodes: ['LI1', 'LI2', 'LI3', 'LI4', 'LI5', 'SI1', 'SI2', 'SI3', 'SI4', 'SI5', 'TE1', 'TE2', 'TE3', 'TE4'],
    clinicalPriority: 'High'
  },
  {
    filename: 'scalp_top.png',
    bodyPart: 'Scalp',
    view: 'Superior',
    keyMeridians: ['GV', 'BL'],
    pointCodes: ['GV20', 'GV21', 'GV22', 'BL6', 'BL7'],
    clinicalPriority: 'High'
  },
  {
    filename: 'face_front.png',
    bodyPart: 'Face',
    view: 'Anterior',
    keyMeridians: ['ST', 'LI', 'GB', 'BL', 'GV'],
    pointCodes: ['ST1', 'ST2', 'ST3', 'ST4', 'ST5', 'ST6', 'ST7', 'ST8', 'LI19', 'LI20', 
                 'GB1', 'GB2', 'GB3', 'BL1', 'BL2', 'GV24', 'GV25', 'GV26', 'GV27', 'GV28'],
    clinicalPriority: 'Medium'
  },
  {
    filename: 'knee_front.png',
    bodyPart: 'Knee',
    view: 'Anterior',
    keyMeridians: ['ST', 'SP', 'LR', 'GB'],
    pointCodes: ['ST34', 'ST35', 'ST36', 'SP10', 'LR8'],
    clinicalPriority: 'Medium'
  },
  {
    filename: 'ankle.png',
    bodyPart: 'Ankle',
    view: 'Anterior',
    keyMeridians: ['ST', 'SP', 'LR', 'GB', 'KI'],
    pointCodes: ['ST41', 'SP5', 'LR4', 'GB40', 'KI3', 'KI4', 'KI5', 'KI6'],
    clinicalPriority: 'Medium'
  },
  {
    filename: 'sacrum_back.png',
    bodyPart: 'Sacrum',
    view: 'Posterior',
    keyMeridians: ['BL', 'GV'],
    pointCodes: ['BL27', 'BL28', 'BL29', 'BL30', 'BL31', 'BL32', 'BL33', 'BL34', 'GV1', 'GV2', 'GV3', 'GV4'],
    clinicalPriority: 'Medium'
  },
  {
    filename: 'neck_front.png',
    bodyPart: 'Neck',
    view: 'Anterior',
    keyMeridians: ['CV', 'ST'],
    pointCodes: ['CV21', 'CV22', 'CV23', 'ST9', 'ST10', 'ST11', 'ST12'],
    clinicalPriority: 'High'
  },
  {
    filename: 'shoulder_anterior.png',
    bodyPart: 'Shoulder',
    view: 'Anterior',
    keyMeridians: ['LU', 'LI', 'ST'],
    pointCodes: ['LU1', 'LU2', 'ST12', 'ST13', 'LI15'],
    clinicalPriority: 'High'
  },
  {
    filename: 'ankle_medial.png',
    bodyPart: 'Ankle',
    view: 'Medial',
    keyMeridians: ['KI', 'SP', 'LR'],
    pointCodes: ['KI3', 'KI4', 'KI5', 'KI6', 'KI7', 'SP5', 'SP6', 'LR4'],
    clinicalPriority: 'Medium'
  },
  {
    filename: 'knee_lateral.png',
    bodyPart: 'Knee',
    view: 'Lateral',
    keyMeridians: ['GB', 'ST'],
    pointCodes: ['GB33', 'GB34', 'ST35', 'ST36'],
    clinicalPriority: 'Medium'
  },
  {
    filename: 'knee_medial.png',
    bodyPart: 'Knee',
    view: 'Medial',
    keyMeridians: ['SP', 'LR', 'KI'],
    pointCodes: ['SP9', 'SP10', 'KI10', 'LR7', 'LR8'],
    clinicalPriority: 'Medium'
  },
  {
    filename: 'knee_back.png',
    bodyPart: 'Knee',
    view: 'Posterior',
    keyMeridians: ['BL'],
    pointCodes: ['BL39', 'BL40'],
    clinicalPriority: 'Medium'
  },
  {
    filename: 'head_lateral.png',
    bodyPart: 'Head',
    view: 'Lateral',
    keyMeridians: ['GB', 'ST', 'TE', 'SI'],
    pointCodes: ['GB1', 'GB2', 'GB3', 'GB4', 'GB5', 'GB6', 'GB7', 'GB8', 'GB9', 'GB10', 
                 'GB11', 'GB12', 'GB13', 'GB14', 'GB15', 'GB16', 'GB17', 'GB18', 'GB19', 'GB20',
                 'ST5', 'ST6', 'ST7', 'ST8', 'TE17', 'TE18', 'TE19', 'TE20', 'TE21', 'TE22', 'TE23', 'SI19'],
    clinicalPriority: 'High'
  },
  {
    filename: 'ear.png',
    bodyPart: 'Ear',
    view: 'Lateral',
    keyMeridians: ['Auricular'],
    pointCodes: [],
    clinicalPriority: 'High'
  },
  {
    filename: 'tongue.png',
    bodyPart: 'Tongue',
    view: 'Superior',
    keyMeridians: ['Diagnostic'],
    pointCodes: [],
    clinicalPriority: 'High'
  },
  {
    filename: 'chest.png',
    bodyPart: 'Chest',
    view: 'Anterior',
    keyMeridians: ['LU', 'KI', 'ST', 'SP', 'CV'],
    pointCodes: ['CV14', 'CV15', 'CV16', 'CV17', 'CV18', 'CV19', 'CV20', 'CV21', 'CV22',
                 'LU1', 'LU2', 'KI22', 'KI23', 'KI24', 'KI25', 'KI26', 'KI27',
                 'ST13', 'ST14', 'ST15', 'ST16', 'ST17', 'ST18', 'SP17', 'SP18', 'SP19', 'SP20'],
    clinicalPriority: 'High'
  },
  {
    filename: 'upper_back.png',
    bodyPart: 'Upper Back',
    view: 'Posterior',
    keyMeridians: ['BL', 'SI', 'GV'],
    pointCodes: ['BL11', 'BL12', 'BL13', 'BL14', 'BL15', 'BL16', 'BL17', 'BL18', 'BL19', 'BL20', 'BL21',
                 'SI9', 'SI10', 'SI11', 'SI12', 'SI13', 'SI14', 'SI15',
                 'GV10', 'GV11', 'GV12', 'GV13', 'GV14'],
    clinicalPriority: 'High'
  },
  {
    filename: 'lower_back.png',
    bodyPart: 'Lower Back',
    view: 'Posterior',
    keyMeridians: ['BL', 'GV'],
    pointCodes: ['BL22', 'BL23', 'BL24', 'BL25', 'BL26', 'GV3', 'GV4', 'GV5', 'GV6'],
    clinicalPriority: 'High'
  },
  {
    filename: 'arm_full.png',
    bodyPart: 'Arm',
    view: 'Dual',
    keyMeridians: ['LI', 'TE', 'SI', 'LU', 'PC', 'HT'],
    pointCodes: ['LI4', 'LI5', 'LI6', 'LI7', 'LI8', 'LI9', 'LI10', 'LI11', 'LI12', 'LI13', 'LI14',
                 'TE4', 'TE5', 'TE6', 'TE7', 'TE8', 'TE9', 'TE10', 'TE11', 'TE12',
                 'SI5', 'SI6', 'SI7', 'SI8',
                 'LU3', 'LU4', 'LU5', 'LU6', 'LU7', 'LU8', 'LU9',
                 'PC3', 'PC4', 'PC5', 'PC6', 'PC7',
                 'HT3', 'HT4', 'HT5', 'HT6', 'HT7'],
    clinicalPriority: 'Medium'
  },
  {
    filename: 'elbow_inner.png',
    bodyPart: 'Elbow',
    view: 'Anterior',
    keyMeridians: ['LU', 'PC', 'HT', 'LI', 'TE', 'SI'],
    pointCodes: ['LU5', 'PC3', 'HT3', 'LI11'],
    clinicalPriority: 'Medium'
  },
  {
    filename: 'wrist.png',
    bodyPart: 'Wrist',
    view: 'Anterior',
    keyMeridians: ['LU', 'PC', 'HT'],
    pointCodes: ['LU7', 'LU8', 'LU9', 'PC6', 'PC7', 'HT4', 'HT5', 'HT6', 'HT7'],
    clinicalPriority: 'High'
  },
  {
    filename: 'thigh_hip.png',
    bodyPart: 'Thigh',
    view: 'Anterior',
    keyMeridians: ['ST', 'SP', 'LR', 'GB'],
    pointCodes: ['ST31', 'ST32', 'ST33', 'ST34', 'SP10', 'SP11', 'SP12', 'SP13', 
                 'LR10', 'LR11', 'LR12', 'GB29', 'GB30', 'GB31'],
    clinicalPriority: 'Medium'
  },
  {
    filename: 'lower_leg.png',
    bodyPart: 'Lower Leg',
    view: 'Anterior',
    keyMeridians: ['ST', 'SP', 'GB', 'BL'],
    pointCodes: ['ST35', 'ST36', 'ST37', 'ST38', 'ST39', 'ST40', 'ST41',
                 'SP6', 'SP7', 'SP8', 'SP9',
                 'GB34', 'GB35', 'GB36', 'GB37', 'GB38', 'GB39'],
    clinicalPriority: 'Medium'
  },
  {
    filename: 'foot_top.png',
    bodyPart: 'Foot',
    view: 'Dorsal',
    keyMeridians: ['ST', 'GB', 'BL', 'LR'],
    pointCodes: ['ST41', 'ST42', 'ST43', 'ST44', 'ST45',
                 'GB40', 'GB41', 'GB42', 'GB43', 'GB44',
                 'BL65', 'BL66', 'BL67',
                 'LR1', 'LR2', 'LR3'],
    clinicalPriority: 'Medium'
  },
  {
    filename: 'foot_sole.png',
    bodyPart: 'Foot',
    view: 'Plantar',
    keyMeridians: ['KI'],
    pointCodes: ['KI1'],
    clinicalPriority: 'High'
  },
  {
    filename: 'child_front.png',
    bodyPart: 'Child',
    view: 'Anterior',
    keyMeridians: ['Pediatric'],
    pointCodes: ['CV8', 'CV12', 'ST36', 'SP6'],
    clinicalPriority: 'Medium',
    ageGroup: 'pediatric'
  },
  {
    filename: 'child_back.png',
    bodyPart: 'Child',
    view: 'Posterior',
    keyMeridians: ['Pediatric', 'BL', 'GV'],
    pointCodes: ['BL11', 'BL12', 'BL13', 'BL14', 'BL15', 'BL16', 'BL17', 'BL18', 'BL19', 'BL20',
                 'BL21', 'BL22', 'BL23', 'BL24', 'BL25', 'BL26', 'BL27', 'BL28', 'BL29', 'BL30'],
    clinicalPriority: 'Medium',
    ageGroup: 'pediatric'
  },
  {
    filename: 'abdomen_zoomed.png',
    bodyPart: 'Abdomen',
    view: 'Anterior Close-up',
    keyMeridians: ['CV', 'ST', 'KI', 'SP'],
    pointCodes: ['CV2', 'CV3', 'CV4', 'CV5', 'CV6', 'CV7', 'CV8', 'CV9', 'CV10', 'CV11', 'CV12', 'CV13', 'CV14',
                 'ST19', 'ST20', 'ST21', 'ST22', 'ST23', 'ST24', 'ST25', 'ST26', 'ST27', 'ST28', 'ST29', 'ST30',
                 'KI11', 'KI12', 'KI13', 'KI14', 'KI15', 'KI16', 'KI17', 'KI18', 'KI19', 'KI20', 'KI21',
                 'SP13', 'SP14', 'SP15', 'SP16'],
    clinicalPriority: 'High'
  },
  {
    filename: 'ankle_side.png',
    bodyPart: 'Ankle',
    view: 'Lateral',
    keyMeridians: ['BL', 'KI', 'GB'],
    pointCodes: ['BL60', 'BL61', 'BL62', 'KI3', 'KI4', 'KI5', 'KI6', 'GB39', 'GB40'],
    clinicalPriority: 'Medium'
  },
  {
    filename: 'legs_posterior.png',
    bodyPart: 'Legs',
    view: 'Posterior',
    keyMeridians: ['BL', 'KI'],
    pointCodes: ['BL36', 'BL37', 'BL38', 'BL39', 'BL40', 'BL55', 'BL56', 'BL57', 'BL58', 'BL59', 'BL60'],
    clinicalPriority: 'Medium'
  },
  {
    filename: 'sacrum.png',
    bodyPart: 'Sacrum',
    view: 'Posterior',
    keyMeridians: ['BL', 'GV'],
    pointCodes: ['BL27', 'BL28', 'BL29', 'BL30', 'BL31', 'BL32', 'BL33', 'BL34', 'GV1', 'GV2', 'GV3', 'GV4'],
    clinicalPriority: 'Medium'
  },
  {
    filename: 'abdomen_female.png',
    bodyPart: 'Abdomen',
    view: 'Anterior (Female)',
    keyMeridians: ['CV', 'ST', 'KI', 'SP'],
    pointCodes: ['CV2', 'CV3', 'CV4', 'CV5', 'CV6', 'CV7', 'CV8', 'CV9', 'CV10', 'CV11', 'CV12', 'CV13', 'CV14',
                 'ST19', 'ST20', 'ST21', 'ST22', 'ST23', 'ST24', 'ST25', 'ST26', 'ST27', 'ST28', 'ST29', 'ST30',
                 'KI11', 'KI12', 'KI13', 'KI14', 'KI15', 'KI16', 'KI17', 'KI18', 'KI19', 'KI20', 'KI21',
                 'SP13', 'SP14', 'SP15', 'SP16'],
    clinicalPriority: 'High',
    gender: 'female'
  },
  {
    filename: 'foot.png',
    bodyPart: 'Foot',
    view: 'General',
    keyMeridians: ['ST', 'GB', 'BL', 'LR', 'KI', 'SP'],
    pointCodes: ['ST41', 'ST42', 'ST43', 'ST44', 'ST45',
                 'GB40', 'GB41', 'GB42', 'GB43', 'GB44',
                 'BL60', 'BL61', 'BL62', 'BL65', 'BL66', 'BL67',
                 'LR1', 'LR2', 'LR3', 'LR4',
                 'KI1', 'KI2', 'KI3', 'KI4', 'KI5', 'KI6',
                 'SP1', 'SP2', 'SP3', 'SP4', 'SP5', 'SP6'],
    clinicalPriority: 'Medium'
  }
];

/**
 * Normalize a point code for comparison (remove hyphens, spaces, convert to uppercase)
 */
export function normalizePointCode(code: string): string {
  return code.replace(/[-\s]/g, '').toUpperCase();
}

/**
 * Find the best matching body figure(s) for a set of point codes
 * Returns figures sorted by how many points they contain
 */
export function findFiguresForPoints(pointCodes: string[]): FigureMapping[] {
  if (!pointCodes.length) return [];
  
  const normalizedInput = pointCodes.map(normalizePointCode);
  
  // Score each figure by how many of the requested points it contains
  const scored = FIGURE_MAPPINGS.map(figure => {
    const normalizedFigurePoints = figure.pointCodes.map(normalizePointCode);
    const matchCount = normalizedInput.filter(code => 
      normalizedFigurePoints.includes(code)
    ).length;
    
    // Also check if the meridian prefix matches
    const meridianMatches = normalizedInput.filter(code => {
      const meridian = code.replace(/\d+/g, '');
      return figure.keyMeridians.some(km => km.toUpperCase() === meridian);
    }).length;
    
    return {
      figure,
      score: matchCount * 10 + meridianMatches, // Weight direct point matches higher
      matchCount
    };
  })
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score);
  
  return scored.map(item => item.figure);
}

/**
 * Find the single best matching figure for a point code
 */
export function findBestFigureForPoint(pointCode: string): FigureMapping | null {
  const figures = findFiguresForPoints([pointCode]);
  return figures[0] || null;
}

/**
 * Get all figures that contain a specific meridian
 */
export function findFiguresForMeridian(meridian: string): FigureMapping[] {
  const normalizedMeridian = meridian.toUpperCase();
  return FIGURE_MAPPINGS.filter(figure => 
    figure.keyMeridians.some(km => km.toUpperCase() === normalizedMeridian)
  );
}

/**
 * Get all figures for a body part
 */
export function findFiguresForBodyPart(bodyPart: string): FigureMapping[] {
  const normalizedPart = bodyPart.toLowerCase();
  return FIGURE_MAPPINGS.filter(figure => 
    figure.bodyPart.toLowerCase().includes(normalizedPart)
  );
}

/**
 * Get point codes for a specific figure
 */
export function getPointsForFigure(filename: string): string[] {
  const figure = FIGURE_MAPPINGS.find(f => f.filename === filename);
  return figure?.pointCodes || [];
}

/**
 * Check if a point is on a specific figure
 */
export function isPointOnFigure(pointCode: string, filename: string): boolean {
  const normalizedCode = normalizePointCode(pointCode);
  const figure = FIGURE_MAPPINGS.find(f => f.filename === filename);
  if (!figure) return false;
  return figure.pointCodes.map(normalizePointCode).includes(normalizedCode);
}

export type GenderFilter = 'male' | 'female' | 'neutral' | null;
export type AgeGroupFilter = 'pediatric' | 'adult' | 'elderly' | null;

/**
 * Gender-aware figure mapping
 * Maps generic figures to gender-specific alternatives
 */
const GENDER_FIGURE_ALTERNATIVES: Record<string, { male: string; female: string }> = {
  'abdomen.png': { male: 'abdomen.png', female: 'abdomen_female.png' },
  'abdomen_zoomed.png': { male: 'abdomen_zoomed.png', female: 'abdomen_female.png' },
  'chest.png': { male: 'chest.png', female: 'chest.png' },
};

/**
 * Age-aware figure mapping
 * Maps generic figures to age-specific alternatives
 */
const AGE_FIGURE_ALTERNATIVES: Record<string, { pediatric: string; adult: string; elderly: string }> = {
  'upper_back.png': { pediatric: 'child_back.png', adult: 'upper_back.png', elderly: 'upper_back.png' },
  'lower_back.png': { pediatric: 'child_back.png', adult: 'lower_back.png', elderly: 'lower_back.png' },
  'abdomen.png': { pediatric: 'child_front.png', adult: 'abdomen.png', elderly: 'abdomen.png' },
  'chest.png': { pediatric: 'child_front.png', adult: 'chest.png', elderly: 'chest.png' },
};

/**
 * Get gender-aware figure filename
 */
export function getGenderAwareFigure(filename: string, gender: GenderFilter): string {
  if (!gender || gender === 'neutral') return filename;
  const alternatives = GENDER_FIGURE_ALTERNATIVES[filename];
  return alternatives ? (alternatives[gender] || filename) : filename;
}

/**
 * Get age-aware figure filename
 */
export function getAgeAwareFigure(filename: string, ageGroup: AgeGroupFilter): string {
  if (!ageGroup) return filename;
  const alternatives = AGE_FIGURE_ALTERNATIVES[filename];
  return alternatives ? (alternatives[ageGroup] || filename) : filename;
}

/**
 * Get demographically-appropriate figure filename
 * Combines gender and age-aware selection
 */
export function getDemographicAwareFigure(
  filename: string, 
  gender: GenderFilter = null, 
  ageGroup: AgeGroupFilter = null
): string {
  let result = getAgeAwareFigure(filename, ageGroup);
  if (ageGroup !== 'pediatric') {
    result = getGenderAwareFigure(result, gender);
  }
  return result;
}

/**
 * Find figures filtered by demographic criteria
 */
export function findFiguresForPointsWithDemographics(
  pointCodes: string[],
  gender: GenderFilter = null,
  ageGroup: AgeGroupFilter = null
): FigureMapping[] {
  const baseFigures = findFiguresForPoints(pointCodes);
  
  if (!gender && !ageGroup) return baseFigures;
  
  return baseFigures
    .filter(figure => {
      if (figure.gender && gender && figure.gender !== gender && figure.gender !== 'neutral') {
        return false;
      }
      if (figure.ageGroup && ageGroup && figure.ageGroup !== ageGroup) {
        return false;
      }
      return true;
    })
    .map(figure => {
      const newFilename = getDemographicAwareFigure(figure.filename, gender, ageGroup);
      if (newFilename !== figure.filename) {
        const altFigure = FIGURE_MAPPINGS.find(f => f.filename === newFilename);
        if (altFigure) return altFigure;
      }
      return figure;
    })
    .filter((figure, index, arr) => 
      arr.findIndex(f => f.filename === figure.filename) === index
    );
}

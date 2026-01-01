import { differenceInYears, parse } from 'date-fns';

export type AgeGroup = 
  | 'newborn' // 0-2 years
  | 'children' // 3-13 years
  | 'adults_18_50' // 18-50 years
  | 'adults_50_70' // 50-70 years
  | 'elderly'; // 70+ years

export interface AgeGroupInfo {
  group: AgeGroup;
  label: string;
  labelHe: string;
  age: number | null;
  knowledgeAssets: string[];
  systemPromptContext: string;
}

const AGE_GROUP_CONFIG: Record<AgeGroup, Omit<AgeGroupInfo, 'age' | 'group'>> = {
  newborn: {
    label: 'Newborn/Infant (0-2)',
    labelHe: 'תינוק (0-2)',
    knowledgeAssets: ['tcm-newborn-qa'],
    systemPromptContext: 'This is a newborn/infant patient (0-2 years). Treatment must be extremely gentle: minimal needling (often avoid), prefer tuina, moxa, herbal baths. Focus on supporting natural development. Reduce herb doses significantly (1/10-1/20 adult dose).',
  },
  children: {
    label: 'Child (3-13)',
    labelHe: 'ילד (3-13)',
    knowledgeAssets: ['tcm-children-7-13-qa'],
    systemPromptContext: 'This is a pediatric patient (3-13 years). Consider school stress, growth patterns, digestive development. Use gentler techniques and reduced dosages. Ask about screen time, sleep, concentration, and social factors.',
  },
  adults_18_50: {
    label: 'Adult (18-50)',
    labelHe: 'מבוגר (18-50)',
    knowledgeAssets: ['tcm-adults-18-50-qa', 'age-prompts-adults-18-50'],
    systemPromptContext: 'This is an adult patient (18-50 years). Consider work stress, lifestyle, fertility/cycles where relevant. Focus on Liver Qi stagnation patterns, digestive issues from irregular eating, and sleep disruption from modern lifestyle.',
  },
  adults_50_70: {
    label: 'Middle-aged (50-70)',
    labelHe: 'בגיל העמידה (50-70)',
    knowledgeAssets: ['age-prompts-adults-50-70'],
    systemPromptContext: 'This is a middle-aged patient (50-70 years). Consider chronic disease history, medications, hormonal changes (menopause/andropause). Focus on Kidney Yin/Yang balance, joint health, cardiovascular patterns. Ask about medication interactions.',
  },
  elderly: {
    label: 'Elderly (70+)',
    labelHe: 'קשיש (70+)',
    knowledgeAssets: ['tcm-elderly-70-120-qa', 'elderly-lifestyle-recommendations'],
    systemPromptContext: 'This is an elderly patient (70+ years). Treatment must be gentle: shallow needling, fewer points (5-8 max), shorter retention. Reduce herb doses to 1/3-1/2 normal. Focus on quality of life, fall prevention, medication interactions. Coordinate with Western medical care.',
  },
};

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string | Date | null): number | null {
  if (!dateOfBirth) return null;
  
  try {
    const dob = typeof dateOfBirth === 'string' 
      ? new Date(dateOfBirth)
      : dateOfBirth;
    
    if (isNaN(dob.getTime())) return null;
    
    return differenceInYears(new Date(), dob);
  } catch {
    return null;
  }
}

/**
 * Detect age group from patient data
 */
export function detectAgeGroup(patient: {
  date_of_birth?: string | null;
  age_group?: string | null;
} | null): AgeGroupInfo {
  // Default to adults_18_50 if no patient data
  if (!patient) {
    return {
      group: 'adults_18_50',
      age: null,
      ...AGE_GROUP_CONFIG.adults_18_50,
    };
  }

  // First try to use explicit age_group field
  if (patient.age_group) {
    const normalizedGroup = patient.age_group.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    
    if (normalizedGroup.includes('newborn') || normalizedGroup.includes('infant') || normalizedGroup.includes('baby')) {
      return { group: 'newborn', age: null, ...AGE_GROUP_CONFIG.newborn };
    }
    if (normalizedGroup.includes('child') || normalizedGroup.includes('pediatric') || normalizedGroup.includes('kid')) {
      return { group: 'children', age: null, ...AGE_GROUP_CONFIG.children };
    }
    if (normalizedGroup.includes('elderly') || normalizedGroup.includes('senior') || normalizedGroup.includes('geriatric') || normalizedGroup.includes('70')) {
      return { group: 'elderly', age: null, ...AGE_GROUP_CONFIG.elderly };
    }
    if (normalizedGroup.includes('50_70') || normalizedGroup.includes('middle')) {
      return { group: 'adults_50_70', age: null, ...AGE_GROUP_CONFIG.adults_50_70 };
    }
    if (normalizedGroup.includes('adult') || normalizedGroup.includes('18_50')) {
      return { group: 'adults_18_50', age: null, ...AGE_GROUP_CONFIG.adults_18_50 };
    }
  }

  // Calculate from date of birth
  const age = calculateAge(patient.date_of_birth);
  
  if (age === null) {
    return {
      group: 'adults_18_50',
      age: null,
      ...AGE_GROUP_CONFIG.adults_18_50,
    };
  }

  let group: AgeGroup;
  
  if (age <= 2) {
    group = 'newborn';
  } else if (age <= 13) {
    group = 'children';
  } else if (age <= 50) {
    group = 'adults_18_50';
  } else if (age <= 70) {
    group = 'adults_50_70';
  } else {
    group = 'elderly';
  }

  return {
    group,
    age,
    ...AGE_GROUP_CONFIG[group],
  };
}

/**
 * Get file name patterns for age-specific knowledge search
 */
export function getAgeGroupFilePatterns(ageGroup: AgeGroup): string[] {
  return AGE_GROUP_CONFIG[ageGroup].knowledgeAssets;
}

/**
 * Get all age groups for selection UI
 */
export function getAllAgeGroups(): Array<{ value: AgeGroup; label: string; labelHe: string }> {
  return Object.entries(AGE_GROUP_CONFIG).map(([key, config]) => ({
    value: key as AgeGroup,
    label: config.label,
    labelHe: config.labelHe,
  }));
}

import { useMemo } from 'react';
import { detectAgeGroup, AgeGroup } from '@/utils/ageGroupDetection';

export interface PatientData {
  date_of_birth?: string | null;
  age_group?: string | null;
  gender?: string | null;
}

export type SimplifiedAgeGroup = 'pediatric' | 'adult' | 'elderly';
export type Gender = 'male' | 'female' | 'other' | null;

export interface PatientAgeGenderInfo {
  ageGroup: SimplifiedAgeGroup;
  detailedAgeGroup: AgeGroup;
  ageGroupLabel: string;
  ageGroupLabelHe: string;
  gender: Gender;
  genderLabel: string;
  genderLabelHe: string;
  isAutoDetected: boolean;
  age: number | null;
}

/**
 * Maps detailed age groups to simplified categories for UI filters
 */
function mapToSimplifiedAgeGroup(detailedGroup: AgeGroup): SimplifiedAgeGroup {
  switch (detailedGroup) {
    case 'newborn':
    case 'children':
      return 'pediatric';
    case 'elderly':
      return 'elderly';
    default:
      return 'adult';
  }
}

/**
 * Normalize gender string to standardized format
 */
function normalizeGender(gender: string | null | undefined): Gender {
  if (!gender) return null;
  
  const normalized = gender.toLowerCase().trim();
  
  if (['male', 'זכר', 'm', 'man', 'boy'].includes(normalized)) {
    return 'male';
  }
  if (['female', 'נקבה', 'f', 'woman', 'girl'].includes(normalized)) {
    return 'female';
  }
  if (['other', 'אחר', 'non-binary', 'nonbinary'].includes(normalized)) {
    return 'other';
  }
  
  return null;
}

/**
 * Hook to auto-detect age group and gender from patient data
 * 
 * Use this hook when you need to:
 * 1. Pre-fill age/gender filters from patient intake data
 * 2. Auto-select appropriate treatment protocols based on patient demographics
 * 3. Show age-appropriate UI elements
 * 
 * @param patient - Patient data with date_of_birth, age_group, and/or gender
 * @returns Detected age group, gender, and labels
 */
export function usePatientAgeGender(patient: PatientData | null): PatientAgeGenderInfo {
  return useMemo(() => {
    const ageGroupInfo = detectAgeGroup(patient);
    const simplifiedAgeGroup = mapToSimplifiedAgeGroup(ageGroupInfo.group);
    const gender = normalizeGender(patient?.gender);
    
    // Determine if we auto-detected from real patient data
    const isAutoDetected = !!(patient?.date_of_birth || patient?.age_group || patient?.gender);
    
    // Gender labels
    const genderLabels: Record<Gender | 'null', { en: string; he: string }> = {
      male: { en: 'Male', he: 'זכר' },
      female: { en: 'Female', he: 'נקבה' },
      other: { en: 'Other', he: 'אחר' },
      null: { en: 'Not specified', he: 'לא צוין' },
    };
    
    // Simplified age group labels
    const simplifiedAgeLabels: Record<SimplifiedAgeGroup, { en: string; he: string }> = {
      pediatric: { en: 'Pediatric', he: 'ילדים' },
      adult: { en: 'Adult', he: 'מבוגר' },
      elderly: { en: 'Elderly', he: 'קשיש' },
    };
    
    return {
      ageGroup: simplifiedAgeGroup,
      detailedAgeGroup: ageGroupInfo.group,
      ageGroupLabel: simplifiedAgeLabels[simplifiedAgeGroup].en,
      ageGroupLabelHe: simplifiedAgeLabels[simplifiedAgeGroup].he,
      gender,
      genderLabel: genderLabels[gender || 'null'].en,
      genderLabelHe: genderLabels[gender || 'null'].he,
      isAutoDetected,
      age: ageGroupInfo.age,
    };
  }, [patient?.date_of_birth, patient?.age_group, patient?.gender]);
}

/**
 * Get all simplified age group options for selection UI
 */
export function getSimplifiedAgeGroupOptions() {
  return [
    { value: 'pediatric' as const, label: 'Pediatric', labelHe: '🧒 ילדים' },
    { value: 'adult' as const, label: 'Adult', labelHe: '💼 מבוגרים' },
    { value: 'elderly' as const, label: 'Elderly', labelHe: '👴 גיל שלישי' },
  ];
}

/**
 * Get all gender options for selection UI
 */
export function getGenderOptions() {
  return [
    { value: 'male' as const, label: 'Male', labelHe: 'זכר' },
    { value: 'female' as const, label: 'Female', labelHe: 'נקבה' },
    { value: 'other' as const, label: 'Other', labelHe: 'אחר' },
  ];
}

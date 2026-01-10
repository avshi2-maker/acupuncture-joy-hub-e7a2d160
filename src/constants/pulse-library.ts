/**
 * Pulse Library Constants
 * Re-exports and extends pulse diagnosis data for use across the application
 */

// Re-export all pulse diagnosis data
export { 
  pulseDiagnosisData, 
  allPulseFindings,
  type PulseFinding,
  type PulseCategory 
} from '@/data/pulse-diagnosis-data';

// Re-export clinical nexus types and hook
export { 
  useClinicalNexus,
  validateClinicalNexus,
  type PulseNexusEntry,
  type BodyMapCoord,
  type ClinicalNexusResult 
} from '@/hooks/useClinicalNexus';

// Pulse category icons for UI
export const PULSE_CATEGORY_ICONS: Record<string, string> = {
  'Pulse Rate': '💓',
  'Pulse Depth': '📏',
  'Pulse Width': '↔️',
  'Pulse Strength': '💪',
  'Pulse Quality - Tension': '🎸',
  'Pulse Quality - Flow': '🌊',
  'Pulse Length': '📐',
  'Pulse Rhythm': '🎵',
  'Special Pulse Qualities': '✨',
  'Pulse Position Analysis': '📍',
  'Constitutional Variations': '👤',
  'Seasonal Variations': '🌸'
};

// Pulse severity levels for clinical prioritization
export const PULSE_SEVERITY_LEVELS = {
  CRITICAL: ['Scattered/Dissipated Pulse', 'Minute/Barely Perceptible Pulse', 'Racing/Hasty Pulse', 'Hidden/Secluded Pulse'],
  HIGH: ['Intermittent Pulse', 'Hollow/Scallion Stalk Pulse', 'Leather/Drum-skin Pulse', 'Hurried Pulse'],
  MODERATE: ['Wiry/String-like Pulse', 'Slippery/Rolling Pulse', 'Choppy/Rough Pulse', 'Knotted Pulse'],
  LOW: ['Normal Rate', 'Regular/Even Rhythm', 'Seasonal Variations']
} as const;

// Quick lookup for pulse ID patterns
export const PULSE_ID_PREFIX = 'P-';

// Color coding for pulse categories
export const PULSE_CATEGORY_COLORS: Record<string, string> = {
  'Pulse Rate': 'bg-red-100 text-red-800 border-red-200',
  'Pulse Depth': 'bg-blue-100 text-blue-800 border-blue-200',
  'Pulse Width': 'bg-purple-100 text-purple-800 border-purple-200',
  'Pulse Strength': 'bg-orange-100 text-orange-800 border-orange-200',
  'Pulse Quality - Tension': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Pulse Quality - Flow': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'Pulse Length': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Pulse Rhythm': 'bg-pink-100 text-pink-800 border-pink-200',
  'Special Pulse Qualities': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Pulse Position Analysis': 'bg-teal-100 text-teal-800 border-teal-200',
  'Constitutional Variations': 'bg-slate-100 text-slate-800 border-slate-200',
  'Seasonal Variations': 'bg-lime-100 text-lime-800 border-lime-200'
};

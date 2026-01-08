import { LucideIcon, Play, Pause, RotateCcw, Square, Brain, HelpCircle, BookOpen, Baby, Heart, Sparkles, Activity, Apple, Calendar, ClipboardList, ArrowRight, CalendarPlus, VideoIcon, FileText, Accessibility, Leaf, Pill, Moon, Briefcase, Dumbbell, Compass, Star, MapPin, Stethoscope } from 'lucide-react';

// ============================================
// SHARED SESSION ASSET CONFIGURATION
// Used by both Standard Session & Video Session
// ============================================

export type ToolbarItemId = 'herbs' | 'nutrition' | 'mental' | 'sleep' | 'worklife' | 'wellness' | 'sports' | 'bazi' | 'astro' | 'points' | 'diagnosis' | 'formulas';

export interface SessionAssetBox {
  id: string;
  name: string;
  nameHe: string;
  icon: LucideIcon;
  color: string;
  borderColor: string;
  tooltip?: string;
  category: 'session-controls' | 'ai-clinical' | 'wellness-category' | 'calendar-scheduling' | 'communication' | 'utilities' | 'clinical-tools';
}

export interface ToolbarAsset {
  id: ToolbarItemId;
  icon: LucideIcon;
  label: string;
  labelHe: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

// ============================================
// HEADER BOX ASSETS (20 items in 6 groups)
// ============================================

export const SESSION_ASSET_BOXES: SessionAssetBox[] = [
  // AI & Clinical Tools Group
  { id: 'ai-tips', name: 'AI Brain', nameHe: 'מוח AI', icon: Brain, color: 'text-purple-600', borderColor: 'border-purple-300', tooltip: 'Open CM Brain AI assistant panel', category: 'ai-clinical' },
  { id: 'qa', name: 'Q&A', nameHe: 'שאלות', icon: HelpCircle, color: 'text-cyan-600', borderColor: 'border-cyan-300', tooltip: 'Open clinical Q&A questionnaires', category: 'ai-clinical' },
  { id: 'guide', name: 'Guide', nameHe: 'מדריך', icon: BookOpen, color: 'text-amber-600', borderColor: 'border-amber-300', tooltip: 'Session teleprompter guide', category: 'ai-clinical' },
  { id: 'pregnancy', name: 'Pregnancy', nameHe: 'הריון', icon: Baby, color: 'text-pink-500', borderColor: 'border-pink-300', tooltip: 'Pregnancy safety calculator', category: 'ai-clinical' },
  { id: 'elderly', name: 'Elderly', nameHe: 'קשישים', icon: Heart, color: 'text-emerald-500', borderColor: 'border-emerald-300', tooltip: 'Healthy lifestyle guide for adults 70+', category: 'ai-clinical' },
  { id: 'session-brief', name: 'Brief', nameHe: 'תקציר', icon: Sparkles, color: 'text-amber-600', borderColor: 'border-amber-300', tooltip: 'AI Session Brief with patient analysis & visit history', category: 'ai-clinical' },
  { id: 'pediatric', name: 'Peds', nameHe: 'ילדים', icon: Baby, color: 'text-cyan-500', borderColor: 'border-cyan-300', tooltip: 'Pediatric TCM Assistant', category: 'clinical-tools' },
  { id: 'herbs', name: 'Herbs', nameHe: 'צמחים', icon: Leaf, color: 'text-emerald-500', borderColor: 'border-emerald-300', tooltip: 'Herbal Master Widget', category: 'clinical-tools' },
  
  // Wellness & Emotional Category
  { id: 'stress-biofeedback', name: 'Stress', nameHe: 'לחץ', icon: Activity, color: 'text-orange-500', borderColor: 'border-orange-300', tooltip: 'TCM Stress & Biofeedback - 75 Q&A with points & formulas', category: 'wellness-category' },
  { id: 'grief', name: 'Grief', nameHe: 'אבל', icon: Heart, color: 'text-rose-500', borderColor: 'border-rose-300', tooltip: 'TCM Grief & Emotional Processing - Lung, Po, letting go', category: 'wellness-category' },
  { id: 'trauma', name: 'Trauma', nameHe: 'טראומה', icon: Brain, color: 'text-purple-500', borderColor: 'border-purple-300', tooltip: 'TCM Trauma Processing - Heart-Kidney, Shen, Zhi', category: 'wellness-category' },
  { id: 'fear', name: 'Fear', nameHe: 'פחד', icon: Activity, color: 'text-blue-500', borderColor: 'border-blue-300', tooltip: 'TCM Fear Processing - Kidney, Zhi, willpower', category: 'wellness-category' },
  { id: 'anger', name: 'Anger', nameHe: 'כעס', icon: Activity, color: 'text-red-500', borderColor: 'border-red-300', tooltip: 'TCM Anger Processing - Liver, Hun, decision-making', category: 'wellness-category' },
  { id: 'nutrition-box', name: 'Nutrition', nameHe: 'תזונה', icon: Apple, color: 'text-green-600', borderColor: 'border-green-300', tooltip: 'Diet & nutrition TCM guidance', category: 'wellness-category' },
  
  // Calendar & Scheduling
  { id: 'calendar', name: 'Calendar', nameHe: 'יומן', icon: Calendar, color: 'text-blue-600', borderColor: 'border-blue-300', tooltip: 'Open calendar view', category: 'calendar-scheduling' },
  { id: 'appointment', name: 'Appoint', nameHe: 'תור חדש', icon: ClipboardList, color: 'text-teal-600', borderColor: 'border-teal-300', tooltip: 'Schedule a new appointment', category: 'calendar-scheduling' },
  { id: 'followup', name: 'Follow-up', nameHe: 'המשך', icon: ArrowRight, color: 'text-jade', borderColor: 'border-jade/50', tooltip: 'Plan follow-up treatment', category: 'calendar-scheduling' },
  { id: 'calendar-invite', name: 'Invite', nameHe: 'הזמנה', icon: CalendarPlus, color: 'text-emerald-600', borderColor: 'border-emerald-300', tooltip: 'Send calendar invite to patient', category: 'calendar-scheduling' },
  
  // Communication
  { id: 'zoom', name: 'Zoom', nameHe: 'זום', icon: VideoIcon, color: 'text-blue-500', borderColor: 'border-blue-300', tooltip: 'Create Zoom meeting invite', category: 'communication' },
  { id: 'report', name: 'Report', nameHe: 'דוח', icon: FileText, color: 'text-indigo-600', borderColor: 'border-indigo-300', tooltip: 'Generate session report', category: 'communication' },
  
  // Utilities
  { id: 'accessibility', name: 'Access', nameHe: 'נגישות', icon: Accessibility, color: 'text-jade', borderColor: 'border-jade/50', tooltip: 'Toggle high contrast mode', category: 'utilities' },
];

// ============================================
// CUSTOMIZABLE TOOLBAR ASSETS (12 items)
// ============================================

export const TOOLBAR_ASSETS: ToolbarAsset[] = [
  { id: 'herbs', icon: Leaf, label: 'Herbs', labelHe: 'צמחים', color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { id: 'formulas', icon: Pill, label: 'Formulas', labelHe: 'נוסחאות', color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  { id: 'nutrition', icon: Apple, label: 'Nutrition', labelHe: 'תזונה', color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  { id: 'mental', icon: Heart, label: 'Mental', labelHe: 'נפשי', color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200' },
  { id: 'sleep', icon: Moon, label: 'Sleep', labelHe: 'שינה', color: 'text-indigo-700', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
  { id: 'worklife', icon: Briefcase, label: 'Balance', labelHe: 'איזון', color: 'text-cyan-700', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200' },
  { id: 'wellness', icon: Activity, label: 'Wellness', labelHe: 'בריאות', color: 'text-teal-700', bgColor: 'bg-teal-50', borderColor: 'border-teal-200' },
  { id: 'sports', icon: Dumbbell, label: 'Sports', labelHe: 'ספורט', color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  { id: 'bazi', icon: Compass, label: 'Bazi', labelHe: 'באזי', color: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  { id: 'astro', icon: Star, label: 'Astrology', labelHe: 'אסטרולוגיה', color: 'text-violet-700', bgColor: 'bg-violet-50', borderColor: 'border-violet-200' },
  { id: 'points', icon: MapPin, label: 'Points', labelHe: 'נקודות', color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  { id: 'diagnosis', icon: Stethoscope, label: 'Diagnosis', labelHe: 'אבחון', color: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getAssetsByCategory(category: SessionAssetBox['category']): SessionAssetBox[] {
  return SESSION_ASSET_BOXES.filter(box => box.category === category);
}

export function getAssetById(id: string): SessionAssetBox | undefined {
  return SESSION_ASSET_BOXES.find(box => box.id === id);
}

export function getToolbarAssetById(id: ToolbarItemId): ToolbarAsset | undefined {
  return TOOLBAR_ASSETS.find(asset => asset.id === id);
}

// Asset categories for grouping
export const ASSET_CATEGORIES = {
  'session-controls': { label: 'Session Controls', labelHe: 'בקרת פגישה' },
  'ai-clinical': { label: 'AI & Clinical', labelHe: 'AI וקליני' },
  'clinical-tools': { label: 'Clinical Tools', labelHe: 'כלים קליניים' },
  'wellness-category': { label: 'Wellness & Emotional', labelHe: 'בריאות ורגשי' },
  'calendar-scheduling': { label: 'Calendar & Scheduling', labelHe: 'יומן ותזמון' },
  'communication': { label: 'Communication', labelHe: 'תקשורת' },
  'utilities': { label: 'Utilities', labelHe: 'כלים' },
} as const;

// ============================================
// SUMMARY STATS
// ============================================

export const ASSET_SUMMARY = {
  headerBoxes: SESSION_ASSET_BOXES.length,
  toolbarAssets: TOOLBAR_ASSETS.length,
  totalAssets: SESSION_ASSET_BOXES.length + TOOLBAR_ASSETS.length,
  categories: Object.keys(ASSET_CATEGORIES).length,
};

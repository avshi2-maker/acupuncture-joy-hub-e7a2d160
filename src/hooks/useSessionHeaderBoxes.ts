import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, RotateCcw, Square, Brain, HelpCircle, BookOpen, Baby, Heart, Sparkles, Activity, Apple, Calendar, ClipboardList, ArrowRight, CalendarPlus, VideoIcon, FileText, Accessibility, Leaf } from 'lucide-react';
import { SESSION_ASSET_BOXES, getAssetsByCategory } from '@/config/sessionAssets';
import { BoxGroup } from '@/components/video/VideoSessionHeaderBoxes';
import { LucideIcon } from 'lucide-react';

export interface SessionHeaderBoxConfig {
  id: string;
  name: string;
  nameHe: string;
  icon: LucideIcon;
  color: string;
  borderColor: string;
  isActive?: boolean;
  tooltip?: string;
  onClick: () => void;
}

export interface SessionHandlers {
  // Session controls
  sessionStatus: 'idle' | 'running' | 'paused' | 'ended';
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  onReset: () => void;
  
  // AI & Clinical
  showTcmBrainPanel?: boolean;
  onToggleTcmBrain: () => void;
  showAnxietyQA?: boolean;
  onToggleQA: () => void;
  showSessionGuide?: boolean;
  onToggleGuide: () => void;
  showPregnancyCalc?: boolean;
  onOpenPregnancy: () => void;
  showElderlyGuide?: boolean;
  onOpenElderly: () => void;
  showSessionBrief?: boolean;
  onToggleSessionBrief: () => void;
  onOpenPediatric: () => void;
  onOpenHerbs: () => void;
  
  // Wellness & Emotional
  showEmotionalPanel?: boolean;
  emotionalPanelEmotion?: 'grief' | 'trauma' | 'fear' | 'anger';
  onOpenStress: () => void;
  onOpenGrief: () => void;
  onOpenTrauma: () => void;
  onOpenFear: () => void;
  onOpenAnger: () => void;
  onOpenNutrition: () => void;
  
  // Calendar & Scheduling
  onOpenCalendar: () => void;
  onOpenAppointment: () => void;
  onOpenFollowUp: () => void;
  onOpenCalendarInvite: () => void;
  
  // Communication
  onOpenZoom: () => void;
  onOpenReport: () => void;
  
  // Utilities
  highContrast?: boolean;
  onToggleAccessibility: () => void;
}

export function useSessionHeaderBoxes(handlers: SessionHandlers): BoxGroup[] {
  const navigate = useNavigate();
  
  return useMemo(() => {
    const {
      sessionStatus,
      onStart, onPause, onResume, onEnd, onReset,
      showTcmBrainPanel, onToggleTcmBrain,
      showAnxietyQA, onToggleQA,
      showSessionGuide, onToggleGuide,
      showPregnancyCalc, onOpenPregnancy,
      showElderlyGuide, onOpenElderly,
      showSessionBrief, onToggleSessionBrief,
      onOpenPediatric, onOpenHerbs,
      showEmotionalPanel, emotionalPanelEmotion,
      onOpenStress, onOpenGrief, onOpenTrauma, onOpenFear, onOpenAnger, onOpenNutrition,
      onOpenCalendar, onOpenAppointment, onOpenFollowUp, onOpenCalendarInvite,
      onOpenZoom, onOpenReport,
      highContrast, onToggleAccessibility,
    } = handlers;

    const groups: BoxGroup[] = [
      // Session Controls
      {
        id: 'session-controls',
        boxes: [
          {
            id: 'start-session',
            name: sessionStatus === 'idle' || sessionStatus === 'ended' ? 'Start' : sessionStatus === 'running' ? 'Pause' : 'Resume',
            nameHe: sessionStatus === 'idle' || sessionStatus === 'ended' ? 'התחל' : sessionStatus === 'running' ? 'השהה' : 'המשך',
            icon: sessionStatus === 'running' ? Pause : Play,
            color: 'text-jade',
            borderColor: 'border-jade',
            isActive: sessionStatus === 'running',
            tooltip: sessionStatus === 'idle' || sessionStatus === 'ended' ? 'Start session' : sessionStatus === 'running' ? 'Pause session' : 'Resume session',
            onClick: () => {
              if (sessionStatus === 'idle' || sessionStatus === 'ended') onStart();
              else if (sessionStatus === 'running') onPause();
              else onResume();
            },
          },
          {
            id: 'end-session',
            name: 'End',
            nameHe: 'סיום',
            icon: Square,
            color: 'text-rose-600',
            borderColor: 'border-rose-300',
            tooltip: 'End session',
            onClick: onEnd,
          },
          {
            id: 'reset',
            name: 'Reset',
            nameHe: 'איפוס',
            icon: RotateCcw,
            color: 'text-amber-600',
            borderColor: 'border-amber-300',
            tooltip: 'Reset session',
            onClick: onReset,
          },
        ],
      },
      // AI & Clinical
      {
        id: 'ai-clinical',
        boxes: [
          {
            id: 'ai-tips',
            name: 'AI Brain',
            nameHe: 'מוח AI',
            icon: Brain,
            color: 'text-purple-600',
            borderColor: 'border-purple-300',
            isActive: showTcmBrainPanel,
            tooltip: 'Open CM Brain AI assistant panel',
            onClick: onToggleTcmBrain,
          },
          {
            id: 'qa',
            name: 'Q&A',
            nameHe: 'שאלות',
            icon: HelpCircle,
            color: 'text-cyan-600',
            borderColor: 'border-cyan-300',
            isActive: showAnxietyQA,
            tooltip: 'Open clinical Q&A questionnaires',
            onClick: onToggleQA,
          },
          {
            id: 'guide',
            name: 'Guide',
            nameHe: 'מדריך',
            icon: BookOpen,
            color: 'text-amber-600',
            borderColor: 'border-amber-300',
            isActive: showSessionGuide,
            tooltip: 'Session teleprompter guide',
            onClick: onToggleGuide,
          },
          {
            id: 'pregnancy',
            name: 'Pregnancy',
            nameHe: 'הריון',
            icon: Baby,
            color: 'text-pink-500',
            borderColor: 'border-pink-300',
            isActive: showPregnancyCalc,
            tooltip: 'Pregnancy safety calculator',
            onClick: onOpenPregnancy,
          },
          {
            id: 'elderly',
            name: 'Elderly',
            nameHe: 'קשישים',
            icon: Heart,
            color: 'text-emerald-500',
            borderColor: 'border-emerald-300',
            isActive: showElderlyGuide,
            tooltip: 'Healthy lifestyle guide for adults 70+',
            onClick: onOpenElderly,
          },
          {
            id: 'session-brief',
            name: 'Brief',
            nameHe: 'תקציר',
            icon: Sparkles,
            color: 'text-amber-600',
            borderColor: 'border-amber-300',
            isActive: showSessionBrief,
            tooltip: 'AI Session Brief with patient analysis & visit history',
            onClick: onToggleSessionBrief,
          },
        ],
      },
      // Clinical Tools
      {
        id: 'clinical-tools',
        boxes: [
          {
            id: 'pediatric',
            name: 'Peds',
            nameHe: 'ילדים',
            icon: Baby,
            color: 'text-cyan-500',
            borderColor: 'border-cyan-300',
            tooltip: 'Pediatric TCM Assistant',
            onClick: onOpenPediatric,
          },
          {
            id: 'herbs',
            name: 'Herbs',
            nameHe: 'צמחים',
            icon: Leaf,
            color: 'text-emerald-500',
            borderColor: 'border-emerald-300',
            tooltip: 'Herbal Master Widget',
            onClick: onOpenHerbs,
          },
        ],
      },
      // Wellness & Emotional
      {
        id: 'wellness-category',
        boxes: [
          {
            id: 'stress-biofeedback',
            name: 'Stress',
            nameHe: 'לחץ',
            icon: Activity,
            color: 'text-orange-500',
            borderColor: 'border-orange-300',
            tooltip: 'TCM Stress & Biofeedback - 75 Q&A with points & formulas',
            onClick: onOpenStress,
          },
          {
            id: 'grief',
            name: 'Grief',
            nameHe: 'אבל',
            icon: Heart,
            color: 'text-rose-500',
            borderColor: 'border-rose-300',
            isActive: showEmotionalPanel && emotionalPanelEmotion === 'grief',
            tooltip: 'TCM Grief & Emotional Processing',
            onClick: onOpenGrief,
          },
          {
            id: 'trauma',
            name: 'Trauma',
            nameHe: 'טראומה',
            icon: Brain,
            color: 'text-purple-500',
            borderColor: 'border-purple-300',
            isActive: showEmotionalPanel && emotionalPanelEmotion === 'trauma',
            tooltip: 'TCM Trauma Processing',
            onClick: onOpenTrauma,
          },
          {
            id: 'fear',
            name: 'Fear',
            nameHe: 'פחד',
            icon: Activity,
            color: 'text-blue-500',
            borderColor: 'border-blue-300',
            isActive: showEmotionalPanel && emotionalPanelEmotion === 'fear',
            tooltip: 'TCM Fear Processing',
            onClick: onOpenFear,
          },
          {
            id: 'anger',
            name: 'Anger',
            nameHe: 'כעס',
            icon: Activity,
            color: 'text-red-500',
            borderColor: 'border-red-300',
            isActive: showEmotionalPanel && emotionalPanelEmotion === 'anger',
            tooltip: 'TCM Anger Processing',
            onClick: onOpenAnger,
          },
          {
            id: 'nutrition-box',
            name: 'Nutrition',
            nameHe: 'תזונה',
            icon: Apple,
            color: 'text-green-600',
            borderColor: 'border-green-300',
            tooltip: 'Diet & nutrition TCM guidance',
            onClick: onOpenNutrition,
          },
        ],
      },
      // Calendar & Scheduling
      {
        id: 'calendar-scheduling',
        boxes: [
          {
            id: 'calendar',
            name: 'Calendar',
            nameHe: 'יומן',
            icon: Calendar,
            color: 'text-blue-600',
            borderColor: 'border-blue-300',
            tooltip: 'Open calendar view',
            onClick: onOpenCalendar,
          },
          {
            id: 'appointment',
            name: 'Appoint',
            nameHe: 'תור חדש',
            icon: ClipboardList,
            color: 'text-teal-600',
            borderColor: 'border-teal-300',
            tooltip: 'Schedule a new appointment',
            onClick: onOpenAppointment,
          },
          {
            id: 'followup',
            name: 'Follow-up',
            nameHe: 'המשך',
            icon: ArrowRight,
            color: 'text-jade',
            borderColor: 'border-jade/50',
            tooltip: 'Plan follow-up treatment',
            onClick: onOpenFollowUp,
          },
          {
            id: 'calendar-invite',
            name: 'Invite',
            nameHe: 'הזמנה',
            icon: CalendarPlus,
            color: 'text-emerald-600',
            borderColor: 'border-emerald-300',
            tooltip: 'Send calendar invite to patient',
            onClick: onOpenCalendarInvite,
          },
        ],
      },
      // Communication
      {
        id: 'communication',
        boxes: [
          {
            id: 'zoom',
            name: 'Zoom',
            nameHe: 'זום',
            icon: VideoIcon,
            color: 'text-blue-500',
            borderColor: 'border-blue-300',
            tooltip: 'Create Zoom meeting invite',
            onClick: onOpenZoom,
          },
          {
            id: 'report',
            name: 'Report',
            nameHe: 'דוח',
            icon: FileText,
            color: 'text-indigo-600',
            borderColor: 'border-indigo-300',
            tooltip: 'Generate session report',
            onClick: onOpenReport,
          },
        ],
      },
      // Utilities
      {
        id: 'utilities',
        boxes: [
          {
            id: 'accessibility',
            name: 'Access',
            nameHe: 'נגישות',
            icon: Accessibility,
            color: highContrast ? 'text-white' : 'text-jade',
            borderColor: highContrast ? 'border-jade bg-jade' : 'border-jade/50',
            isActive: highContrast,
            tooltip: 'Toggle high contrast mode',
            onClick: onToggleAccessibility,
          },
        ],
      },
    ];

    return groups;
  }, [handlers, navigate]);
}

// Total boxes: 7 groups, 32 boxes
export const SESSION_HEADER_BOX_COUNT = 24; // Header boxes
export const TOOLBAR_ASSET_COUNT = 12; // Toolbar items
export const TOTAL_ASSET_COUNT = SESSION_HEADER_BOX_COUNT + TOOLBAR_ASSET_COUNT;

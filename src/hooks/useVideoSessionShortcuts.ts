import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface VideoSessionShortcutsConfig {
  sessionStatus: 'idle' | 'running' | 'paused' | 'ended';
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  onReset: () => void;
  onQuickNote: () => void;
  onTimestamp: () => void;
  onVoiceDictation: () => void;
  onAnxietyQA: () => void;
  onFollowUp: () => void;
  onSessionReport: () => void;
  onQuickPatient: () => void;
  onQuickAppointment: () => void;
  onZoomInvite: () => void;
  onSettings: () => void;
  onPatientHistory?: () => void;
  enabled?: boolean;
}

export const VIDEO_SESSION_SHORTCUTS = [
  // Timer Controls
  { id: 'vs-start', keys: ['Space'], action: 'Start/Pause/Resume Timer', actionHe: 'התחל/השהה/המשך טיימר', category: 'Timer' },
  { id: 'vs-end', keys: ['Alt', 'E'], action: 'End Session', actionHe: 'סיים טיפול', category: 'Timer' },
  { id: 'vs-reset', keys: ['Alt', 'R'], action: 'Reset Timer', actionHe: 'אפס טיימר', category: 'Timer' },
  
  // Quick Actions
  { id: 'vs-timestamp', keys: ['Alt', 'T'], action: 'Add Timestamp', actionHe: 'הוסף חותמת זמן', category: 'Notes' },
  { id: 'vs-voice', keys: ['Alt', 'V'], action: 'Voice Dictation', actionHe: 'הקלטה קולית', category: 'Notes' },
  { id: 'vs-note', keys: ['Alt', 'N'], action: 'Focus Notes Field', actionHe: 'מיקוד בהערות', category: 'Notes' },
  
  // Dialogs
  { id: 'vs-anxiety', keys: ['Alt', 'A'], action: 'Anxiety Q&A', actionHe: 'שאלות חרדה', category: 'Tools' },
  { id: 'vs-followup', keys: ['Alt', 'F'], action: 'Follow-up Plan', actionHe: 'תוכנית המשך', category: 'Tools' },
  { id: 'vs-report', keys: ['Alt', 'S'], action: 'Session Report', actionHe: 'דוח טיפול', category: 'Tools' },
  { id: 'vs-patient', keys: ['Alt', 'P'], action: 'Quick Patient', actionHe: 'מטופל מהיר', category: 'Tools' },
  { id: 'vs-appt', keys: ['Alt', 'C'], action: 'Quick Appointment', actionHe: 'תור מהיר', category: 'Tools' },
  { id: 'vs-zoom', keys: ['Alt', 'Z'], action: 'Zoom Invite', actionHe: 'הזמנת Zoom', category: 'Tools' },
  { id: 'vs-settings', keys: ['Alt', ','], action: 'Settings', actionHe: 'הגדרות', category: 'Tools' },
];

export function useVideoSessionShortcuts({
  sessionStatus,
  onStart,
  onPause,
  onResume,
  onEnd,
  onReset,
  onQuickNote,
  onTimestamp,
  onVoiceDictation,
  onAnxietyQA,
  onFollowUp,
  onSessionReport,
  onQuickPatient,
  onQuickAppointment,
  onZoomInvite,
  onSettings,
  onPatientHistory,
  enabled = true,
}: VideoSessionShortcutsConfig) {
  const haptic = useHapticFeedback();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    
    // Ignore if typing in input/textarea (except for specific shortcuts)
    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName);
    
    // Space bar for timer control (only when not typing)
    if (e.code === 'Space' && !isTyping) {
      e.preventDefault();
      haptic.medium();
      
      if (sessionStatus === 'idle') {
        onStart();
        toast.success('⏱️ Session started', { duration: 2000 });
      } else if (sessionStatus === 'running') {
        onPause();
        toast.info('⏸️ Session paused', { duration: 2000 });
      } else if (sessionStatus === 'paused') {
        onResume();
        toast.success('▶️ Session resumed', { duration: 2000 });
      }
      return;
    }

    // Alt + key shortcuts
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'e':
          e.preventDefault();
          haptic.medium();
          onEnd();
          toast.info('⏹️ Session ended', { duration: 2000 });
          break;
        case 'r':
          e.preventDefault();
          haptic.light();
          onReset();
          toast.info('🔄 Timer reset', { duration: 2000 });
          break;
        case 't':
          e.preventDefault();
          haptic.light();
          onTimestamp();
          toast.success('📍 Timestamp added', { duration: 2000 });
          break;
        case 'v':
          e.preventDefault();
          haptic.light();
          onVoiceDictation();
          break;
        case 'n':
          e.preventDefault();
          haptic.light();
          onQuickNote();
          break;
        case 'a':
          e.preventDefault();
          haptic.light();
          onAnxietyQA();
          break;
        case 'f':
          e.preventDefault();
          haptic.light();
          onFollowUp();
          break;
        case 's':
          e.preventDefault();
          haptic.light();
          onSessionReport();
          break;
        case 'p':
          e.preventDefault();
          haptic.light();
          onQuickPatient();
          break;
        case 'c':
          e.preventDefault();
          haptic.light();
          onQuickAppointment();
          break;
        case 'z':
          e.preventDefault();
          haptic.light();
          onZoomInvite();
          break;
        case ',':
          e.preventDefault();
          haptic.light();
          onSettings();
          break;
        case 'h':
          if (onPatientHistory) {
            e.preventDefault();
            haptic.light();
            onPatientHistory();
          }
          break;
      }
    }
  }, [
    enabled,
    sessionStatus,
    haptic,
    onStart,
    onPause,
    onResume,
    onEnd,
    onReset,
    onQuickNote,
    onTimestamp,
    onVoiceDictation,
    onAnxietyQA,
    onFollowUp,
    onSessionReport,
    onQuickPatient,
    onQuickAppointment,
    onZoomInvite,
    onSettings,
    onPatientHistory,
  ]);

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);
}

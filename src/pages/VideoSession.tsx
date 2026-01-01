import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { InlineVoiceTextarea } from '@/components/ui/InlineVoiceTextarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Square, 
  Printer, 
  Mail, 
  MessageCircle,
  Video,
  Sparkles,
  UserPlus,
  Calendar,
  VideoIcon,
  Settings,
  Users,
  RefreshCw,
  Clock,
  AlertTriangle,
  CalendarPlus,
  ClipboardList,
  Trash2,
  Leaf,
  ArrowRight,
  Apple,
  Pill,
  Stethoscope,
  Heart,
  Brain,
  FileText,
  Send,
  Loader2,
  Moon,
  Briefcase,
  Activity,
  Dumbbell,
  Compass,
  Star,
  MapPin,
  BookOpen,
  Accessibility,
  Music,
  HelpCircle,
  Mic,
  MicOff
} from 'lucide-react';
import { AnimatedMic } from '@/components/ui/AnimatedMic';
import { toast } from 'sonner';
import { saveSessionReport, printReport, LocalSessionReport } from '@/utils/localDataStorage';
import { AnxietyQADialog } from '@/components/video/AnxietyQADialog';
import { QuickPatientDialog } from '@/components/video/QuickPatientDialog';
import { QuickAppointmentDialog } from '@/components/video/QuickAppointmentDialog';
import { ZoomInviteDialog } from '@/components/video/ZoomInviteDialog';
import { TherapistSettingsDialog, getAudioAlertsEnabled } from '@/components/video/TherapistSettingsDialog';
import { FollowUpPlanDialog } from '@/components/video/FollowUpPlanDialog';
import { VoiceDictationDialog } from '@/components/video/VoiceDictationDialog';
import { CalendarInviteDialog } from '@/components/video/CalendarInviteDialog';
import { SessionReportDialog } from '@/components/video/SessionReportDialog';
import { MobileSessionBar } from '@/components/video/MobileSessionBar';
import { MobileToolsDrawer } from '@/components/video/MobileToolsDrawer';
import { FloatingSessionTimer } from '@/components/video/FloatingSessionTimer';
import { LongPressVoiceNote } from '@/components/video/LongPressVoiceNote';
import { CrossPlatformBackButton } from '@/components/ui/CrossPlatformBackButton';
import { SessionTimerWidget } from '@/components/crm/SessionTimerWidget';
import { SessionTimerProvider } from '@/contexts/SessionTimerContext';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import { useTier } from '@/hooks/useTier';
import { useBackgroundDetection } from '@/hooks/useBackgroundDetection';
import { TierBadge } from '@/components/layout/TierBadge';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useDoubleTapGesture } from '@/hooks/useDoubleTapGesture';
import { useShakeGesture } from '@/hooks/useShakeGesture';
import { MilestoneCelebration } from '@/components/video/MilestoneCelebration';
import { SwipeStatusTags } from '@/components/video/SwipeStatusTags';
import { AutoSaveIndicator } from '@/components/video/AutoSaveIndicator';
import { VoiceCommandSystem } from '@/components/video/VoiceCommandSystem';
import { SessionPresets } from '@/components/video/SessionPresets';
import { useThreeFingerTap } from '@/hooks/useThreeFingerTap';
import { PatientHistoryPanel } from '@/components/video/PatientHistoryPanel';
import { SessionRecordingModule, SessionRecordingModuleRef } from '@/components/video/SessionRecordingModule';
import { FloatingQuickActions } from '@/components/video/FloatingQuickActions';
import { CustomizableToolbar, ToolbarItemId } from '@/components/video/CustomizableToolbar';
import { FloatingHelpGuide } from '@/components/ui/FloatingHelpGuide';
import { SessionGuideTeleprompter } from '@/components/video/SessionGuideTeleprompter';
import { AISessionSuggestions } from '@/components/video/AISessionSuggestions';
import { MiniInspirationCarousel } from '@/components/video/MiniInspirationCarousel';
import { 
  VideoSessionAPIMeter, 
  VideoSessionEngineIndicator,
  useVideoSessionAudio,
  playSessionSound,
  triggerSessionHaptic,
  addVideoSessionUsage
} from '@/components/video/VideoSessionEnhancements';
import { VideoSessionHeaderBoxes } from '@/components/video/VideoSessionHeaderBoxes';
import { InlineMusicPlayer } from '@/components/video/InlineMusicPlayer';
import { TcmBrainPanel } from '@/components/video/TcmBrainPanel';

import { SessionWorkflowIndicator } from '@/components/video/SessionWorkflowIndicator';
import { SessionPhaseIndicator } from '@/components/session';
import { useSessionPhase } from '@/hooks/useSessionPhase';
import { QATypeDropdown, QAType } from '@/components/video/QATypeDropdown';
import { useLongPressTimer } from '@/hooks/useLongPressTimer';
import { useSessionLock } from '@/contexts/SessionLockContext';
import { useVideoSessionShortcuts } from '@/hooks/useVideoSessionShortcuts';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useVoiceCommands, COMMON_COMMAND_PATTERNS, VoiceCommand } from '@/hooks/useVoiceCommands';
import { useVoiceCommandAudio } from '@/hooks/useVoiceCommandAudio';
import { VoiceCommandCheatSheet } from '@/components/video/VoiceCommandCheatSheet';
import { cn } from '@/lib/utils';
import aiGeneratorBg from '@/assets/ai-generator-bg.png';
import animatedMicGif from '@/assets/mic-animated.gif';
import clockImg from '@/assets/clock.png';
import anxietySessionBg from '@/assets/anxiety-session-bg.jpg';

// Session time alerts (in seconds)
const SESSION_ALERT_30_MIN = 30 * 60;
const SESSION_ALERT_35_MIN = 35 * 60;

interface Patient {
  id: string;
  full_name: string;
  phone: string | null;
}

// Zoom free tier limits
const ZOOM_FREE_LIMIT_SECONDS = 40 * 60;
const ZOOM_WARNING_SECONDS = 35 * 60;

export default function VideoSession() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { tier, hasFeature } = useTier();
  const { user } = useAuth();
  const { pauseLock, resumeLock, isPaused: isLockPaused } = useSessionLock();
  const { fontSize, setFontSize, highContrast, setHighContrast } = useAccessibility();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [refreshingPatients, setRefreshingPatients] = useState(false);
  const [showAnxietyQA, setShowAnxietyQA] = useState(false);
  const [showQuickPatient, setShowQuickPatient] = useState(false);
  const [showQuickAppointment, setShowQuickAppointment] = useState(false);
  const [showZoomInvite, setShowZoomInvite] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFollowUpPlan, setShowFollowUpPlan] = useState(false);
  const [showVoiceDictation, setShowVoiceDictation] = useState(false);
  const [showCalendarInvite, setShowCalendarInvite] = useState(false);
  const [showSessionReport, setShowSessionReport] = useState(false);
  const [showSessionGuide, setShowSessionGuide] = useState(false);
  const [sessionGuideExpanded, setSessionGuideExpanded] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [showTcmBrainPanel, setShowTcmBrainPanel] = useState(false);
  const [voiceAlwaysOn, setVoiceAlwaysOn] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<{ text: string; matched: boolean; description?: string } | null>(null);
  const voiceFeedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedQAType, setSelectedQAType] = useState<QAType | null>(null);
  const [guideCompleted, setGuideCompleted] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState('');
  const [currentAppointmentId, setCurrentAppointmentId] = useState<string | null>(null);
  const [isCancellingBlock, setIsCancellingBlock] = useState(false);
  const warningShownRef = useRef(false);
  const alert30ShownRef = useRef(false);
  const alert35ShownRef = useRef(false);
  
  // Recording module ref for voice commands
  const recordingModuleRef = useRef<SessionRecordingModuleRef>(null);
  
  // Haptic feedback hook
  const haptic = useHapticFeedback();
  
  // Audio feedback hook from enhancements
  const { enabled: audioEnabled } = useVideoSessionAudio();
  
  // Voice command audio feedback hook
  const voiceAudio = useVoiceCommandAudio({ enabled: audioEnabled });
  
  // AI Query states
  const [activeAiQuery, setActiveAiQuery] = useState<ToolbarItemId | null>(null);
  const [aiQueryInput, setAiQueryInput] = useState('');
  const [aiQueryLoading, setAiQueryLoading] = useState(false);
  const [aiQueryResult, setAiQueryResult] = useState<string | null>(null);
  
  // Floating quick actions state
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [quickActionsPosition, setQuickActionsPosition] = useState<{ x: number; y: number } | undefined>();
  
  // Long press timer hook
  const longPressTimer = useLongPressTimer({
    onLongPress: (position) => {
      setQuickActionsPosition(position);
      setShowQuickActions(true);
    },
    delay: 600,
  });
  
  // Anxiety Q&A inline state
  const [inlineAnxietyMessages, setInlineAnxietyMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [anxietyInput, setAnxietyInput] = useState('');
  const inlineChatRef = useRef<HTMLDivElement>(null);
  
  // Current time for clock display
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Background/pause dimming state
  const [isBackgroundPaused, setIsBackgroundPaused] = useState(false);
  
  // Undo state for shake gesture
  const [notesHistory, setNotesHistory] = useState<string[]>([]);
  const lastNotesRef = useRef<string>('');
  
  // Auto-save state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Panel toggle state for three-finger tap
  const [activePanel, setActivePanel] = useState<'notes' | 'chat'>('notes');
  
  // Session preset state
  const [sessionPreset, setSessionPreset] = useState<number | null>(null);
  
  const {
    status: sessionStatus,
    duration: sessionDuration,
    notes: sessionNotes,
    patientId: selectedPatientId,
    patientName: selectedPatientName,
    patientPhone: selectedPatientPhone,
    anxietyConversation,
    sessionStartTime,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    resetSession,
    resetDuration,
    setNotes,
    setPatient,
    setAnxietyConversation,
  } = useSessionPersistence();

  // Session phase with haptic feedback and persistence
  const { currentPhase, setPhase, clearManualPhase, isManualOverride } = useSessionPhase(sessionDuration, sessionStartTime);
  useBackgroundDetection({
    onBackground: () => {
      if (sessionStatus === 'running') {
        pauseSession();
        setIsBackgroundPaused(true);
        toast.info('⏸️ Session auto-paused (app in background)', { duration: 3000 });
      }
    },
    onForeground: () => {
      if (isBackgroundPaused) {
        toast.info('👋 Welcome back! Session is paused', { duration: 3000 });
      }
    },
    pauseOnBackground: sessionStatus === 'running',
  });

  // Track notes history for undo
  useEffect(() => {
    if (sessionNotes !== lastNotesRef.current && sessionNotes.length > lastNotesRef.current.length) {
      // Only add to history when content is added (not when undoing)
      setNotesHistory(prev => [...prev.slice(-9), lastNotesRef.current]); // Keep last 10 states
    }
    lastNotesRef.current = sessionNotes;
  }, [sessionNotes]);

  // Shake gesture to undo last note entry
  const handleShakeUndo = useCallback(() => {
    if (notesHistory.length === 0) {
      haptic.warning();
      toast.info('📝 Nothing to undo', { duration: 2000 });
      return;
    }
    
    const previousNotes = notesHistory[notesHistory.length - 1];
    setNotesHistory(prev => prev.slice(0, -1));
    lastNotesRef.current = previousNotes; // Prevent this from being added to history
    setNotes(previousNotes);
    haptic.success();
    toast.success('↩️ Undo successful!', { duration: 2000 });
  }, [notesHistory, setNotes, haptic]);

  useShakeGesture({
    onShake: handleShakeUndo,
    threshold: 20,
    shakeCount: 3,
    timeout: 1000,
  });

  // Double-tap gesture to add timestamp marker to notes
  const handleDoubleTapTimestamp = useCallback(() => {
    const timestamp = formatDuration(sessionDuration);
    const marker = `\n📍 [${timestamp}] `;
    setNotes(sessionNotes + marker);
    haptic.success();
    toast.success(`⏱️ Timestamp added at ${timestamp}`, { duration: 2000 });
  }, [sessionDuration, sessionNotes, setNotes, haptic]);

  const doubleTapHandlers = useDoubleTapGesture({
    onDoubleTap: handleDoubleTapTimestamp,
  });

  // Three-finger tap to toggle between notes and AI chat panel
  useThreeFingerTap({
    onTripleTap: useCallback(() => {
      setActivePanel(prev => prev === 'notes' ? 'chat' : 'notes');
      haptic.medium();
      toast.info(`Switched to ${activePanel === 'notes' ? 'AI Chat' : 'Session Notes'}`, { duration: 1500 });
    }, [activePanel, haptic]),
  });

  // Notes textarea ref for focus
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Keyboard shortcuts for VideoSession
  useVideoSessionShortcuts({
    sessionStatus,
    onStart: () => {
      if (sessionStatus === 'idle') {
        startSession();
        pauseLock('Treatment session active');
        if (audioEnabled) playSessionSound('start');
        triggerSessionHaptic('start');
      }
    },
    onPause: () => {
      if (sessionStatus === 'running') {
        pauseSession();
        if (audioEnabled) playSessionSound('pause');
        triggerSessionHaptic('pause');
      }
    },
    onResume: () => {
      if (sessionStatus === 'paused') {
        resumeSession();
        if (audioEnabled) playSessionSound('resume');
        triggerSessionHaptic('resume');
      }
    },
    onEnd: () => {
      if (sessionStatus !== 'idle') {
        endSession();
        resumeLock();
        if (audioEnabled) playSessionSound('end');
        triggerSessionHaptic('end');
      }
    },
    onReset: () => {
      resetSession();
      if (audioEnabled) playSessionSound('reset');
      triggerSessionHaptic('reset');
    },
    onQuickNote: () => {
      notesTextareaRef.current?.focus();
    },
    onTimestamp: handleDoubleTapTimestamp,
    onVoiceDictation: () => setShowVoiceDictation(true),
    onAnxietyQA: () => setShowAnxietyQA(true),
    onFollowUp: () => setShowFollowUpPlan(true),
    onSessionReport: () => setShowSessionReport(true),
    onQuickPatient: () => setShowQuickPatient(true),
    onQuickAppointment: () => setShowQuickAppointment(true),
    onZoomInvite: () => setShowZoomInvite(true),
    onSettings: () => setShowSettings(true),
    enabled: true,
  });
  useEffect(() => {
    if (sessionNotes && sessionStatus !== 'idle') {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        setIsSaving(true);
        // Simulate save (notes are already persisted by useSessionPersistence)
        setTimeout(() => {
          setIsSaving(false);
          setLastSaved(new Date());
        }, 300);
      }, 1000);
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [sessionNotes, sessionStatus]);

  // Auto-scroll inline chat when new messages arrive
  useEffect(() => {
    if (inlineChatRef.current) {
      inlineChatRef.current.scrollTop = inlineChatRef.current.scrollHeight;
    }
  }, [inlineAnxietyMessages, aiQueryLoading]);

  // Reset background paused state when manually resumed
  useEffect(() => {
    if (sessionStatus === 'running') {
      setIsBackgroundPaused(false);
    }
  }, [sessionStatus]);

  // Handler for long-press voice note transcription
  const handleVoiceNoteTranscription = useCallback((text: string) => {
    const timestamp = formatDuration(sessionDuration);
    const voiceNote = `\n🎙️ [${timestamp}] ${text}`;
    setNotes(sessionNotes + voiceNote);
    haptic.success();
  }, [sessionDuration, sessionNotes, setNotes, haptic]);

  // Voice command handler
  const handleVoiceCommand = useCallback((command: string) => {
    const timestamp = formatDuration(sessionDuration);
    
    switch (command) {
      case 'start':
        if (sessionStatus === 'idle') {
          startSession();
          pauseLock('Treatment session active');
          toast.success('Session started via voice command');
        }
        break;
      case 'stop':
        if (sessionStatus === 'running' || sessionStatus === 'paused') {
          endSession();
          resumeLock();
          toast.success('Session ended via voice command');
        }
        break;
      case 'pause':
        if (sessionStatus === 'running') {
          pauseSession();
          toast.info('Session paused via voice command');
        }
        break;
      case 'resume':
        if (sessionStatus === 'paused') {
          resumeSession();
          toast.info('Session resumed via voice command');
        }
        break;
      case 'reset':
        resetSession();
        toast.info('Session reset via voice command');
        break;
      case 'timestamp':
        setNotes(sessionNotes + `\n📍 [${timestamp}] `);
        toast.success(`Timestamp added at ${timestamp}`);
        break;
      case 'feeling-better':
        setNotes(sessionNotes + `\n✅ Patient feeling better`);
        toast.success('Status tag added');
        break;
      case 'needs-followup':
        setNotes(sessionNotes + `\n⚠️ Patient needs follow-up`);
        toast.success('Status tag added');
        break;
      // Recording voice commands
      case 'start-recording':
        if (recordingModuleRef.current && !recordingModuleRef.current.isRecording()) {
          recordingModuleRef.current.startRecording();
          toast.success('🎙️ Recording started via voice command');
        } else if (recordingModuleRef.current?.isRecording()) {
          toast.info('Recording already in progress');
        }
        break;
      case 'stop-recording':
        if (recordingModuleRef.current?.isRecording()) {
          recordingModuleRef.current.stopRecording();
          toast.success('⏹️ Recording stopped via voice command');
        } else {
          toast.info('No recording in progress');
        }
        break;
      case 'generate-summary':
        if (recordingModuleRef.current) {
          recordingModuleRef.current.generateSummary();
          toast.success('🧠 Generating AI summary via voice command');
        }
        break;
      // AI Cue voice commands
      case 'objection-detected':
        setNotes(sessionNotes + `\n🚫 [${timestamp}] Objection detected`);
        setShowAISuggestions(true);
        toast.info('🚫 Objection logged - AI suggestions activated');
        break;
      case 'positive-signal':
        setNotes(sessionNotes + `\n✅ [${timestamp}] Positive buying signal`);
        toast.success('✅ Positive signal logged');
        break;
      case 'resistance-detected':
        setNotes(sessionNotes + `\n⚠️ [${timestamp}] Resistance detected`);
        setShowAISuggestions(true);
        toast.info('⚠️ Resistance logged - Check AI suggestions');
        break;
      case 'red-flag':
        setNotes(sessionNotes + `\n🚨 [${timestamp}] RED FLAG - Do NOT proceed`);
        setShowAISuggestions(true);
        haptic.heavy();
        toast.error('🚨 Red flag logged - Review ethical guidelines');
        break;
      case 'closing-time':
        setNotes(sessionNotes + `\n🎯 [${timestamp}] Ready for trial close`);
        toast.success('🎯 Closing time marked');
        break;
      case 'fear-objection':
        setNotes(sessionNotes + `\n😰 [${timestamp}] Fear objection (needles/pain)`);
        setShowAISuggestions(true);
        toast.info('😰 Fear objection logged - Show needle demo');
        break;
      case 'cost-objection':
        setNotes(sessionNotes + `\n💰 [${timestamp}] Cost objection`);
        setShowAISuggestions(true);
        toast.info('💰 Cost objection logged - Show ROI calculation');
        break;
      case 'time-objection':
        setNotes(sessionNotes + `\n⏰ [${timestamp}] Time objection`);
        setShowAISuggestions(true);
        toast.info('⏰ Time objection logged - Emphasize flexibility');
        break;
      case 'skepticism-objection':
        setNotes(sessionNotes + `\n🤔 [${timestamp}] Skepticism objection`);
        setShowAISuggestions(true);
        toast.info('🤔 Skepticism logged - Show research evidence');
        break;
    }
  }, [sessionStatus, sessionDuration, sessionNotes, startSession, endSession, pauseSession, resumeSession, resetSession, setNotes, pauseLock, resumeLock, haptic]);

  // Always-on voice commands using Web Speech API
  const alwaysOnVoiceCommands: VoiceCommand[] = useMemo(() => [
    // Session controls
    { patterns: COMMON_COMMAND_PATTERNS.start, action: () => handleVoiceCommand('start'), description: 'Start session', category: 'session' },
    { patterns: COMMON_COMMAND_PATTERNS.stop, action: () => handleVoiceCommand('stop'), description: 'End session', category: 'session' },
    { patterns: COMMON_COMMAND_PATTERNS.pause, action: () => handleVoiceCommand('pause'), description: 'Pause session', category: 'session' },
    { patterns: COMMON_COMMAND_PATTERNS.resume, action: () => handleVoiceCommand('resume'), description: 'Resume session', category: 'session' },
    { patterns: COMMON_COMMAND_PATTERNS.reset, action: () => handleVoiceCommand('reset'), description: 'Reset session', category: 'session' },
    { patterns: ['timestamp', 'חותמת זמן', 'mark', 'סמן'], action: () => handleVoiceCommand('timestamp'), description: 'Add timestamp', category: 'session' },
    
    // Navigation & dialogs
    { patterns: ['calendar', 'יומן', 'appointment', 'תור'], action: () => setShowQuickAppointment(true), description: 'Open calendar', category: 'navigation' },
    { patterns: ['patient', 'מטופל', 'add patient'], action: () => setShowQuickPatient(true), description: 'Quick patient', category: 'navigation' },
    { patterns: ['zoom', 'זום', 'video call'], action: () => setShowZoomInvite(true), description: 'Zoom invite', category: 'navigation' },
    { patterns: ['report', 'דוח', 'summary', 'סיכום'], action: () => setShowSessionReport(true), description: 'Session report', category: 'navigation' },
    { patterns: ['follow up', 'מעקב', 'followup'], action: () => setShowFollowUpPlan(true), description: 'Follow-up plan', category: 'navigation' },
    { patterns: ['settings', 'הגדרות'], action: () => setShowSettings(true), description: 'Open settings', category: 'navigation' },
    { patterns: ['brain', 'מוח', 'tcm', 'ai'], action: () => setShowTcmBrainPanel(true), description: 'Open TCM Brain', category: 'ai' },
    { patterns: ['anxiety', 'חרדה', 'qa', 'questions'], action: () => setShowAnxietyQA(true), description: 'Anxiety Q&A', category: 'ai' },
    { patterns: ['guide', 'מדריך', 'teleprompter'], action: () => setShowSessionGuide(true), description: 'Session guide', category: 'navigation' },
    { patterns: ['music', 'מוזיקה'], action: () => setShowMusicPlayer(!showMusicPlayer), description: 'Toggle music', category: 'utility' },
    { patterns: COMMON_COMMAND_PATTERNS.help, action: () => setShowHelpGuide(true), description: 'Open help', category: 'utility' },
    { patterns: COMMON_COMMAND_PATTERNS.print, action: () => window.print(), description: 'Print', category: 'utility' },
    
    // Status tags
    { patterns: ['feeling better', 'מרגיש טוב', 'better'], action: () => handleVoiceCommand('feeling-better'), description: 'Patient feeling better', category: 'session' },
    { patterns: ['needs followup', 'צריך מעקב', 'follow up needed'], action: () => handleVoiceCommand('needs-followup'), description: 'Needs follow-up', category: 'session' },
    
    // Recording
    { patterns: ['start recording', 'התחל הקלטה', 'record'], action: () => handleVoiceCommand('start-recording'), description: 'Start recording', category: 'utility' },
    { patterns: ['stop recording', 'עצור הקלטה'], action: () => handleVoiceCommand('stop-recording'), description: 'Stop recording', category: 'utility' },
    
    // TCM-specific commands
    { patterns: ['qi stagnation', 'קי סטגנציה', 'liver qi'], action: () => {
      const ts = formatDuration(sessionDuration);
      setNotes(sessionNotes + `\n🔄 [${ts}] TCM Pattern: Liver Qi Stagnation`);
      haptic.success();
    }, description: 'Add Qi stagnation note', category: 'ai' },
    { patterns: ['blood stasis', 'סטזיס דם', 'דם קפוא'], action: () => {
      const ts = formatDuration(sessionDuration);
      setNotes(sessionNotes + `\n🩸 [${ts}] TCM Pattern: Blood Stasis`);
      haptic.success();
    }, description: 'Add Blood stasis note', category: 'ai' },
    { patterns: ['yin deficiency', 'חסר יין', 'יין'], action: () => {
      const ts = formatDuration(sessionDuration);
      setNotes(sessionNotes + `\n🌙 [${ts}] TCM Pattern: Yin Deficiency`);
      haptic.success();
    }, description: 'Add Yin deficiency note', category: 'ai' },
    { patterns: ['yang deficiency', 'חסר יאנג', 'יאנג'], action: () => {
      const ts = formatDuration(sessionDuration);
      setNotes(sessionNotes + `\n☀️ [${ts}] TCM Pattern: Yang Deficiency`);
      haptic.success();
    }, description: 'Add Yang deficiency note', category: 'ai' },
    { patterns: ['dampness', 'לחות', 'phlegm', 'ליחה'], action: () => {
      const ts = formatDuration(sessionDuration);
      setNotes(sessionNotes + `\n💧 [${ts}] TCM Pattern: Dampness/Phlegm`);
      haptic.success();
    }, description: 'Add Dampness note', category: 'ai' },
    { patterns: ['heat', 'חום', 'fire', 'אש'], action: () => {
      const ts = formatDuration(sessionDuration);
      setNotes(sessionNotes + `\n🔥 [${ts}] TCM Pattern: Heat/Fire`);
      haptic.success();
    }, description: 'Add Heat pattern note', category: 'ai' },
    { patterns: ['cold', 'קור', 'cold pattern'], action: () => {
      const ts = formatDuration(sessionDuration);
      setNotes(sessionNotes + `\n❄️ [${ts}] TCM Pattern: Cold`);
      haptic.success();
    }, description: 'Add Cold pattern note', category: 'ai' },
    { patterns: ['wind', 'רוח', 'external wind'], action: () => {
      const ts = formatDuration(sessionDuration);
      setNotes(sessionNotes + `\n🌬️ [${ts}] TCM Pattern: Wind`);
      haptic.success();
    }, description: 'Add Wind pattern note', category: 'ai' },
    { patterns: ['kidney', 'כליות', 'kidney deficiency'], action: () => {
      const ts = formatDuration(sessionDuration);
      setNotes(sessionNotes + `\n🫘 [${ts}] Organ: Kidney involvement`);
      haptic.success();
    }, description: 'Add Kidney note', category: 'ai' },
    { patterns: ['spleen', 'טחול', 'spleen qi'], action: () => {
      const ts = formatDuration(sessionDuration);
      setNotes(sessionNotes + `\n🟤 [${ts}] Organ: Spleen Qi Deficiency`);
      haptic.success();
    }, description: 'Add Spleen note', category: 'ai' },
    { patterns: ['liver', 'כבד', 'liver fire'], action: () => {
      const ts = formatDuration(sessionDuration);
      setNotes(sessionNotes + `\n🟢 [${ts}] Organ: Liver involvement`);
      haptic.success();
    }, description: 'Add Liver note', category: 'ai' },
    { patterns: ['heart', 'לב', 'heart fire'], action: () => {
      const ts = formatDuration(sessionDuration);
      setNotes(sessionNotes + `\n❤️ [${ts}] Organ: Heart involvement`);
      haptic.success();
    }, description: 'Add Heart note', category: 'ai' },
    { patterns: ['lung', 'ריאות', 'lung qi'], action: () => {
      const ts = formatDuration(sessionDuration);
      setNotes(sessionNotes + `\n🫁 [${ts}] Organ: Lung involvement`);
      haptic.success();
    }, description: 'Add Lung note', category: 'ai' },
    
    // Treatment commands
    { patterns: ['acupuncture', 'דיקור', 'needles', 'מחטים'], action: () => {
      const ts = formatDuration(sessionDuration);
      setNotes(sessionNotes + `\n📍 [${ts}] Treatment: Acupuncture applied`);
      haptic.success();
    }, description: 'Add acupuncture note', category: 'ai' },
    { patterns: ['moxa', 'מוקסה', 'moxibustion'], action: () => {
      const ts = formatDuration(sessionDuration);
      setNotes(sessionNotes + `\n🔥 [${ts}] Treatment: Moxibustion applied`);
      haptic.success();
    }, description: 'Add moxa note', category: 'ai' },
    { patterns: ['cupping', 'כוסות רוח', 'cups'], action: () => {
      const ts = formatDuration(sessionDuration);
      setNotes(sessionNotes + `\n⭕ [${ts}] Treatment: Cupping applied`);
      haptic.success();
    }, description: 'Add cupping note', category: 'ai' },
    { patterns: ['tuina', 'טואינה', 'massage'], action: () => {
      const ts = formatDuration(sessionDuration);
      setNotes(sessionNotes + `\n✋ [${ts}] Treatment: Tuina/Massage applied`);
      haptic.success();
    }, description: 'Add Tuina note', category: 'ai' },
    { patterns: ['herbs', 'צמחים', 'herbal', 'formula'], action: () => {
      const ts = formatDuration(sessionDuration);
      setNotes(sessionNotes + `\n🌿 [${ts}] Treatment: Herbal formula prescribed`);
      haptic.success();
    }, description: 'Add herbs note', category: 'ai' },
    
    // Pulse & tongue
    { patterns: ['pulse wiry', 'דופק מתוח', 'wiry'], action: () => {
      const ts = formatDuration(sessionDuration);
      setNotes(sessionNotes + `\n💓 [${ts}] Pulse: Wiry (弦 xián)`);
      haptic.success();
    }, description: 'Add wiry pulse', category: 'ai' },
    { patterns: ['pulse slippery', 'דופק חלק', 'slippery'], action: () => {
      const ts = formatDuration(sessionDuration);
      setNotes(sessionNotes + `\n💓 [${ts}] Pulse: Slippery (滑 huá)`);
      haptic.success();
    }, description: 'Add slippery pulse', category: 'ai' },
    { patterns: ['pulse weak', 'דופק חלש', 'weak pulse'], action: () => {
      const ts = formatDuration(sessionDuration);
      setNotes(sessionNotes + `\n💓 [${ts}] Pulse: Weak/Empty (虚 xū)`);
      haptic.success();
    }, description: 'Add weak pulse', category: 'ai' },
    { patterns: ['tongue pale', 'לשון חיוורת', 'pale tongue'], action: () => {
      const ts = formatDuration(sessionDuration);
      setNotes(sessionNotes + `\n👅 [${ts}] Tongue: Pale body`);
      haptic.success();
    }, description: 'Add pale tongue', category: 'ai' },
    { patterns: ['tongue red', 'לשון אדומה', 'red tongue'], action: () => {
      const ts = formatDuration(sessionDuration);
      setNotes(sessionNotes + `\n👅 [${ts}] Tongue: Red body (Heat)`);
      haptic.success();
    }, description: 'Add red tongue', category: 'ai' },
    { patterns: ['thick coating', 'ציפוי עבה', 'greasy coating'], action: () => {
      const ts = formatDuration(sessionDuration);
      setNotes(sessionNotes + `\n👅 [${ts}] Tongue: Thick/Greasy coating (Dampness)`);
      haptic.success();
    }, description: 'Add thick coating', category: 'ai' },
  ], [handleVoiceCommand, showMusicPlayer, sessionDuration, sessionNotes, setNotes, haptic]);

  // Voice command recognition callback with audio feedback
  const handleVoiceRecognized = useCallback((transcript: string, matched: VoiceCommand | null) => {
    // Clear any existing timeout
    if (voiceFeedbackTimeoutRef.current) {
      clearTimeout(voiceFeedbackTimeoutRef.current);
    }
    
    // Play audio feedback
    if (matched) {
      voiceAudio.playSuccess();
    } else {
      voiceAudio.playFailure();
    }
    
    // Set feedback
    setVoiceFeedback({
      text: transcript,
      matched: !!matched,
      description: matched?.description,
    });
    
    // Auto-hide after 3 seconds
    voiceFeedbackTimeoutRef.current = setTimeout(() => {
      setVoiceFeedback(null);
    }, 3000);
  }, [voiceAudio]);

  // Play audio when voice listening starts/stops
  const handleToggleAlwaysOnVoice = useCallback(() => {
    if (!voiceAlwaysOn) {
      voiceAudio.playListeningStart();
    } else {
      voiceAudio.playListeningStop();
    }
    setVoiceAlwaysOn(!voiceAlwaysOn);
  }, [voiceAlwaysOn, voiceAudio]);

  const { isListening: isAlwaysOnListening, isSupported: isVoiceSupported, toggleListening: toggleAlwaysOnVoice, lastCommand } = useVoiceCommands({
    commands: alwaysOnVoiceCommands,
    enabled: voiceAlwaysOn,
    language: 'he-IL',
    showToasts: false, // We'll handle feedback visually
    onCommandRecognized: handleVoiceRecognized,
  });

  // Check access
  // Clock update effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!tier) {
      navigate('/gate');
    } else if (!hasFeature('video_sessions')) {
      toast.error('אין גישה לפגישות וידאו - שדרגו את התוכנית');
      navigate('/dashboard');
    }
  }, [tier, hasFeature, navigate]);

  // Audio alert function
  const playAlertSound = useCallback(() => {
    if (!getAudioAlertsEnabled()) return;
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playBeep = (startTime: number, frequency: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
      };
      const now = audioContext.currentTime;
      playBeep(now, 880);
      playBeep(now + 0.4, 880);
      playBeep(now + 0.8, 1100);
    } catch (err) {
      console.error('Could not play audio alert:', err);
    }
  }, []);

  // Fetch patients
  const fetchPatients = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, phone')
        .eq('therapist_id', user.id)
        .order('full_name');
      if (error) throw error;
      setPatients(data || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoadingPatients(false);
      setRefreshingPatients(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Handle newPatientId from URL param (after creating new patient from intake form)
  useEffect(() => {
    const newPatientId = searchParams.get('newPatientId');
    if (newPatientId && patients.length > 0) {
      const patient = patients.find(p => p.id === newPatientId);
      if (patient) {
        setPatient({ id: patient.id, name: patient.full_name, phone: patient.phone || undefined });
        toast.success(`${patient.full_name} נבחר אוטומטית`);
        // Clear the param from URL
        setSearchParams({}, { replace: true });
      }
    }
  }, [patients, searchParams, setPatient, setSearchParams]);

  // Zoom warning
  useEffect(() => {
    if (sessionStatus === 'running' && sessionDuration >= ZOOM_WARNING_SECONDS && !warningShownRef.current) {
      warningShownRef.current = true;
      playAlertSound();
      toast.warning('⚠️ נותרו 5 דקות! מגבלת Zoom חינם מתקרבת', { duration: 10000 });
    }
  }, [sessionDuration, sessionStatus, playAlertSound]);

  // Session time alerts at 30 and 35 minutes with haptic feedback
  useEffect(() => {
    if (sessionStatus === 'running') {
      // 30 minute alert
      if (sessionDuration >= SESSION_ALERT_30_MIN && sessionDuration < SESSION_ALERT_30_MIN + 2 && !alert30ShownRef.current) {
        alert30ShownRef.current = true;
        haptic.warning();
        playAlertSound();
        toast.info('⏰ 30 minutes - Session halfway point', { 
          duration: 5000,
          icon: '🕐'
        });
      }
      // 35 minute alert
      if (sessionDuration >= SESSION_ALERT_35_MIN && sessionDuration < SESSION_ALERT_35_MIN + 2 && !alert35ShownRef.current) {
        alert35ShownRef.current = true;
        haptic.heavy();
        playAlertSound();
        toast.warning('⏰ 35 minutes - Consider wrapping up', { 
          duration: 8000,
          icon: '⚠️'
        });
      }
    }
  }, [sessionDuration, sessionStatus, haptic, playAlertSound]);

  // Reset alert refs when session is reset
  useEffect(() => {
    if (sessionStatus === 'idle' || sessionDuration < ZOOM_WARNING_SECONDS) {
      warningShownRef.current = false;
    }
    if (sessionStatus === 'idle' || sessionDuration < SESSION_ALERT_30_MIN) {
      alert30ShownRef.current = false;
    }
    if (sessionStatus === 'idle' || sessionDuration < SESSION_ALERT_35_MIN) {
      alert35ShownRef.current = false;
    }
  }, [sessionStatus, sessionDuration]);

  const handleRefreshPatients = async () => {
    setRefreshingPatients(true);
    await fetchPatients();
    toast.success('רשימת המטופלים עודכנה');
  };

  const handlePatientCreated = (patientId: string, patientName: string) => {
    fetchPatients().then(() => {
      setPatient({ id: patientId, name: patientName });
      toast.success(`${patientName} נוסף ונבחר`);
    });
  };

  const handleExtendZoomTimer = () => {
    resetDuration();
    warningShownRef.current = false;
    toast.success('טיימר Zoom אופס - 40 דקות נוספות');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getZoomTimeRemaining = () => {
    const remaining = ZOOM_FREE_LIMIT_SECONDS - sessionDuration;
    if (remaining <= 0) return '00:00';
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getZoomProgress = () => Math.min((sessionDuration / ZOOM_FREE_LIMIT_SECONDS) * 100, 100);
  const isZoomWarning = sessionDuration >= ZOOM_WARNING_SECONDS;
  const isZoomExpired = sessionDuration >= ZOOM_FREE_LIMIT_SECONDS;

  const handleStart = () => {
    startSession();
    pauseLock('Treatment session active'); // Pause auto-lock during session
    playSessionSound('start', audioEnabled);
    triggerSessionHaptic('start');
    toast.success('פגישת וידאו התחילה');
  };

  const handlePause = () => {
    pauseSession();
    playSessionSound('warning', audioEnabled);
    triggerSessionHaptic('medium');
    toast.info('הפגישה הושהתה');
  };

  const handleResume = () => {
    resumeSession();
    playSessionSound('click', audioEnabled);
    triggerSessionHaptic('light');
    toast.info('הפגישה ממשיכה');
  };

  const handleRepeat = () => {
    resetSession();
    resumeLock(); // Resume auto-lock when session is reset
    setCurrentAppointmentId(null);
    playSessionSound('click', audioEnabled);
    triggerSessionHaptic('medium');
    toast.info('הפגישה אופסה');
  };

  const handleEnd = async () => {
    endSession();
    resumeLock(); // Resume auto-lock after session ends
    playSessionSound('stop', audioEnabled);
    triggerSessionHaptic('heavy');
    
    if (selectedPatientId && selectedPatientName && user && sessionStartTime) {
      try {
        await supabase.from('video_sessions').insert({
          therapist_id: user.id,
          patient_id: selectedPatientId,
          started_at: new Date(sessionStartTime).toISOString(),
          ended_at: new Date().toISOString(),
          duration_seconds: sessionDuration,
          notes: sessionNotes + (anxietyConversation.length > 0 
            ? '\n\n--- שאלון חרדה ---\n' + anxietyConversation.join('\n') : ''),
          anxiety_qa_responses: anxietyConversation.length > 0 ? anxietyConversation : null,
        });
      } catch (error) {
        console.error('Error saving video session:', error);
      }
      if (currentAppointmentId) {
        try {
          await supabase.from('appointments').update({ status: 'completed' }).eq('id', currentAppointmentId);
          toast.success('הפגישה ביומן סומנה כהושלמה');
        } catch (error) {
          console.error('Error updating appointment:', error);
        }
      }
    }
    if (selectedPatientId && selectedPatientName) {
      saveSessionReport({
        patientId: selectedPatientId,
        patientName: selectedPatientName,
        visitDate: new Date().toISOString(),
        notes: sessionNotes + (anxietyConversation.length > 0 
          ? '\n\n--- שאלון חרדה ---\n' + anxietyConversation.join('\n') : ''),
        cupping: false,
        moxa: false,
      });
      playSessionSound('success', audioEnabled);
      toast.success('הפגישה נשמרה');
    } else {
      playSessionSound('warning', audioEnabled);
      toast.warning('לא נבחר מטופל - הדוח לא נשמר');
    }
  };

  const handlePatientSelect = (patientId: string) => {
    if (patientId === 'none') {
      setPatient(null);
      return;
    }
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setPatient({ id: patient.id, name: patient.full_name, phone: patient.phone || undefined });
    }
  };

  const handlePrint = () => {
    if (selectedPatientId && selectedPatientName) {
      const report: LocalSessionReport = {
        id: `temp_${Date.now()}`,
        patientId: selectedPatientId,
        patientName: selectedPatientName,
        visitDate: new Date().toISOString(),
        notes: sessionNotes,
        cupping: false,
        moxa: false,
        savedAt: new Date().toISOString(),
      };
      printReport(report);
    } else {
      toast.error('בחר מטופל להדפסת דוח');
    }
  };

  const handleSendEmail = () => toast.info('שליחת דוח באימייל - בקרוב');

  const handleSendWhatsApp = () => {
    if (!selectedPatientName) {
      toast.error('בחר מטופל קודם');
      return;
    }
    const message = encodeURIComponent(
      `דוח טיפול - ${selectedPatientName}\nתאריך: ${new Date().toLocaleDateString('he-IL')}\nמשך: ${formatDuration(sessionDuration)}\n\nהערות: ${sessionNotes}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleCalendarInviteCreated = (appointmentId: string) => {
    setCurrentAppointmentId(appointmentId);
    toast.success('הפגישה נוספה ליומן');
  };

  const handleCancelCalendarBlock = async () => {
    if (!currentAppointmentId) return;
    setIsCancellingBlock(true);
    try {
      await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', currentAppointmentId);
      setCurrentAppointmentId(null);
      toast.success('החסימה ביומן בוטלה');
    } catch (error) {
      toast.error('שגיאה בביטול החסימה');
    } finally {
      setIsCancellingBlock(false);
    }
  };

  const getSessionStartTimeDisplay = () => {
    if (!sessionStartTime) return null;
    return new Date(sessionStartTime).toLocaleString('he-IL', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  };

  // Handle QA type dropdown selection
  const handleQATypeSelect = (type: QAType) => {
    setSelectedQAType(type);
    switch (type) {
      case 'anxiety':
        setShowAnxietyQA(true);
        break;
      case 'tcm-brain':
        setShowTcmBrainPanel(true);
        break;
      case 'diagnostics':
        setActiveAiQuery('diagnosis');
        break;
      case 'general':
        setShowAnxietyQA(true);
        break;
    }
  };

  // Reset QA type selection
  const handleQATypeReset = () => {
    setSelectedQAType(null);
    setShowAnxietyQA(false);
    setShowTcmBrainPanel(false);
    if (activeAiQuery === 'diagnosis') {
      setActiveAiQuery(null);
    }
    toast.info('Q&A selection reset', { description: 'איפוס בחירת שאלון' });
  };

  // AI Query handler - sends to tcm-rag-chat function
  const handleAiQuery = async (type: 'nutrition' | 'herbs' | 'diagnosis' | 'mental' | 'sleep' | 'worklife' | 'wellness' | 'sports' | 'bazi' | 'astro' | 'points') => {
    if (!aiQueryInput.trim()) {
      toast.error('Please enter a question');
      return;
    }
    setAiQueryLoading(true);
    playSessionSound('click', audioEnabled);
    triggerSessionHaptic('light');
    
    // Track usage
    addVideoSessionUsage(type, aiQueryInput);
    
    try {
      const { data, error } = await supabase.functions.invoke('tcm-rag-chat', {
        body: { 
          message: aiQueryInput,
          context: type,
          patientName: selectedPatientName
        }
      });
      if (error) throw error;
      setAiQueryResult(data?.response || 'No response received');
      playSessionSound('success', audioEnabled);
      triggerSessionHaptic('success');
    } catch (error) {
      console.error('AI Query error:', error);
      playSessionSound('error', audioEnabled);
      triggerSessionHaptic('error');
      toast.error('Error sending question to AI');
    } finally {
      setAiQueryLoading(false);
    }
  };

  // Anxiety Q&A inline handler
  const handleAnxietyQuestion = async () => {
    if (!anxietyInput.trim()) return;
    
    const userMessage = { role: 'user' as const, content: anxietyInput };
    setInlineAnxietyMessages(prev => [...prev, userMessage]);
    setAnxietyInput('');
    setAiQueryLoading(true);
    playSessionSound('click', audioEnabled);
    triggerSessionHaptic('light');
    
    // Track usage
    addVideoSessionUsage('anxiety', anxietyInput);
    
    try {
      const { data, error } = await supabase.functions.invoke('tcm-rag-chat', {
        body: { 
          message: anxietyInput,
          context: 'anxiety',
          patientName: selectedPatientName,
          history: inlineAnxietyMessages
        }
      });
      if (error) throw error;
      const assistantMessage = { role: 'assistant' as const, content: data?.response || 'לא התקבלה תשובה' };
      setInlineAnxietyMessages(prev => [...prev, assistantMessage]);
      playSessionSound('success', audioEnabled);
    } catch (error) {
      console.error('Anxiety Q&A error:', error);
      playSessionSound('error', audioEnabled);
      toast.error('שגיאה בשליחת השאלה');
    } finally {
      setAiQueryLoading(false);
    }
  };

  if (!tier || !hasFeature('video_sessions')) return null;

  return (
    <SessionTimerProvider>
      <Helmet>
        <title>פגישת וידאו | TCM Clinic</title>
        <meta name="description" content="ניהול פגישת וידאו עם מטופלים" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col relative" dir="rtl">
        {/* Milestone Celebrations with confetti */}
        <MilestoneCelebration 
          sessionDuration={sessionDuration} 
          sessionStatus={sessionStatus} 
        />
        
        {/* Swipe-down Status Tags - Mobile only */}
        <SwipeStatusTags 
          onAddTag={(tag) => setNotes(sessionNotes + tag)}
          sessionStatus={sessionStatus}
        />
        
        {/* Voice Command System - Mobile only */}
        <VoiceCommandSystem
          onCommand={handleVoiceCommand}
          isSessionActive={sessionStatus === 'running' || sessionStatus === 'paused'}
        />
        
        {/* Floating Voice Feedback Indicator */}
        {voiceAlwaysOn && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            {/* Listening indicator */}
            {isAlwaysOnListening && !voiceFeedback && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-jade/90 text-jade-foreground shadow-lg backdrop-blur-sm animate-pulse">
                <Mic className="h-4 w-4" />
                <span className="text-sm font-medium">Listening...</span>
                <div className="flex gap-0.5">
                  <span className="w-1 h-3 bg-jade-foreground/60 rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" />
                  <span className="w-1 h-4 bg-jade-foreground/80 rounded-full animate-[pulse_0.6s_ease-in-out_infinite_0.1s]" />
                  <span className="w-1 h-2 bg-jade-foreground/60 rounded-full animate-[pulse_0.6s_ease-in-out_infinite_0.2s]" />
                </div>
              </div>
            )}
            
            {/* Command feedback */}
            {voiceFeedback && (
              <div 
                className={cn(
                  "px-4 py-3 rounded-xl shadow-xl backdrop-blur-sm animate-scale-in max-w-[300px]",
                  voiceFeedback.matched 
                    ? "bg-jade/95 text-jade-foreground" 
                    : "bg-muted/95 text-foreground border border-border"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  {voiceFeedback.matched ? (
                    <>
                      <div className="w-6 h-6 rounded-full bg-jade-foreground/20 flex items-center justify-center">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide">Command Recognized</span>
                    </>
                  ) : (
                    <>
                      <div className="w-6 h-6 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                        <Mic className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">Heard</span>
                    </>
                  )}
                </div>
                <p className="text-sm font-medium truncate">"{voiceFeedback.text}"</p>
                {voiceFeedback.matched && voiceFeedback.description && (
                  <p className="text-xs mt-1 opacity-80">→ {voiceFeedback.description}</p>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Paused Dimming Overlay */}
        {sessionStatus === 'paused' && (
          <div 
            className={cn(
              'fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity duration-300 pointer-events-none',
              'flex items-center justify-center'
            )}
          >
            <div className="text-center pointer-events-auto">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center animate-pulse">
                <Pause className="h-10 w-10 text-amber-500" />
              </div>
              <p className="text-xl font-semibold text-foreground">Session Paused</p>
              <p className="text-sm text-muted-foreground mt-1">
                {isBackgroundPaused ? 'Auto-paused when app went to background' : 'Tap Resume to continue'}
              </p>
              <Button 
                onClick={resumeSession} 
                className="mt-4 bg-jade hover:bg-jade/90"
              >
                <Play className="h-4 w-4 mr-2" />
                Resume Session
              </Button>
            </div>
          </div>
        )}

        {/* Floating Session Timer - Mobile only */}
        <FloatingSessionTimer
          status={sessionStatus}
          duration={sessionDuration}
          patientName={selectedPatientName}
        />
        
        {/* Header - Optimized for mobile - ALWAYS sticky */}
        <header className="bg-card border-b border-border sticky top-0 z-50">
          <div className="max-w-full mx-auto px-3 md:px-4 py-2 md:py-4 relative flex items-center justify-between">
            {/* Mobile: Back button + Logo */}
            <div className="flex items-center gap-1 md:gap-4">
              <CrossPlatformBackButton 
                fallbackPath="/dashboard" 
                variant="ghost" 
                size="icon"
                className="md:hidden h-9 w-9"
              />
              <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-jade-light rounded-full flex items-center justify-center">
                  <Leaf className="h-4 w-4 md:h-5 md:w-5 text-jade" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="font-display text-lg md:text-xl">TCM Clinic</h1>
                  <p className="text-xs md:text-sm text-muted-foreground">פגישת וידאו</p>
                </div>
              </Link>
            </div>

            {/* Mobile Workflow Indicator - Above patient selector */}
            <div className="md:hidden absolute top-full left-0 right-0 px-2 py-1 bg-background/95 backdrop-blur-sm border-b">
              <SessionWorkflowIndicator
                hasPatient={!!selectedPatientId}
                isSessionStarted={sessionStatus !== 'idle'}
                isRecording={recordingModuleRef.current?.isRecording() || false}
                guideCompleted={guideCompleted}
                hasNotes={sessionNotes.length > 10}
              />
            </div>

            {/* Mobile Quick Access Bar: Patient → History → Start → Record → Settings */}
            <div className="flex md:hidden items-center gap-1 flex-1 mx-1 overflow-x-auto scrollbar-hide mt-10">
              {/* 1. Patient Selector */}
              <Select
                value={selectedPatientId || 'none'}
                onValueChange={handlePatientSelect}
                disabled={loadingPatients}
              >
                <SelectTrigger className="w-[110px] bg-background h-8 text-xs shrink-0">
                  <SelectValue placeholder={loadingPatients ? "טוען..." : "מטופל"} />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-lg z-50">
                  <SelectItem value="none">ללא מטופל</SelectItem>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* 2. Patient History */}
              {selectedPatientId && (
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-8 w-8 shrink-0 touch-manipulation border-blue-300 text-blue-600"
                  onClick={() => navigate(`/crm/patients/${selectedPatientId}`)}
                  title="היסטוריית מטופל"
                >
                  <Users className="h-4 w-4" />
                </Button>
              )}
              
              {/* 3. Start/Reset Meeting */}
              {(sessionStatus === 'idle' || sessionStatus === 'ended') ? (
                <Button 
                  onClick={handleStart}
                  size="sm"
                  className="h-8 px-2 bg-jade hover:bg-jade/90 gap-1 shrink-0 touch-manipulation"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span className="text-[10px]">התחל</span>
                </Button>
              ) : (
                <Button 
                  onClick={handleRepeat}
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 shrink-0 touch-manipulation border-jade text-jade"
                  title="אפס"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              )}
              
              {/* 4. Record */}
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 shrink-0 touch-manipulation border-rose-300 text-rose-600" 
                onClick={() => recordingModuleRef.current?.isRecording() 
                  ? recordingModuleRef.current?.stopRecording() 
                  : recordingModuleRef.current?.startRecording()}
                title="הקלטה"
              >
                <Video className="h-3.5 w-3.5" />
              </Button>
              
              {/* 5. Settings */}
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 shrink-0 touch-manipulation" 
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
              
              {/* 6. Always-On Voice - Mobile */}
              <Button 
                size="icon" 
                className={cn(
                  "h-8 w-8 shrink-0 touch-manipulation transition-all",
                  voiceAlwaysOn 
                    ? "bg-jade text-jade-foreground animate-pulse" 
                    : "bg-muted text-muted-foreground"
                )}
                onClick={handleToggleAlwaysOnVoice}
                disabled={!isVoiceSupported}
                title={voiceAlwaysOn ? "Voice commands active" : "Enable voice commands"}
              >
                <Mic className="h-3.5 w-3.5" />
              </Button>
              
              {/* 7. Voice Cheat Sheet - Mobile */}
              <VoiceCommandCheatSheet 
                isListening={isAlwaysOnListening}
                onToggleVoice={handleToggleAlwaysOnVoice}
                className="h-8 px-2"
              />
              
              {/* 8. Help - Mobile */}
              <Button 
                size="icon" 
                className="h-8 w-8 shrink-0 touch-manipulation bg-gradient-to-br from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600" 
                onClick={() => setShowHelpGuide(true)}
              >
                <HelpCircle className="h-3.5 w-3.5 text-amber-900" />
              </Button>
            </div>

            {/* Help + Voice + Clock - Desktop only */}
            <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2">
              {/* Always-On Voice Toggle - Desktop */}
              <Button
                onClick={handleToggleAlwaysOnVoice}
                size="icon"
                disabled={!isVoiceSupported}
                className={cn(
                  'h-12 w-12 rounded-full shadow-lg transition-all duration-300 hover:scale-110',
                  voiceAlwaysOn 
                    ? 'bg-jade text-jade-foreground ring-2 ring-jade/40 animate-pulse' 
                    : 'bg-muted hover:bg-muted/80'
                )}
                title={voiceAlwaysOn ? "🎤 Voice active - say commands" : "Enable always-on voice"}
              >
                <Mic className="h-6 w-6" />
              </Button>

              {/* Voice Command Cheat Sheet - Desktop */}
              <VoiceCommandCheatSheet 
                isListening={isAlwaysOnListening}
                onToggleVoice={handleToggleAlwaysOnVoice}
              />

              <Button
                onClick={() => setShowHelpGuide((v) => !v)}
                size="icon"
                className={cn(
                  'h-12 w-12 rounded-full shadow-lg',
                  'bg-gradient-to-br from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600',
                  'transition-all duration-300 hover:scale-110',
                  showHelpGuide ? 'ring-2 ring-amber-500/40' : ''
                )}
                title="עזרה / Help"
              >
                <HelpCircle className="h-6 w-6 text-amber-900" />
              </Button>

              <div className="relative h-20 w-20 rounded-full shadow-lg overflow-hidden">
                <img
                  src={clockImg}
                  alt="Session clock"
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <span className="text-lg font-bold text-white font-mono drop-shadow-lg">
                    {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher variant="outline" isScrolled={true} />
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard" className="gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <TierBadge />
            </div>
          </div>
        </header>

        {/* API Usage Meter Bar */}
        <div className="border-b bg-card/30 backdrop-blur-sm py-1.5 px-3 overflow-x-auto hidden md:block">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground text-[10px]">AI Status:</span>
              <VideoSessionAPIMeter />
            </div>
            <VideoSessionEngineIndicator isLoading={aiQueryLoading} />
          </div>
        </div>

        {/* Session Presets - Mobile only */}
        <div className="md:hidden px-3 pt-2">
          <SessionPresets
            sessionDuration={sessionDuration}
            sessionStatus={sessionStatus}
            onPresetSelect={setSessionPreset}
          />
        </div>

        {/* Session Phase Indicator - Unified workflow */}
        <div className="px-3 md:px-6 pt-3 pb-2 border-b bg-gradient-to-r from-jade/5 via-transparent to-jade/5">
          <SessionPhaseIndicator
            currentPhase={currentPhase}
            patientName={selectedPatientName}
            isManualOverride={isManualOverride}
            onResetToAuto={clearManualPhase}
            onPhaseClick={(phase) => {
              setPhase(phase);
              // Navigate to relevant action based on phase
              if (phase === 'opening' && selectedPatientId) {
                navigate(`/crm/patients/${selectedPatientId}`);
              } else if (phase === 'diagnosis') {
                setShowTcmBrainPanel(true);
              } else if (phase === 'treatment') {
                setActivePanel('notes');
              } else if (phase === 'closing') {
                setShowSessionReport(true);
              }
            }}
            className="max-w-2xl mx-auto"
          />
        </div>

        {/* Workflow Progress Indicator (legacy - task steps) */}
        <div className="px-3 md:px-4 pt-2 md:pt-3 hidden md:block">
          <SessionWorkflowIndicator
            hasPatient={!!selectedPatientId}
            isSessionStarted={sessionStatus !== 'idle'}
            isRecording={recordingModuleRef.current?.isRecording() || false}
            guideCompleted={guideCompleted}
            hasNotes={sessionNotes.length > 10}
          />
        </div>

        {/* Header Boxes with Circular Icons - Organized by Category with Separators */}
        <div className="px-3 md:px-4 pt-2 md:pt-4 pb-2 border-b bg-gradient-to-b from-jade/5 to-transparent">
          <VideoSessionHeaderBoxes
            groups={[
              {
                id: 'session-controls',
                boxes: [
                  {
                    id: 'new-meeting',
                    name: sessionStatus === 'idle' ? 'Start' : 'Reset',
                    nameHe: sessionStatus === 'idle' ? 'התחל' : 'איפוס',
                    icon: sessionStatus === 'idle' ? Play : RotateCcw,
                    color: 'text-jade',
                    borderColor: 'border-jade',
                    isActive: sessionStatus === 'running',
                    tooltip: sessionStatus === 'idle' ? 'Start a new session' : 'Reset and start fresh',
                    onClick: sessionStatus === 'idle' ? handleStart : handleRepeat,
                  },
                ],
              },
              {
                id: 'ai-diagnosis',
                boxes: [
                  {
                    id: 'ai-tips',
                    name: 'AI Brain',
                    nameHe: 'מוח AI',
                    icon: Brain,
                    color: 'text-purple-600',
                    borderColor: 'border-purple-300',
                    isActive: showAISuggestions || showTcmBrainPanel,
                    tooltip: 'Open TCM Brain AI assistant panel',
                    onClick: () => {
                      if (showTcmBrainPanel) setShowTcmBrainPanel(false);
                      else setShowTcmBrainPanel(true);
                    },
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
                    onClick: () => setShowAnxietyQA(!showAnxietyQA),
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
                    onClick: () => setShowSessionGuide(!showSessionGuide),
                  },
                ],
              },
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
                    onClick: () => navigate('/crm/calendar'),
                  },
                  {
                    id: 'calendar-invite',
                    name: 'Invite',
                    nameHe: 'הזמנה',
                    icon: CalendarPlus,
                    color: 'text-emerald-600',
                    borderColor: 'border-emerald-300',
                    tooltip: 'Send calendar invite to patient',
                    onClick: () => setShowCalendarInvite(true),
                  },
                  {
                    id: 'appointment',
                    name: 'Appoint',
                    nameHe: 'תור חדש',
                    icon: ClipboardList,
                    color: 'text-teal-600',
                    borderColor: 'border-teal-300',
                    tooltip: 'Schedule a new appointment',
                    onClick: () => setShowQuickAppointment(true),
                  },
                  {
                    id: 'followup',
                    name: 'Follow-up',
                    nameHe: 'המשך',
                    icon: ArrowRight,
                    color: 'text-jade',
                    borderColor: 'border-jade/50',
                    tooltip: 'Plan follow-up treatment',
                    onClick: () => setShowFollowUpPlan(true),
                  },
                ],
              },
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
                    onClick: () => setShowZoomInvite(true),
                  },
                ],
              },
              {
                id: 'utilities',
                boxes: [
                  {
                    id: 'report',
                    name: 'Report',
                    nameHe: 'דוח',
                    icon: FileText,
                    color: 'text-indigo-600',
                    borderColor: 'border-indigo-300',
                    tooltip: 'Generate session report',
                    onClick: () => setShowSessionReport(true),
                  },
                  {
                    id: 'music',
                    name: 'Music',
                    nameHe: 'מוזיקה',
                    icon: Music,
                    color: showMusicPlayer ? 'text-white' : 'text-amber-600',
                    borderColor: showMusicPlayer ? 'border-amber-500 bg-amber-500' : 'border-amber-300',
                    isActive: showMusicPlayer,
                    tooltip: 'Background music player',
                    onClick: () => setShowMusicPlayer(!showMusicPlayer),
                  },
                  {
                    id: 'accessibility',
                    name: 'Access',
                    nameHe: 'נגישות',
                    icon: Accessibility,
                    color: highContrast ? 'text-white' : 'text-jade',
                    borderColor: highContrast ? 'border-jade bg-jade' : 'border-jade/50',
                    isActive: highContrast,
                    tooltip: 'Toggle high contrast mode',
                    onClick: () => {
                      setHighContrast(!highContrast);
                      toast.success(highContrast ? 'ניגודיות רגילה' : 'ניגודיות גבוהה', { 
                        description: highContrast ? 'High contrast disabled' : 'High contrast enabled',
                        duration: 2000 
                      });
                    },
                  },
                ],
              },
            ]}
          />
          
          {/* CAF Asset Boxes - Customizable Toolbar */}
          <div className="mt-3 hidden md:block">
            <CustomizableToolbar
              activeQuery={activeAiQuery}
              onQueryChange={setActiveAiQuery}
            />
          </div>

          {/* Patient History Panel - Mobile only */}
          <div className="md:hidden mt-2">
            <PatientHistoryPanel 
              patientId={selectedPatientId} 
              patientName={selectedPatientName} 
            />
          </div>
        </div>

        {/* Inline Music Player */}
        {showMusicPlayer && (
          <div className="px-3 md:px-4 pb-2">
            <InlineMusicPlayer onClose={() => setShowMusicPlayer(false)} />
          </div>
        )}

        {/* AI Query Panel with Voice Input */}
        {activeAiQuery && (
          <div className="px-4 pb-2">
            <Card className="border-jade/30 bg-jade/5 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  {activeAiQuery === 'nutrition' && <Apple className="h-5 w-5 text-green-600" />}
                  {activeAiQuery === 'herbs' && <Leaf className="h-5 w-5 text-amber-600" />}
                  {activeAiQuery === 'diagnosis' && <Stethoscope className="h-5 w-5 text-purple-600" />}
                  {activeAiQuery === 'mental' && <Heart className="h-5 w-5 text-rose-600" />}
                  {activeAiQuery === 'sleep' && <Moon className="h-5 w-5 text-indigo-600" />}
                  {activeAiQuery === 'worklife' && <Briefcase className="h-5 w-5 text-cyan-600" />}
                  {activeAiQuery === 'wellness' && <Activity className="h-5 w-5 text-teal-600" />}
                  {activeAiQuery === 'sports' && <Dumbbell className="h-5 w-5 text-orange-600" />}
                  {activeAiQuery === 'bazi' && <Compass className="h-5 w-5 text-yellow-600" />}
                  {activeAiQuery === 'astro' && <Star className="h-5 w-5 text-violet-600" />}
                  {activeAiQuery === 'points' && <MapPin className="h-5 w-5 text-emerald-600" />}
                  <span className="text-sm font-semibold capitalize">
                    Ask about: {activeAiQuery}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">(Connected to RAG)</span>
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1 relative">
                    <Textarea
                      value={aiQueryInput}
                      onChange={(e) => setAiQueryInput(e.target.value)}
                      placeholder="Type your question or use voice input..."
                      rows={2}
                      className="pr-12"
                    />
                    {/* Voice Microphone Button */}
                    <button 
                      onClick={() => setShowVoiceDictation(true)}
                      className="absolute bottom-2 right-2 p-1 rounded-full hover:bg-jade/10 transition-colors"
                      title="Voice input"
                    >
                      <img 
                        src={animatedMicGif} 
                        alt="Voice input" 
                        className="h-8 w-8 object-contain"
                      />
                    </button>
                  </div>
                  <Button 
                    onClick={() => handleAiQuery(activeAiQuery)} 
                    disabled={aiQueryLoading || !aiQueryInput.trim()}
                    className="bg-jade hover:bg-jade/90 h-12 px-4"
                  >
                    {aiQueryLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
                {aiQueryResult && (
                  <div className="mt-4 p-4 bg-background rounded-lg border text-sm whitespace-pre-wrap">
                    <div className="flex items-center gap-2 mb-2 text-jade font-medium">
                      <Sparkles className="h-4 w-4" />
                      AI Response
                    </div>
                    {aiQueryResult}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content - Dynamic Grid Layout */}
        <main className="p-3 md:p-4 flex-1 overflow-hidden pb-24 md:pb-4">
          <div className={cn(
            "grid grid-cols-1 gap-3 md:gap-4 h-full",
            showSessionGuide ? "lg:grid-cols-5" : "lg:grid-cols-4"
          )}>
            
            {/* Left Column - Video + Anxiety Q&A */}
            <div className={cn(
              "flex flex-col gap-3 md:gap-4 h-full overflow-hidden",
              showSessionGuide ? "lg:col-span-3" : "lg:col-span-3"
            )}>
              {/* Mobile Inspiration Carousel - Above Video */}
              <div className="md:hidden">
                <MiniInspirationCarousel 
                  autoPlay={sessionStatus === 'running'}
                  interval={6000}
                  language="he"
                  sessionDuration={sessionDuration}
                  autoSync={true}
                />
              </div>

              {/* Top Row: Video Area + Anxiety Q&A Chat */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 min-h-0">
                {/* Video Area - Compact on mobile */}
                <Card className="bg-muted/30 overflow-hidden">
                  <CardContent className="p-0 h-full flex items-center justify-center min-h-[200px] md:min-h-[300px]">
                    <div className="w-full h-full bg-gradient-to-br from-jade/10 to-jade/5 rounded-lg flex flex-col items-center justify-center p-4 md:p-6">
                      <Video className="h-10 w-10 md:h-16 md:w-16 text-jade/40 mb-2 md:mb-3" />
                      <p className="text-muted-foreground text-base md:text-lg">אזור וידאו</p>
                      <p className="text-xs text-muted-foreground mt-1 hidden md:block">Zoom / Google Meet</p>
                      
                      {sessionStatus !== 'idle' && (
                        <Badge className={`mt-3 md:mt-4 text-xs md:text-sm px-2 md:px-3 py-0.5 md:py-1 ${
                          sessionStatus === 'running' ? 'bg-jade animate-pulse' : 
                          sessionStatus === 'paused' ? 'bg-gold' : 'bg-destructive'
                        }`}>
                          {sessionStatus === 'running' ? '● בשידור חי' :
                           sessionStatus === 'paused' ? '⏸ מושהה' : '■ הסתיים'}
                        </Badge>
                      )}
                      
                      <div 
                        className={cn(
                          "text-3xl md:text-4xl font-mono mt-3 md:mt-4 text-jade font-bold hidden md:block cursor-pointer",
                          "hover:scale-105 transition-transform select-none",
                          longPressTimer.isPressing && "scale-95"
                        )}
                        {...longPressTimer.handlers}
                        title="Long press for quick actions"
                      >
                        {formatDuration(sessionDuration)}
                      </div>
                      
                      {/* Session Presets - Desktop */}
                      <div className="hidden md:block mt-3 w-full max-w-xs">
                        <SessionPresets
                          sessionDuration={sessionDuration}
                          sessionStatus={sessionStatus}
                          onPresetSelect={setSessionPreset}
                        />
                      </div>
                      
                      {sessionStartTime && sessionStatus !== 'idle' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          התחלה: {getSessionStartTimeDisplay()}
                        </p>
                      )}
                      
                      {selectedPatientName && sessionStatus === 'running' && (
                        <Badge variant="outline" className="mt-2 text-sm px-3">
                          {selectedPatientName}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Featured Q&A Discussion Box */}
                <Card 
                  className="relative overflow-hidden border-rose-200/50 animate-fade-in"
                  style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.75), rgba(255,255,255,0.75)), url(${anxietySessionBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <CardContent className="p-4 flex flex-col min-h-[180px] md:min-h-[250px]">
                    {!selectedQAType ? (
                      <div className="flex flex-col items-center justify-center flex-1 animate-fade-in">
                        <Heart className="h-8 w-8 text-rose-500 mx-auto mb-2" />
                        <h3 className="text-lg font-semibold text-foreground">התחל דיון בנושא</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">בחר סוג שיחה להתחיל</p>
                        <QATypeDropdown
                          variant="tile"
                          selectedType={selectedQAType}
                          onSelect={(type) => {
                            setSelectedQAType(type);
                            haptic.medium();
                          }}
                          onReset={() => setSelectedQAType(null)}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col h-full animate-fade-in">
                        {/* Header with reset */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Heart className="h-5 w-5 text-rose-500" />
                            <span className="font-medium text-sm">
                              {selectedQAType === 'anxiety' ? 'שאלון חרדה' : 
                               selectedQAType === 'tcm-brain' ? 'TCM Brain' :
                               selectedQAType === 'diagnostics' ? 'אבחון' : 'כללי'}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedQAType(null);
                              setInlineAnxietyMessages([]);
                              setAnxietyInput('');
                            }}
                            className="h-7 text-xs"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            החלף
                          </Button>
                        </div>
                        
                        {/* Quick Question Chips */}
                        {inlineAnxietyMessages.length === 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {(selectedQAType === 'anxiety' ? [
                              'איך להתמודד עם חרדה?',
                              'טכניקות הרגעה',
                              'מה עוזר לשינה?',
                              'תסמיני לחץ'
                            ] : selectedQAType === 'tcm-brain' ? [
                              'נקודות לכאב ראש',
                              'איזון אנרגיה',
                              'דופק חלש',
                              'לשון לבנה'
                            ] : [
                              'שאלה כללית',
                              'עצה טיפולית',
                              'המלצה'
                            ]).map((q, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  setAnxietyInput(q);
                                  haptic.light();
                                }}
                                className="px-2 py-1 text-xs bg-rose-100/80 hover:bg-rose-200 text-rose-700 rounded-full transition-colors"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {/* Messages Area */}
                        <div 
                          ref={inlineChatRef}
                          className="flex-1 overflow-y-auto space-y-2 mb-3 min-h-[60px] max-h-[100px] scroll-smooth"
                        >
                          {inlineAnxietyMessages.length === 0 ? (
                            <div className="text-center text-muted-foreground text-xs py-2">
                              <p>בחר שאלה מהירה או כתוב משלך</p>
                            </div>
                          ) : (
                            <>
                              {inlineAnxietyMessages.map((msg, idx) => (
                                <div key={idx} className={`p-2 rounded-lg text-sm relative group ${
                                  msg.role === 'user' 
                                    ? 'bg-rose-100 text-rose-900 mr-8' 
                                    : 'bg-background/80 border ml-8'
                                }`}>
                                  {msg.content}
                                  {msg.role === 'assistant' && (
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(msg.content);
                                        toast.success('התשובה הועתקה');
                                        haptic.light();
                                      }}
                                      className="absolute top-1 left-1 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-opacity"
                                      title="העתק"
                                    >
                                      <FileText className="h-3 w-3 text-muted-foreground" />
                                    </button>
                                  )}
                                </div>
                              ))}
                              {/* Typing Indicator */}
                              {aiQueryLoading && (
                                <div className="bg-background/80 border ml-8 p-2 rounded-lg flex items-center gap-1.5">
                                  <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        
                        {/* Input Area */}
                        <div className="flex gap-2 items-end">
                          <div className="flex-1 relative">
                            <Textarea
                              value={anxietyInput}
                              onChange={(e) => setAnxietyInput(e.target.value)}
                              placeholder="שאל שאלה..."
                              rows={1}
                              className="text-sm pr-10 resize-none bg-background/80"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleAnxietyQuestion();
                                }
                              }}
                            />
                            <button 
                              onClick={() => setShowVoiceDictation(true)}
                              className="absolute bottom-1.5 right-2 p-1 rounded-full hover:bg-rose-100 transition-colors"
                              title="Voice input"
                            >
                              <img 
                                src={animatedMicGif} 
                                alt="Voice input" 
                                className="h-5 w-5 object-contain"
                              />
                            </button>
                          </div>
                          <Button 
                            onClick={handleAnxietyQuestion} 
                            disabled={aiQueryLoading || !anxietyInput.trim()}
                            size="sm"
                            className="bg-rose-600 hover:bg-rose-700 h-9"
                          >
                            {aiQueryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Session Notes - Below with double-tap gesture and inline voice input */}
              <Card 
                className="touch-manipulation"
                {...doubleTapHandlers}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium">הערות פגישה:</label>
                      <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      🎤 Click mic for voice • Double-tap for timestamp
                    </span>
                  </div>
                  <InlineVoiceTextarea
                    ref={notesTextareaRef as any}
                    value={sessionNotes}
                    onChange={(e) => setNotes(e.target.value)}
                    onVoiceInput={(text) => {
                      haptic.success();
                      toast.success('Voice note added', { duration: 1500 });
                    }}
                    placeholder="רשום הערות במהלך הפגישה... (לחץ על המיקרופון להקלטה)"
                    rows={3}
                    showLanguageSelector={true}
                    defaultLanguage="he-IL"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Session Guide Teleprompter Panel - Shows when enabled */}
            {showSessionGuide && (
              <div className={cn(
                "hidden md:block",
                sessionGuideExpanded ? "fixed inset-4 z-50 bg-background" : "md:col-span-1"
              )}>
                <SessionGuideTeleprompter
                  sessionDuration={sessionDuration}
                  isSessionActive={sessionStatus === 'running'}
                  onClose={() => setShowSessionGuide(false)}
                  isExpanded={sessionGuideExpanded}
                  onToggleExpand={() => setSessionGuideExpanded(!sessionGuideExpanded)}
                />
              </div>
            )}

            {/* AI Session Suggestions Panel - Shows when enabled */}
            {showAISuggestions && (
              <div className="hidden md:block md:col-span-1 max-h-[calc(100vh-105px)]">
                <AISessionSuggestions
                  sessionDuration={sessionDuration}
                  isSessionActive={sessionStatus === 'running'}
                  transcription={liveTranscription}
                  patientName={selectedPatientName || undefined}
                  currentPhase={`phase-${Math.min(6, Math.floor(sessionDuration / 600) + 1)}`}
                  onSuggestionUsed={(suggestion) => {
                    setNotes(sessionNotes + `\n📌 Used: ${suggestion.slice(0, 50)}...`);
                  }}
                  onClose={() => setShowAISuggestions(false)}
                  isListening={recordingModuleRef.current?.isRecording() || false}
                />
              </div>
            )}

            {/* Right Sidebar - All Tools & Controls (1/4 width) - Hidden on mobile */}
            <div className={cn(
              "hidden lg:flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-105px)]",
              showSessionGuide ? "lg:col-span-1" : "lg:col-span-1"
            )}>
              {/* Patient Selection */}
              <Card>
                <CardHeader className="pb-2 pt-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    בחירת מטופל
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pb-3">
                  <div className="flex items-center gap-1">
                    <Select
                      value={selectedPatientId || 'none'}
                      onValueChange={handlePatientSelect}
                      disabled={loadingPatients}
                    >
                      <SelectTrigger className="flex-1 bg-background h-8 text-sm">
                        <SelectValue placeholder={loadingPatients ? "טוען..." : "בחר מטופל"} />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border shadow-lg z-50">
                        <SelectItem value="none">ללא מטופל</SelectItem>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleRefreshPatients} disabled={refreshingPatients}>
                      <RefreshCw className={`h-3 w-3 ${refreshingPatients ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setShowSettings(true)}>
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-1 h-8 text-xs" 
                    onClick={() => navigate('/crm/patients/new?returnTo=/video-session')}
                  >
                    <UserPlus className="h-3 w-3" />
                    הוסף מטופל חדש
                  </Button>
                </CardContent>
              </Card>

              {/* Patient History Panel - Desktop */}
              <PatientHistoryPanel 
                patientId={selectedPatientId} 
                patientName={selectedPatientName}
              />

              {/* Session Controls */}
              <Card className="border-jade/30">
                <CardHeader className="pb-2 pt-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Video className="h-4 w-4 text-jade" />
                    בקרת פגישה
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pb-3">
                  <div className="grid grid-cols-2 gap-2">
                    {sessionStatus === 'idle' && (
                      <Button onClick={handleStart} size="sm" className="bg-jade hover:bg-jade/90 gap-1 col-span-2 h-9">
                        <Play className="h-4 w-4" />
                        התחל פגישה
                      </Button>
                    )}
                    {sessionStatus === 'running' && (
                      <Button onClick={handlePause} size="sm" variant="secondary" className="gap-1 h-9">
                        <Pause className="h-4 w-4" />
                        השהה
                      </Button>
                    )}
                    {sessionStatus === 'paused' && (
                      <Button onClick={handleResume} size="sm" className="bg-jade hover:bg-jade/90 gap-1 h-9">
                        <Play className="h-4 w-4" />
                        המשך
                      </Button>
                    )}
                    {(sessionStatus === 'running' || sessionStatus === 'paused') && (
                      <>
                        <Button onClick={handleRepeat} size="sm" variant="outline" className="gap-1 h-9">
                          <RotateCcw className="h-4 w-4" />
                          מחדש
                        </Button>
                        <Button onClick={handleEnd} size="sm" variant="destructive" className="gap-1 col-span-2 h-9">
                          <Square className="h-4 w-4" />
                          סיים ושמור
                        </Button>
                      </>
                    )}
                    {sessionStatus === 'ended' && (
                      <Button onClick={handleRepeat} size="sm" className="bg-jade hover:bg-jade/90 gap-1 col-span-2 h-9">
                        <RotateCcw className="h-4 w-4" />
                        פגישה חדשה
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-1 pt-1">
                    <Button onClick={handlePrint} variant="outline" size="sm" className="flex-1 gap-1 h-7 text-xs">
                      <Printer className="h-3 w-3" />
                      הדפס
                    </Button>
                    <Button onClick={handleSendEmail} variant="outline" size="sm" className="flex-1 gap-1 h-7 text-xs">
                      <Mail className="h-3 w-3" />
                      אימייל
                    </Button>
                    <Button onClick={handleSendWhatsApp} variant="outline" size="sm" className="flex-1 gap-1 h-7 text-xs">
                      <MessageCircle className="h-3 w-3" />
                      וואטס
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Session Recording Module */}
              <SessionRecordingModule
                ref={recordingModuleRef}
                patientId={selectedPatientId || undefined}
                patientName={selectedPatientName || undefined}
                onTranscriptionUpdate={(text) => {
                  setNotes(sessionNotes + '\n' + text);
                  // Feed transcription to AI suggestions panel
                  setLiveTranscription(prev => prev + ' ' + text);
                }}
              />

              {/* Zoom Timer */}
              {sessionStatus !== 'idle' && sessionStatus !== 'ended' && (
                <Card className={`${isZoomExpired ? 'border-destructive bg-destructive/5' : isZoomWarning ? 'border-amber-500 bg-amber-50' : 'border-blue-200 bg-blue-50'}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        {isZoomExpired ? <AlertTriangle className="h-3 w-3 text-destructive" /> : <Clock className={`h-3 w-3 ${isZoomWarning ? 'text-amber-600' : 'text-blue-600'}`} />}
                        <span className={`text-xs font-medium ${isZoomExpired ? 'text-destructive' : isZoomWarning ? 'text-amber-700' : 'text-blue-700'}`}>
                          {isZoomExpired ? 'Zoom הסתיים!' : `נותרו ${getZoomTimeRemaining()}`}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleExtendZoomTimer} className="h-6 px-2 text-xs">
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                    <Progress value={getZoomProgress()} className={`h-1.5 ${isZoomExpired ? '[&>div]:bg-destructive' : isZoomWarning ? '[&>div]:bg-amber-500' : '[&>div]:bg-blue-500'}`} />
                  </CardContent>
                </Card>
              )}

              {/* Calendar Block */}
              {currentAppointmentId && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-green-600" />
                        <span className="text-xs font-medium text-green-700">חסום ביומן</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleCancelCalendarBlock} disabled={isCancellingBlock} className="h-6 px-2 text-xs text-red-600">
                        {isCancellingBlock ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Mini Inspiration Carousel - Session Tips */}
              <div className="mt-2">
                <MiniInspirationCarousel 
                  autoPlay={sessionStatus === 'running'}
                  interval={6000}
                  language="he"
                  sessionDuration={sessionDuration}
                  autoSync={true}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Session Bar - Fixed bottom bar for mobile */}
        <MobileSessionBar
          sessionStatus={sessionStatus}
          sessionDuration={sessionDuration}
          selectedPatientName={selectedPatientName}
          isZoomWarning={isZoomWarning}
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onEnd={handleEnd}
          onReset={handleRepeat}
          onQuickPatient={() => setShowQuickPatient(true)}
          onQuickAppointment={() => setShowQuickAppointment(true)}
          onZoomInvite={() => setShowZoomInvite(true)}
          zoomTimeRemaining={getZoomTimeRemaining()}
          onLongPressTimer={(position) => {
            setQuickActionsPosition(position);
            setShowQuickActions(true);
          }}
        />

        {/* Mobile Session Guide Floating Button */}
        <div className="md:hidden fixed bottom-28 left-4 z-40">
          <Button
            variant={showSessionGuide ? "default" : "outline"}
            size="icon"
            onClick={() => setShowSessionGuide(!showSessionGuide)}
            className={cn(
              "h-12 w-12 rounded-full shadow-lg",
              showSessionGuide 
                ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-600" 
                : "bg-background border-amber-300"
            )}
          >
            <BookOpen className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Session Guide Panel */}
        {showSessionGuide && (
          <div className="md:hidden fixed inset-x-2 bottom-32 top-20 z-50">
            <SessionGuideTeleprompter
              sessionDuration={sessionDuration}
              isSessionActive={sessionStatus === 'running'}
              onClose={() => setShowSessionGuide(false)}
              isExpanded={false}
            />
          </div>
        )}

        {/* Mobile Tools Drawer - Floating button */}
        <div className="md:hidden fixed bottom-28 right-4 z-40">
          <MobileToolsDrawer
            onVoiceDictation={() => setShowVoiceDictation(true)}
            onAIQuery={(type) => setActiveAiQuery(type as any)}
            onAnxietyQA={() => setShowAnxietyQA(true)}
            onFollowUpPlan={() => setShowFollowUpPlan(true)}
            onQuickAppointment={() => setShowQuickAppointment(true)}
            onZoomInvite={() => setShowZoomInvite(true)}
            onSessionReport={() => setShowSessionReport(true)}
            onSettings={() => setShowSettings(true)}
            disabled={{ sessionReport: !selectedPatientId || !sessionNotes }}
          />
        </div>
      </div>

      {/* Dialogs */}
      <AnxietyQADialog open={showAnxietyQA} onOpenChange={setShowAnxietyQA} onConversationSave={setAnxietyConversation} />
      <QuickPatientDialog open={showQuickPatient} onOpenChange={setShowQuickPatient} onPatientCreated={handlePatientCreated} />
      <QuickAppointmentDialog open={showQuickAppointment} onOpenChange={setShowQuickAppointment} patientId={selectedPatientId || undefined} patientName={selectedPatientName || undefined} />
      <ZoomInviteDialog open={showZoomInvite} onOpenChange={setShowZoomInvite} patientName={selectedPatientName || undefined} patientPhone={selectedPatientPhone || undefined} />
      <TherapistSettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      <FollowUpPlanDialog open={showFollowUpPlan} onOpenChange={setShowFollowUpPlan} patientId={selectedPatientId || undefined} patientName={selectedPatientName || undefined} patientPhone={selectedPatientPhone || undefined} />
      <VoiceDictationDialog open={showVoiceDictation} onOpenChange={setShowVoiceDictation} patientId={selectedPatientId || undefined} patientName={selectedPatientName || undefined} />
      <CalendarInviteDialog open={showCalendarInvite} onOpenChange={setShowCalendarInvite} patientId={selectedPatientId || undefined} patientName={selectedPatientName || undefined} patientPhone={selectedPatientPhone || undefined} onAppointmentCreated={handleCalendarInviteCreated} />
      <SessionReportDialog open={showSessionReport} onOpenChange={setShowSessionReport} patientName={selectedPatientName || ''} patientPhone={selectedPatientPhone} sessionNotes={sessionNotes} anxietyResponses={anxietyConversation} />
      
      {/* TCM Brain Slide-out Panel */}
      <TcmBrainPanel 
        open={showTcmBrainPanel} 
        onOpenChange={setShowTcmBrainPanel}
        patientId={selectedPatientId || undefined}
        patientName={selectedPatientName || undefined}
        sessionNotes={sessionNotes}
      />
      
      {/* Floating Quick Actions - Long press on timer */}
      <FloatingQuickActions
        isOpen={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        sessionStatus={sessionStatus}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onEnd={handleEnd}
        onReset={handleRepeat}
        onQuickPatient={() => setShowQuickPatient(true)}
        onQuickAppointment={() => setShowQuickAppointment(true)}
        onVoiceDictation={() => setShowVoiceDictation(true)}
        onAnxietyQA={() => setShowAnxietyQA(true)}
        onFollowUp={() => setShowFollowUpPlan(true)}
        onSessionReport={() => setShowSessionReport(true)}
        anchorPosition={quickActionsPosition}
      />

      {/* Help Guide (trigger is next to the clock) */}
      <FloatingHelpGuide isOpen={showHelpGuide} onOpenChange={setShowHelpGuide} />
    </SessionTimerProvider>
  );
}

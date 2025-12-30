import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
  MapPin
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
import { FloatingQuickActions } from '@/components/video/FloatingQuickActions';
import { CustomizableToolbar, ToolbarItemId } from '@/components/video/CustomizableToolbar';
import { useLongPressTimer } from '@/hooks/useLongPressTimer';
import { useSessionLock } from '@/contexts/SessionLockContext';
import { cn } from '@/lib/utils';
import aiGeneratorBg from '@/assets/ai-generator-bg.png';
import animatedMicGif from '@/assets/mic-animated.gif';
import clockImg from '@/assets/clock.png';

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
  const { tier, hasFeature } = useTier();
  const { user } = useAuth();
  const { pauseLock, resumeLock, isPaused: isLockPaused } = useSessionLock();
  
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
  const [currentAppointmentId, setCurrentAppointmentId] = useState<string | null>(null);
  const [isCancellingBlock, setIsCancellingBlock] = useState(false);
  const warningShownRef = useRef(false);
  const alert30ShownRef = useRef(false);
  const alert35ShownRef = useRef(false);
  
  // Haptic feedback hook
  const haptic = useHapticFeedback();
  
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

  // Background detection - auto-pause when app goes to background
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

  // Auto-save notes with debounce
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
    }
  }, [sessionStatus, sessionDuration, sessionNotes, startSession, endSession, pauseSession, resumeSession, resetSession, setNotes]);

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
    toast.success('פגישת וידאו התחילה');
  };

  const handlePause = () => {
    pauseSession();
    toast.info('הפגישה הושהתה');
  };

  const handleResume = () => {
    resumeSession();
    toast.info('הפגישה ממשיכה');
  };

  const handleRepeat = () => {
    resetSession();
    resumeLock(); // Resume auto-lock when session is reset
    setCurrentAppointmentId(null);
    toast.info('הפגישה אופסה');
  };

  const handleEnd = async () => {
    endSession();
    resumeLock(); // Resume auto-lock after session ends
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
      toast.success('הפגישה נשמרה');
    } else {
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

  // AI Query handler - sends to tcm-rag-chat function
  const handleAiQuery = async (type: 'nutrition' | 'herbs' | 'diagnosis' | 'mental' | 'sleep' | 'worklife' | 'wellness' | 'sports' | 'bazi' | 'astro' | 'points') => {
    if (!aiQueryInput.trim()) {
      toast.error('Please enter a question');
      return;
    }
    setAiQueryLoading(true);
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
    } catch (error) {
      console.error('AI Query error:', error);
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
    } catch (error) {
      console.error('Anxiety Q&A error:', error);
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
        
        {/* Header - Optimized for mobile */}
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

            {/* Mobile Patient Selector - Quick access */}
            <div className="flex md:hidden items-center gap-2 flex-1 mx-2">
              <Select
                value={selectedPatientId || 'none'}
                onValueChange={handlePatientSelect}
                disabled={loadingPatients}
              >
                <SelectTrigger className="flex-1 bg-background h-9 text-sm">
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
              <Button 
                variant="outline" 
                size="icon" 
                className="h-9 w-9 shrink-0 touch-manipulation" 
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            {/* Clock - circular with full background - hidden on mobile */}
            <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
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

        {/* Session Presets - Mobile only */}
        <div className="md:hidden px-3 pt-2">
          <SessionPresets
            sessionDuration={sessionDuration}
            sessionStatus={sessionStatus}
            onPresetSelect={setSessionPreset}
          />
        </div>

        {/* CAF Asset Boxes - Customizable Toolbar */}
        <div className="px-3 md:px-4 pt-2 md:pt-4 pb-2">
          <CustomizableToolbar
            activeQuery={activeAiQuery}
            onQueryChange={setActiveAiQuery}
          />
          {/* Second Row - Main Actions - Compact sizing for mobile */}
          <div className="grid grid-cols-4 gap-1 md:flex md:flex-wrap md:gap-2 mt-2 md:mt-3">
            {/* Animated AI Query Button */}
            <button
              onClick={() => setActiveAiQuery(activeAiQuery ? null : 'nutrition')}
              className="relative overflow-hidden rounded-md px-1.5 py-1 md:px-4 md:py-2 text-white font-medium shadow-lg 
                         hover:scale-105 transition-all duration-300 animate-pulse-slow group text-[10px] md:text-sm h-7 md:h-auto"
              style={{
                background: `linear-gradient(135deg, rgba(22, 163, 74, 0.9), rgba(6, 95, 70, 0.95))`,
              }}
            >
              <div 
                className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity"
                style={{
                  backgroundImage: `url(${aiGeneratorBg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="relative flex items-center justify-center gap-0.5 md:gap-2">
                <Sparkles className="h-3 w-3 md:h-5 md:w-5 animate-bounce" />
                <span className="truncate">AI</span>
              </div>
            </button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAnxietyQA(true)}
              className="gap-0.5 md:gap-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-300 text-[10px] md:text-sm px-1 md:px-3 h-7 md:h-9"
            >
              <Heart className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="truncate">Q&A</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/cm-brain-questions')}
              className="gap-0.5 md:gap-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300 text-[10px] md:text-sm px-1 md:px-3 h-7 md:h-9"
            >
              <Brain className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="truncate">CM</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSessionReport(true)}
              disabled={!selectedPatientId || !sessionNotes}
              className="gap-0.5 md:gap-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border-indigo-300 text-[10px] md:text-sm px-1 md:px-3 h-7 md:h-9"
              title="Generate AI summary report of the session notes"
            >
              <FileText className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="truncate">Report</span>
            </Button>
          </div>

          {/* Patient History Panel - Mobile only */}
          <div className="md:hidden mt-2">
            <PatientHistoryPanel 
              patientId={selectedPatientId} 
              patientName={selectedPatientName} 
            />
          </div>
        </div>

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

        {/* Main Content - 2 Column Layout */}
        <main className="p-3 md:p-4 flex-1 overflow-hidden pb-24 md:pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4 h-full">
            
            {/* Left Column - Video + Anxiety Q&A (3/4 width) */}
            <div className="lg:col-span-3 flex flex-col gap-3 md:gap-4 h-full overflow-hidden">
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

                {/* Anxiety Q&A Chat Panel */}
                <Card className="border-rose-200 bg-rose-50/30 flex flex-col overflow-hidden">
                  <CardHeader className="pb-2 pt-3 border-b">
                    <CardTitle className="text-sm flex items-center gap-2 text-rose-700">
                      <Heart className="h-4 w-4" />
                      שאלון חרדה - שיחה עם AI
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-3 overflow-hidden">
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto space-y-2 mb-3 min-h-[150px]">
                      {inlineAnxietyMessages.length === 0 ? (
                        <div className="text-center text-muted-foreground text-sm py-8">
                          <Heart className="h-8 w-8 mx-auto mb-2 text-rose-300" />
                          <p>שאל שאלות לגבי חרדה, לחץ נפשי, או רגשות</p>
                        </div>
                      ) : (
                        inlineAnxietyMessages.map((msg, idx) => (
                          <div key={idx} className={`p-2 rounded-lg text-sm ${
                            msg.role === 'user' 
                              ? 'bg-rose-100 text-rose-900 mr-8' 
                              : 'bg-background border ml-8'
                          }`}>
                            {msg.content}
                          </div>
                        ))
                      )}
                    </div>
                    {/* Input Area with Mic */}
                    <div className="flex gap-2 items-end">
                      <div className="flex-1 relative">
                        <Textarea
                          value={anxietyInput}
                          onChange={(e) => setAnxietyInput(e.target.value)}
                          placeholder="שאל שאלה על חרדה..."
                          rows={2}
                          className="text-sm pr-10"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAnxietyQuestion();
                            }
                          }}
                        />
                        <button 
                          onClick={() => setShowVoiceDictation(true)}
                          className="absolute bottom-2 right-2 p-1 rounded-full hover:bg-rose-100 transition-colors"
                          title="Voice input"
                        >
                          <img 
                            src={animatedMicGif} 
                            alt="Voice input" 
                            className="h-6 w-6 object-contain"
                          />
                        </button>
                      </div>
                      <Button 
                        onClick={handleAnxietyQuestion} 
                        disabled={aiQueryLoading || !anxietyInput.trim()}
                        size="sm"
                        className="bg-rose-600 hover:bg-rose-700"
                      >
                        {aiQueryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Session Notes - Below with double-tap gesture and voice note */}
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
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground md:hidden">
                        Double-tap for timestamp
                      </span>
                      {/* Long-press voice note button - Mobile only */}
                      <div className="md:hidden">
                        <LongPressVoiceNote 
                          onTranscription={handleVoiceNoteTranscription}
                          className="scale-75 origin-right"
                        />
                      </div>
                    </div>
                  </div>
                  <Textarea
                    value={sessionNotes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="רשום הערות במהלך הפגישה..."
                    rows={2}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar - All Tools & Controls (1/4 width) - Hidden on mobile */}
            <div className="hidden lg:flex lg:col-span-1 flex-col gap-3 overflow-y-auto max-h-[calc(100vh-105px)]">
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
                  <Button variant="outline" size="sm" className="w-full gap-1 h-8 text-xs" onClick={() => setShowQuickPatient(true)}>
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

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-2 pt-3">
                  <CardTitle className="text-sm">כלים מהירים</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-1 pb-3">
                  <Button variant="outline" size="sm" onClick={() => setShowFollowUpPlan(true)} className="gap-0.5 bg-jade/10 hover:bg-jade/20 text-jade border-jade/30 h-7 text-[10px] px-1.5">
                    <ClipboardList className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">המשך</span>
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setShowAnxietyQA(true)} className="gap-0.5 h-7 text-[10px] px-1.5">
                    <Sparkles className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">חרדה</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowVoiceDictation(true)} className="gap-0.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 h-7 text-[10px] px-1.5">
                    <AnimatedMic size="sm" />
                    <span className="truncate">הקלטה</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowQuickAppointment(true)} className="gap-0.5 h-7 text-[10px] px-1.5">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">תור</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowCalendarInvite(true)} className="gap-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 h-7 text-[10px] px-1.5">
                    <CalendarPlus className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">יומן</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowZoomInvite(true)} className="gap-0.5 h-7 text-[10px] px-1.5">
                    <VideoIcon className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">Zoom</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowSessionReport(true)} disabled={!selectedPatientId || !sessionNotes} className="gap-0.5 col-span-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 h-7 text-[10px] px-1.5">
                    <Sparkles className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">דו"ח AI + MP3</span>
                  </Button>
                </CardContent>
              </Card>
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
    </SessionTimerProvider>
  );
}

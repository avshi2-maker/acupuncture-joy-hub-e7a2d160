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
import { SessionTimerWidget } from '@/components/crm/SessionTimerWidget';
import { SessionTimerProvider } from '@/contexts/SessionTimerContext';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import { useTier } from '@/hooks/useTier';
import { TierBadge } from '@/components/layout/TierBadge';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import aiGeneratorBg from '@/assets/ai-generator-bg.png';
import animatedMicGif from '@/assets/mic-animated.gif';
import clockImg from '@/assets/clock.png';

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
  
  // AI Query states
  const [activeAiQuery, setActiveAiQuery] = useState<'nutrition' | 'herbs' | 'diagnosis' | 'mental' | 'sleep' | 'worklife' | 'wellness' | 'sports' | 'bazi' | 'astro' | 'points' | null>(null);
  const [aiQueryInput, setAiQueryInput] = useState('');
  const [aiQueryLoading, setAiQueryLoading] = useState(false);
  const [aiQueryResult, setAiQueryResult] = useState<string | null>(null);
  
  // Anxiety Q&A inline state
  const [inlineAnxietyMessages, setInlineAnxietyMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [anxietyInput, setAnxietyInput] = useState('');
  
  // Current time for clock display
  const [currentTime, setCurrentTime] = useState(new Date());

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

  useEffect(() => {
    if (sessionStatus === 'idle' || sessionDuration < ZOOM_WARNING_SECONDS) {
      warningShownRef.current = false;
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
    setCurrentAppointmentId(null);
    toast.info('הפגישה אופסה');
  };

  const handleEnd = async () => {
    endSession();
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

      <div className="min-h-screen bg-background flex flex-col" dir="rtl">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-50">
          <div className="max-w-full mx-auto px-4 py-4 relative flex items-center justify-between">
            <Link to="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
              <div className="w-10 h-10 bg-jade-light rounded-full flex items-center justify-center">
                <Leaf className="h-5 w-5 text-jade" />
              </div>
              <div>
                <h1 className="font-display text-xl">TCM Clinic</h1>
                <p className="text-sm text-muted-foreground">פגישת וידאו</p>
              </div>
            </Link>

            {/* Clock - circular with full background */}
            <div className="absolute left-1/2 -translate-x-1/2">
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

            <div className="flex items-center gap-3">
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

        {/* CAF Asset Boxes - All connected to RAG */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {/* Herbs */}
            <Button 
              variant={activeAiQuery === 'herbs' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveAiQuery(activeAiQuery === 'herbs' ? null : 'herbs')}
              className="gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
            >
              <Leaf className="h-4 w-4" />
              Herbs
            </Button>
            {/* Nutrition */}
            <Button 
              variant={activeAiQuery === 'nutrition' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveAiQuery(activeAiQuery === 'nutrition' ? null : 'nutrition')}
              className="gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
            >
              <Apple className="h-4 w-4" />
              Nutrition
            </Button>
            {/* Mental Health */}
            <Button 
              variant={activeAiQuery === 'mental' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveAiQuery(activeAiQuery === 'mental' ? null : 'mental')}
              className="gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
            >
              <Heart className="h-4 w-4" />
              Mental
            </Button>
            {/* Sleep */}
            <Button 
              variant={activeAiQuery === 'sleep' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveAiQuery(activeAiQuery === 'sleep' ? null : 'sleep')}
              className="gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
            >
              <Moon className="h-4 w-4" />
              Sleep
            </Button>
            {/* Work-Life Balance */}
            <Button 
              variant={activeAiQuery === 'worklife' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveAiQuery(activeAiQuery === 'worklife' ? null : 'worklife')}
              className="gap-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200"
            >
              <Briefcase className="h-4 w-4" />
              Balance
            </Button>
            {/* Wellness */}
            <Button 
              variant={activeAiQuery === 'wellness' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveAiQuery(activeAiQuery === 'wellness' ? null : 'wellness')}
              className="gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200"
            >
              <Activity className="h-4 w-4" />
              Wellness
            </Button>
            {/* Sports */}
            <Button 
              variant={activeAiQuery === 'sports' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveAiQuery(activeAiQuery === 'sports' ? null : 'sports')}
              className="gap-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
            >
              <Dumbbell className="h-4 w-4" />
              Sports
            </Button>
            {/* Bazi */}
            <Button 
              variant={activeAiQuery === 'bazi' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveAiQuery(activeAiQuery === 'bazi' ? null : 'bazi')}
              className="gap-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
            >
              <Compass className="h-4 w-4" />
              Bazi
            </Button>
            {/* Astrology */}
            <Button 
              variant={activeAiQuery === 'astro' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveAiQuery(activeAiQuery === 'astro' ? null : 'astro')}
              className="gap-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-200"
            >
              <Star className="h-4 w-4" />
              Astrology
            </Button>
            {/* Acupuncture Points */}
            <Button 
              variant={activeAiQuery === 'points' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveAiQuery(activeAiQuery === 'points' ? null : 'points')}
              className="gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
            >
              <MapPin className="h-4 w-4" />
              Points
            </Button>
            {/* Diagnosis */}
            <Button 
              variant={activeAiQuery === 'diagnosis' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveAiQuery(activeAiQuery === 'diagnosis' ? null : 'diagnosis')}
              className="gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
            >
              <Stethoscope className="h-4 w-4" />
              Diagnosis
            </Button>
          </div>
          {/* Second Row - Main Actions */}
          <div className="flex flex-wrap gap-2 mt-3">
            {/* Animated AI Query Button */}
            <button
              onClick={() => setActiveAiQuery(activeAiQuery ? null : 'nutrition')}
              className="relative overflow-hidden rounded-lg px-4 py-2 text-white font-medium shadow-lg 
                         hover:scale-105 transition-all duration-300 animate-pulse-slow group"
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
              <div className="relative flex items-center gap-2">
                <Sparkles className="h-5 w-5 animate-bounce" />
                <span>Ask AI / RAG</span>
                <Brain className="h-4 w-4" />
              </div>
            </button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAnxietyQA(true)}
              className="gap-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-300"
            >
              <Heart className="h-4 w-4" />
              Anxiety Q&A
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/cm-brain-questions')}
              className="gap-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300"
            >
              <Brain className="h-4 w-4" />
              CM Brain
              <span className="ms-1 text-[11px] opacity-80">(150)</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSessionReport(true)}
              disabled={!selectedPatientId || !sessionNotes}
              className="gap-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border-indigo-300"
              title="Generate AI summary report of the session notes"
            >
              <FileText className="h-4 w-4" />
              AI Report
            </Button>
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
        <main className="p-4 flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
            
            {/* Left Column - Video + Anxiety Q&A (3/4 width) */}
            <div className="lg:col-span-3 flex flex-col gap-4 h-full overflow-hidden">
              {/* Top Row: Video Area + Anxiety Q&A Chat */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
                {/* Video Area */}
                <Card className="bg-muted/30 overflow-hidden">
                  <CardContent className="p-0 h-full flex items-center justify-center min-h-[300px]">
                    <div className="w-full h-full bg-gradient-to-br from-jade/10 to-jade/5 rounded-lg flex flex-col items-center justify-center p-6">
                      <Video className="h-16 w-16 text-jade/40 mb-3" />
                      <p className="text-muted-foreground text-lg">אזור וידאו</p>
                      <p className="text-xs text-muted-foreground mt-1">Zoom / Google Meet</p>
                      
                      {sessionStatus !== 'idle' && (
                        <Badge className={`mt-4 text-sm px-3 py-1 ${
                          sessionStatus === 'running' ? 'bg-jade animate-pulse' : 
                          sessionStatus === 'paused' ? 'bg-gold' : 'bg-destructive'
                        }`}>
                          {sessionStatus === 'running' ? '● בשידור חי' :
                           sessionStatus === 'paused' ? '⏸ מושהה' : '■ הסתיים'}
                        </Badge>
                      )}
                      
                      <p className="text-4xl font-mono mt-4 text-jade font-bold">
                        {formatDuration(sessionDuration)}
                      </p>
                      
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

              {/* Session Notes - Below */}
              <Card>
                <CardContent className="p-3">
                  <label className="text-xs font-medium mb-1 block">הערות פגישה:</label>
                  <Textarea
                    value={sessionNotes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="רשום הערות במהלך הפגישה..."
                    rows={2}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar - All Tools & Controls (1/4 width) */}
            <div className="lg:col-span-1 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-105px)]">
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
                <CardContent className="grid grid-cols-2 gap-1.5 pb-3">
                  <Button variant="outline" size="sm" onClick={() => setShowFollowUpPlan(true)} className="gap-1 bg-jade/10 hover:bg-jade/20 text-jade border-jade/30 h-8 text-xs">
                    <ClipboardList className="h-3 w-3" />
                    תוכנית המשך
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setShowAnxietyQA(true)} className="gap-1 h-8 text-xs">
                    <Sparkles className="h-3 w-3" />
                    שאלון חרדה
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowVoiceDictation(true)} className="gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 h-8 text-xs">
                    <AnimatedMic size="sm" />
                    הקלטה קולית
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowQuickAppointment(true)} className="gap-1 h-8 text-xs">
                    <Calendar className="h-3 w-3" />
                    קביעת תור
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowCalendarInvite(true)} className="gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 h-8 text-xs">
                    <CalendarPlus className="h-3 w-3" />
                    הזמנה + יומן
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowZoomInvite(true)} className="gap-1 h-8 text-xs">
                    <VideoIcon className="h-3 w-3" />
                    הזמנת Zoom
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowSessionReport(true)} disabled={!selectedPatientId || !sessionNotes} className="gap-1 col-span-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 h-8 text-xs">
                    <Sparkles className="h-3 w-3" />
                    דו"ח AI + MP3
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Session timer widget removed - using header clock instead */}
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
    </SessionTimerProvider>
  );
}

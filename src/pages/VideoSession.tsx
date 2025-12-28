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
  ArrowRight
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

  if (!tier || !hasFeature('video_sessions')) return null;

  return (
    <SessionTimerProvider>
      <Helmet>
        <title>פגישת וידאו | TCM Clinic</title>
        <meta name="description" content="ניהול פגישת וידאו עם מטופלים" />
      </Helmet>

      <div className="min-h-screen bg-background" dir="rtl">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-50">
          <div className="max-w-full mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
              <div className="w-10 h-10 bg-jade-light rounded-full flex items-center justify-center">
                <Leaf className="h-5 w-5 text-jade" />
              </div>
              <div>
                <h1 className="font-display text-xl">TCM Clinic</h1>
                <p className="text-sm text-muted-foreground">פגישת וידאו</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard" className="gap-2">
                  <ArrowRight className="h-4 w-4" />
                  חזרה לדשבורד
                </Link>
              </Button>
              <TierBadge />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Video Screen */}
            <div className="lg:col-span-2 space-y-4">
              {/* Video Area */}
              <Card className="bg-muted/30 min-h-[400px]">
                <CardContent className="p-0 h-full flex items-center justify-center min-h-[400px]">
                  <div className="w-full h-full bg-gradient-to-br from-jade/10 to-jade/5 rounded-lg flex flex-col items-center justify-center p-8">
                    <Video className="h-20 w-20 text-jade/40 mb-4" />
                    <p className="text-muted-foreground text-xl">אזור וידאו</p>
                    <p className="text-sm text-muted-foreground mt-1">Zoom / Google Meet</p>
                    
                    {sessionStatus !== 'idle' && (
                      <Badge className={`mt-6 text-lg px-4 py-2 ${
                        sessionStatus === 'running' ? 'bg-jade animate-pulse' : 
                        sessionStatus === 'paused' ? 'bg-gold' : 'bg-destructive'
                      }`}>
                        {sessionStatus === 'running' ? '● בשידור חי' :
                         sessionStatus === 'paused' ? '⏸ מושהה' : '■ הסתיים'}
                      </Badge>
                    )}
                    
                    <p className="text-4xl font-mono mt-6 text-jade font-bold">
                      {formatDuration(sessionDuration)}
                    </p>
                    
                    {sessionStartTime && sessionStatus !== 'idle' && (
                      <p className="text-sm text-muted-foreground mt-2">
                        התחלה: {getSessionStartTimeDisplay()}
                      </p>
                    )}
                    
                    {selectedPatientName && sessionStatus === 'running' && (
                      <Badge variant="outline" className="mt-3 text-lg px-4 py-1">
                        {selectedPatientName}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Session Controls */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Video className="h-5 w-5 text-jade" />
                    בקרת פגישה
                    {selectedPatientName && (
                      <Badge variant="outline" className="mr-auto">{selectedPatientName}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    {sessionStatus === 'idle' && (
                      <Button onClick={handleStart} size="lg" className="bg-jade hover:bg-jade/90 gap-2">
                        <Play className="h-5 w-5" />
                        התחל פגישה
                      </Button>
                    )}
                    {sessionStatus === 'running' && (
                      <Button onClick={handlePause} size="lg" variant="secondary" className="gap-2">
                        <Pause className="h-5 w-5" />
                        השהה
                      </Button>
                    )}
                    {sessionStatus === 'paused' && (
                      <Button onClick={handleResume} size="lg" className="bg-jade hover:bg-jade/90 gap-2">
                        <Play className="h-5 w-5" />
                        המשך
                      </Button>
                    )}
                    {(sessionStatus === 'running' || sessionStatus === 'paused') && (
                      <>
                        <Button onClick={handleRepeat} size="lg" variant="outline" className="gap-2">
                          <RotateCcw className="h-5 w-5" />
                          התחל מחדש
                        </Button>
                        <Button onClick={handleEnd} size="lg" variant="destructive" className="gap-2">
                          <Square className="h-5 w-5" />
                          סיים ושמור
                        </Button>
                      </>
                    )}
                    {sessionStatus === 'ended' && (
                      <Button onClick={handleRepeat} size="lg" className="bg-jade hover:bg-jade/90 gap-2">
                        <RotateCcw className="h-5 w-5" />
                        פגישה חדשה
                      </Button>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">הערות פגישה:</label>
                    <Textarea
                      value={sessionNotes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="רשום הערות במהלך הפגישה..."
                      rows={4}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <Button onClick={handlePrint} variant="outline" className="gap-2">
                      <Printer className="h-4 w-4" />
                      הדפס דוח
                    </Button>
                    <Button onClick={handleSendEmail} variant="outline" className="gap-2">
                      <Mail className="h-4 w-4" />
                      שלח באימייל
                    </Button>
                    <Button onClick={handleSendWhatsApp} variant="outline" className="gap-2">
                      <MessageCircle className="h-4 w-4" />
                      שלח בוואטסאפ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Tools */}
            <div className="space-y-4">
              {/* Patient Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    בחירת מטופל
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedPatientId || 'none'}
                      onValueChange={handlePatientSelect}
                      disabled={loadingPatients}
                    >
                      <SelectTrigger className="flex-1 bg-background">
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
                    <Button variant="outline" size="icon" onClick={handleRefreshPatients} disabled={refreshingPatients}>
                      <RefreshCw className={`h-4 w-4 ${refreshingPatients ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setShowSettings(true)}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full gap-2" onClick={() => setShowQuickPatient(true)}>
                    <UserPlus className="h-4 w-4" />
                    הוסף מטופל חדש
                  </Button>
                </CardContent>
              </Card>

              {/* Zoom Timer */}
              {sessionStatus !== 'idle' && sessionStatus !== 'ended' && (
                <Card className={`${isZoomExpired ? 'border-destructive bg-destructive/5' : isZoomWarning ? 'border-amber-500 bg-amber-50' : 'border-blue-200 bg-blue-50'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isZoomExpired ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <Clock className={`h-4 w-4 ${isZoomWarning ? 'text-amber-600' : 'text-blue-600'}`} />}
                        <span className={`text-sm font-medium ${isZoomExpired ? 'text-destructive' : isZoomWarning ? 'text-amber-700' : 'text-blue-700'}`}>
                          {isZoomExpired ? 'זמן Zoom חינם הסתיים!' : `נותרו ${getZoomTimeRemaining()}`}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleExtendZoomTimer} className="h-7 px-2 text-xs">
                        <RotateCcw className="h-3 w-3 mr-1" />
                        אפס
                      </Button>
                    </div>
                    <Progress value={getZoomProgress()} className={`h-2 ${isZoomExpired ? '[&>div]:bg-destructive' : isZoomWarning ? '[&>div]:bg-amber-500' : '[&>div]:bg-blue-500'}`} />
                  </CardContent>
                </Card>
              )}

              {/* Calendar Block */}
              {currentAppointmentId && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">חסום ביומן</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleCancelCalendarBlock} disabled={isCancellingBlock} className="h-7 px-2 text-xs text-red-600">
                        {isCancellingBlock ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">כלים מהירים</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => setShowFollowUpPlan(true)} className="gap-2 bg-jade/10 hover:bg-jade/20 text-jade border-jade/30">
                    <ClipboardList className="h-4 w-4" />
                    תוכנית המשך
                  </Button>
                  <Button variant="secondary" onClick={() => setShowAnxietyQA(true)} className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    שאלון חרדה
                  </Button>
                  <Button variant="outline" onClick={() => setShowVoiceDictation(true)} className="gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200">
                    <AnimatedMic size="md" />
                    הקלטה קולית
                  </Button>
                  <Button variant="outline" onClick={() => setShowQuickAppointment(true)} className="gap-2">
                    <Calendar className="h-4 w-4" />
                    קביעת תור
                  </Button>
                  <Button variant="outline" onClick={() => setShowCalendarInvite(true)} className="gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200">
                    <CalendarPlus className="h-4 w-4" />
                    הזמנה + יומן
                  </Button>
                  <Button variant="outline" onClick={() => setShowZoomInvite(true)} className="gap-2">
                    <VideoIcon className="h-4 w-4" />
                    הזמנת Zoom
                  </Button>
                  <Button variant="outline" onClick={() => setShowSessionReport(true)} disabled={!selectedPatientId || !sessionNotes} className="gap-2 col-span-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200">
                    <Sparkles className="h-4 w-4" />
                    דו"ח AI + MP3
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <SessionTimerWidget position="bottom-right" />
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

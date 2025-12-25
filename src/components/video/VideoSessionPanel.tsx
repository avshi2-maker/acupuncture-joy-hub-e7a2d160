import { useState, useEffect, useRef, useCallback } from 'react';
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
  Mic,
  ClipboardList
} from 'lucide-react';
import { toast } from 'sonner';
import { saveSessionReport, printReport, LocalSessionReport } from '@/utils/localDataStorage';
import { AnxietyQADialog } from './AnxietyQADialog';
import { QuickPatientDialog } from './QuickPatientDialog';
import { QuickAppointmentDialog } from './QuickAppointmentDialog';
import { ZoomInviteDialog } from './ZoomInviteDialog';
import { TherapistSettingsDialog, getAudioAlertsEnabled } from './TherapistSettingsDialog';
import { FollowUpPlanDialog } from './FollowUpPlanDialog';
import { VoiceDictationDialog } from './VoiceDictationDialog';
import { CalendarInviteDialog } from './CalendarInviteDialog';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Patient {
  id: string;
  full_name: string;
  phone: string | null;
}

interface VideoSessionPanelProps {
  onSessionEnd?: (report: LocalSessionReport) => void;
}

// Zoom free tier limits
const ZOOM_FREE_LIMIT_SECONDS = 40 * 60; // 40 minutes
const ZOOM_WARNING_SECONDS = 35 * 60; // 35 minutes warning

export function VideoSessionPanel({ onSessionEnd }: VideoSessionPanelProps) {
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
  const [currentAppointmentId, setCurrentAppointmentId] = useState<string | null>(null);
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

  // Audio alert function
  const playAlertSound = useCallback(() => {
    // Check if audio alerts are enabled
    if (!getAudioAlertsEnabled()) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a sequence of beeps
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
      
      // Play 3 beeps
      const now = audioContext.currentTime;
      playBeep(now, 880);        // A5
      playBeep(now + 0.4, 880);  // A5
      playBeep(now + 0.8, 1100); // Higher pitch for urgency
      
    } catch (err) {
      console.error('Could not play audio alert:', err);
    }
  }, []);

  // Fetch patients function
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

  // Fetch patients on mount
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // 35-minute warning for Zoom with audio alert
  useEffect(() => {
    if (sessionStatus === 'running' && sessionDuration >= ZOOM_WARNING_SECONDS && !warningShownRef.current) {
      warningShownRef.current = true;
      playAlertSound();
      toast.warning('⚠️ נותרו 5 דקות! מגבלת Zoom חינם מתקרבת', {
        duration: 10000,
        description: 'שקול לסיים או לחדש את הפגישה',
      });
    }
  }, [sessionDuration, sessionStatus, playAlertSound]);

  // Reset warning flag when duration resets
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
    // Refresh list and select the new patient
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

  const getZoomProgress = () => {
    return Math.min((sessionDuration / ZOOM_FREE_LIMIT_SECONDS) * 100, 100);
  };

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
    
    // Save video session to database if patient is selected
    if (selectedPatientId && selectedPatientName && user && sessionStartTime) {
      try {
        await supabase.from('video_sessions').insert({
          therapist_id: user.id,
          patient_id: selectedPatientId,
          started_at: new Date(sessionStartTime).toISOString(),
          ended_at: new Date().toISOString(),
          duration_seconds: sessionDuration,
          notes: sessionNotes + (anxietyConversation.length > 0 
            ? '\n\n--- שאלון חרדה ---\n' + anxietyConversation.join('\n') 
            : ''),
          anxiety_qa_responses: anxietyConversation.length > 0 ? anxietyConversation : null,
        });
      } catch (error) {
        console.error('Error saving video session to DB:', error);
      }

      // Release calendar block if there was one
      if (currentAppointmentId) {
        try {
          await supabase
            .from('appointments')
            .update({ status: 'completed' })
            .eq('id', currentAppointmentId);
          toast.success('הפגישה ביומן סומנה כהושלמה');
        } catch (error) {
          console.error('Error updating appointment:', error);
        }
      }
    }
    
    // Save report locally
    if (selectedPatientId && selectedPatientName) {
      const report = saveSessionReport({
        patientId: selectedPatientId,
        patientName: selectedPatientName,
        visitDate: new Date().toISOString(),
        notes: sessionNotes + (anxietyConversation.length > 0 
          ? '\n\n--- שאלון חרדה ---\n' + anxietyConversation.join('\n') 
          : ''),
        cupping: false,
        moxa: false,
      });
      
      toast.success('הפגישה נשמרה');
      onSessionEnd?.(report);
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
      setPatient({
        id: patient.id,
        name: patient.full_name,
        phone: patient.phone || undefined,
      });
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

  const handleSendEmail = () => {
    toast.info('שליחת דוח באימייל - בקרוב');
  };

  const handleSendWhatsApp = () => {
    if (!selectedPatientName) {
      toast.error('בחר מטופל קודם');
      return;
    }
    const message = encodeURIComponent(
      `דוח טיפול - ${selectedPatientName}\n` +
      `תאריך: ${new Date().toLocaleDateString('he-IL')}\n` +
      `משך: ${formatDuration(sessionDuration)}\n\n` +
      `הערות: ${sessionNotes}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleCalendarInviteCreated = (appointmentId: string) => {
    setCurrentAppointmentId(appointmentId);
    toast.success('הפגישה נוספה ליומן - תשוחרר בסיום');
  };

  // Format session start time for display
  const getSessionStartTimeDisplay = () => {
    if (!sessionStartTime) return null;
    return new Date(sessionStartTime).toLocaleString('he-IL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Patient Selection */}
      <Card className="mb-4">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
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
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefreshPatients}
              disabled={refreshingPatients}
              title="רענן רשימה"
            >
              <RefreshCw className={`h-4 w-4 ${refreshingPatients ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettings(true)}
              title="הגדרות"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Zoom Timer - only show when session is active */}
      {sessionStatus !== 'idle' && sessionStatus !== 'ended' && (
        <Card className={`mb-4 ${isZoomExpired ? 'border-destructive bg-destructive/5' : isZoomWarning ? 'border-amber-500 bg-amber-50' : 'border-blue-200 bg-blue-50'}`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {isZoomExpired ? (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                ) : (
                  <Clock className={`h-4 w-4 ${isZoomWarning ? 'text-amber-600' : 'text-blue-600'}`} />
                )}
                <span className={`text-sm font-medium ${isZoomExpired ? 'text-destructive' : isZoomWarning ? 'text-amber-700' : 'text-blue-700'}`}>
                  {isZoomExpired ? 'זמן Zoom חינם הסתיים!' : `נותרו ${getZoomTimeRemaining()} (מתוך 40 דק׳)`}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExtendZoomTimer}
                className={`h-7 px-2 text-xs ${isZoomWarning || isZoomExpired ? 'text-amber-700 hover:bg-amber-100' : 'text-blue-700 hover:bg-blue-100'}`}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                אפס טיימר
              </Button>
            </div>
            <Progress 
              value={getZoomProgress()} 
              className={`h-2 ${isZoomExpired ? '[&>div]:bg-destructive' : isZoomWarning ? '[&>div]:bg-amber-500' : '[&>div]:bg-blue-500'}`}
            />
          </CardContent>
        </Card>
      )}

      {/* Video Area */}
      <Card className="flex-1 bg-muted/50">
        <CardContent className="p-0 h-full flex items-center justify-center relative">
          <div className="w-full h-full min-h-[300px] bg-gradient-to-br from-jade/10 to-jade/5 rounded-lg flex flex-col items-center justify-center">
            <Video className="h-16 w-16 text-jade/40 mb-4" />
            <p className="text-muted-foreground text-lg">אזור וידאו</p>
            <p className="text-sm text-muted-foreground mt-1">Zoom / Google Meet</p>
            
            {/* Session Status Badge */}
            {sessionStatus !== 'idle' && (
              <Badge 
                className={`mt-4 ${
                  sessionStatus === 'running' ? 'bg-jade animate-pulse' : 
                  sessionStatus === 'paused' ? 'bg-gold' : 
                  'bg-destructive'
                }`}
              >
                {sessionStatus === 'running' ? '● בשידור חי' :
                 sessionStatus === 'paused' ? '⏸ מושהה' :
                 '■ הסתיים'}
              </Badge>
            )}
            
            {/* Timer */}
            <p className="text-2xl font-mono mt-4 text-jade">
              {formatDuration(sessionDuration)}
            </p>
            
            {/* Session start time stamp */}
            {sessionStartTime && sessionStatus !== 'idle' && (
              <p className="text-xs text-muted-foreground mt-1">
                התחלה: {getSessionStartTimeDisplay()}
              </p>
            )}
            
            {/* Active patient indicator */}
            {selectedPatientName && sessionStatus === 'running' && (
              <Badge variant="outline" className="mt-2">
                {selectedPatientName}
              </Badge>
            )}
          </div>
          
          {/* Quick Action Buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAnxietyQA(true)}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              שאלון חרדה
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQuickPatient(true)}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              מטופל חדש
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQuickAppointment(true)}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              קביעת תור
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCalendarInvite(true)}
              className="gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
            >
              <CalendarPlus className="h-4 w-4" />
              הזמנה + יומן
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowZoomInvite(true)}
              className="gap-2"
            >
              <VideoIcon className="h-4 w-4" />
              הזמנת Zoom
            </Button>
          </div>
          
          {/* Left side action buttons */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFollowUpPlan(true)}
              className="gap-2 bg-jade/10 hover:bg-jade/20 text-jade border-jade/30"
            >
              <ClipboardList className="h-4 w-4" />
              תוכנית המשך
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVoiceDictation(true)}
              className="gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
            >
              <Mic className="h-4 w-4" />
              הקלטה קולית
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Session Controls */}
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Video className="h-5 w-5 text-jade" />
            בקרת פגישה
            {selectedPatientName && (
              <Badge variant="outline" className="mr-auto">
                {selectedPatientName}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total session time info */}
          {sessionStatus !== 'idle' && (
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">זמן כולל:</span>
              <span className="font-mono font-medium">{formatDuration(sessionDuration)}</span>
              {sessionStartTime && (
                <span className="text-muted-foreground mr-auto">
                  • התחלה: {getSessionStartTimeDisplay()}
                </span>
              )}
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex flex-wrap gap-2">
            {sessionStatus === 'idle' && (
              <Button onClick={handleStart} className="bg-jade hover:bg-jade/90 gap-2">
                <Play className="h-4 w-4" />
                התחל פגישה
              </Button>
            )}
            
            {sessionStatus === 'running' && (
              <Button onClick={handlePause} variant="secondary" className="gap-2">
                <Pause className="h-4 w-4" />
                השהה
              </Button>
            )}
            
            {sessionStatus === 'paused' && (
              <Button onClick={handleResume} className="bg-jade hover:bg-jade/90 gap-2">
                <Play className="h-4 w-4" />
                המשך
              </Button>
            )}
            
            {(sessionStatus === 'running' || sessionStatus === 'paused') && (
              <>
                <Button onClick={handleRepeat} variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  התחל מחדש
                </Button>
                <Button onClick={handleEnd} variant="destructive" className="gap-2">
                  <Square className="h-4 w-4" />
                  סיים ושמור
                </Button>
              </>
            )}
            
            {sessionStatus === 'ended' && (
              <Button onClick={handleRepeat} className="bg-jade hover:bg-jade/90 gap-2">
                <RotateCcw className="h-4 w-4" />
                פגישה חדשה
              </Button>
            )}
          </div>

          {/* Session Notes */}
          <div>
            <label className="text-sm font-medium mb-2 block">הערות פגישה:</label>
            <Textarea
              value={sessionNotes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="רשום הערות במהלך הפגישה..."
              rows={3}
            />
          </div>

          {/* Report Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2">
              <Printer className="h-4 w-4" />
              הדפס דוח
            </Button>
            <Button onClick={handleSendEmail} variant="outline" size="sm" className="gap-2">
              <Mail className="h-4 w-4" />
              שלח באימייל
            </Button>
            <Button onClick={handleSendWhatsApp} variant="outline" size="sm" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              שלח בוואטסאפ
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AnxietyQADialog
        open={showAnxietyQA}
        onOpenChange={setShowAnxietyQA}
        onConversationSave={(conv) => setAnxietyConversation(conv)}
      />
      
      <QuickPatientDialog
        open={showQuickPatient}
        onOpenChange={setShowQuickPatient}
        onPatientCreated={handlePatientCreated}
      />
      
      <QuickAppointmentDialog
        open={showQuickAppointment}
        onOpenChange={setShowQuickAppointment}
        patientId={selectedPatientId || undefined}
        patientName={selectedPatientName || undefined}
      />
      
      <ZoomInviteDialog
        open={showZoomInvite}
        onOpenChange={setShowZoomInvite}
        patientName={selectedPatientName || undefined}
        patientPhone={selectedPatientPhone || undefined}
      />
      
      <TherapistSettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
      />
      
      <FollowUpPlanDialog
        open={showFollowUpPlan}
        onOpenChange={setShowFollowUpPlan}
        patientId={selectedPatientId || undefined}
        patientName={selectedPatientName || undefined}
        patientPhone={selectedPatientPhone || undefined}
      />
      
      <VoiceDictationDialog
        open={showVoiceDictation}
        onOpenChange={setShowVoiceDictation}
        patientId={selectedPatientId || undefined}
        patientName={selectedPatientName || undefined}
      />
      
      <CalendarInviteDialog
        open={showCalendarInvite}
        onOpenChange={setShowCalendarInvite}
        patientId={selectedPatientId || undefined}
        patientName={selectedPatientName || undefined}
        patientPhone={selectedPatientPhone || undefined}
        onAppointmentCreated={handleCalendarInviteCreated}
      />
    </div>
  );
}
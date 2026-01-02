import { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, TrendingUp, Plus, ArrowRight, Video, FileText, Trash2, BookOpen, Leaf, Volume2, VolumeX } from 'lucide-react';
import { WhatsAppReminderButton } from '@/components/crm/WhatsAppReminderButton';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { PullToRefreshContainer } from '@/components/ui/PullToRefreshContainer';
import { QuickPatientSearch } from '@/components/crm/QuickPatientSearch';
import { toast } from 'sonner';
interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  upcomingAppointments: number;
  weeklyVisits: number;
}

const DRAFT_KEY = 'patient_intake_draft';

interface DraftInfo {
  savedAt: number;
  currentStep: number;
  formData: { full_name?: string };
}

function getDraftInfo(): DraftInfo | null {
  try {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return null;
    const draft = JSON.parse(saved) as DraftInfo;
    // Only show if less than 24 hours old
    const hoursSinceSave = (Date.now() - draft.savedAt) / (1000 * 60 * 60);
    if (hoursSinceSave < 24) return draft;
    return null;
  } catch {
    return null;
  }
}

export default function CRMDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
    weeklyVisits: 0,
  });
  const [todayAppts, setTodayAppts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [draftInfo, setDraftInfo] = useState<DraftInfo | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [nextAppt, setNextAppt] = useState<any>(null);
  const [audioEnabled, setAudioEnabled] = useState(() => {
    return localStorage.getItem('appt_audio_reminder') !== 'false';
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const reminderShownRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetchDashboardData();
    setDraftInfo(getDraftInfo());
  }, []);

  const handleDiscardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setDraftInfo(null);
    toast.info('Draft discarded');
  };

  const handleContinueDraft = () => {
    navigate('/crm/patients/new');
  };

  // Play audio reminder
  const playReminderSound = useCallback(() => {
    if (!audioEnabled) return;
    try {
      // Create a simple notification beep using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // Play a second beep
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 1000;
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.5);
      }, 200);
    } catch (e) {
      console.log('Audio not supported');
    }
  }, [audioEnabled]);

  // Update countdown timer
  useEffect(() => {
    if (todayAppts.length === 0) return;

    const updateCountdown = () => {
      const now = new Date();
      const upcomingAppts = todayAppts.filter(appt => new Date(appt.start_time) > now);
      
      if (upcomingAppts.length === 0) {
        setNextAppt(null);
        setCountdown('');
        return;
      }

      const next = upcomingAppts[0];
      setNextAppt(next);
      
      const startTime = new Date(next.start_time);
      const diffMins = differenceInMinutes(startTime, now);
      const diffSecs = differenceInSeconds(startTime, now) % 60;
      
      if (diffMins < 60) {
        setCountdown(`Starts in ${diffMins}m ${diffSecs}s`);
      } else {
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        setCountdown(`Starts in ${hours}h ${mins}m`);
      }

      // Audio reminder at 15 min and 5 min
      const reminderKey15 = `${next.id}-15`;
      const reminderKey5 = `${next.id}-5`;
      
      if (diffMins === 15 && !reminderShownRef.current.has(reminderKey15)) {
        reminderShownRef.current.add(reminderKey15);
        playReminderSound();
        toast.info(`Appointment in 15 minutes: ${next.patients?.full_name || next.title}`, { duration: 5000 });
      }
      
      if (diffMins === 5 && !reminderShownRef.current.has(reminderKey5)) {
        reminderShownRef.current.add(reminderKey5);
        playReminderSound();
        toast.warning(`Appointment in 5 minutes: ${next.patients?.full_name || next.title}`, { duration: 8000 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [todayAppts, playReminderSound]);

  const toggleAudio = () => {
    const newValue = !audioEnabled;
    setAudioEnabled(newValue);
    localStorage.setItem('appt_audio_reminder', String(newValue));
    toast.success(newValue ? 'Audio reminders enabled' : 'Audio reminders disabled');
    if (newValue) playReminderSound();
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    try {
      // Get patient count
      const { count: patientCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      // Get today's appointments
      const { data: todayData, count: todayCount } = await supabase
        .from('appointments')
        .select('*, patients(full_name, phone)', { count: 'exact' })
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay)
        .order('start_time', { ascending: true });

      // Get upcoming appointments
      const { count: upcomingCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', new Date().toISOString())
        .eq('status', 'scheduled');

      // Get weekly visits
      const { count: weeklyCount } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .gte('visit_date', weekAgo);

      setStats({
        totalPatients: patientCount || 0,
        todayAppointments: todayCount || 0,
        upcomingAppointments: upcomingCount || 0,
        weeklyVisits: weeklyCount || 0,
      });
      setTodayAppts(todayData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    await fetchDashboardData();
    toast.success('Dashboard updated', { duration: 2000 });
  };

  const statCards = [
    { title: 'Patients', shortTitle: 'Patients', value: stats.totalPatients, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', showReminder: false, countdown: '' },
    { title: "Today's Appts", shortTitle: 'Today', value: stats.todayAppointments, icon: Calendar, color: 'text-jade', bg: 'bg-jade/10', showReminder: stats.todayAppointments > 0, countdown },
    { title: 'Upcoming', shortTitle: 'Soon', value: stats.upcomingAppointments, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', showReminder: false, countdown: '' },
    { title: 'This Week', shortTitle: 'Week', value: stats.weeklyVisits, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', showReminder: false, countdown: '' },
  ];

  return (
    <CRMLayout>
      <PullToRefreshContainer onRefresh={handleRefresh} className="min-h-full">
        <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-display font-semibold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back! Here's your clinic overview for {format(new Date(), 'EEEE, MMMM d')}
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Link to="/crm/patients/new">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden xs:inline">New</span> Patient
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-jade hover:bg-jade/90 flex-1 sm:flex-none">
                <Link to="/crm/calendar">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Quick Patient Search */}
          <QuickPatientSearch className="max-w-md" />
        </div>

        {/* Draft Recovery Card */}
        {draftInfo && (
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <FileText className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Unsaved Patient Intake Draft</p>
                  <p className="text-xs text-muted-foreground">
                    {draftInfo.formData?.full_name ? `"${draftInfo.formData.full_name}"` : 'Unnamed patient'} 
                    {' · '}Saved {formatDistanceToNow(draftInfo.savedAt, { addSuffix: true })}
                    {' · '}Step {(draftInfo.currentStep || 0) + 1}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDiscardDraft}
                  className="flex-1 sm:flex-none gap-1.5 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Discard
                </Button>
                <Button
                  size="sm"
                  onClick={handleContinueDraft}
                  className="flex-1 sm:flex-none gap-1.5 bg-amber-500 hover:bg-amber-600 text-white"
                >
                  <ArrowRight className="h-4 w-4" />
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="border-border/50 active:scale-[0.98] transition-transform touch-manipulation relative">
              {/* Blinking reminder dot for today's appointments */}
              {stat.showReminder && (
                <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-jade opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-jade"></span>
                  </span>
                  <span className="text-[10px] text-jade font-medium hidden sm:inline">Due Today</span>
                </div>
              )}
              <CardContent className="p-3 md:p-6">
                <div className="flex items-center justify-between gap-1 md:gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] md:text-sm text-muted-foreground truncate">
                      <span className="hidden sm:inline">{stat.title}</span>
                      <span className="sm:hidden">{stat.shortTitle}</span>
                    </p>
                    <p className="text-xl md:text-3xl font-semibold mt-0.5 md:mt-1">
                      {loading ? '—' : stat.value}
                    </p>
                    {/* Countdown timer */}
                    {stat.countdown && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <p className="text-[10px] md:text-xs text-jade font-medium animate-pulse">
                          {stat.countdown}
                        </p>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleAudio(); }}
                          className="p-0.5 hover:bg-muted rounded"
                          title={audioEnabled ? 'Disable audio reminders' : 'Enable audio reminders'}
                        >
                          {audioEnabled ? (
                            <Volume2 className="h-3 w-3 text-jade" />
                          ) : (
                            <VolumeX className="h-3 w-3 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className={`p-1.5 md:p-3 rounded-lg md:rounded-xl ${stat.bg} shrink-0`}>
                    <stat.icon className={`h-4 w-4 md:h-6 md:w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Today's Schedule & Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
          <Card className="border-border/50">
            <CardHeader className="pb-3 px-4 md:px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base md:text-lg">Today's Schedule</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/crm/calendar" className="text-xs md:text-sm">
                    View all <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : todayAppts.length === 0 ? (
                <div className="text-center py-6 md:py-8 text-muted-foreground">
                  <Calendar className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No appointments scheduled for today</p>
                  <Button variant="link" asChild className="mt-2 text-sm">
                    <Link to="/crm/calendar">Schedule an appointment</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppts.slice(0, 5).map((appt) => (
                    <div
                      key={appt.id}
                      className="flex items-center gap-3 md:gap-4 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <div className="w-1 h-10 md:h-12 rounded-full bg-jade shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm md:text-base truncate">
                          {appt.patients?.full_name || appt.title}
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {format(new Date(appt.start_time), 'h:mm a')} -{' '}
                          {format(new Date(appt.end_time), 'h:mm a')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <WhatsAppReminderButton
                          patientName={appt.patients?.full_name || 'Patient'}
                          patientPhone={appt.patients?.phone}
                          appointmentId={appt.id}
                          appointmentDate={appt.start_time}
                          appointmentTime={format(new Date(appt.start_time), 'HH:mm')}
                        />
                        <span
                          className={`px-2 py-1 text-xs rounded-full hidden sm:inline-block ${
                            appt.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : appt.status === 'confirmed'
                              ? 'bg-jade/20 text-jade border border-jade/30'
                              : appt.status === 'cancelled'
                              ? 'bg-red-500/10 text-red-500'
                              : 'bg-blue-500/10 text-blue-500'
                          }`}
                        >
                          {appt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions - Mobile Optimized with larger touch targets */}
          <Card className="border-border/50">
            <CardHeader className="pb-2 md:pb-3 px-3 md:px-6">
              <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-4">
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <Button 
                  variant="outline" 
                  className="h-14 md:h-20 flex-col gap-1 md:gap-2 text-xs md:text-sm touch-manipulation active:scale-[0.98]" 
                  asChild
                >
                  <Link to="/crm/patients/new">
                    <Users className="h-5 w-5 md:h-5 md:w-5" />
                    <span>Add Patient</span>
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-14 md:h-20 flex-col gap-1 md:gap-2 text-xs md:text-sm touch-manipulation active:scale-[0.98]" 
                  asChild
                >
                  <Link to="/crm/calendar">
                    <Calendar className="h-5 w-5 md:h-5 md:w-5" />
                    <span>Appointment</span>
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-14 md:h-20 flex-col gap-1 md:gap-2 text-xs md:text-sm touch-manipulation active:scale-[0.98]" 
                  asChild
                >
                  <Link to="/video-session">
                    <Video className="h-5 w-5 md:h-5 md:w-5 text-jade" />
                    <span>Video Session</span>
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-14 md:h-20 flex-col gap-1 md:gap-2 text-xs md:text-sm touch-manipulation active:scale-[0.98]" 
                  asChild
                >
                  <Link to="/tcm-brain">
                    <TrendingUp className="h-5 w-5 md:h-5 md:w-5" />
                    <span>TCM Brain</span>
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-14 md:h-20 flex-col gap-1 md:gap-2 text-xs md:text-sm touch-manipulation active:scale-[0.98]" 
                  asChild
                >
                  <Link to="/caf-browser">
                    <BookOpen className="h-5 w-5 md:h-5 md:w-5 text-jade" />
                    <span>CAF Studies</span>
                  </Link>
                </Button>
                <Link 
                  to="/retreat-quiz"
                  className="relative h-14 md:h-20 rounded-md border border-gold/30 overflow-hidden flex flex-col items-center justify-center gap-1 md:gap-2 text-xs md:text-sm touch-manipulation active:scale-[0.98] hover:border-gold/50 transition-all group"
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity"
                    style={{ backgroundImage: `url('/src/assets/quiz-dashboard-bg.jpg')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/20" />
                  <Leaf className="relative z-10 h-5 w-5 md:h-5 md:w-5 text-gold" />
                  <span className="relative z-10 font-medium">Retreat Quiz</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </PullToRefreshContainer>
    </CRMLayout>
  );
}
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTier } from '@/hooks/useTier';
import { TierBadge } from '@/components/layout/TierBadge';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WorkflowTutorial } from '@/components/onboarding/WorkflowTutorial';
import { OnboardingProgress, OnboardingProgressCompact } from '@/components/onboarding/OnboardingProgress';
import { useWorkflowProgress } from '@/hooks/useWorkflowProgress';
import { 
  Brain, 
  Calendar, 
  Users, 
  Video, 
  Lock,
  Leaf,
  LogOut,
  Database,
  CheckCircle2,
  FileCheck,
  Clock,
  UserCheck,
  UserPlus,
  Bell,
  Search,
  X,
  Phone,
  Sun,
  Moon,
  KeyRound,
  LockKeyhole,
  ShieldOff,
  ShieldCheck,
  PauseCircle,
  PlayCircle,
  ClipboardCheck
} from 'lucide-react';
import { PinSetupDialog } from '@/components/auth/PinSetupDialog';
import { usePinAuth } from '@/hooks/usePinAuth';
import { useSessionLock } from '@/contexts/SessionLockContext';
import { ShareQRButton } from '@/components/ui/ShareQRButton';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ThemedClockWidget, getClockTheme, type ClockTheme } from '@/components/ui/ThemedClockWidget';
import { Link } from 'react-router-dom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import calendarBg from '@/assets/calendar-bg.png';
import deskBg from '@/assets/desk-bg.png';
import brainBg from '@/assets/brain-bg.png';
import knowledgeBg from '@/assets/knowledge-bg.png';
import videoMeetingBg from '@/assets/video-meeting-bg.jpg';
import newLogo from '@/assets/new-logo.png';
import { PatientEducationWidget } from '@/components/education/PatientEducationWidget';
import { PediatricInfographicCard, VagusNerveCard, VagusStimulationDialog, StressWellnessCard, AssessmentCenterCard, PediatricProtocolCard } from '@/components/clinical';
import { UsageWidget, UsageCard } from '@/components/usage/UnifiedUsageMeter';
import { DashboardTokenCalculator } from '@/components/usage/DashboardTokenCalculator';
import { ClinicWalletCard } from '@/components/wallet/ClinicWalletCard';
import roiWidgetBg from '@/assets/roi-widget-bg.png';
import { PulseGalleryCard } from '@/components/dashboard/PulseGalleryCard';
import { BaZiDashboardCard } from '@/components/dashboard/BaZiDashboardCard';
import { DashboardThreeColumnLayout, GlassCard } from '@/components/dashboard/DashboardThreeColumnLayout';
import { DashboardGuide, useDashboardGuide } from '@/components/dashboard/DashboardGuide';
import { Compass } from 'lucide-react';


// Phosphor-style glowing clock component (mobile - small version)
function PhosphorClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourDeg = (hours * 30) + (minutes * 0.5);
  const minuteDeg = minutes * 6;
  const secondDeg = seconds * 6;

  return (
    <div className="relative w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-jade/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)] md:hidden">
      {/* Clock face glow */}
      <div className="absolute inset-0 rounded-full bg-jade/5" />
      
      {/* Hour markers */}
      {[0, 90, 180, 270].map((deg) => (
        <div
          key={deg}
          className="absolute w-0.5 h-1 bg-jade/40 rounded-full"
          style={{
            transform: `rotate(${deg}deg) translateY(-14px)`,
            transformOrigin: 'center center',
          }}
        />
      ))}
      
      {/* Hour hand */}
      <div
        className="absolute w-0.5 h-2.5 bg-jade rounded-full origin-bottom shadow-[0_0_4px_rgba(34,197,94,0.6)]"
        style={{
          transform: `rotate(${hourDeg}deg)`,
          bottom: '50%',
        }}
      />
      
      {/* Minute hand */}
      <div
        className="absolute w-0.5 h-3 bg-jade/80 rounded-full origin-bottom shadow-[0_0_4px_rgba(34,197,94,0.5)]"
        style={{
          transform: `rotate(${minuteDeg}deg)`,
          bottom: '50%',
        }}
      />
      
      {/* Second hand */}
      <div
        className="absolute w-px h-3.5 bg-emerald-400 rounded-full origin-bottom shadow-[0_0_6px_rgba(52,211,153,0.8)] transition-transform duration-100"
        style={{
          transform: `rotate(${secondDeg}deg)`,
          bottom: '50%',
        }}
      />
      
      {/* Center dot */}
      <div className="absolute w-1 h-1 bg-jade rounded-full shadow-[0_0_4px_rgba(34,197,94,0.8)]" />
    </div>
  );
}

interface Notification {
  id: string;
  type: 'follow_up' | 'appointment';
  title: string;
  time?: string;
  patientName?: string;
}


interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
  href?: string;
  highlighted?: boolean;
  backgroundImage?: string;
  animationDelay?: number;
  locked?: boolean;
  lockMessage?: string;
  statusBadge?: {
    text: string;
    variant: 'success' | 'warning' | 'pending';
  };
}

function FeatureCard({ title, description, icon, available, href, highlighted, backgroundImage, animationDelay = 0, locked, lockMessage, statusBadge }: FeatureCardProps) {
  const isLocked = locked || !available;
  
  const badgeStyles = {
    success: 'bg-emerald-500/90 text-white',
    warning: 'bg-amber-500/90 text-white',
    pending: 'bg-orange-500/90 text-white',
  };
  
  const content = (
    <Card 
      className={`transition-all duration-300 h-full relative overflow-hidden transform opacity-0 animate-fade-in ${!isLocked ? 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-jade/20 hover:scale-[1.03] cursor-pointer' : 'opacity-60'} ${highlighted && !isLocked ? 'ring-2 ring-jade border-jade hover:ring-jade/80 hover:shadow-jade/30' : ''}`}
      style={{
        animationDelay: `${animationDelay}ms`,
        animationFillMode: 'forwards',
        ...(backgroundImage ? { 
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {})
      }}
    >
      {/* Status Badge */}
      {statusBadge && (
        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium ${badgeStyles[statusBadge.variant]}`}>
          {statusBadge.text}
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${backgroundImage ? 'bg-white/20 backdrop-blur-sm' : !isLocked ? 'bg-jade-light' : 'bg-muted'}`}>
            {icon}
          </div>
          {isLocked && <Lock className={`h-5 w-5 ${backgroundImage ? 'text-white/70' : 'text-muted-foreground'}`} />}
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className={`text-lg mb-1 ${backgroundImage ? 'text-white' : ''}`}>{title}</CardTitle>
        <CardDescription className={`text-sm ${backgroundImage ? 'text-white/80' : ''}`}>
          {isLocked ? (lockMessage || 'שדרגו לתוכנית גבוהה יותר') : description}
        </CardDescription>
        {locked && (
          <Link 
            to="/crm/calendar" 
            className={`inline-flex items-center gap-1 mt-3 text-sm font-medium transition-colors ${backgroundImage ? 'text-jade-light hover:text-white' : 'text-jade hover:text-jade-dark'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Calendar className="h-4 w-4" />
            עבור ליומן התורים
          </Link>
        )}
      </CardContent>
    </Card>
  );

  if (!isLocked && href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
}

interface DashboardStats {
  totalPatients: number;
  appointmentsToday: number;
  patientsWithConsent: number;
  pendingConsents: number;
  hasAppointmentWithConsent: boolean;
  sessionsThisWeek: number;
}

interface DisclaimerStatus {
  isSigned: boolean;
  expiresAt?: Date;
  isExpired: boolean;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { tier, hasFeature, daysRemaining } = useTier();
  const { theme, setTheme } = useTheme();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    appointmentsToday: 0,
    patientsWithConsent: 0,
    pendingConsents: 0,
    hasAppointmentWithConsent: false,
    sessionsThisWeek: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; full_name: string; phone: string | null }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showVagusStimulation, setShowVagusStimulation] = useState(false);
  const [clockTheme, setClockTheme] = useState<ClockTheme>('gold');
  const [disclaimerStatus, setDisclaimerStatus] = useState<DisclaimerStatus>({ isSigned: false, isExpired: false });
  const { progress, hasProgress, resetProgress } = useWorkflowProgress();
  const { lock, isPaused, pauseReason, pauseLock, resumeLock } = useSessionLock();
  const { hasPin } = usePinAuth();
  const { isGuideOpen, startGuide, closeGuide } = useDashboardGuide();

  // Check therapist disclaimer status
  useEffect(() => {
    const checkDisclaimerStatus = async () => {
      // First check localStorage
      const DISCLAIMER_STORAGE_KEY = 'therapist_disclaimer_signed';
      const stored = localStorage.getItem(DISCLAIMER_STORAGE_KEY);
      
      if (stored) {
        try {
          const signedData = JSON.parse(stored);
          const expiresAt = signedData.signedAt ? new Date(new Date(signedData.signedAt).getTime() + 365 * 24 * 60 * 60 * 1000) : undefined;
          const isExpired = expiresAt ? expiresAt < new Date() : false;
          
          setDisclaimerStatus({
            isSigned: !isExpired,
            expiresAt,
            isExpired
          });
        } catch {
          setDisclaimerStatus({ isSigned: false, isExpired: false });
        }
      } else {
        setDisclaimerStatus({ isSigned: false, isExpired: false });
      }
    };
    
    checkDisclaimerStatus();
  }, []);

  // Load clock theme from settings
  useEffect(() => {
    setClockTheme(getClockTheme());
    
    // Listen for storage changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'therapist_clock_theme' && e.newValue) {
        setClockTheme(e.newValue as ClockTheme);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'בוקר טוב';
    if (hour >= 12 && hour < 17) return 'צהריים טובים';
    if (hour >= 17 && hour < 21) return 'ערב טוב';
    return 'לילה טוב';
  };
  const fetchNotifications = useCallback(async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(new Date(today).setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(new Date(today).setHours(23, 59, 59, 999)).toISOString();

      // Fetch pending follow-ups
      const { data: followUps } = await supabase
        .from('follow_ups')
        .select('id, scheduled_date, reason, patients(full_name)')
        .eq('status', 'pending')
        .lte('scheduled_date', today.toISOString().split('T')[0])
        .limit(10);

      // Fetch today's appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('id, start_time, title, patients(full_name)')
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay)
        .order('start_time', { ascending: true })
        .limit(10);

      const notifs: Notification[] = [];

      followUps?.forEach((fu: any) => {
        notifs.push({
          id: fu.id,
          type: 'follow_up',
          title: fu.reason || 'מעקב',
          patientName: fu.patients?.full_name,
        });
      });

      appointments?.forEach((apt: any) => {
        notifs.push({
          id: apt.id,
          type: 'appointment',
          title: apt.title,
          time: new Date(apt.start_time).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
          patientName: apt.patients?.full_name,
        });
      });

      setNotifications(notifs);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  // Search patients
  const searchPatients = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const { data } = await supabase
        .from('patients')
        .select('id, full_name, phone')
        .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(5);

      setSearchResults(data || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching patients:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPatients(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchPatients]);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Fetch dashboard statistics
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(new Date(today).setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(new Date(today).setHours(23, 59, 59, 999)).toISOString();

      // Get start of week (Sunday)
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      // Fetch patients
      const { data: patients } = await supabase
        .from('patients')
        .select('id, consent_signed');

      // Fetch today's appointments with patient info
      const { data: appointments } = await supabase
        .from('appointments')
        .select('id, patient_id')
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay);

      // Fetch this week's completed video sessions
      const { data: sessions } = await supabase
        .from('video_sessions')
        .select('id')
        .gte('started_at', startOfWeek.toISOString())
        .not('ended_at', 'is', null);

      const totalPatients = patients?.length || 0;
      const patientsWithConsent = patients?.filter(p => p.consent_signed).length || 0;
      const pendingConsents = totalPatients - patientsWithConsent;
      const appointmentsToday = appointments?.length || 0;
      const sessionsThisWeek = sessions?.length || 0;

      // Check if any appointment today has a patient with consent
      const patientIds = appointments?.map(a => a.patient_id).filter(Boolean) || [];
      const hasAppointmentWithConsent = patients?.some(
        p => p.consent_signed && patientIds.includes(p.id)
      ) || false;

      setStats({
        totalPatients,
        appointmentsToday,
        patientsWithConsent,
        pendingConsents,
        hasAppointmentWithConsent,
        sessionsThisWeek,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Set up real-time subscriptions for stats updates
    const patientsChannel = supabase
      .channel('dashboard-patients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, fetchStats)
      .subscribe();

    const appointmentsChannel = supabase
      .channel('dashboard-appointments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, fetchStats)
      .subscribe();

    const sessionsChannel = supabase
      .channel('dashboard-sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'video_sessions' }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(patientsChannel);
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(sessionsChannel);
    };
  }, [fetchStats]);

  useEffect(() => {
    if (!tier) {
      navigate('/gate');
    }
  }, [tier, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('therapist_tier');
    localStorage.removeItem('therapist_expires_at');
    navigate('/');
  };

  // Row 1: Calendar, Patient Management, Therapist Intake
  const getDisclaimerBadge = (): { text: string; variant: 'success' | 'warning' | 'pending' } | undefined => {
    if (disclaimerStatus.isExpired) {
      return { text: 'פג תוקף', variant: 'warning' };
    }
    if (disclaimerStatus.isSigned) {
      return { text: 'חתום ✓', variant: 'success' };
    }
    return { text: 'לא חתום', variant: 'pending' };
  };

  const row1Features = [
    {
      id: 'calendar',
      title: 'יומן תורים',
      description: 'ניהול תורים וזמינות',
      icon: <Calendar className="h-6 w-6 text-white" />,
      feature: 'calendar' as const,
      href: '/crm/calendar',
      backgroundImage: calendarBg,
    },
    {
      id: 'crm',
      title: 'ניהול מטופלים',
      description: 'CRM מותאם למטפלים',
      icon: <Users className="h-6 w-6 text-white" />,
      feature: 'crm' as const,
      href: '/crm/patients',
      backgroundImage: calendarBg,
    },
    {
      id: 'therapist_intake',
      title: 'קליטת מטפל',
      description: disclaimerStatus.isSigned 
        ? 'לחץ לעריכת פרטי המטפל' 
        : 'נדרש למלא טופס קליטה והצהרה',
      icon: <ClipboardCheck className="h-6 w-6 text-white" />,
      feature: 'crm' as const,
      href: disclaimerStatus.isSigned ? '/therapist-profile/edit' : '/therapist-intake',
      backgroundImage: deskBg,
      statusBadge: getDisclaimerBadge(),
    },
  ];

  // Row 2: Video Session, Standard Session - LOCKED (start from calendar)
  const sessionLockMessage = 'התחל טיפול מיומן התורים לאחר קביעת תור עם מטופל חתום';
  const row2Features = [
    {
      id: 'video_sessions',
      title: 'פגישת וידאו',
      description: 'טיפולים מרחוק בוידאו עם שאלוני תמיכה',
      icon: <Video className="h-6 w-6 text-white" />,
      feature: 'video_sessions' as const,
      href: '/video-session',
      highlighted: true,
      backgroundImage: videoMeetingBg,
      locked: true,
      lockMessage: sessionLockMessage,
    },
    {
      id: 'cm_brain',
      title: 'טיפול סטנדרטי',
      description: 'מוח AI ומפות גוף אינטראקטיביות',
      icon: <Brain className="h-6 w-6 text-white" />,
      feature: 'tcm_brain' as const,
      href: '/tcm-brain',
      backgroundImage: brainBg,
      locked: true,
      lockMessage: sessionLockMessage,
    },
  ];

  // Row 3: Knowledge Registry + Treatment Planner (removed individual quiz cards - now in Assessment Center)
  const row3Features = [
    {
      id: 'knowledge_registry',
      title: 'מאגר ידע',
      description: 'העלאת וניהול קבצי ידע CSV',
      icon: <Database className="h-6 w-6 text-jade" />,
      href: '/knowledge-registry',
      alwaysAvailable: true,
      backgroundImage: knowledgeBg,
    },
    {
      id: 'treatment_planner',
      title: 'מתכנן טיפולים',
      description: 'תכנון ומעקב אחר טיפולים',
      icon: <Calendar className="h-6 w-6 text-jade" />,
      href: '/treatment-planner',
      alwaysAvailable: true,
      backgroundImage: knowledgeBg,
    },
  ];

  if (!tier) return null;

  return (
    <>
      <Helmet>
        <title>מסך ראשי לניהול קליניקה | קליניקה ברפואה סינית משלימה</title>
        <meta name="description" content="מסך ראשי לניהול קליניקה ברפואה סינית משלימה" />
      </Helmet>

      {/* PIN Setup Dialog */}
      <PinSetupDialog 
        open={showPinSetup} 
        onOpenChange={setShowPinSetup}
        onSuccess={() => toast.success('PIN מוגדר! כעת תוכל להשתמש בו לגישה מהירה')}
      />

      <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity" aria-label="דף הבית">
            <div className="w-10 h-10 rounded-full flex items-center justify-center animate-scale-in overflow-hidden" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
              <img src={newLogo} alt="CM Clinic Logo" className="w-full h-full object-contain" />
            </div>
            <div className="opacity-0 animate-fade-in" style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}>
              <h1 className="font-display text-xl">CM Clinic</h1>
              <p className="text-sm text-muted-foreground">קליניקה ברפואה סינית משלימה</p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative opacity-0 animate-fade-in" style={{ animationDelay: '180ms', animationFillMode: 'forwards' }}>
            <div className="relative w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="חיפוש מטופל לפי שם או טלפון..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 pl-8 bg-muted/50 border-border/50 focus:bg-background"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                {searchResults.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0"
                  >
                    <Link
                      to={`/crm/patients/${patient.id}`}
                      className="flex items-center gap-3 flex-1"
                      onClick={() => {
                        setSearchQuery('');
                        setShowSearchResults(false);
                      }}
                    >
                      <Users className="h-4 w-4 text-jade" />
                      <div>
                        <p className="font-medium text-sm">{patient.full_name}</p>
                        {patient.phone && (
                          <p className="text-xs text-muted-foreground">{patient.phone}</p>
                        )}
                      </div>
                    </Link>
                    {patient.phone && (
                      <a
                        href={`tel:${patient.phone}`}
                        className="p-2 rounded-full bg-jade/10 hover:bg-jade/20 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="h-4 w-4 text-jade" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
            {showSearchResults && searchResults.length === 0 && searchQuery && !isSearching && (
              <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg z-50 p-4 text-center text-muted-foreground text-sm">
                לא נמצאו תוצאות
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 opacity-0 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            {/* Mobile Search Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>
            
            {/* Themed Clock Widget - Desktop only */}
            <div className="hidden md:block">
              <ThemedClockWidget theme={clockTheme} />
            </div>
            
            {/* Phosphor Clock - Mobile only */}
            <PhosphorClock />
            
            {/* Notifications Bell */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0" dir="rtl">
                <div className="p-3 border-b border-border">
                  <h3 className="font-medium">התראות</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      אין התראות חדשות
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <Link
                        key={notif.id}
                        to={notif.type === 'appointment' ? '/crm/calendar' : '/crm/patients'}
                        className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          notif.type === 'appointment' ? 'bg-blue-500/10' : 'bg-amber-500/10'
                        }`}>
                          {notif.type === 'appointment' ? (
                            <Calendar className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{notif.title}</p>
                          {notif.patientName && (
                            <p className="text-xs text-muted-foreground truncate">{notif.patientName}</p>
                          )}
                          {notif.time && (
                            <p className="text-xs text-jade mt-0.5">{notif.time}</p>
                          )}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-2 border-t border-border">
                    <Button variant="ghost" size="sm" className="w-full text-jade" asChild>
                      <Link to="/crm/calendar">צפה בכל התורים</Link>
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
            
            {/* Dark Mode Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} title={theme === 'dark' ? 'מצב יום' : 'מצב לילה'}>
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
            {/* PIN Quick Access Setup */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowPinSetup(true)}
              title={hasPin ? 'שנה PIN' : 'הגדר PIN לגישה מהירה'}
              className={hasPin ? 'text-jade' : ''}
            >
              <KeyRound className="h-5 w-5" />
            </Button>

            {/* Lock Status & Pause Toggle */}
            {hasPin && (
              <TooltipProvider>
                <div className="flex items-center gap-1">
                  {/* Pause/Resume Toggle */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => isPaused ? resumeLock() : pauseLock('Manual pause')}
                        className={isPaused ? 'text-amber-500 hover:text-amber-600' : 'text-jade hover:text-jade-dark'}
                      >
                        {isPaused ? (
                          <PlayCircle className="h-5 w-5" />
                        ) : (
                          <PauseCircle className="h-5 w-5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{isPaused ? 'הפעל נעילה אוטומטית' : 'השהה נעילה אוטומטית'}</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Status Badge */}
                  {isPaused && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs">
                          <ShieldOff className="h-3.5 w-3.5" />
                          <span>מושהה</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>{pauseReason || 'Auto-lock is paused'}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {/* Manual Lock Button - only when not paused */}
                  {!isPaused && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={lock}
                          className="text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                        >
                          <LockKeyhole className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>נעל מסך עכשיו</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TooltipProvider>
            )}
            
            {/* Share App QR Code */}
            <ShareQRButton 
              buttonVariant="ghost" 
              buttonSize="icon" 
              showLabel={false}
              title="שתפו את האפליקציה"
              description="סרקו את הקוד כדי להתקין את CM Clinic"
            />
            
            {/* Onboarding Progress Compact - in header */}
            <OnboardingProgressCompact />
            
            <TierBadge />
            <LanguageSwitcher variant="ghost" isScrolled={true} />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Search Panel */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-card border-b border-border px-4 py-3 animate-fade-in">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="חיפוש מטופל לפי שם או טלפון..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 pl-8 bg-muted/50 border-border/50 focus:bg-background"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          
          {/* Mobile Search Results */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="mt-3 bg-card border border-border rounded-lg overflow-hidden">
              {searchResults.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0"
                >
                  <Link
                    to={`/crm/patients/${patient.id}`}
                    className="flex items-center gap-3 flex-1"
                    onClick={() => {
                      setSearchQuery('');
                      setShowSearchResults(false);
                      setMobileSearchOpen(false);
                    }}
                  >
                    <Users className="h-4 w-4 text-jade" />
                    <div>
                      <p className="font-medium text-sm">{patient.full_name}</p>
                      {patient.phone && (
                        <p className="text-xs text-muted-foreground">{patient.phone}</p>
                      )}
                    </div>
                  </Link>
                  {patient.phone && (
                    <a
                      href={`tel:${patient.phone}`}
                      className="p-2 rounded-full bg-jade/10 hover:bg-jade/20 transition-colors"
                    >
                      <Phone className="h-4 w-4 text-jade" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
          {showSearchResults && searchResults.length === 0 && searchQuery && !isSearching && (
            <div className="mt-3 p-4 text-center text-muted-foreground text-sm bg-card border border-border rounded-lg">
              לא נמצאו תוצאות
            </div>
          )}
        </div>
      )}

      {/* Main Content - 3-Column Layout */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Section with Guide Button */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl mb-2">{getGreeting()}! 👋</h2>
            <p className="text-muted-foreground">
              {tier === 'trial' && daysRemaining !== null && (
                <>נותרו לכם {daysRemaining} ימי ניסיון. <Link to="/pricing" className="text-jade hover:underline">שדרגו עכשיו</Link></>
              )}
              {tier === 'standard' && 'אתם בתוכנית סטנדרט. כל הכלים הבסיסיים זמינים עבורכם.'}
              {tier === 'premium' && 'אתם בתוכנית פרימיום. כל הפיצ׳רים זמינים עבורכם!'}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={startGuide}
            className="gap-2 border-jade/30 hover:bg-jade/10"
          >
            <Compass className="h-4 w-4 text-jade" />
            מדריך
          </Button>
        </div>

        {/* 3-Column Dashboard Layout */}
        <DashboardThreeColumnLayout
          /* RIGHT COLUMN: Action - Workflow, Feature Cards, Assessment */
          rightColumn={
            <div id="dashboard-right-column" className="space-y-4">
              {/* 3-Step Workflow Stepper */}
              <GlassCard className="p-4">
                <h3 className="text-sm font-semibold mb-4 text-center">
                  💡 3 שלבים להתחלת טיפול
                </h3>
                <div className="flex flex-col items-center gap-3">
                  {/* Step 1: Schedule */}
                  <Link to="/crm/calendar" className="w-full">
                    <div className={`flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-jade/10 ${
                      stats.appointmentsToday > 0 ? 'bg-jade/5 border border-jade/20' : 'border border-border'
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        stats.appointmentsToday > 0 ? 'bg-jade text-white' : 'bg-jade/10'
                      }`}>
                        {stats.appointmentsToday > 0 ? <CheckCircle2 className="h-5 w-5" /> : <Calendar className="h-5 w-5 text-jade" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">1. קביעת תור</p>
                        <p className="text-xs text-muted-foreground">
                          {stats.appointmentsToday > 0 ? `${stats.appointmentsToday} תורים היום ✓` : 'התחילו כאן'}
                        </p>
                      </div>
                    </div>
                  </Link>

                  {/* Step 2: Consent */}
                  <Link to="/crm/patients" className="w-full">
                    <div className={`flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-jade/10 ${
                      stats.hasAppointmentWithConsent ? 'bg-jade/5 border border-jade/20' : 'border border-border'
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        stats.hasAppointmentWithConsent ? 'bg-jade text-white' : 'bg-jade/10'
                      }`}>
                        {stats.hasAppointmentWithConsent ? <CheckCircle2 className="h-5 w-5" /> : <Users className="h-5 w-5 text-jade" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">2. הסכמת מטופל</p>
                        <p className="text-xs text-muted-foreground">
                          {stats.hasAppointmentWithConsent ? 'מוכן ✓' : 'חתימה על טופס'}
                        </p>
                      </div>
                    </div>
                  </Link>

                  {/* Step 3: Start Session */}
                  <Link to="/crm/calendar" className="w-full">
                    <div className={`flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-jade/10 border border-border ${
                      stats.hasAppointmentWithConsent ? 'ring-2 ring-jade/30' : 'opacity-60'
                    }`}>
                      <div className="w-10 h-10 rounded-full bg-jade/10 flex items-center justify-center">
                        <Video className="h-5 w-5 text-jade" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">3. התחלת טיפול</p>
                        <p className="text-xs text-muted-foreground">
                          {stats.hasAppointmentWithConsent ? 'לחץ להתחלה! 🎉' : 'מהיומן'}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </GlassCard>

              {/* Feature Cards */}
              <GlassCard className="p-4">
                <h4 className="text-xs font-medium text-muted-foreground mb-3">כלי ניהול</h4>
                <div className="space-y-2">
                  <Link to="/crm/calendar" className="flex items-center gap-3 p-2 rounded-lg hover:bg-jade/10 transition-colors">
                    <Calendar className="h-5 w-5 text-jade" />
                    <span className="text-sm">יומן תורים</span>
                  </Link>
                  <Link to="/crm/patients" className="flex items-center gap-3 p-2 rounded-lg hover:bg-jade/10 transition-colors">
                    <Users className="h-5 w-5 text-jade" />
                    <span className="text-sm">ניהול מטופלים</span>
                  </Link>
                  <Link to={disclaimerStatus.isSigned ? '/therapist-profile/edit' : '/therapist-intake'} className="flex items-center gap-3 p-2 rounded-lg hover:bg-jade/10 transition-colors">
                    <ClipboardCheck className="h-5 w-5 text-jade" />
                    <span className="text-sm">קליטת מטפל</span>
                    {disclaimerStatus.isSigned && <span className="text-xs text-jade">✓</span>}
                  </Link>
                </div>
              </GlassCard>

              {/* Session Tools */}
              <GlassCard className="p-4">
                <h4 className="text-xs font-medium text-muted-foreground mb-3">כלי טיפול</h4>
                <div className="space-y-2">
                  <Link to="/video-session" className="flex items-center gap-3 p-2 rounded-lg hover:bg-jade/10 transition-colors">
                    <Video className="h-5 w-5 text-jade" />
                    <span className="text-sm">פגישת וידאו</span>
                  </Link>
                  <Link to="/tcm-brain" className="flex items-center gap-3 p-2 rounded-lg hover:bg-jade/10 transition-colors">
                    <Brain className="h-5 w-5 text-jade" />
                    <span className="text-sm">טיפול סטנדרטי</span>
                  </Link>
                  <Link to="/knowledge-registry" className="flex items-center gap-3 p-2 rounded-lg hover:bg-jade/10 transition-colors">
                    <Database className="h-5 w-5 text-jade" />
                    <span className="text-sm">מאגר ידע</span>
                  </Link>
                </div>
              </GlassCard>

              {/* Assessment Center */}
              <AssessmentCenterCard />
            </div>
          }

          /* CENTER COLUMN: Intelligence Hub - Stats, AI, Knowledge */
          centerColumn={
            <div id="dashboard-center-column" className="space-y-4">
              {/* Statistics Cards Row */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <Link to="/crm/patients">
                  <GlassCard className="p-3 text-center">
                    <p className="text-2xl font-bold text-jade">{isLoadingStats ? '-' : stats.totalPatients}</p>
                    <p className="text-xs text-muted-foreground">מטופלים</p>
                  </GlassCard>
                </Link>
                <Link to="/crm/calendar">
                  <GlassCard className="p-3 text-center">
                    <p className="text-2xl font-bold text-blue-500">{isLoadingStats ? '-' : stats.appointmentsToday}</p>
                    <p className="text-xs text-muted-foreground">תורים היום</p>
                  </GlassCard>
                </Link>
                <Link to="/crm/patients">
                  <GlassCard className="p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-500">{isLoadingStats ? '-' : stats.patientsWithConsent}</p>
                    <p className="text-xs text-muted-foreground">חתמו הסכמה</p>
                  </GlassCard>
                </Link>
                <Link to="/crm/patients">
                  <GlassCard className="p-3 text-center">
                    <p className="text-2xl font-bold text-amber-500">{isLoadingStats ? '-' : stats.pendingConsents}</p>
                    <p className="text-xs text-muted-foreground">ממתינים</p>
                  </GlassCard>
                </Link>
                <Link to="/crm/calendar">
                  <GlassCard className="p-3 text-center">
                    <p className="text-2xl font-bold text-purple-500">{isLoadingStats ? '-' : stats.sessionsThisWeek}</p>
                    <p className="text-xs text-muted-foreground">טיפולים השבוע</p>
                  </GlassCard>
                </Link>
              </div>


              {/* Knowledge Tools Grid */}

              {/* Additional Widgets */}
            </div>
          }

          /* LEFT COLUMN: Visual/Status - Clock, Galleries, Wallet */
          leftColumn={
            <div id="dashboard-left-column" className="space-y-4">
              {/* Progress */}
              <GlassCard className="p-4">
                <OnboardingProgress />
              </GlassCard>

              
              <GlassCard className="p-0 overflow-hidden">
                <PulseGalleryCard />
              </GlassCard>

              {/* Economy Monitor - z-[9999] */}
              <div className="sticky top-20 z-[9999] space-y-4">
                <GlassCard className="p-0 overflow-hidden">
                  <ClinicWalletCard />
                </GlassCard>
                
                <GlassCard className="p-0 overflow-hidden">
                  <DashboardTokenCalculator />
                </GlassCard>

                <GlassCard className="p-0 overflow-hidden">
                  <UsageWidget backgroundImage={roiWidgetBg} />
                </GlassCard>
              </div>

              {/* Additional Cards */}
              <GlassCard className="p-0 overflow-hidden">
                <BaZiDashboardCard />
              </GlassCard>

              {/* Pediatric & Vagus */}
              <GlassCard className="p-0 overflow-hidden">
                <PediatricInfographicCard />
              </GlassCard>
              
              <GlassCard className="p-0 overflow-hidden" onClick={() => setShowVagusStimulation(true)}>
                <VagusNerveCard />
              </GlassCard>
            </div>
          }
        />

        {/* Upgrade CTA for non-premium */}
        {tier !== 'premium' && (
          <GlassCard className="mt-8 bg-gradient-to-r from-jade/20 to-jade/5 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-xl mb-1">רוצים גישה לכל הפיצ׳רים?</h3>
                <p className="text-muted-foreground">שדרגו לתוכנית פרימיום וקבלו גישה מלאה כולל פגישות וידאו</p>
              </div>
              <Button asChild className="bg-jade hover:bg-jade/90 shrink-0">
                <Link to="/pricing">צפו בתוכניות</Link>
              </Button>
            </div>
          </GlassCard>
        )}
      </main>
      
      {/* Dashboard Guide Teleprompter */}
      <DashboardGuide isOpen={isGuideOpen} onClose={closeGuide} />
      
      {/* First-time tutorial overlay */}
      <WorkflowTutorial />
      
      {/* Vagus Stimulation Guide */}
      <VagusStimulationDialog 
        open={showVagusStimulation} 
        onOpenChange={setShowVagusStimulation}
      />
    </div>
    </>
  );
}

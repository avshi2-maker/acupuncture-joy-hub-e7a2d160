import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { useTier } from '@/hooks/useTier';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WorkflowTutorial } from '@/components/onboarding/WorkflowTutorial';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { PinSetupDialog } from '@/components/auth/PinSetupDialog';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ClinicStatsBar } from '@/components/dashboard/ClinicStatsBar';
import { QuickActionsGrid } from '@/components/dashboard/QuickActionsGrid';
import { DashboardGuide, useDashboardGuide } from '@/components/dashboard/DashboardGuide';
import { GoldenPathGuide, useGoldenPathGuide } from '@/components/dashboard/GoldenPathGuide';
import { ActiveSessionWidget } from '@/components/dashboard/ActiveSessionWidget';
import { HelpFAB } from '@/components/dashboard/HelpFAB';
import { ClinicalNexusCard } from '@/components/dashboard/ClinicalNexusCard';
import { ClinicWalletCard } from '@/components/wallet/ClinicWalletCard';
import { UsageWidget } from '@/components/usage/UnifiedUsageMeter';
import { VagusStimulationDialog } from '@/components/clinical';
import { useGlobalSessionOptional } from '@/contexts/GlobalSessionContext';
import roiWidgetBg from '@/assets/roi-widget-bg.png';

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
  const { tier, daysRemaining } = useTier();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    appointmentsToday: 0,
    patientsWithConsent: 0,
    pendingConsents: 0,
    hasAppointmentWithConsent: false,
    sessionsThisWeek: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showVagusStimulation, setShowVagusStimulation] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [disclaimerStatus, setDisclaimerStatus] = useState<DisclaimerStatus>({ isSigned: false, isExpired: false });
  const { isGuideOpen, closeGuide } = useDashboardGuide();
  const { isGuideOpen: isGoldenPathOpen, startGoldenPath, closeGoldenPath } = useGoldenPathGuide();
  const globalSession = useGlobalSessionOptional();

  // Check therapist disclaimer status
  useEffect(() => {
    const checkDisclaimerStatus = () => {
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

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'בוקר טוב';
    if (hour >= 12 && hour < 17) return 'צהריים טובים';
    if (hour >= 17 && hour < 21) return 'ערב טוב';
    return 'לילה טוב';
  };

  // Get tier message
  const getTierMessage = () => {
    if (tier === 'trial' && daysRemaining !== null) {
      return `נותרו לכם ${daysRemaining} ימי ניסיון`;
    }
    if (tier === 'standard') return 'תוכנית סטנדרט - כל הכלים הבסיסיים זמינים';
    if (tier === 'premium') return 'תוכנית פרימיום - גישה מלאה לכל הפיצ׳רים';
    return 'ברוכים הבאים לקליניקה';
  };

  // Fetch dashboard statistics
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const today = new Date();
      const startOfDay = new Date(new Date(today).setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(new Date(today).setHours(23, 59, 59, 999)).toISOString();

      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const { data: patients } = await supabase
        .from('patients')
        .select('id, consent_signed');

      const { data: appointments } = await supabase
        .from('appointments')
        .select('id, patient_id')
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay);

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

  if (!tier) return null;

  return (
    <>
      <Helmet>
        <title>מסך ראשי | CM Clinic - קליניקה ברפואה סינית</title>
        <meta name="description" content="מסך ראשי לניהול קליניקה ברפואה סינית משלימה" />
      </Helmet>

      {/* PIN Setup Dialog */}
      <PinSetupDialog 
        open={showPinSetup} 
        onOpenChange={setShowPinSetup}
        onSuccess={() => toast.success('PIN מוגדר! כעת תוכל להשתמש בו לגישה מהירה')}
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900" dir="rtl">
        {/* Sidebar - Desktop always visible, Mobile slide-in */}
        <DashboardSidebar 
          onLogout={handleLogout} 
          disclaimerSigned={disclaimerStatus.isSigned}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area - With right margin for sidebar on desktop */}
        <div className="lg:mr-64">
          {/* Header */}
          <DashboardHeader 
            greeting={getGreeting()} 
            tierMessage={getTierMessage()}
            onMenuClick={() => setIsMobileSidebarOpen(true)}
          />

          {/* Main Content */}
          <main className="p-6 space-y-8">
            {/* Centered Clinic Stats */}
            <ClinicStatsBar
              totalPatients={stats.totalPatients}
              appointmentsToday={stats.appointmentsToday}
              patientsWithConsent={stats.patientsWithConsent}
              pendingConsents={stats.pendingConsents}
              sessionsThisWeek={stats.sessionsThisWeek}
              isLoading={isLoadingStats}
            />

            {/* Active Session Widget */}
            <ActiveSessionWidget showTeleprompter={true} />

            {/* Patient Quick Actions Grid */}
            <QuickActionsGrid 
              disclaimerSigned={disclaimerStatus.isSigned}
              hasAppointmentWithConsent={stats.hasAppointmentWithConsent}
            />

            {/* Secondary Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Onboarding Progress */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold mb-4">התקדמות</h3>
                <OnboardingProgress />
              </div>

              {/* Clinical NEXUS */}
              <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                <ClinicalNexusCard />
              </div>

              {/* Wallet & Usage */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                  <ClinicWalletCard />
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                  <UsageWidget backgroundImage={roiWidgetBg} />
                </div>
              </div>
            </div>

            {/* Upgrade CTA for non-premium */}
            {tier !== 'premium' && (
              <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/5 rounded-2xl p-6 border border-blue-200 dark:border-blue-600/30">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl mb-1 text-slate-800 dark:text-slate-100">רוצים גישה לכל הפיצ׳רים?</h3>
                    <p className="text-slate-600 dark:text-slate-400">שדרגו לתוכנית פרימיום וקבלו גישה מלאה כולל פגישות וידאו</p>
                  </div>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                    <Link to="/pricing">צפו בתוכניות</Link>
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
        
        {/* Dashboard Guide Teleprompter */}
        <DashboardGuide isOpen={isGuideOpen} onClose={closeGuide} />
        
        {/* Golden Path Guide */}
        <GoldenPathGuide isOpen={isGoldenPathOpen} onClose={closeGoldenPath} />
        
        {/* Help FAB */}
        <HelpFAB 
          onClick={startGoldenPath} 
          isSessionActive={globalSession?.isSessionActive ?? false}
        />
        
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

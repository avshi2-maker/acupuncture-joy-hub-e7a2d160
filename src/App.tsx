import { useEffect, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { TierProvider, useTier } from "@/hooks/useTier";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { SessionLockProvider } from "@/contexts/SessionLockContext";
import { GlobalSessionProvider } from "@/contexts/GlobalSessionContext";
import RequireTier from "@/components/auth/RequireTier";

import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { AccessibilityPanel } from "@/components/ui/AccessibilityPanel";
import { CRMErrorBoundary } from "@/components/crm/CRMErrorBoundary";
import { SplashScreen } from "@/components/ui/SplashScreen";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Navigate } from "react-router-dom";
import Pricing from "./pages/Pricing";
import PaymentInstructions from "./pages/PaymentInstructions";
import Gate from "./pages/Gate";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import VideoSession from "./pages/VideoSession";
import Auth from "./pages/Auth";
import TcmBrain from "./pages/TcmBrain";
import CRMDashboard from "./pages/crm/CRMDashboard";
import CRMCalendar from "./pages/crm/CRMCalendar";
import CRMPatients from "./pages/crm/CRMPatients";
import CRMPatientNew from "./pages/crm/CRMPatientNew";
import CRMPatientDetail from "./pages/crm/CRMPatientDetail";
import CRMPatientEdit from "./pages/crm/CRMPatientEdit";
import CRMRooms from "./pages/crm/CRMRooms";
import CRMStaff from "./pages/crm/CRMStaff";
import CRMClinics from "./pages/crm/CRMClinics";
import PatientConsentForm from "./pages/crm/PatientConsentForm";
import AppointmentConfirm from "./pages/AppointmentConfirm";
import AppointmentLanding from "./pages/AppointmentLanding";
import TherapistProfile from "./pages/TherapistProfile";
import InstallApp from "./pages/InstallApp";
import AdminFeedback from "./pages/AdminFeedback";
import KnowledgeRegistry from "./pages/KnowledgeRegistry";
import BaziCalculator from "./pages/BaziCalculator";
import LegalReport from "./pages/LegalReport";
import SymptomChecker from "./pages/SymptomChecker";
import TreatmentPlanner from "./pages/TreatmentPlanner";
import QATesting from "./pages/QATesting";
import EncyclopediaLanding from "./pages/EncyclopediaLanding";
import Developers from "./pages/Developers";
import ScenariosDashboard from "./pages/ScenariosDashboard";
import TherapistDisclaimer from "./pages/TherapistDisclaimer";
import TherapistIntake from "./pages/TherapistIntake";
import AdminDisclaimers from "./pages/AdminDisclaimers";
import AdminLegalAudit from "./pages/AdminLegalAudit";
import CMBrainQuestions from "./pages/CMBrainQuestions";
import Contact from "./pages/Contact";
import AdminPasswordGenerator from "./pages/AdminPasswordGenerator";
import CAFBrowser from "./pages/CAFBrowser";
import TherapistProfileEdit from "./pages/TherapistProfileEdit";
import RetreatQuiz from "./pages/RetreatQuiz";
import BrainHealthAssessment from "./pages/BrainHealthAssessment";
import FullBodyAssessment from "./pages/FullBodyAssessment";
import Patient360 from "./pages/Patient360";
import CRMSessionManager from "./pages/crm/CRMSessionManager";
import PatientValuator from "./pages/PatientValuator";
import ProfessionalInvite from "./pages/ProfessionalInvite";
import ClinicalTrialsBrowser from "./pages/ClinicalTrialsBrowser";
import ROISimulator from "./pages/ROISimulator";
import UISmokeTest from "./pages/UISmokeTest";
import MusicPlayerTest from "./pages/MusicPlayerTest";
import TherapistROICalculator from "./pages/TherapistROICalculator";
import SimulationCalculators from "./pages/SimulationCalculators";
import ClinicalNavigator from "./pages/ClinicalNavigator";
import HealthCompass from "./pages/HealthCompass";
import PatientQuestionnaire from "./pages/PatientQuestionnaire";
import InternalClimateQuestionnaire from "./pages/InternalClimateQuestionnaire";
import VitalityLongevityQuestionnaire from "./pages/VitalityLongevityQuestionnaire";
import BalanceStrengthAdultQuestionnaire from "./pages/BalanceStrengthAdultQuestionnaire";
import GoldenAgeVitalityQuestionnaire from "./pages/GoldenAgeVitalityQuestionnaire";
import LongevityDignityQuestionnaire from "./pages/LongevityDignityQuestionnaire";
import NourishingLifeQuestionnaire from "./pages/NourishingLifeQuestionnaire";
import MentalClarityQuestionnaire from "./pages/MentalClarityQuestionnaire";
import PainRehabilitationQuestionnaire from "./pages/PainRehabilitationQuestionnaire";
import ImmuneShieldQuestionnaire from "./pages/ImmuneShieldQuestionnaire";
import ZangFuSyndromesQuestionnaire from "./pages/ZangFuSyndromesQuestionnaire";
import PulseTongueDiagnosisQuestionnaire from "./pages/PulseTongueDiagnosisQuestionnaire";
import AcupuncturePointsQuestionnaire from "./pages/AcupuncturePointsQuestionnaire";
import QuestionnaireHub from "./pages/QuestionnaireHub";
import TongueGallery from "./pages/TongueGallery";
import PulseGallery from "./pages/PulseGallery";
import CombinedDiagnosis from "./pages/CombinedDiagnosis";
import RAGHebrewReport from "./pages/RAGHebrewReport";
import HebrewQuestionsReport from "./pages/HebrewQuestionsReport";
import PatientTimeline from "./pages/PatientTimeline";
import AssetInventory from "./pages/AssetInventory";
import PrivateDeveloper from "./pages/PrivateDeveloper";
import StandardSession from "./pages/StandardSession";
import { SessionLayout } from "./components/layouts/SessionLayout";

const queryClient = new QueryClient();

function HashPathRedirect() {
  useEffect(() => {
    // App uses HashRouter. If a user navigates directly to /dashboard (no #/...),
    // convert it to the equivalent hash route so refresh / direct links work.
    if (typeof window === "undefined") return;

    const hasHashRoute = window.location.hash.startsWith("#/");
    const isDirectPath = window.location.pathname !== "/";

    if (!hasHashRoute && isDirectPath) {
      const targetHash = `#${window.location.pathname}${window.location.search}`;
      window.location.replace(`${window.location.origin}/${targetHash}`);
    }
  }, []);

  return null;
}

// Splash screen wrapper that shows on initial mount
function AppWithSplash({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash for minimum 800ms to ensure smooth entry
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <SplashScreen isVisible={showSplash} />
      {children}
    </>
  );
}

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey="tcm-theme">
        <AccessibilityProvider>
          <LanguageProvider>
            <AuthProvider>
              <TierProvider>
                <SessionLockProvider>
                  <GlobalSessionProvider>
                    <TooltipProvider>
                      <AppWithSplash>
                        <OfflineBanner />
                        <HashRouter>
                          <HashPathRedirect />
                    <Routes>
                    {/* ============================================= */}
                    {/* PUBLIC ROUTES - No authentication required    */}
                    {/* ============================================= */}
                      <Route path="/" element={<Index />} />
                      <Route path="/therapist-register" element={<Navigate to="/therapist-intake" replace />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/payment-instructions" element={<PaymentInstructions />} />
                      <Route path="/gate" element={<Gate />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/confirm" element={<AppointmentConfirm />} />
                      <Route path="/appointment" element={<AppointmentLanding />} />
                      <Route path="/install" element={<InstallApp />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/therapist-disclaimer" element={<TherapistDisclaimer />} />
                      <Route path="/therapist-intake" element={<TherapistIntake />} />
                      <Route path="/retreat-quiz" element={<RetreatQuiz />} />
                      <Route path="/invite" element={<ProfessionalInvite />} />

                    {/* ============================================= */}
                    {/* AUTHENTICATED DEFAULT - Redirect to CRM       */}
                    {/* ============================================= */}
                      <Route path="/dashboard" element={<RequireTier><Navigate to="/crm" replace /></RequireTier>} />
                      <Route path="/video-session" element={<RequireTier><VideoSession /></RequireTier>} />
                      <Route path="/tcm-brain" element={<RequireTier><TcmBrain /></RequireTier>} />

                    {/* ============================================= */}
                    {/* CRM ROUTES - Clinic Management System         */}
                    {/* ============================================= */}
                      <Route path="/crm" element={<RequireTier><CRMErrorBoundary><CRMDashboard /></CRMErrorBoundary></RequireTier>} />
                      <Route path="/crm/dashboard" element={<RequireTier><CRMErrorBoundary><CRMDashboard /></CRMErrorBoundary></RequireTier>} />
                      <Route path="/crm/calendar" element={<RequireTier><CRMErrorBoundary><CRMCalendar /></CRMErrorBoundary></RequireTier>} />
                      <Route path="/crm/patients" element={<RequireTier><CRMErrorBoundary><CRMPatients /></CRMErrorBoundary></RequireTier>} />
                      <Route path="/crm/patients/new" element={<RequireTier><CRMErrorBoundary><CRMPatientNew /></CRMErrorBoundary></RequireTier>} />
                      <Route path="/crm/patients/:id" element={<RequireTier><CRMErrorBoundary><CRMPatientDetail /></CRMErrorBoundary></RequireTier>} />
                      <Route path="/crm/patients/:id/edit" element={<RequireTier><CRMErrorBoundary><CRMPatientEdit /></CRMErrorBoundary></RequireTier>} />
                      <Route path="/crm/rooms" element={<RequireTier><CRMErrorBoundary><CRMRooms /></CRMErrorBoundary></RequireTier>} />
                      <Route path="/crm/staff" element={<RequireTier><CRMErrorBoundary><CRMStaff /></CRMErrorBoundary></RequireTier>} />
                      <Route path="/crm/clinics" element={<RequireTier><CRMErrorBoundary><CRMClinics /></CRMErrorBoundary></RequireTier>} />
                      <Route path="/crm/session-manager" element={<RequireTier><CRMErrorBoundary><CRMSessionManager /></CRMErrorBoundary></RequireTier>} />
                      <Route path="/crm/patients/:patientId/consent" element={<RequireTier><CRMErrorBoundary><PatientConsentForm /></CRMErrorBoundary></RequireTier>} />
                      <Route path="/patient/:id/timeline" element={<RequireTier><CRMErrorBoundary><PatientTimeline /></CRMErrorBoundary></RequireTier>} />

                    {/* ============================================= */}
                    {/* SESSION MODE - Active clinical session        */}
                    {/* ============================================= */}
                      <Route path="/session/:patientId" element={<RequireTier><SessionLayout /></RequireTier>} />

                    {/* CLINICAL TOOLS - Grouped under /clinical-tools */}
                    {/* ============================================= */}
                      <Route path="/clinical-tools/bazi" element={<RequireTier><BaziCalculator /></RequireTier>} />
                      <Route path="/clinical-tools/pulse-gallery" element={<RequireTier><PulseGallery /></RequireTier>} />
                      <Route path="/clinical-tools/tongue-gallery" element={<RequireTier><TongueGallery /></RequireTier>} />
                      <Route path="/clinical-tools/symptom-checker" element={<RequireTier><SymptomChecker /></RequireTier>} />
                      <Route path="/clinical-tools/brain-assessment" element={<BrainHealthAssessment />} />
                      <Route path="/clinical-tools/full-body" element={<FullBodyAssessment />} />
                      <Route path="/clinical-tools/combined-diagnosis" element={<RequireTier><CombinedDiagnosis /></RequireTier>} />
                      <Route path="/clinical-tools/treatment-planner" element={<RequireTier><TreatmentPlanner /></RequireTier>} />
                      <Route path="/clinical-tools/clinical-navigator" element={<RequireTier><ClinicalNavigator /></RequireTier>} />
                      <Route path="/clinical-tools/health-compass" element={<HealthCompass />} />
                      <Route path="/clinical-tools/patient-360" element={<RequireTier><Patient360 /></RequireTier>} />
                      <Route path="/clinical-tools/patient-valuator" element={<RequireTier><PatientValuator /></RequireTier>} />
                      <Route path="/clinical-tools/caf-browser" element={<RequireTier><CAFBrowser /></RequireTier>} />
                      <Route path="/clinical-tools/clinical-trials" element={<RequireTier><ClinicalTrialsBrowser /></RequireTier>} />
                      
                      {/* Legacy routes - redirect to new clinical-tools paths */}
                      <Route path="/bazi-calculator" element={<Navigate to="/clinical-tools/bazi" replace />} />
                      <Route path="/pulse-gallery" element={<Navigate to="/clinical-tools/pulse-gallery" replace />} />
                      <Route path="/tongue-gallery" element={<Navigate to="/clinical-tools/tongue-gallery" replace />} />
                      <Route path="/symptom-checker" element={<Navigate to="/clinical-tools/symptom-checker" replace />} />
                      <Route path="/brain-assessment" element={<Navigate to="/clinical-tools/brain-assessment" replace />} />
                      <Route path="/full-body-assessment" element={<Navigate to="/clinical-tools/full-body" replace />} />
                      <Route path="/combined-diagnosis" element={<Navigate to="/clinical-tools/combined-diagnosis" replace />} />
                      <Route path="/treatment-planner" element={<Navigate to="/clinical-tools/treatment-planner" replace />} />
                      <Route path="/clinical-navigator" element={<Navigate to="/clinical-tools/clinical-navigator" replace />} />
                      <Route path="/health-compass" element={<Navigate to="/clinical-tools/health-compass" replace />} />
                      <Route path="/patient-360" element={<Navigate to="/clinical-tools/patient-360" replace />} />
                      <Route path="/patient-valuator" element={<Navigate to="/clinical-tools/patient-valuator" replace />} />
                      <Route path="/caf-browser" element={<Navigate to="/clinical-tools/caf-browser" replace />} />
                      <Route path="/clinical-trials" element={<Navigate to="/clinical-tools/clinical-trials" replace />} />

                    {/* ============================================= */}
                    {/* THERAPIST PROFILE                             */}
                    {/* ============================================= */}
                      <Route path="/therapist-profile" element={<RequireTier><TherapistProfile /></RequireTier>} />
                      <Route path="/therapist-profile/edit" element={<RequireTier><TherapistProfileEdit /></RequireTier>} />

                    {/* ============================================= */}
                    {/* ADMIN ROUTES                                  */}
                    {/* ============================================= */}
                      <Route path="/admin" element={<RequireTier><Admin /></RequireTier>} />
                      <Route path="/admin/feedback" element={<RequireTier><AdminFeedback /></RequireTier>} />
                      <Route path="/admin/knowledge" element={<KnowledgeRegistry />} />
                      <Route path="/admin/disclaimers" element={<RequireTier><AdminDisclaimers /></RequireTier>} />
                      <Route path="/admin/passwords" element={<RequireTier><AdminPasswordGenerator /></RequireTier>} />
                      <Route path="/admin/legal-audit" element={<RequireTier><AdminLegalAudit /></RequireTier>} />

                    {/* ============================================= */}
                    {/* ENCYCLOPEDIA & KNOWLEDGE                      */}
                    {/* ============================================= */}
                      <Route path="/encyclopedia" element={<RequireTier><EncyclopediaLanding /></RequireTier>} />
                      <Route path="/knowledge-registry" element={<KnowledgeRegistry />} />
                      <Route path="/cm-brain-questions" element={<RequireTier><CMBrainQuestions /></RequireTier>} />

                    {/* ============================================= */}
                    {/* QUESTIONNAIRES                                */}
                    {/* ============================================= */}
                      <Route path="/questionnaire-hub" element={<QuestionnaireHub />} />
                      <Route path="/patient-questionnaire" element={<PatientQuestionnaire />} />
                      <Route path="/internal-climate" element={<InternalClimateQuestionnaire />} />
                      <Route path="/vitality-longevity" element={<VitalityLongevityQuestionnaire />} />
                      <Route path="/balance-strength-adult" element={<BalanceStrengthAdultQuestionnaire />} />
                      <Route path="/golden-age-vitality" element={<GoldenAgeVitalityQuestionnaire />} />
                      <Route path="/longevity-dignity" element={<LongevityDignityQuestionnaire />} />
                      <Route path="/nourishing-life" element={<NourishingLifeQuestionnaire />} />
                      <Route path="/mental-clarity" element={<MentalClarityQuestionnaire />} />
                      <Route path="/pain-rehabilitation" element={<PainRehabilitationQuestionnaire />} />
                      <Route path="/immune-shield" element={<ImmuneShieldQuestionnaire />} />
                      <Route path="/zang-fu-syndromes" element={<ZangFuSyndromesQuestionnaire />} />
                      <Route path="/pulse-tongue-diagnosis" element={<PulseTongueDiagnosisQuestionnaire />} />
                      <Route path="/acupuncture-points" element={<AcupuncturePointsQuestionnaire />} />

                    {/* ============================================= */}
                    {/* TOOLS & UTILITIES                             */}
                    {/* ============================================= */}
                      <Route path="/legal-report" element={<RequireTier><LegalReport /></RequireTier>} />
                      <Route path="/qa-testing" element={<RequireTier><QATesting /></RequireTier>} />
                      <Route path="/developers" element={<RequireTier><Developers /></RequireTier>} />
                      <Route path="/scenarios" element={<RequireTier><ScenariosDashboard /></RequireTier>} />
                      <Route path="/roi-simulator" element={<ROISimulator />} />
                      <Route path="/therapist-roi" element={<TherapistROICalculator />} />
                      <Route path="/simulation-calculators" element={<SimulationCalculators />} />
                      <Route path="/rag-hebrew-report" element={<RequireTier><RAGHebrewReport /></RequireTier>} />
                      <Route path="/hebrew-questions-report" element={<RequireTier><HebrewQuestionsReport /></RequireTier>} />
                      <Route path="/asset-inventory" element={<RequireTier><AssetInventory /></RequireTier>} />

                    {/* ============================================= */}
                    {/* DEV & TESTING                                 */}
                    {/* ============================================= */}
                      <Route path="/ui-smoke-test" element={<UISmokeTest />} />
                      <Route path="/music-test" element={<MusicPlayerTest />} />
                      <Route path="/private-developer" element={<PrivateDeveloper />} />
                      <Route path="/standard-session" element={<StandardSession />} />

                    {/* ============================================= */}
                    {/* CATCH-ALL                                     */}
                    {/* ============================================= */}
                      <Route path="*" element={<NotFound />} />
                        </Routes>
                        
                        <AccessibilityPanel />
                      </HashRouter>
                    </AppWithSplash>
                  </TooltipProvider>
                </GlobalSessionProvider>
              </SessionLockProvider>
            </TierProvider>
          </AuthProvider>
        </LanguageProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  </QueryClientProvider>
</HelmetProvider>
);

export default App;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { TierProvider } from "@/hooks/useTier";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { SessionLockProvider } from "@/contexts/SessionLockContext";
import RequireTier from "@/components/auth/RequireTier";
import { FloatingMusicPlayer } from "@/components/ui/FloatingMusicPlayer";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { AccessibilityPanel } from "@/components/ui/AccessibilityPanel";
import { CRMErrorBoundary } from "@/components/crm/CRMErrorBoundary";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TherapistRegister from "./pages/TherapistRegister";
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
import AdminDisclaimers from "./pages/AdminDisclaimers";
import CMBrainQuestions from "./pages/CMBrainQuestions";
import PointCoordinateEditor from "./pages/PointCoordinateEditor";
import Contact from "./pages/Contact";
import AdminPasswordGenerator from "./pages/AdminPasswordGenerator";
import CAFBrowser from "./pages/CAFBrowser";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey="tcm-theme">
        <AccessibilityProvider>
          <LanguageProvider>
            <AuthProvider>
              <TierProvider>
                <SessionLockProvider>
                  <TooltipProvider>
                    <OfflineBanner />
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                    {/* Public */}
                      <Route path="/" element={<Index />} />
                      <Route path="/therapist-register" element={<TherapistRegister />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/payment-instructions" element={<PaymentInstructions />} />
                      <Route path="/gate" element={<Gate />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/confirm" element={<AppointmentConfirm />} />
                      <Route path="/install" element={<InstallApp />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/therapist-disclaimer" element={<TherapistDisclaimer />} />

                      {/* Protected (requires tier) */}
                      <Route path="/dashboard" element={<RequireTier><Dashboard /></RequireTier>} />
                      <Route path="/video-session" element={<RequireTier><VideoSession /></RequireTier>} />
                      <Route path="/tcm-brain" element={<RequireTier><TcmBrain /></RequireTier>} />

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
                      <Route path="/crm/patients/:patientId/consent" element={<RequireTier><CRMErrorBoundary><PatientConsentForm /></CRMErrorBoundary></RequireTier>} />

                      <Route path="/therapist-profile" element={<RequireTier><TherapistProfile /></RequireTier>} />

                      <Route path="/admin" element={<RequireTier><Admin /></RequireTier>} />
                      <Route path="/admin/feedback" element={<RequireTier><AdminFeedback /></RequireTier>} />
                      <Route path="/admin/knowledge" element={<RequireTier><KnowledgeRegistry /></RequireTier>} />
                      <Route path="/admin/disclaimers" element={<RequireTier><AdminDisclaimers /></RequireTier>} />
                      <Route path="/admin/passwords" element={<RequireTier><AdminPasswordGenerator /></RequireTier>} />

                      <Route path="/knowledge-registry" element={<RequireTier><KnowledgeRegistry /></RequireTier>} />
                      <Route path="/bazi-calculator" element={<RequireTier><BaziCalculator /></RequireTier>} />
                      <Route path="/legal-report" element={<RequireTier><LegalReport /></RequireTier>} />
                      <Route path="/symptom-checker" element={<RequireTier><SymptomChecker /></RequireTier>} />
                      <Route path="/treatment-planner" element={<RequireTier><TreatmentPlanner /></RequireTier>} />
                      <Route path="/qa-testing" element={<RequireTier><QATesting /></RequireTier>} />
                      <Route path="/encyclopedia" element={<RequireTier><EncyclopediaLanding /></RequireTier>} />
                      <Route path="/developers" element={<RequireTier><Developers /></RequireTier>} />
                      <Route path="/scenarios" element={<RequireTier><ScenariosDashboard /></RequireTier>} />
                      <Route path="/cm-brain-questions" element={<RequireTier><CMBrainQuestions /></RequireTier>} />
                      <Route path="/point-editor" element={<RequireTier><PointCoordinateEditor /></RequireTier>} />
                      <Route path="/caf-browser" element={<RequireTier><CAFBrowser /></RequireTier>} />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <FloatingMusicPlayer />
                    <AccessibilityPanel />
                  </BrowserRouter>
                  </TooltipProvider>
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


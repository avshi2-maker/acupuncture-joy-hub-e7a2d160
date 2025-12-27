import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { TierProvider } from "@/hooks/useTier";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TherapistRegister from "./pages/TherapistRegister";
import Pricing from "./pages/Pricing";
import PaymentInstructions from "./pages/PaymentInstructions";
import Gate from "./pages/Gate";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import TcmBrain from "./pages/TcmBrain";
import CRM from "./pages/CRM";
import CRMDashboard from "./pages/crm/CRMDashboard";
import CRMCalendar from "./pages/crm/CRMCalendar";
import CRMPatients from "./pages/crm/CRMPatients";
import CRMPatientNew from "./pages/crm/CRMPatientNew";
import CRMPatientDetail from "./pages/crm/CRMPatientDetail";
import CRMPatientEdit from "./pages/crm/CRMPatientEdit";
import CRMRooms from "./pages/crm/CRMRooms";
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

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TierProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/therapist-register" element={<TherapistRegister />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/payment-instructions" element={<PaymentInstructions />} />
                  <Route path="/gate" element={<Gate />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/tcm-brain" element={<TcmBrain />} />
                  <Route path="/crm" element={<CRMDashboard />} />
                  <Route path="/crm/dashboard" element={<CRMDashboard />} />
                  <Route path="/crm/calendar" element={<CRMCalendar />} />
                  <Route path="/crm/patients" element={<CRMPatients />} />
                  <Route path="/crm/patients/new" element={<CRMPatientNew />} />
                  <Route path="/crm/patients/:id" element={<CRMPatientDetail />} />
                  <Route path="/crm/patients/:id/edit" element={<CRMPatientEdit />} />
                  <Route path="/crm/rooms" element={<CRMRooms />} />
                  <Route path="/crm/patients/:patientId/consent" element={<PatientConsentForm />} />
                  <Route path="/confirm" element={<AppointmentConfirm />} />
                  <Route path="/therapist-profile" element={<TherapistProfile />} />
                  <Route path="/install" element={<InstallApp />} />
                  <Route path="/admin/feedback" element={<AdminFeedback />} />
                  <Route path="/admin/knowledge" element={<KnowledgeRegistry />} />
                  <Route path="/knowledge-registry" element={<KnowledgeRegistry />} />
                  <Route path="/bazi-calculator" element={<BaziCalculator />} />
                  <Route path="/legal-report" element={<LegalReport />} />
                  <Route path="/symptom-checker" element={<SymptomChecker />} />
                  <Route path="/treatment-planner" element={<TreatmentPlanner />} />
                  <Route path="/qa-testing" element={<QATesting />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                
              </BrowserRouter>
            </TooltipProvider>
          </TierProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

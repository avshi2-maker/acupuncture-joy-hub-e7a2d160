import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { TierProvider } from "@/hooks/useTier";
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

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
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
                <Route path="/crm" element={<CRM />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </TierProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

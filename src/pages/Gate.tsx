import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useTier } from '@/hooks/useTier';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Calculator, CheckCircle, ChevronDown, CreditCard, Eye, EyeOff, Fingerprint, HelpCircle, Leaf, Loader2, Lock, Mail, MessageCircle, Upload } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import { BackToTopButton } from '@/components/ui/BackToTopButton';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import gateBg from '@/assets/gate-background.png';
import tokenSimulatorBg from '@/assets/token-simulator-bg.png';
import { VideoShowcaseCards } from '@/components/gate/VideoShowcaseCards';
import { MobileTierCarousel } from '@/components/gate/MobileTierCarousel';
import { StickyTierFooter } from '@/components/gate/StickyTierFooter';
import { TokenCalculator } from '@/components/pricing/TokenCalculator';
import { FeatureComparisonTable } from '@/components/pricing/FeatureComparisonTable';

// Session expiry timer component - REMOVED per user request

const gateSchema = z.object({
  password: z
    .string()
    .trim()
    .min(1, 'נא להזין סיסמה'),
});

type GateForm = z.infer<typeof gateSchema>;

const tiers = [
  {
    name: 'Trial',
    nameHe: 'ניסיון',
    price: 'חינם',
    period: '7 ימי ניסיון',
    queriesLimit: '500 שאילתות/חודש',
    tokensInfo: '~50K טוקנים',
    description: '7 ימי ניסיון חינם לכל הפיצ׳רים הבסיסיים',
    features: [
      { name: 'מאגר ידע - TCM Brain', included: true },
      { name: 'יומן תורים', included: true },
      { name: 'ניהול מטופלים (CRM)', included: true },
      { name: 'מפת גוף אינטראקטיבית', included: true },
      { name: 'תזכורות Email למטופלים', included: false },
      { name: 'תזכורות WhatsApp', included: false },
      { name: 'פגישות וידאו', included: false },
    ],
  },
  {
    name: 'Standard',
    nameHe: 'סטנדרט',
    price: '₪40',
    period: '/ חודש',
    periodSub: '+ מע״מ',
    queriesLimit: '1,200 שאילתות/חודש',
    tokensInfo: '~200K טוקנים',
    description: 'כולל תזכורות אוטומטיות למטופלים',
    features: [
      { name: 'מאגר ידע - TCM Brain', included: true },
      { name: 'יומן תורים', included: true },
      { name: 'ניהול מטופלים (CRM)', included: true },
      { name: 'מפת גוף אינטראקטיבית', included: true },
      { name: 'תזכורות Email למטופלים', included: true },
      { name: 'תזכורות WhatsApp', included: true },
      { name: 'פגישות וידאו', included: false },
    ],
    highlighted: true,
  },
  {
    name: 'Premium',
    nameHe: 'פרימיום',
    price: '₪50',
    period: '/ חודש',
    periodSub: '+ מע״מ',
    queriesLimit: '5,000 שאילתות/חודש',
    tokensInfo: '~250K טוקנים',
    description: 'כל הפיצ׳רים כולל פגישות וידאו',
    features: [
      { name: 'מאגר ידע - TCM Brain', included: true },
      { name: 'יומן תורים', included: true },
      { name: 'ניהול מטופלים (CRM)', included: true },
      { name: 'מפת גוף אינטראקטיבית', included: true },
      { name: 'תזכורות Email למטופלים', included: true },
      { name: 'תזכורות WhatsApp', included: true },
      { name: 'פגישות וידאו', included: true },
    ],
  },
];

type Step = 'tiers' | 'payment' | 'password';

// Check if therapist disclaimer is completed
const DISCLAIMER_STORAGE_KEY = 'tcm_therapist_disclaimer_signed';
const INTAKE_STORAGE_KEY = 'therapist_intake_completed';

// Helper to check if intake is completed
const isIntakeCompleted = (): boolean => {
  try {
    const completed = localStorage.getItem(INTAKE_STORAGE_KEY);
    if (!completed) return false;
    const data = JSON.parse(completed);
    // Check if completed within last year
    return data.completedAt && new Date(data.completedAt) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  } catch {
    return false;
  }
};

// Scroll indicator arrow component
function ScrollIndicator() {
  return (
    <motion.div 
      className="flex flex-col items-center mt-8 mb-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
    >
      <motion.p 
        className="text-sm text-muted-foreground mb-2 font-heebo"
      >
        מחשבון טוקנים חכם ⬇️
      </motion.p>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="w-8 h-8 text-gold" />
      </motion.div>
    </motion.div>
  );
}

// Token Calculator with scroll-triggered animation
interface TokenCalculatorSectionProps {
  onPlanRecommended?: (planName: string) => void;
}

function TokenCalculatorSection({ onPlanRecommended }: TokenCalculatorSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  // Scroll to tier cards and highlight the recommended plan
  const scrollToTier = (planName: string) => {
    onPlanRecommended?.(planName);
    const tierCard = document.getElementById(`tier-card-${planName.toLowerCase()}`);
    if (tierCard) {
      tierCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  
  return (
    <>
      <ScrollIndicator />
      <motion.div
        id="token-calculator"
        ref={ref}
        className="mt-2 scroll-mt-8"
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="relative rounded-2xl p-6 border border-gold/30 overflow-visible"
          initial={{ boxShadow: "0 10px 40px rgba(212,175,55,0.1)" }}
          animate={isInView ? {
            boxShadow: [
              "0 10px 40px rgba(212,175,55,0.1)",
              "0 15px 60px rgba(212,175,55,0.35)",
              "0 12px 45px rgba(212,175,55,0.2)",
            ],
          } : {}}
          transition={{
            duration: 2,
            times: [0, 0.5, 1],
            ease: "easeInOut",
          }}
          whileHover={{ 
            boxShadow: "0 20px 60px rgba(212,175,55,0.3)",
            scale: 1.01,
          }}
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 rounded-2xl bg-cover bg-center opacity-15"
            style={{ backgroundImage: `url(${tokenSimulatorBg})` }}
          />
          {/* Overlay for readability */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/95 via-white/90 to-white/85 backdrop-blur-sm" />
          
          {/* Animated glow border effect */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: [0, 1, 0.6] } : { opacity: 0 }}
            transition={{ duration: 2, times: [0, 0.5, 1] }}
            style={{
              background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)",
              filter: "blur(20px)",
            }}
          />
          <div className="relative z-10">
            <TokenCalculator onPlanRecommended={scrollToTier} />
          </div>
        </motion.div>
        
        {/* ROI Calculator Link */}
        <div className="mt-6 text-center">
          <Link 
            to="/therapist-roi"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
            <Calculator className="h-4 w-4" />
            מחשבון פוטנציאל הכנסה למטפלים
          </Link>
        </div>
      </motion.div>
    </>
  );
}

export default function Gate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setTier, setExpiresAt } = useTier();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('tiers');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [therapistName, setTherapistName] = useState('');
  const [therapistPhone, setTherapistPhone] = useState('');
  
  const [rememberMe, setRememberMe] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [recommendedPlan, setRecommendedPlan] = useState<string | null>(null);
  const [showStickyFooter, setShowStickyFooter] = useState(false);
  const tierSectionRef = useRef<HTMLDivElement>(null);
  
  // Biometric authentication
  const { isAvailable: isBiometricAvailable, isEnabled: isBiometricEnabled, authenticate, enableBiometric, isAuthenticating } = useBiometricAuth();
  
  // Check if user has previously logged in (has stored tier info)
  const hasStoredSession = localStorage.getItem('tier') !== null;
  
  // Handle return from intake form - check URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stepParam = params.get('step');
    const tierParam = params.get('tier');
    
    if (stepParam === 'payment' && tierParam) {
      // Validate intake is completed before allowing payment step
      if (!isIntakeCompleted()) {
        toast.error('יש להשלים את טופס הקליטה תחילה');
        sessionStorage.setItem('selected_tier_for_intake', tierParam);
        navigate('/therapist-intake?from=gate');
        return;
      }
      setSelectedTier(tierParam);
      setCurrentStep('payment');
      sessionStorage.removeItem('selected_tier_for_intake');
    } else if (stepParam === 'password') {
      // Validate intake is completed before allowing password step
      if (!isIntakeCompleted()) {
        toast.error('יש להשלים את טופס הקליטה תחילה');
        sessionStorage.setItem('selected_tier_for_intake', 'trial');
        navigate('/therapist-intake?from=gate');
        return;
      }
      setSelectedTier('trial');
      setCurrentStep('password');
      sessionStorage.removeItem('selected_tier_for_intake');
    }
  }, [location.search, navigate]);
  
  // Simulate page loading for tier cards
  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Sticky footer visibility - show when tier section is not visible
  useEffect(() => {
    if (currentStep !== 'tiers') {
      setShowStickyFooter(false);
      return;
    }
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky footer when tier section is NOT in view
        setShowStickyFooter(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (tierSectionRef.current) {
      observer.observe(tierSectionRef.current);
    }

    return () => observer.disconnect();
  }, [currentStep]);

  const scrollToTierSection = () => {
    tierSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const form = useForm<GateForm>({
    resolver: zodResolver(gateSchema),
    defaultValues: {
      password: '',
    },
  });

  const buildPostLoginRedirect = () => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    const question = params.get('question');
    
    // Since intake is completed BEFORE password entry in the new flow,
    // we can go directly to dashboard or profile
    const hasProfile = localStorage.getItem('therapist_profile');
    const defaultRedirect = hasProfile ? '/dashboard' : '/therapist-profile';

    const url = new URL(redirect || defaultRedirect, window.location.origin);
    if (question) url.searchParams.set('question', question);

    return `${url.pathname}${url.search}${url.hash}`;
  };

  const handleSelectTier = (tierName: string) => {
    setSelectedTier(tierName);
    // Store selected tier and redirect to intake form
    sessionStorage.setItem('selected_tier_for_intake', tierName.toLowerCase());
    navigate('/therapist-intake?from=gate');
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  // Israeli phone validation regex (05X-XXXXXXX or 05XXXXXXXX formats)
  const isValidIsraeliPhone = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    // Israeli mobile: starts with 05, followed by 8 digits (total 10 digits)
    return /^05\d{8}$/.test(cleanPhone);
  };

  const handleSendProof = async () => {
    if (!therapistName.trim() || therapistName.trim().length < 2) {
      toast.error('נא להזין שם מלא (לפחות 2 תווים)');
      return;
    }
    if (!therapistPhone.trim()) {
      toast.error('נא להזין מספר טלפון');
      return;
    }
    if (!isValidIsraeliPhone(therapistPhone)) {
      toast.error('נא להזין מספר טלפון ישראלי תקין (לדוגמה: 050-1234567)');
      return;
    }
    if (!proofFile) {
      toast.error('נא לבחור קובץ אישור תשלום');
      return;
    }

    setIsUploading(true);
    try {
      // Upload to Supabase storage
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `payment-proof-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, proofFile);

      if (uploadError) {
        console.log('Upload notice:', uploadError.message);
      }

      // Send email notification to Dr. Roni
      const tierName = selectedTier === 'standard' ? 'סטנדרט' : 'פרימיום';
      await supabase.functions.invoke('notify-payment-proof', {
        body: { 
          tierName, 
          fileName: proofFile.name,
          therapistName: therapistName.trim(),
          therapistPhone: therapistPhone.trim(),
        },
      });

      toast.success('אישור התשלום נשלח בהצלחה! תקבלו סיסמה בוואטסאפ בקרוב.');
      setCurrentStep('password');
    } catch (error) {
      toast.error('שגיאה בשליחת האישור. נא לשלוח ישירות בוואטסאפ.');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: GateForm) => {
    setIsLoading(true);
    try {
      const password = data.password.trim();

      const { data: validationResult, error } = await supabase
        .rpc('validate_access_password', { password_input: password });

      if (error) throw error;

      const result = validationResult?.[0];
      if (!result || !result.valid) {
        toast.error('סיסמה לא תקינה, בשימוש, או שפג תוקפה.');
        return;
      }

      setTier(result.tier as 'trial' | 'standard' | 'premium');
      
      // If remember me is checked, extend session to 30 days; otherwise use default from server
      if (rememberMe) {
        const extendedExpiry = new Date();
        extendedExpiry.setDate(extendedExpiry.getDate() + 30);
        setExpiresAt(extendedExpiry);
        localStorage.setItem('remember_me', 'true');
      } else if (result.expires_at) {
        setExpiresAt(new Date(result.expires_at));
      }

      await supabase.from('access_logs').insert({
        action: 'password_login',
        details: { tier: result.tier },
      });
      
      // Offer to enable biometric for next time (if available and not already enabled)
      if (isBiometricAvailable && !isBiometricEnabled) {
        setTimeout(async () => {
          const enableResult = await enableBiometric();
          if (enableResult.success) {
            toast.success('🔐 כניסה ביומטרית הופעלה!', {
              description: 'בפעם הבאה תוכלו להיכנס עם טביעת אצבע / Face ID',
              duration: 5000,
            });
          }
        }, 1500);
      }

      // Show beautiful welcome toast with celebration
      toast.success('ברוכים הבאים! 🌿', {
        description: 'נכנסתם בהצלחה למערכת',
        duration: 4000,
        className: 'bg-gradient-to-r from-jade/10 to-gold/10 border-jade',
      });
      
      // Navigate after confetti starts
      setTimeout(() => {
        navigate(buildPostLoginRedirect(), { replace: true });
      }, 800);
    } catch (error) {
      toast.error('שגיאה בכניסה. נסו שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle biometric login
  const handleBiometricLogin = async () => {
    const result = await authenticate();
    if (result.success) {
      // Restore stored tier from localStorage
      const storedTier = localStorage.getItem('tier') as 'trial' | 'standard' | 'premium' | null;
      const storedExpiry = localStorage.getItem('tierExpiresAt');
      
      if (storedTier) {
        setTier(storedTier);
        if (storedExpiry) {
          setExpiresAt(new Date(storedExpiry));
        }
        
        await supabase.from('access_logs').insert({
          action: 'biometric_login',
          details: { tier: storedTier },
        });
        
        toast.success('ברוכים הבאים! 🔐', {
          description: 'כניסה מהירה בטביעת אצבע',
          duration: 3000,
        });
        
        setTimeout(() => {
          navigate(buildPostLoginRedirect(), { replace: true });
        }, 800);
      } else {
        toast.error('לא נמצאה כניסה קודמת. נא להיכנס עם סיסמה.');
      }
    } else if (result.error !== 'Authentication cancelled') {
      toast.error('אימות ביומטרי נכשל');
    }
  };

  const tierPrices: Record<string, string> = {
    trial: 'חינם',
    standard: '₪40',
    premium: '₪50',
  };

  return (
    <>
      <Helmet>
        <title>כניסה למטפלים | TCM Clinic</title>
        <meta name="description" content="בחרו תוכנית והזינו סיסמת גישה" />
      </Helmet>

      <div className="min-h-screen relative overflow-x-hidden overflow-y-visible" dir="rtl">
        {/* Beautiful bamboo background */}
        <div 
          className="fixed inset-0 -z-20"
          style={{
            backgroundImage: `url(${gateBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />
        
        {/* Dark overlay for text readability */}
        <div className="fixed inset-0 -z-10 bg-black/20" />
        
        {/* Vignette effect */}
        <div 
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 100%)',
          }}
        />

        <div className="relative z-10 py-4 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-start mb-4">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 hover:bg-white transition-colors shadow-lg"
              >
                <ArrowLeft className="h-4 w-4" />
                חזרה לדף הבית
              </Link>
            </div>

            {/* Step Indicator - Glassmorphism style */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-1 sm:gap-2 p-2 rounded-full bg-white/80 backdrop-blur-md shadow-lg flex-wrap justify-center">
                <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-full transition-all ${currentStep === 'tiers' ? 'bg-jade text-white shadow-md' : 'text-slate-600'}`}>
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/30 flex items-center justify-center text-xs sm:text-sm font-medium">1</span>
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">תוכנית</span>
                </div>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
                <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-full transition-all text-slate-600`}>
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/30 flex items-center justify-center text-xs sm:text-sm font-medium">2</span>
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">טופס קליטה</span>
                </div>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
                <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-full transition-all ${currentStep === 'payment' ? 'bg-jade text-white shadow-md' : 'text-slate-600'}`}>
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/30 flex items-center justify-center text-xs sm:text-sm font-medium">3</span>
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">תשלום</span>
                </div>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
                <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-full transition-all ${currentStep === 'password' ? 'bg-jade text-white shadow-md' : 'text-slate-600'}`}>
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/30 flex items-center justify-center text-xs sm:text-sm font-medium">4</span>
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">כניסה</span>
                </div>
              </div>
            </div>

            {/* Step 1: Tier Selection */}
            {currentStep === 'tiers' && (
              <>
                {/* Video Showcase Cards */}
                <VideoShowcaseCards />

                {/* Header */}
                <div className="text-center mb-4 text-white" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                  <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">
                    ברוכים הבאים לקליניקה
                  </h1>
                  <p className="text-base opacity-90">
                    בחרו את הנתיב המתאים ביותר לביקור שלכם היום
                  </p>
                </div>

                {/* ROI Calculator Button */}
                <div className="flex justify-center mb-4">
                  <Link
                    to="/therapist-roi"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-gold to-amber-500 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    <Calculator className="h-4 w-4" />
                    מחשבון ROI למטפלים
                  </Link>
                </div>

                {/* Mobile Swipeable Carousel */}
                <div ref={tierSectionRef} className="pt-6 md:pt-0">
                  <MobileTierCarousel
                    tiers={tiers}
                    recommendedPlan={recommendedPlan}
                    onSelectTier={handleSelectTier}
                    onCalculatorClick={() => {
                      document.getElementById('token-calculator')?.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'center'
                      });
                    }}
                  />
                </div>

                {/* Desktop Grid - Hidden on mobile */}
                <div id="tier-selection" className="hidden md:grid overflow-visible md:grid-cols-3 gap-3 lg:gap-4 mb-4 pt-6 md:pt-8 items-stretch scroll-mt-24 max-w-4xl mx-auto">
                  {isPageLoading ? (
                    // Skeleton loading state
                    <>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-2xl bg-white/80 backdrop-blur-xl p-6 space-y-4 animate-pulse">
                          <div className="space-y-2">
                            <Skeleton className="h-6 w-24 mx-auto" />
                            <Skeleton className="h-10 w-20 mx-auto" />
                            <Skeleton className="h-4 w-40 mx-auto" />
                          </div>
                          <div className="space-y-2 pt-4">
                            {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                              <div key={j} className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-4 flex-1" />
                              </div>
                            ))}
                          </div>
                          <Skeleton className="h-10 w-full mt-4" />
                        </div>
                      ))}
                    </>
                  ) : (
                    // Compact Glass Tier Cards
                    tiers.map((tier) => {
                      const isRecommended = recommendedPlan === tier.name;
                      return (
                      <div
                        id={`tier-card-${tier.name.toLowerCase()}`}
                        key={tier.name}
                        data-tier={tier.name}
                        className="relative overflow-visible"
                      >
                        {/* Badge for highlighted (kept outside blur layer to prevent clipping) */}
                        {tier.highlighted && (
                          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
                            <span className="bg-gold text-primary-foreground px-4 py-1 rounded-full text-sm font-bold shadow-gold">
                              הכי פופולרי
                            </span>
                          </div>
                        )}

                        <div
                          className={`
                            relative flex flex-col h-full
                            rounded-xl
                            px-4 pb-4
                            ${tier.highlighted ? 'pt-10' : 'pt-5'} 
                            text-center
                            transition-all duration-300
                            backdrop-blur-xl border
                            ${tier.highlighted 
                              ? 'bg-white/85 border border-gold/50 shadow-md' 
                              : 'bg-white/75 border-slate-200/50 hover:bg-white/90 shadow-sm hover:shadow-md'
                            }
                            ${isRecommended 
                              ? 'ring-2 ring-gold/60' 
                              : ''
                            }
                            hover:-translate-y-0.5
                          `}
                          style={{ fontFamily: "'Heebo', sans-serif" }}
                        >
                          {/* Plan Name */}
                          <h3 className="text-base font-semibold mb-0.5 text-jade-dark">
                            {tier.nameHe}
                          </h3>
                          <p className="text-[11px] text-muted-foreground mb-1.5">{tier.name}</p>

                        {/* Price */}
                        <div className="mb-1">
                          <span className="text-xl font-bold text-foreground">
                            {tier.price}
                          </span>
                          {tier.period && (
                            <span className="text-xs text-muted-foreground mr-1">{tier.period}</span>
                          )}
                        </div>
                        {tier.periodSub && (
                          <p className="text-[10px] text-muted-foreground mb-1.5">{tier.periodSub}</p>
                        )}

                        {/* Limits */}
                        <div className="flex items-center justify-center gap-1.5 mb-2 flex-wrap">
                          <span className="text-[10px] font-medium bg-jade/10 text-jade-dark rounded-full px-2 py-0.5">
                            {tier.queriesLimit}
                          </span>
                          <span className="text-[10px] font-medium bg-gold/10 text-gold-dark rounded-full px-2 py-0.5">
                            {tier.tokensInfo}
                          </span>
                        </div>

                        {/* Features List */}
                        <ul className="space-y-1 mb-3 flex-1 text-right">
                          {tier.features.map((feature, idx) => (
                            <li 
                              key={idx} 
                              className={`flex items-center text-xs ${feature.included ? 'text-foreground/80' : 'text-muted-foreground/50 line-through'}`}
                            >
                              <span 
                                className={`ml-2 font-bold w-4 text-center text-[10px] ${feature.included ? 'text-jade' : 'text-muted-foreground/30'}`}
                              >
                                {feature.included ? '✓' : '✕'}
                              </span>
                              {feature.name}
                            </li>
                          ))}
                        </ul>

                        {/* CTA Button */}
                        <button
                          onClick={() => handleSelectTier(tier.name)}
                          className={`
                            w-full py-2 rounded-lg font-medium text-sm
                            transition-all duration-200
                            ${tier.highlighted 
                              ? 'bg-gold text-white hover:bg-gold/90' 
                              : 'bg-transparent border border-jade text-jade hover:bg-jade hover:text-white'
                            }
                          `}
                        >
                          {tier.name === 'Trial' ? 'התחל ניסיון' : 'בחר חבילה'}
                        </button>
                        
                        {/* Try Calculator Button - Enhanced touch target */}
                        <button
                          onClick={() => {
                            document.getElementById('token-calculator')?.scrollIntoView({ 
                              behavior: 'smooth',
                              block: 'center'
                            });
                          }}
                          className="w-full mt-3 md:mt-2 py-2.5 md:py-1.5 text-sm md:text-xs text-gray-500 hover:text-jade transition-colors flex items-center justify-center gap-1.5 group min-h-[44px] md:min-h-0 touch-manipulation"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 group-hover:text-gold transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="16" height="20" x="4" y="2" rx="2"/>
                            <line x1="8" x2="16" y1="6" y2="6"/>
                            <line x1="16" x2="16" y1="14" y2="18"/>
                            <path d="M16 10h.01"/>
                            <path d="M12 10h.01"/>
                            <path d="M8 10h.01"/>
                            <path d="M12 14h.01"/>
                            <path d="M8 14h.01"/>
                            <path d="M12 18h.01"/>
                            <path d="M8 18h.01"/>
                          </svg>
                          נסה את המחשבון
                        </button>
                      </div>
                    </div>
                  );
                })
                )}
              </div>

              {/* Token Calculator - Scroll-Triggered Animation with Glow */}
              <TokenCalculatorSection onPlanRecommended={setRecommendedPlan} />

                {/* Feature Comparison Table */}
                <div className="mt-12 bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-xl">
                  <FeatureComparisonTable />
                </div>

                {hasStoredSession && isBiometricEnabled && (
                  <div className="mb-8">
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 max-w-md mx-auto border border-gold/30 shadow-xl">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-jade to-jade-dark flex items-center justify-center">
                          <Fingerprint className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">כניסה מהירה</h3>
                        <p className="text-sm text-slate-600 mb-4">היי! זוהית כמטפל/ת חוזר/ת</p>
                        <Button
                          onClick={handleBiometricLogin}
                          disabled={isAuthenticating}
                          className="w-full bg-gradient-to-r from-jade to-jade-dark hover:from-jade-dark hover:to-jade text-white py-3"
                        >
                          {isAuthenticating ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              <Fingerprint className="h-5 w-5 ml-2" />
                              כניסה עם טביעת אצבע / Face ID
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-center text-white/80 text-sm mt-4">או בחרו תוכנית חדשה למטה</p>
                  </div>
                )}

                {/* Skip to password entry */}
                <div className="text-center">
                  <Button 
                    variant="link" 
                    onClick={() => setCurrentStep('password')}
                    className="text-white hover:text-gold"
                  >
                    כבר יש לי סיסמה - דלגו לכניסה
                  </Button>
                </div>
              </>
            )}

          {/* Step 2: Payment Instructions */}
          {currentStep === 'payment' && selectedTier && (
            <div className="max-w-2xl mx-auto">
              <Card className="shadow-elevated">
                <CardHeader className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center">
                    <CreditCard className="h-8 w-8 text-gold" />
                  </div>
                  <CardTitle className="font-display text-2xl">
                    תוכנית {selectedTier === 'standard' ? 'סטנדרט' : 'פרימיום'} - {tierPrices[selectedTier.toLowerCase()]} לחודש
                  </CardTitle>
                  <CardDescription>
                    בצעו תשלום ושלחו אישור לקבלת סיסמה
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Step 1: Payment */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-jade text-white flex items-center justify-center text-sm">1</span>
                      בצעו תשלום
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      לחצו על הכפתור להעברת תשלום:
                    </p>
                    <Button asChild className="w-full" variant="outline">
                      <a 
                        href="https://grow.business/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <CreditCard className="h-4 w-4 ml-2" />
                        עבור לתשלום
                      </a>
                    </Button>
                  </div>

                  {/* Step 2: Send Proof */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-jade text-white flex items-center justify-center text-sm">2</span>
                      שלחו אישור תשלום
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      מלאו את הפרטים ושלחו אישור תשלום לד״ר רוני ספיר:
                    </p>

                    {/* Therapist Info */}
                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">שם מלא *</label>
                        <Input 
                          placeholder="הזינו את שמכם המלא"
                          value={therapistName}
                          onChange={(e) => setTherapistName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">טלפון נייד *</label>
                        <Input 
                          placeholder="050-1234567"
                          value={therapistPhone}
                          onChange={(e) => setTherapistPhone(e.target.value)}
                          dir="ltr"
                          className="text-left"
                        />
                      </div>
                    </div>

                    {/* Upload Option */}
                    <div className="border-2 border-dashed border-border rounded-lg p-4 mb-4">
                      <label className="flex flex-col items-center gap-2 cursor-pointer">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">העלאת קובץ אישור</span>
                        <input 
                          type="file" 
                          accept="image/*,.pdf" 
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        {proofFile && (
                          <span className="text-sm text-jade flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            {proofFile.name}
                          </span>
                        )}
                      </label>
                    </div>

                    {proofFile && therapistName && therapistPhone && (
                      <Button 
                        onClick={handleSendProof} 
                        className="w-full mb-4"
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                            שולח אישור...
                          </>
                        ) : (
                          'שלח אישור'
                        )}
                      </Button>
                    )}

                    <div className="text-center text-sm text-muted-foreground mb-3">או שלחו ישירות:</div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button asChild variant="outline" size="sm">
                        <a 
                          href={`https://wa.me/972505231042?text=${encodeURIComponent(`שלום ד״ר רוני, ביצעתי תשלום עבור תוכנית ${selectedTier === 'standard' ? 'סטנדרט' : 'פרימיום'}. מצורף אישור התשלום.`)}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="h-4 w-4 ml-2" />
                          WhatsApp
                        </a>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <a href="mailto:dr.roni.sapir@gmail.com?subject=אישור תשלום TCM Clinic">
                          <Mail className="h-4 w-4 ml-2" />
                          אימייל
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Step 3: Get Password */}
                  <div className="bg-jade-light/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-jade text-white flex items-center justify-center text-sm">3</span>
                      קבלו סיסמה
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      לאחר אישור התשלום, תקבלו סיסמה בהודעת WhatsApp לכניסה למערכת.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep('tiers')}
                      className="flex-1"
                    >
                      <ArrowRight className="h-4 w-4 ml-2" />
                      חזרה לבחירת תוכנית
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep('password')}
                      className="flex-1"
                    >
                      יש לי סיסמה
                      <ArrowLeft className="h-4 w-4 mr-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Password Entry */}
          {currentStep === 'password' && (
            <div className="max-w-md mx-auto animate-fade-in">
              <Card className="shadow-elevated overflow-hidden relative">
                {/* Decorative background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-jade/5 via-transparent to-gold/5 pointer-events-none" />
                
                <CardHeader className="text-center space-y-4 relative z-10">
                  {/* Animated lock icon with glow */}
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-jade-light to-jade/20 rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                    <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center shadow-inner">
                      <Lock className="h-8 w-8 text-jade animate-pulse" />
                    </div>
                  </div>
                  <CardTitle className="font-display text-3xl bg-gradient-to-r from-jade to-jade-dark bg-clip-text text-transparent">
                    כניסה למערכת
                  </CardTitle>
                  <CardDescription className="text-base">
                    הזינו את סיסמת הגישה שקיבלתם מד״ר רוני ספיר
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-base font-medium">סיסמת גישה</FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-jade transition-colors" />
                                <Input 
                                  type={showPassword ? "text" : "password"} 
                                  placeholder="הזינו את הסיסמה" 
                                  className="pr-11 pl-11 h-12 text-lg border-2 focus:border-jade transition-all"
                                  {...field} 
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground hover:text-jade transition-colors"
                                  tabIndex={-1}
                                >
                                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Remember me checkbox */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                        <Checkbox
                          id="remember-me"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked === true)}
                          className="data-[state=checked]:bg-jade data-[state=checked]:border-jade"
                        />
                        <label 
                          htmlFor="remember-me" 
                          className="text-sm cursor-pointer flex-1"
                        >
                          <span className="font-medium">זכור אותי</span>
                          <span className="text-muted-foreground mr-1">(30 ימים)</span>
                        </label>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-12 text-lg font-medium bg-gradient-to-r from-jade to-jade-dark hover:from-jade-dark hover:to-jade shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                            בודק...
                          </>
                        ) : (
                          <>
                            <Leaf className="h-5 w-5 ml-2" />
                            כניסה
                          </>
                        )}
                      </Button>
                      
                      {/* Biometric login option - only shown for returning users */}
                      {isBiometricAvailable && isBiometricEnabled && hasStoredSession && (
                        <>
                          <div className="relative flex items-center justify-center my-4">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-border/50" />
                            </div>
                            <span className="relative px-3 bg-card text-sm text-muted-foreground">או</span>
                          </div>
                          
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-12 text-lg font-medium border-2 border-jade/30 hover:border-jade hover:bg-jade/5 transition-all group"
                            onClick={handleBiometricLogin}
                            disabled={isAuthenticating}
                          >
                            {isAuthenticating ? (
                              <>
                                <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                                מאמת...
                              </>
                            ) : (
                              <>
                                <Fingerprint className="h-5 w-5 ml-2 text-jade group-hover:scale-110 transition-transform" />
                                כניסה עם טביעת אצבע / Face ID
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </form>
                  </Form>

                  <div className="mt-8 pt-6 border-t border-border/50 space-y-4">
                    <Button 
                      variant="ghost" 
                      className="w-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                      onClick={() => setCurrentStep('tiers')}
                    >
                      <ArrowRight className="h-4 w-4 ml-2" />
                      חזרה לבחירת תוכנית
                    </Button>
                    
                    <p className="text-center text-sm text-muted-foreground">
                      שכחתם סיסמה?{' '}
                      <a 
                        href="https://wa.me/972505231042?text=שלום ד״ר רוני, שכחתי את הסיסמה שלי למערכת TCM Clinic"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-jade hover:text-jade-dark hover:underline font-medium transition-colors"
                      >
                        צרו קשר עם ד״ר רוני
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* FAQ Section */}
          <div className="mt-12 max-w-2xl mx-auto" id="faq-section">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">שאלות נפוצות</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  document.getElementById('tier-selection')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 bg-white/80 hover:bg-white"
              >
                <ArrowRight className="h-4 w-4" />
                חזרה לתוכניות
              </Button>
            </div>
            <Card className="bg-background/80 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-white/20">
                    <AccordionTrigger className="text-right hover:no-underline">
                      מה ההבדל בין התוכניות?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-right">
                      <strong>ניסיון</strong> - 7 ימי ניסיון חינם עם גישה לכל הפיצ׳רים הבסיסיים: מאגר ידע TCM Brain, יומן תורים, וניהול מטופלים.
                      <br /><br />
                      <strong>סטנדרט</strong> - כולל את כל הפיצ׳רים הבסיסיים + תזכורות אוטומטיות למטופלים ב-Email ו-WhatsApp.
                      <br /><br />
                      <strong>פרימיום</strong> - כל הפיצ׳רים כולל פגישות וידאו עם מטופלים.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2" className="border-white/20">
                    <AccordionTrigger className="text-right hover:no-underline">
                      איך מתבצע התשלום?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-right">
                      התשלום מתבצע דרך Invoice4U (העברה בנקאית / כרטיס אשראי). לאחר התשלום, שלחו אישור בוואטסאפ ותקבלו סיסמת גישה תוך מספר שעות.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3" className="border-white/20">
                    <AccordionTrigger className="text-right hover:no-underline">
                      האם אפשר לשדרג תוכנית?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-right">
                      כן! ניתן לשדרג מתוכנית ניסיון או סטנדרט לתוכנית גבוהה יותר בכל עת. צרו קשר עם ד״ר רוני לקבלת קוד שדרוג.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4" className="border-white/20">
                    <AccordionTrigger className="text-right hover:no-underline">
                      מה קורה אחרי תקופת הניסיון?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-right">
                      לאחר 7 ימי הניסיון, תוכלו לבחור להמשיך עם אחת מהתוכניות בתשלום או להפסיק את השימוש. הנתונים שלכם נשמרים למשך 30 יום נוספים.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5" className="border-white/20">
                    <AccordionTrigger className="text-right hover:no-underline">
                      האם המידע שלי מאובטח?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-right">
                      בהחלט! המערכת משתמשת בהצפנה מתקדמת ועומדת בתקני אבטחת מידע. כל הנתונים מאוחסנים בשרתים מאובטחים עם גיבוי יומי.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>


          {/* Footer section */}
          <footer className="mt-12 pt-8 border-t border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-right">
              {/* Contact Info */}
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground mb-3">צור קשר</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>ד״ר רוני ספיר</p>
                  <a 
                    href="https://wa.me/972544634923?text=שלום ד״ר רוני, אשמח לשמוע עוד על השירותים שלכם"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center md:justify-start gap-1 hover:text-jade transition-colors"
                  >
                    <MessageCircle className="h-3 w-3" />
                    054-4634923
                    <span className="text-xs text-amber-600">(הודעות בלבד)</span>
                  </a>
                  <a 
                    href="mailto:dr.roni.sapir@gmail.com" 
                    className="block hover:text-jade transition-colors"
                  >
                    dr.roni.sapir@gmail.com
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground mb-3">קישורים מהירים</h4>
                <div className="space-y-1 text-sm">
                  <Link to="/" className="block text-muted-foreground hover:text-jade transition-colors">
                    דף הבית
                  </Link>
                  <Link to="/pricing" className="block text-muted-foreground hover:text-jade transition-colors">
                    מחשבון שימוש TOKEN בהתאם לכמות לקוחות
                  </Link>
                </div>
              </div>

            </div>

            {/* Copyright */}
            <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-muted-foreground">
              <p>© {new Date().getFullYear()} TCM Clinic. כל הזכויות שמורות.</p>
            </div>
          </footer>
          </div>
        </div>

        {/* Floating WhatsApp Button */}
        <a
          href="https://wa.me/972505231042?text=שלום, יש לי שאלה לגבי מערכת TCM Clinic"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#1da851] hover:scale-105 transition-all duration-200"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="text-sm font-medium">שלחו הודעה</span>
        </a>
        
        {/* Back to Top Button */}
        <BackToTopButton threshold={600} />
        
        {/* Sticky Mobile Footer */}
        <StickyTierFooter
          tiers={tiers}
          selectedTier={selectedTier || recommendedPlan}
          onSelectTier={handleSelectTier}
          onScrollToTiers={scrollToTierSection}
          isVisible={showStickyFooter && currentStep === 'tiers'}
        />
      </div>
    </>
  );
}

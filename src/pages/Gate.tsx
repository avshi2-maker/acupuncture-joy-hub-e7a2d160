import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { Lock, ArrowLeft, Leaf, CreditCard, Upload, CheckCircle, ArrowRight, MessageCircle, Mail, Loader2, Play, Fingerprint } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TierCard } from '@/components/pricing/TierCard';
import { Confetti } from '@/components/ui/Confetti';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';

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
    description: '7 ימי ניסיון חינם לכל הפיצ׳רים הבסיסיים',
    features: [
      { name: 'TCM Brain - מאגר ידע', included: true },
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
    description: 'כולל תזכורות אוטומטיות למטופלים + מע״מ',
    features: [
      { name: 'TCM Brain - מאגר ידע', included: true },
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
    description: 'כל הפיצ׳רים כולל פגישות וידאו + מע״מ',
    features: [
      { name: 'TCM Brain - מאגר ידע', included: true },
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
  const [showConfetti, setShowConfetti] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  // Biometric authentication
  const { isAvailable: isBiometricAvailable, isEnabled: isBiometricEnabled, authenticate, enableBiometric, isAuthenticating } = useBiometricAuth();
  
  // Check if user has previously logged in (has stored tier info)
  const hasStoredSession = localStorage.getItem('tier') !== null;
  
  // Simulate page loading for tier cards
  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

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
    
    const hasProfile = localStorage.getItem('therapist_profile');
    const defaultRedirect = hasProfile ? '/dashboard' : '/therapist-profile';

    const url = new URL(redirect || defaultRedirect, window.location.origin);
    if (question) url.searchParams.set('question', question);

    return `${url.pathname}${url.search}${url.hash}`;
  };

  const handleSelectTier = (tierName: string) => {
    setSelectedTier(tierName);
    if (tierName === 'Trial') {
      // Trial goes directly to password step
      setCurrentStep('password');
    } else {
      // Paid tiers show payment instructions
      setCurrentStep('payment');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      // Show confetti celebration
      setShowConfetti(true);
      
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
        
        setShowConfetti(true);
        
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

      <div className="min-h-screen bg-background py-8 px-4" dir="rtl">
        <div className="max-w-6xl mx-auto">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            חזרה לדף הבית
          </Link>

          {/* Step Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentStep === 'tiers' ? 'bg-jade text-white' : 'bg-muted text-muted-foreground'}`}>
                <span className="w-6 h-6 rounded-full bg-background/20 flex items-center justify-center text-sm">1</span>
                <span className="text-sm font-medium">בחירת תוכנית</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentStep === 'payment' ? 'bg-jade text-white' : 'bg-muted text-muted-foreground'}`}>
                <span className="w-6 h-6 rounded-full bg-background/20 flex items-center justify-center text-sm">2</span>
                <span className="text-sm font-medium">תשלום</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentStep === 'password' ? 'bg-jade text-white' : 'bg-muted text-muted-foreground'}`}>
                <span className="w-6 h-6 rounded-full bg-background/20 flex items-center justify-center text-sm">3</span>
                <span className="text-sm font-medium">כניסה</span>
              </div>
            </div>
          </div>

          {/* Step 1: Tier Selection */}
          {currentStep === 'tiers' && (
            <>
              <div className="text-center mb-10">
                <div className="mx-auto w-16 h-16 bg-jade-light rounded-full flex items-center justify-center mb-6">
                  <Leaf className="h-8 w-8 text-jade" />
                </div>
                <h1 className="font-display text-3xl md:text-4xl mb-4">בחרו את התוכנית שלכם</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  התחילו עם 7 ימי ניסיון חינם או בחרו תוכנית מתקדמת יותר
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-8">
                {isPageLoading ? (
                  // Skeleton loading state
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="rounded-xl border bg-card p-6 space-y-4 animate-pulse">
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
                  // Actual tier cards
                  tiers.map((tier) => (
                    <TierCard
                      key={tier.name}
                      {...tier}
                      onSelect={() => handleSelectTier(tier.name)}
                      buttonText={tier.name === 'Trial' ? 'התחל ניסיון' : 'בחר תוכנית'}
                    />
                  ))
                )}
              </div>

              {/* Quick Test Access for Daily Testing */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      // Set trial tier for 24 hours
                      const tomorrow = new Date();
                      tomorrow.setHours(23, 59, 59, 999);
                      setTier('trial');
                      setExpiresAt(tomorrow);
                      toast.success('Trial access activated for today!');
                      navigate('/tcm-brain');
                    }}
                    className="border-jade text-jade hover:bg-jade hover:text-white"
                  >
                    <Play className="h-4 w-4 ml-2" />
                    Quick Test Access (Daily)
                  </Button>
                  <Button 
                    variant="link" 
                    onClick={() => setCurrentStep('password')}
                    className="text-jade"
                  >
                    כבר יש לי סיסמה - דלגו לכניסה
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Test access expires at midnight. For full access, select a plan above.
                </p>
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
                      לחצו על הכפתור להעברת תשלום דרך Invoice4U:
                    </p>
                    <Button asChild className="w-full" variant="outline">
                      <a 
                        href="https://app.invoice4u.co.il/link/13006-1/nPmb" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <CreditCard className="h-4 w-4 ml-2" />
                        עבור לתשלום ב-Invoice4U
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
                                  type="password" 
                                  placeholder="הזינו את הסיסמה" 
                                  className="pr-11 h-12 text-lg border-2 focus:border-jade transition-all"
                                  {...field} 
                                />
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
          
          {/* Confetti celebration */}
          <Confetti isActive={showConfetti} duration={3000} />

          {/* Contact footer */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            לשאלות נוספות, צרו קשר עם ד״ר רוני ספיר בוואטסאפ:{' '}
            <a 
              href="https://wa.me/972505231042" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-jade hover:underline"
            >
              050-5231042
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

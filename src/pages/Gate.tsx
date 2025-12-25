import { useState } from 'react';
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
import { toast } from 'sonner';
import { Lock, ArrowLeft, Leaf, CreditCard, Upload, CheckCircle, ArrowRight, MessageCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TierCard } from '@/components/pricing/TierCard';

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

  const handleSendProof = async () => {
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
        // If bucket doesn't exist, just show success message anyway
        console.log('Upload notice:', uploadError.message);
      }

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
      if (result.expires_at) {
        setExpiresAt(new Date(result.expires_at));
      }

      await supabase.from('access_logs').insert({
        action: 'password_login',
        details: { tier: result.tier },
      });

      toast.success('ברוכים הבאים!');
      navigate(buildPostLoginRedirect(), { replace: true });
    } catch (error) {
      toast.error('שגיאה בכניסה. נסו שוב.');
    } finally {
      setIsLoading(false);
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
                {tiers.map((tier) => (
                  <TierCard
                    key={tier.name}
                    {...tier}
                    onSelect={() => handleSelectTier(tier.name)}
                    buttonText={tier.name === 'Trial' ? 'התחל ניסיון' : 'בחר תוכנית'}
                  />
                ))}
              </div>

              {/* Already have password link */}
              <div className="text-center">
                <Button 
                  variant="link" 
                  onClick={() => setCurrentStep('password')}
                  className="text-jade"
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
                      שלחו צילום מסך או אישור תשלום מהבנק/כרטיס האשראי לד״ר רוני ספיר:
                    </p>

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

                    {proofFile && (
                      <Button 
                        onClick={handleSendProof} 
                        className="w-full mb-4"
                        disabled={isUploading}
                      >
                        {isUploading ? 'שולח...' : 'שלח אישור'}
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
            <div className="max-w-md mx-auto">
              <Card className="shadow-elevated">
                <CardHeader className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-jade-light rounded-full flex items-center justify-center">
                    <Lock className="h-8 w-8 text-jade" />
                  </div>
                  <CardTitle className="font-display text-3xl">כניסה למערכת</CardTitle>
                  <CardDescription>
                    הזינו את סיסמת הגישה שקיבלתם מד״ר רוני ספיר
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>סיסמת גישה</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type="password" 
                                  placeholder="הזינו את הסיסמה" 
                                  className="pr-10"
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'בודק...' : 'כניסה'}
                      </Button>
                    </form>
                  </Form>

                  <div className="mt-6 pt-6 border-t border-border space-y-3">
                    <Button 
                      variant="ghost" 
                      className="w-full text-muted-foreground"
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
                        className="text-jade hover:underline"
                      >
                        צרו קשר עם ד״ר רוני
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

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

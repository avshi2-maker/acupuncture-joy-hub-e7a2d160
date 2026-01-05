import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Leaf, ArrowLeft, MessageCircle, CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WhatsAppWithTemplates, REGISTRATION_TEMPLATES } from '@/components/ui/WhatsAppTemplates';
import { validateIsraeliId, looksLikeIsraeliId } from '@/utils/israeliIdValidation';
import { RegistrationProgressSteps } from '@/components/registration/RegistrationProgressSteps';

const registerSchema = z.object({
  idNumber: z.string().min(5, 'מספר ת.ז. חייב להכיל לפחות 5 ספרות').max(15, 'מספר ת.ז. ארוך מדי'),
  fullName: z.string().min(2, 'שם מלא חייב להכיל לפחות 2 תווים').max(100),
  email: z.string().email('כתובת אימייל לא תקינה').max(255),
  phone: z.string().min(9, 'מספר טלפון לא תקין').max(15),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function TherapistRegister() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [idCheckStatus, setIdCheckStatus] = useState<'idle' | 'checking' | 'valid' | 'duplicate' | 'invalid_checksum'>('idle');
  const [isIdDuplicate, setIsIdDuplicate] = useState(false);
  const [idChecksumError, setIdChecksumError] = useState<string | null>(null);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      idNumber: '',
      fullName: '',
      email: '',
      phone: '',
    },
  });

  // Function to check if ID number is unique and valid
  const checkIdUniqueness = async (idNumber: string) => {
    if (!idNumber || idNumber.length < 5) {
      setIdCheckStatus('idle');
      setIsIdDuplicate(false);
      setIdChecksumError(null);
      return;
    }

    // First validate checksum if it looks like an Israeli ID
    if (looksLikeIsraeliId(idNumber)) {
      const checksumResult = validateIsraeliId(idNumber);
      if (!checksumResult.valid) {
        setIdCheckStatus('invalid_checksum');
        setIdChecksumError(checksumResult.error || 'ספרת ביקורת שגויה');
        setIsIdDuplicate(false);
        return;
      }
    }

    setIdChecksumError(null);
    setIdCheckStatus('checking');
    
    try {
      const { data: existingTherapist } = await supabase
        .from('therapist_registrations')
        .select('id')
        .eq('id_number', idNumber)
        .maybeSingle();

      if (existingTherapist) {
        setIdCheckStatus('duplicate');
        setIsIdDuplicate(true);
      } else {
        setIdCheckStatus('valid');
        setIsIdDuplicate(false);
      }
    } catch (error) {
      setIdCheckStatus('idle');
      setIsIdDuplicate(false);
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    // Block submission if we already know ID is duplicate
    if (isIdDuplicate) {
      toast.error('מספר ת.ז. כבר רשום במערכת!');
      return;
    }

    setIsLoading(true);
    try {
      // Double-check for duplicate ID number at submission
      const { data: existingTherapist } = await supabase
        .from('therapist_registrations')
        .select('id')
        .eq('id_number', data.idNumber)
        .maybeSingle();

      if (existingTherapist) {
        setIsIdDuplicate(true);
        setIdCheckStatus('duplicate');
        toast.error('מספר ת.ז. כבר רשום במערכת!');
        setIsLoading(false);
        return;
      }

      const { error } = await supabase
        .from('therapist_registrations')
        .insert({
          id_number: data.idNumber,
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          requested_tier: 'trial',
          status: 'pending',
        });

      if (error) {
        if (error.code === '23505') {
          if (error.message.includes('id_number')) {
            toast.error('מספר ת.ז. כבר רשום במערכת');
          } else {
            toast.error('כתובת האימייל כבר רשומה במערכת');
          }
        } else {
          throw error;
        }
        return;
      }

      toast.success('פרטים נשמרו! המשך לטופס קליטה');
      // Navigate to intake form with registration flow context
      navigate('/therapist-intake?from=register');
    } catch (error) {
      toast.error('שגיאה בהרשמה. נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>הרשמה למטפלים | TCM Clinic</title>
        <meta name="description" content="הצטרפו למערכת הניהול המתקדמת למטפלים ברפואה סינית" />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md">
          {/* Progress Steps */}
          <RegistrationProgressSteps currentStep={1} className="mb-8" />

          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            חזרה לדף הבית
          </Link>

          <Card className="shadow-elevated">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-jade-light rounded-full flex items-center justify-center">
                <Leaf className="h-8 w-8 text-jade" />
              </div>
              <CardTitle className="font-display text-3xl">הרשמה למטפלים חדשים</CardTitle>
              <CardDescription className="space-y-2">
                <span className="block">הצטרפו למערכת הניהול המתקדמת למטפלים ברפואה סינית</span>
                <span className="block text-xs text-muted-foreground">
                  מלאו את הפרטים → בחרו תוכנית → התחילו לעבוד
                </span>
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="idNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          מספר ת.ז. *
                          {idCheckStatus === 'checking' && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                          {idCheckStatus === 'valid' && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                          {idCheckStatus === 'duplicate' && (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                          {idCheckStatus === 'invalid_checksum' && (
                            <XCircle className="h-4 w-4 text-amber-500" />
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123456789" 
                            {...field}
                            className={(isIdDuplicate || idCheckStatus === 'invalid_checksum') ? 'border-destructive focus-visible:ring-destructive' : ''}
                            onBlur={(e) => {
                              field.onBlur();
                              checkIdUniqueness(e.target.value);
                            }}
                          />
                        </FormControl>
                        {isIdDuplicate && (
                          <div className="text-sm text-destructive font-medium flex items-center gap-1">
                            <XCircle className="h-4 w-4" />
                            מספר ת.ז. כבר רשום במערכת!
                          </div>
                        )}
                        {idChecksumError && (
                          <div className="text-sm text-amber-600 font-medium flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            {idChecksumError}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>שם מלא *</FormLabel>
                        <FormControl>
                          <Input placeholder="ד״ר ישראל ישראלי" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>אימייל</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="example@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>טלפון</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="050-1234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full bg-jade hover:bg-jade/90" disabled={isLoading}>
                    {isLoading ? 'שומר...' : 'המשך לטופס קליטה →'}
                  </Button>
                </form>
              </Form>

              {/* Clear options section */}
              <div className="mt-6 pt-6 border-t border-border space-y-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground mb-2">
                    כבר רשום במערכת?
                  </p>
                  <Link 
                    to="/gate" 
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-md bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors"
                  >
                    כניסה למערכת
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* WhatsApp Help Section */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <MessageCircle className="h-4 w-4 text-[#25D366]" />
                    <span>צריך/ה עזרה? דברו איתנו</span>
                  </div>
                  <WhatsAppWithTemplates
                    phoneNumber="972505231042"
                    templates={REGISTRATION_TEMPLATES}
                    buttonTextHe="שאלות? כתבו לנו"
                    variant="outline"
                    size="default"
                    showLabelsInHebrew={true}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

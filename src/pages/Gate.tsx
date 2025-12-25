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
import { Lock, ArrowLeft, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

const gateSchema = z.object({
  password: z
    .string()
    .trim()
    .min(1, 'נא להזין סיסמה'),
});

type GateForm = z.infer<typeof gateSchema>;

export default function Gate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setTier, setExpiresAt } = useTier();
  const [isLoading, setIsLoading] = useState(false);

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
    
    // Check if therapist has completed profile
    const hasProfile = localStorage.getItem('therapist_profile');
    const defaultRedirect = hasProfile ? '/dashboard' : '/therapist-profile';

    const url = new URL(redirect || defaultRedirect, window.location.origin);
    if (question) url.searchParams.set('question', question);

    return `${url.pathname}${url.search}${url.hash}`;
  };

  const onSubmit = async (data: GateForm) => {
    setIsLoading(true);
    try {
      const password = data.password.trim();

      // Use secure RPC function to validate password (prevents password enumeration)
      const { data: validationResult, error } = await supabase
        .rpc('validate_access_password', { password_input: password });

      if (error) throw error;

      // Check validation result
      const result = validationResult?.[0];
      if (!result || !result.valid) {
        toast.error('סיסמה לא תקינה, בשימוש, או שפג תוקפה.');
        return;
      }

      // Set tier and expiration
      setTier(result.tier as 'trial' | 'standard' | 'premium');
      if (result.expires_at) {
        setExpiresAt(new Date(result.expires_at));
      }

      // Log access
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

  return (
    <>
      <Helmet>
        <title>כניסה למערכת | TCM Clinic</title>
        <meta name="description" content="הזינו את סיסמת הגישה שקיבלתם מד״ר רוני" />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            חזרה לדף הבית
          </Link>

          <Card className="shadow-elevated">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-jade-light rounded-full flex items-center justify-center">
                <Leaf className="h-8 w-8 text-jade" />
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

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-center text-sm text-muted-foreground">
                  אין לכם סיסמה?{' '}
                  <Link to="/therapist-register" className="text-jade hover:underline">
                    הרשמה למטפלים
                  </Link>
                </p>
                <p className="text-center text-sm text-muted-foreground mt-2">
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
      </div>
    </>
  );
}

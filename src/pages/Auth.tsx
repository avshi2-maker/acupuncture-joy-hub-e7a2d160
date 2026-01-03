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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import clinicLogo from '@/assets/clinic-logo.png';
import { Link } from 'react-router-dom';

const authSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(6, 'סיסמה חייבת להכיל לפחות 6 תווים'),
});

type AuthForm = z.infer<typeof authSchema>;

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, signUp, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const form = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user) {
      const params = new URLSearchParams(location.search);
      const redirectParam = params.get('redirect');
      const safeRedirect = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/admin';
      navigate(safeRedirect, { replace: true });
    }
  }, [user, navigate, location.search]);

  const onSubmit = async (data: AuthForm) => {
    setIsSubmitting(true);
    try {
      if (activeTab === 'login') {
        const { error } = await signIn(data.email, data.password);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success('התחברת בהצלחה!');
      } else {
        const { error } = await signUp(data.email, data.password);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('כתובת האימייל כבר רשומה');
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('נרשמת בהצלחה! ניתן להתחבר כעת.');
        setActiveTab('login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-jade border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>התחברות | TCM Clinic</title>
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
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center overflow-hidden">
                <img src={clinicLogo} alt="Clinic Logo" className="w-full h-full object-contain" />
              </div>
              <CardTitle className="font-display text-3xl">TCM Clinic</CardTitle>
              <CardDescription>כניסה לפאנל ניהול</CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">התחברות</TabsTrigger>
                  <TabsTrigger value="signup">הרשמה</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>אימייל</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>סיסמה</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'מתחבר...' : 'התחבר'}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="signup">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>אימייל</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>סיסמה</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'נרשם...' : 'הרשמה'}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

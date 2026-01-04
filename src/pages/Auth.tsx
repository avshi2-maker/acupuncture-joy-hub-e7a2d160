import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
import { ArrowLeft, Brain, ShieldCheck, Lock, Activity } from 'lucide-react';
import clinicLogo from '@/assets/clinic-logo.png';

// Validation Schema
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

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const params = new URLSearchParams(location.search);
      const redirectParam = params.get('redirect');
      const safeRedirect = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/admin';
      navigate(safeRedirect, { replace: true });
    }
  }, [user, navigate, location.search]);

  // Handle Login/Register
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4" />
          <p className="text-white/80 text-lg font-medium">Loading Sanctuary...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>התחברות | CM Clinic AI</title>
      </Helmet>

      <div className="min-h-screen flex flex-col lg:flex-row">
        
        {/* --- LEFT SIDE: THE VISUAL SANCTUARY (Desktop Only) --- */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-900 overflow-hidden">
          
          {/* Abstract Background Shapes */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-32 right-16 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl" />

          {/* Branding Content */}
          <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
            
            {/* Logo Section */}
            <div className="flex items-center gap-4 mb-12">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <Brain className="h-9 w-9 text-white" />
              </div>
              <h1 className="text-4xl font-display font-bold text-white tracking-tight">CM CLINIC AI</h1>
            </div>

            {/* Tagline */}
            <div className="text-center max-w-md">
              <h2 className="text-5xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-white to-teal-200 mb-6">
                Healing Intelligence.
              </h2>
              <p className="text-lg text-emerald-100/80 leading-relaxed">
                Bridging ancient wisdom with modern precision. 
                Enter the secure gateway to manage patient care, herbal protocols, and clinical diagnostics.
              </p>
            </div>
          </div>

          {/* Footer Features */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 text-sm text-emerald-200/70">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              HIPAA Secure
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Real-time Vitals
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Encrypted Data
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: THE GATE (Login Form) --- */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50/30 p-6 lg:p-12" dir="rtl">
          
          {/* Back Button */}
          <div className="absolute top-6 left-6">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>

          <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-xl">
            <CardHeader className="text-center space-y-3 pb-2">
              <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <img src={clinicLogo} alt="Clinic Logo" className="w-10 h-10 object-contain" />
              </div>
              <CardTitle className="font-display text-2xl text-slate-800">ברוכים הבאים</CardTitle>
              <CardDescription className="text-slate-500">הזדהות מאובטחת למערכת הקלינית</CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100/80">
                  <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">
                    כניסה
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">
                    הרשמה
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-0">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700">כתובת אימייל</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="you@clinic.com" 
                                {...field} 
                                className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all h-11"
                              />
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
                            <FormLabel className="text-slate-700">סיסמה</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                {...field} 
                                className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                            מעבד נתונים...
                          </span>
                        ) : (
                          'כניסה למערכת'
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="signup" className="mt-0">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700">כתובת אימייל</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="you@clinic.com" 
                                {...field} 
                                className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all h-11"
                              />
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
                            <FormLabel className="text-slate-700">סיסמה</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                {...field} 
                                className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                            מעבד נתונים...
                          </span>
                        ) : (
                          'יצירת חשבון חדש'
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center">
                <Link 
                  to="/" 
                  className="text-sm text-slate-500 hover:text-emerald-600 transition-colors"
                >
                  חזרה לדף הבית הציבורי
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

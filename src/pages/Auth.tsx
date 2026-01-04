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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Brain, ShieldCheck, Lock, Activity, Eye, EyeOff, Mail, MessageCircle, RefreshCw } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import clinicLogo from '@/assets/clinic-logo.png';

// Google Icon Component
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

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
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [isResendingVerification, setIsResendingVerification] = useState(false);

  // WhatsApp CTA
  const whatsappNumber = '972544634923';
  const whatsappMessage = encodeURIComponent('שלום, אני מעוניין לקבל מידע נוסף על מערכת CM Clinic AI');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  // Handle Resend Verification Email
  const handleResendVerification = async () => {
    if (!verificationEmail) {
      toast.error('נא להזין כתובת אימייל');
      return;
    }
    setIsResendingVerification(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: verificationEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('מייל אימות נשלח מחדש בהצלחה!');
        setShowVerificationDialog(false);
      }
    } finally {
      setIsResendingVerification(false);
    }
  };

  // Handle Google OAuth
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin`,
        },
      });
      if (error) {
        toast.error(error.message);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const form = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast.error('נא להזין כתובת אימייל');
      return;
    }
    setIsSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('קישור לאיפוס סיסמה נשלח לאימייל שלך');
        setShowForgotPassword(false);
        setForgotEmail('');
      }
    } finally {
      setIsSendingReset(false);
    }
  };

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
  const onSubmit = async (formData: AuthForm) => {
    setIsSubmitting(true);
    try {
      if (activeTab === 'login') {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success('התחברת בהצלחה!');
      } else {
        const result = await signUp(formData.email, formData.password);
        if (result.error) {
          if (result.error.message.includes('already registered')) {
            toast.error('כתובת האימייל כבר רשומה');
          } else {
            toast.error(result.error.message);
          }
          return;
        }
        // Show verification dialog after signup
        setVerificationEmail(formData.email);
        toast.success('נרשמת בהצלחה! נשלח אליך מייל אימות.');
        setShowVerificationDialog(true);
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

                      <div className="text-left">
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                        >
                          שכחת סיסמה?
                        </button>
                      </div>
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700">סיסמה</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showPassword ? "text" : "password"} 
                                  {...field} 
                                  className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all h-11 pl-10"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Remember Me Checkbox */}
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="rememberMe"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked === true)}
                          className="border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                        <label
                          htmlFor="rememberMe"
                          className="text-sm text-slate-600 cursor-pointer select-none"
                        >
                          זכור אותי
                        </label>
                      </div>

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

                      {/* Divider */}
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-slate-500">או</span>
                        </div>
                      </div>

                      {/* Google OAuth Button */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading}
                        className="w-full h-12 border-slate-200 hover:bg-slate-50 transition-all"
                      >
                        {isGoogleLoading ? (
                          <span className="flex items-center gap-2">
                            <div className="animate-spin h-4 w-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full" />
                            מתחבר...
                          </span>
                        ) : (
                          <span className="flex items-center gap-3">
                            <GoogleIcon />
                            <span className="text-slate-700">התחבר עם Google</span>
                          </span>
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
                              <div className="relative">
                                <Input 
                                  type={showPassword ? "text" : "password"} 
                                  {...field} 
                                  className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all h-11 pl-10"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
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

                      {/* Divider */}
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-slate-500">או</span>
                        </div>
                      </div>

                      {/* Google OAuth Button */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading}
                        className="w-full h-12 border-slate-200 hover:bg-slate-50 transition-all"
                      >
                        {isGoogleLoading ? (
                          <span className="flex items-center gap-2">
                            <div className="animate-spin h-4 w-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full" />
                            מתחבר...
                          </span>
                        ) : (
                          <span className="flex items-center gap-3">
                            <GoogleIcon />
                            <span className="text-slate-700">הרשמה עם Google</span>
                          </span>
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>

              {/* Resend Verification Email Link */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowVerificationDialog(true)}
                  className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                >
                  לא קיבלת מייל אימות? לחץ כאן לשליחה מחדש
                </button>
              </div>

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

          {/* WhatsApp CTA - Fixed Position */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all group"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="hidden sm:inline font-medium">צור קשר בוואטסאפ</span>
          </a>
        </div>

        {/* Forgot Password Dialog */}
        <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-xl font-display">איפוס סיסמה</DialogTitle>
              <DialogDescription>
                הזן את כתובת האימייל שלך ונשלח לך קישור לאיפוס הסיסמה
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="you@clinic.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="bg-slate-50 border-slate-200 focus:border-emerald-500 h-11 pr-10"
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
              <Button
                onClick={handleForgotPassword}
                disabled={isSendingReset}
                className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                {isSendingReset ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                    שולח...
                  </span>
                ) : (
                  'שלח קישור לאיפוס'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Email Verification Dialog */}
        <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-xl font-display flex items-center gap-2">
                <Mail className="h-5 w-5 text-emerald-600" />
                אימות כתובת אימייל
              </DialogTitle>
              <DialogDescription>
                שלחנו לך מייל אימות. אם לא קיבלת אותו, תוכל לשלוח שוב.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="you@clinic.com"
                  value={verificationEmail}
                  onChange={(e) => setVerificationEmail(e.target.value)}
                  className="bg-slate-50 border-slate-200 focus:border-emerald-500 h-11 pr-10"
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
              <Button
                onClick={handleResendVerification}
                disabled={isResendingVerification}
                className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                {isResendingVerification ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    שולח מחדש...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    שלח מייל אימות מחדש
                  </span>
                )}
              </Button>
              <p className="text-xs text-slate-500 text-center">
                בדוק גם את תיקיית הספאם אם לא קיבלת את המייל
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

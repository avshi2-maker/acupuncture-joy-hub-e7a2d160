import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Copy, Key, LogOut, Loader2, RefreshCw, MessageSquare, Database } from 'lucide-react';
import clinicLogo from '@/assets/clinic-logo.png';
import { format } from 'date-fns';

interface TherapistRegistration {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  requested_tier: string;
  status: string;
  created_at: string;
}

interface AccessPassword {
  id: string;
  plain_password: string;
  tier: string;
  is_used: boolean;
  expires_at: string | null;
  created_at: string;
  therapist_registration_id: string | null;
}

const ADMIN_EMAIL = 'Avshi2@gmail.com';

export default function Admin() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signIn, signOut, isAdmin } = useAuth();
  const [registrations, setRegistrations] = useState<TherapistRegistration[]>([]);
  const [passwords, setPasswords] = useState<AccessPassword[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  // New password form
  const [newPasswordTier, setNewPasswordTier] = useState<string>('trial');
  const [expirationDays, setExpirationDays] = useState<string>('7');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    } else if (!authLoading && user && !isAdmin) {
      toast.error('אין לך הרשאות גישה');
      navigate('/');
    } else if (!authLoading && !user) {
      setIsLoading(false);
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [regResult, pwResult] = await Promise.all([
        supabase.from('therapist_registrations').select('*').order('created_at', { ascending: false }),
        supabase.from('access_passwords').select('*').order('created_at', { ascending: false }),
      ]);

      if (regResult.data) setRegistrations(regResult.data);
      if (pwResult.data) setPasswords(pwResult.data);
    } catch (error) {
      toast.error('שגיאה בטעינת הנתונים');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      toast.error('רק מנהל מערכת יכול לגשת');
      return;
    }
    
    setIsSigningIn(true);
    const { error } = await signIn(loginEmail, loginPassword);
    if (error) {
      toast.error('שגיאה בכניסה: ' + error.message);
    }
    setIsSigningIn(false);
  };

  // SECURITY: Use cryptographically secure random number generator
  const generatePassword = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const getSecureRandomIndex = (max: number): number => {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      return array[0] % max;
    };
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(getSecureRandomIndex(chars.length));
    }
    return password;
  };

  const handleGeneratePassword = async () => {
    setIsGenerating(true);
    try {
      const plainPassword = generatePassword();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expirationDays));

      const { error } = await supabase.from('access_passwords').insert({
        plain_password: plainPassword,
        password_hash: plainPassword,
        tier: newPasswordTier as 'trial' | 'standard' | 'premium',
        expires_at: expiresAt.toISOString(),
        created_by: user?.id,
      });

      if (error) throw error;

      toast.success(`סיסמה חדשה נוצרה: ${plainPassword}`);
      await navigator.clipboard.writeText(plainPassword);
      toast.success('הסיסמה הועתקה ללוח');
      fetchData();
    } catch (error) {
      toast.error('שגיאה ביצירת סיסמה');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('הועתק ללוח');
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-muted text-muted-foreground',
      trial: 'bg-jade-light text-jade',
      active: 'bg-jade text-primary-foreground',
      expired: 'bg-destructive/20 text-destructive',
    };
    const labels: Record<string, string> = {
      pending: 'ממתין',
      trial: 'ניסיון',
      active: 'פעיל',
      expired: 'פג תוקף',
    };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  const getTierBadge = (tier: string) => {
    const styles: Record<string, string> = {
      trial: 'bg-muted text-muted-foreground',
      standard: 'bg-jade text-primary-foreground',
      premium: 'bg-gold text-primary-foreground',
    };
    const labels: Record<string, string> = {
      trial: 'ניסיון',
      standard: 'סטנדרט',
      premium: 'פרימיום',
    };
    return <Badge className={styles[tier]}>{labels[tier]}</Badge>;
  };

  // Login form if not authenticated
  if (!authLoading && !user) {
    return (
      <>
        <Helmet>
          <title>כניסת מנהל | TCM Clinic</title>
        </Helmet>
        <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
          <Card className="w-full max-w-md shadow-elevated">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center overflow-hidden">
                <img src={clinicLogo} alt="Clinic Logo" className="w-full h-full object-contain" />
              </div>
              <CardTitle className="font-display text-2xl">כניסת מנהל</CardTitle>
              <CardDescription>רק ד״ר רוני ספיר יכולה לגשת</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">אימייל</label>
                  <Input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Avshi2@gmail.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">סיסמה</label>
                  <Input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSigningIn}>
                  {isSigningIn ? <Loader2 className="h-4 w-4 animate-spin" /> : 'כניסה'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-jade" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>פאנל ניהול | TCM Clinic</title>
      </Helmet>

      <div className="min-h-screen bg-background p-4 md:p-8" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden">
                <img src={clinicLogo} alt="Clinic Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="font-display text-3xl">פאנל ניהול</h1>
                <p className="text-muted-foreground">ד״ר רוני ספיר</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/admin/knowledge')}>
                <Database className="h-4 w-4 ml-2" />
                מאגר ידע
              </Button>
              <Button variant="outline" onClick={() => navigate('/admin/feedback')}>
                <MessageSquare className="h-4 w-4 ml-2" />
                משוב
              </Button>
              <Button variant="outline" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 ml-2" />
                יציאה
              </Button>
            </div>
          </div>

          {/* Password Generator */}
          <Card className="mb-8 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                יצירת סיסמה חדשה
              </CardTitle>
              <CardDescription>צרי סיסמה חדשה לשליחה למטפל</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[150px]">
                  <label className="text-sm font-medium mb-2 block">תוכנית</label>
                  <Select value={newPasswordTier} onValueChange={setNewPasswordTier}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">ניסיון (7 ימים)</SelectItem>
                      <SelectItem value="standard">סטנדרט (₪40)</SelectItem>
                      <SelectItem value="premium">פרימיום (₪50)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="text-sm font-medium mb-2 block">תוקף (ימים)</label>
                  <Input
                    type="number"
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(e.target.value)}
                    min="1"
                    max="365"
                  />
                </div>
                <Button onClick={handleGeneratePassword} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'צור סיסמה'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Passwords Table */}
          <Card className="mb-8 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>סיסמאות פעילות</CardTitle>
                <CardDescription>רשימת כל הסיסמאות שנוצרו</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>סיסמה</TableHead>
                    <TableHead>תוכנית</TableHead>
                    <TableHead>סטטוס</TableHead>
                    <TableHead>תוקף</TableHead>
                    <TableHead>נוצר</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {passwords.map((pw) => (
                    <TableRow key={pw.id}>
                      <TableCell className="font-mono">{pw.plain_password}</TableCell>
                      <TableCell>{getTierBadge(pw.tier)}</TableCell>
                      <TableCell>
                        <Badge variant={pw.is_used ? 'secondary' : 'default'}>
                          {pw.is_used ? 'נוצל' : 'פעיל'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {pw.expires_at ? format(new Date(pw.expires_at), 'dd/MM/yyyy') : '-'}
                      </TableCell>
                      <TableCell>{format(new Date(pw.created_at), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(pw.plain_password)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Registrations Table */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>הרשמות ממתינות</CardTitle>
              <CardDescription>מטפלים שנרשמו ומחכים לאישור</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>שם</TableHead>
                    <TableHead>אימייל</TableHead>
                    <TableHead>טלפון</TableHead>
                    <TableHead>תוכנית מבוקשת</TableHead>
                    <TableHead>סטטוס</TableHead>
                    <TableHead>תאריך</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell>{reg.full_name}</TableCell>
                      <TableCell>{reg.email}</TableCell>
                      <TableCell dir="ltr">{reg.phone}</TableCell>
                      <TableCell>{getTierBadge(reg.requested_tier)}</TableCell>
                      <TableCell>{getStatusBadge(reg.status)}</TableCell>
                      <TableCell>{format(new Date(reg.created_at), 'dd/MM/yyyy')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

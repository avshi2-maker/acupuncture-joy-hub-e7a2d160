import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SignaturePad } from '@/components/crm/SignaturePad';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { 
  AlertTriangle, FileDown, CheckCircle2, Shield, User, Award, 
  ArrowLeft, ArrowRight, Loader2, Building2, Phone, Mail, 
  GraduationCap, Briefcase, Calendar 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { validateIsraeliId, looksLikeIsraeliId } from '@/utils/israeliIdValidation';
import { CrossPlatformBackButton } from '@/components/ui/CrossPlatformBackButton';
import therapistIntakeBg from '@/assets/therapist-intake-bg.jpg';

// Form schema
const therapistIntakeSchema = z.object({
  // Personal Details
  idNumber: z.string().min(5, 'מספר ת.ז. חייב להכיל לפחות 5 ספרות').max(15),
  fullName: z.string().min(2, 'שם מלא חייב להכיל לפחות 2 תווים').max(100),
  email: z.string().email('כתובת אימייל לא תקינה').max(255),
  phone: z.string().min(9, 'מספר טלפון לא תקין').max(15),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  
  // Professional Details
  licenseNumber: z.string().min(2, 'מספר רישיון נדרש').max(50),
  licenseType: z.string().min(1, 'סוג רישיון נדרש'),
  yearsExperience: z.string().optional(),
  specializations: z.string().optional(),
  education: z.string().optional(),
  
  // Clinic Details
  clinicName: z.string().optional(),
  clinicAddress: z.string().optional(),
  clinicPhone: z.string().optional(),
});

type TherapistIntakeForm = z.infer<typeof therapistIntakeSchema>;

const INTAKE_STORAGE_KEY = 'therapist_intake_completed';
const DISCLAIMER_STORAGE_KEY = 'therapist_disclaimer_signed';

const licenseTypes = [
  { value: 'acupuncture', label: 'דיקור סיני' },
  { value: 'chinese_medicine', label: 'רפואה סינית מסורתית' },
  { value: 'naturopathy', label: 'נטורופתיה' },
  { value: 'homeopathy', label: 'הומאופתיה' },
  { value: 'reflexology', label: 'רפלקסולוגיה' },
  { value: 'shiatsu', label: 'שיאצו' },
  { value: 'massage', label: 'עיסוי רפואי' },
  { value: 'other', label: 'אחר' },
];

const disclaimerPoints = [
  'אני מטפל/ת מורשה ברפואה סינית מסורתית עם רישיון תקף לעסוק במקצוע.',
  'מערכת זו היא כלי תמיכה בלבד ואינה מהווה תחליף לשיקול הדעת הרפואי המקצועי שלי.',
  'המערכת משתמשת בבינה מלאכותית ועלולה להכיל שגיאות, נתונים חלקיים או הזיות.',
  'אני נושא/ת באחריות בלעדית ומלאה לאימות כל הנתונים, האבחנות ותוכניות הטיפול.',
  'אני מתחייב/ת לאמת את כל המידע מול ספרות רפואית מקובלת לפני הטיפול.',
  'היוצרים מסירים כל אחריות לכל פציעה, הפסד או נזק הנובעים משימוש בכלי זה.',
];

export default function TherapistIntake() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isFromGate = searchParams.get('from') === 'gate';
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idCheckStatus, setIdCheckStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  
  // Disclaimer state
  const [confirmLicensed, setConfirmLicensed] = useState(false);
  const [confirmRead, setConfirmRead] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const form = useForm<TherapistIntakeForm>({
    resolver: zodResolver(therapistIntakeSchema),
    defaultValues: {
      idNumber: '',
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      licenseNumber: '',
      licenseType: '',
      yearsExperience: '',
      specializations: '',
      education: '',
      clinicName: '',
      clinicAddress: '',
      clinicPhone: '',
    },
  });

  // Check if already completed
  useEffect(() => {
    const completed = localStorage.getItem(INTAKE_STORAGE_KEY);
    if (completed) {
      try {
        const data = JSON.parse(completed);
        if (data.completedAt && new Date(data.completedAt) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)) {
          navigate('/dashboard');
        }
      } catch {
        // Invalid JSON
      }
    }
  }, [navigate]);

  const checkIdNumber = async (idNumber: string) => {
    if (!idNumber || idNumber.length < 5) {
      setIdCheckStatus('idle');
      return;
    }

    if (looksLikeIsraeliId(idNumber)) {
      const result = validateIsraeliId(idNumber);
      if (!result.valid) {
        setIdCheckStatus('invalid');
        return;
      }
    }
    
    setIdCheckStatus('checking');
    // Simulate check
    setTimeout(() => setIdCheckStatus('valid'), 500);
  };

  const canProceedToDisclaimer = confirmLicensed && confirmRead && signature && isSaved;

  const generateDisclaimerHTML = () => {
    const values = form.getValues();
    const date = new Date().toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>טופס קליטת מטפל - חתום</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; direction: rtl; }
          .header { text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 20px; margin-bottom: 20px; }
          .section { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .section h3 { margin-top: 0; color: #16a34a; }
          .field { margin: 10px 0; }
          .field label { font-weight: bold; }
          .emergency { background: #fee2e2; border: 2px solid #dc2626; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .signature-section { border: 2px solid #16a34a; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .signature-img { max-width: 300px; border: 1px solid #ccc; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏥 מערכת ניהול קליניקה - רפואה סינית</h1>
          <h2>טופס קליטת מטפל - חתום</h2>
          <p><strong>תאריך:</strong> ${date}</p>
        </div>

        <div class="section">
          <h3>👤 פרטים אישיים</h3>
          <div class="field"><label>שם מלא:</label> ${values.fullName}</div>
          <div class="field"><label>ת.ז.:</label> ${values.idNumber}</div>
          <div class="field"><label>אימייל:</label> ${values.email}</div>
          <div class="field"><label>טלפון:</label> ${values.phone}</div>
          ${values.dateOfBirth ? `<div class="field"><label>תאריך לידה:</label> ${values.dateOfBirth}</div>` : ''}
          ${values.address ? `<div class="field"><label>כתובת:</label> ${values.address}</div>` : ''}
        </div>

        <div class="section">
          <h3>🎓 פרטים מקצועיים</h3>
          <div class="field"><label>מספר רישיון:</label> ${values.licenseNumber}</div>
          <div class="field"><label>סוג רישיון:</label> ${licenseTypes.find(l => l.value === values.licenseType)?.label || values.licenseType}</div>
          ${values.yearsExperience ? `<div class="field"><label>שנות ניסיון:</label> ${values.yearsExperience}</div>` : ''}
          ${values.specializations ? `<div class="field"><label>התמחויות:</label> ${values.specializations}</div>` : ''}
          ${values.education ? `<div class="field"><label>השכלה:</label> ${values.education}</div>` : ''}
        </div>

        ${values.clinicName ? `
        <div class="section">
          <h3>🏢 פרטי קליניקה</h3>
          <div class="field"><label>שם הקליניקה:</label> ${values.clinicName}</div>
          ${values.clinicAddress ? `<div class="field"><label>כתובת:</label> ${values.clinicAddress}</div>` : ''}
          ${values.clinicPhone ? `<div class="field"><label>טלפון:</label> ${values.clinicPhone}</div>` : ''}
        </div>
        ` : ''}

        <div class="emergency">
          <h3>🚨 במקרה חירום רפואי</h3>
          <p><strong>אין להשתמש במערכת - יש לפנות מיידית למוקד 101</strong></p>
        </div>
        
        <div class="section">
          <h3>הצהרה משפטית</h3>
          <ol>
            ${disclaimerPoints.map(point => `<li>${point}</li>`).join('')}
          </ol>
        </div>
        
        <div class="signature-section">
          <h3>חתימת המטפל</h3>
          <img src="${signature}" alt="חתימה" class="signature-img" />
          <p><strong>נחתם בתאריך:</strong> ${date}</p>
        </div>
      </body>
      </html>
    `;
  };

  const handleSaveLocal = () => {
    const html = generateDisclaimerHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Therapist_Intake_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsSaved(true);
    toast.success('נשמר לדיסק המקומי');
  };

  const handleSubmit = async () => {
    if (!canProceedToDisclaimer) {
      toast.error('יש להשלים את כל השדות הנדרשים ולחתום');
      return;
    }

    setIsSubmitting(true);
    const values = form.getValues();

    try {
      // Save to database
      const { error } = await supabase
        .from('therapist_disclaimers')
        .insert({
          therapist_name: values.fullName,
          license_number: values.licenseNumber,
          language: 'he',
          signature_url: signature,
          user_agent: navigator.userAgent,
        });

      if (error) {
        console.error('Error saving to database:', error);
      }

      // Save completion status
      localStorage.setItem(INTAKE_STORAGE_KEY, JSON.stringify({
        completedAt: new Date().toISOString(),
        therapistName: values.fullName,
        licenseNumber: values.licenseNumber,
      }));

      // Also update the disclaimer storage key for status badge
      localStorage.setItem(DISCLAIMER_STORAGE_KEY, JSON.stringify({
        signedAt: new Date().toISOString(),
        language: 'he',
        therapistName: values.fullName,
        licenseNumber: values.licenseNumber,
      }));

      toast.success('טופס הקליטה הושלם בהצלחה!');
      
      // Check if coming from Gate registration flow
      if (isFromGate) {
        const selectedTier = sessionStorage.getItem('selected_tier_for_intake');
        if (selectedTier === 'trial') {
          // Trial users go directly to password step
          navigate('/gate?step=password');
        } else {
          // Paid tier users go to payment step
          navigate('/gate?step=payment&tier=' + selectedTier);
        }
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('שגיאה בשמירה. נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof TherapistIntakeForm)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ['idNumber', 'fullName', 'email', 'phone'];
    } else if (step === 2) {
      fieldsToValidate = ['licenseNumber', 'licenseType'];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div 
      className="min-h-screen py-8 px-4 md:px-6 flex items-start md:items-center justify-center"
      dir="rtl"
      style={{
        backgroundImage: `url(${therapistIntakeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundAttachment: 'fixed',
        backgroundColor: '#e0e5df',
      }}
    >
      <Helmet>
        <title>קליטת מטפל | מערכת ניהול קליניקה</title>
      </Helmet>

      {/* Glassmorphism Form Container */}
      <div className="w-full max-w-2xl bg-white/92 backdrop-blur-md rounded-xl shadow-2xl p-6 md:p-10 my-4 md:my-8 space-y-6">
        <CrossPlatformBackButton fallbackPath="/dashboard" />

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                step >= s ? 'bg-jade text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {s}
              </div>
              {s < 4 && <div className={`w-8 h-1 ${step > s ? 'bg-jade' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground mb-4">
          {step === 1 && 'פרטים אישיים'}
          {step === 2 && 'פרטים מקצועיים'}
          {step === 3 && 'פרטי קליניקה (אופציונלי)'}
          {step === 4 && 'הצהרה וחתימה'}
        </div>

        <Form {...form}>
          <form className="space-y-6">
            {/* Step 1: Personal Details */}
            {step === 1 && (
              <Card className="bg-white/80 backdrop-blur-sm border-jade/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-jade" />
                    פרטים אישיים
                  </CardTitle>
                  <CardDescription>מלא את הפרטים האישיים שלך</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="idNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          מספר ת.ז. *
                          {idCheckStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin" />}
                          {idCheckStatus === 'valid' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123456789" 
                            {...field}
                            onBlur={(e) => {
                              field.onBlur();
                              checkIdNumber(e.target.value);
                            }}
                          />
                        </FormControl>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <Mail className="h-4 w-4" /> אימייל *
                          </FormLabel>
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
                          <FormLabel className="flex items-center gap-1">
                            <Phone className="h-4 w-4" /> טלפון *
                          </FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="050-1234567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" /> תאריך לידה
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>כתובת מגורים</FormLabel>
                          <FormControl>
                            <Input placeholder="עיר, רחוב" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Professional Details */}
            {step === 2 && (
              <Card className="bg-white/80 backdrop-blur-sm border-jade/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-jade" />
                    פרטים מקצועיים
                  </CardTitle>
                  <CardDescription>פרטי הרישיון והניסיון המקצועי</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="licenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <Award className="h-4 w-4" /> מספר רישיון *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="מספר רישיון" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="licenseType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>סוג רישיון *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="בחר סוג רישיון" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {licenseTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="yearsExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" /> שנות ניסיון
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="בחר" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0-2">0-2 שנים</SelectItem>
                            <SelectItem value="3-5">3-5 שנים</SelectItem>
                            <SelectItem value="6-10">6-10 שנים</SelectItem>
                            <SelectItem value="10+">מעל 10 שנים</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specializations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>התמחויות</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="לדוגמה: כאבי גב, פוריות, עיכול..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>השכלה ותעודות</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="פרט את ההשכלה והתעודות שלך" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 3: Clinic Details (Optional) */}
            {step === 3 && (
              <Card className="bg-white/80 backdrop-blur-sm border-jade/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-jade" />
                    פרטי קליניקה
                  </CardTitle>
                  <CardDescription>פרטי הקליניקה (אופציונלי - ניתן להשלים מאוחר יותר)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="clinicName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>שם הקליניקה</FormLabel>
                        <FormControl>
                          <Input placeholder="שם הקליניקה" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clinicAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>כתובת הקליניקה</FormLabel>
                        <FormControl>
                          <Input placeholder="עיר, רחוב, מספר" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clinicPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>טלפון הקליניקה</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="03-1234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 4: Disclaimer & Signature */}
            {step === 4 && (
              <div className="space-y-6">
                {/* Emergency Warning */}
                <Card className="border-destructive bg-destructive/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 text-destructive">
                      <AlertTriangle className="h-8 w-8 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-lg">🚨 במקרה חירום רפואי</h3>
                        <p className="font-medium">אין להשתמש במערכת - יש לפנות מיידית למוקד 101</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Disclaimer Points */}
                <Card className="bg-white/80 backdrop-blur-sm border-jade/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-jade" />
                      הצהרה משפטית
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                      {disclaimerPoints.map((point, index) => (
                        <div key={index} className="flex gap-2">
                          <span className="text-jade font-bold">{index + 1}.</span>
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          id="confirmLicensed" 
                          checked={confirmLicensed}
                          onCheckedChange={(checked) => setConfirmLicensed(!!checked)}
                        />
                        <Label htmlFor="confirmLicensed" className="cursor-pointer">
                          אני מאשר/ת כי אני מטפל/ת מוסמך/ת ברפואה משלימה
                        </Label>
                      </div>

                      <div className="flex items-center gap-3">
                        <Checkbox 
                          id="confirmRead" 
                          checked={confirmRead}
                          onCheckedChange={(checked) => setConfirmRead(!!checked)}
                        />
                        <Label htmlFor="confirmRead" className="cursor-pointer">
                          קראתי והבנתי את ההצהרה המשפטית ואת מגבלות המערכת
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Signature */}
                <Card className="bg-white/80 backdrop-blur-sm border-jade/20 shadow-lg">
                  <CardHeader>
                    <CardTitle>חתימה דיגיטלית</CardTitle>
                    <CardDescription>אנא חתום/י למטה לאישור ההסכמה</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>חתימת המטפל</Label>
                      <SignaturePad 
                        onSave={setSignature}
                        onClear={() => setSignature(null)}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleSaveLocal}
                        disabled={!signature}
                        className="flex-1"
                      >
                        <FileDown className="h-4 w-4 ml-2" />
                        שמירה לדיסק המקומי
                      </Button>
                    </div>

                    {isSaved && (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>הקובץ נשמר בהצלחה</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowRight className="h-4 w-4 ml-2" />
                  הקודם
                </Button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <Button type="button" onClick={nextStep}>
                  הבא
                  <ArrowLeft className="h-4 w-4 mr-2" />
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={handleSubmit}
                  disabled={!canProceedToDisclaimer || isSubmitting}
                  className="bg-jade hover:bg-jade-dark"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      שומר...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 ml-2" />
                      סיום והגשה
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

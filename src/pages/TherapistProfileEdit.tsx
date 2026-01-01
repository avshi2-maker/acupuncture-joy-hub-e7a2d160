import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  User, Award, Building2, Phone, Mail, GraduationCap, 
  Briefcase, Calendar, Save, ArrowLeft, CheckCircle2
} from 'lucide-react';
import { CrossPlatformBackButton } from '@/components/ui/CrossPlatformBackButton';

const INTAKE_STORAGE_KEY = 'therapist_intake_completed';

const therapistProfileSchema = z.object({
  idNumber: z.string().min(5, 'מספר ת.ז. חייב להכיל לפחות 5 ספרות').max(15),
  fullName: z.string().min(2, 'שם מלא חייב להכיל לפחות 2 תווים').max(100),
  email: z.string().email('כתובת אימייל לא תקינה').max(255),
  phone: z.string().min(9, 'מספר טלפון לא תקין').max(15),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  licenseNumber: z.string().min(2, 'מספר רישיון נדרש').max(50),
  licenseType: z.string().min(1, 'סוג רישיון נדרש'),
  yearsExperience: z.string().optional(),
  specializations: z.string().optional(),
  education: z.string().optional(),
  clinicName: z.string().optional(),
  clinicAddress: z.string().optional(),
  clinicPhone: z.string().optional(),
});

type TherapistProfileForm = z.infer<typeof therapistProfileSchema>;

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

export default function TherapistProfileEdit() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  const form = useForm<TherapistProfileForm>({
    resolver: zodResolver(therapistProfileSchema),
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

  // Load existing profile data
  useEffect(() => {
    const intakeData = localStorage.getItem(INTAKE_STORAGE_KEY);
    const profileData = localStorage.getItem('therapist_profile_details');
    
    if (profileData) {
      try {
        const parsed = JSON.parse(profileData);
        form.reset(parsed);
        setHasProfile(true);
      } catch { /* ignore */ }
    } else if (intakeData) {
      try {
        const parsed = JSON.parse(intakeData);
        // Set basic fields from intake
        form.setValue('fullName', parsed.therapistName || '');
        form.setValue('licenseNumber', parsed.licenseNumber || '');
        setHasProfile(true);
      } catch { /* ignore */ }
    }
  }, [form]);

  const onSubmit = async (data: TherapistProfileForm) => {
    setIsSubmitting(true);
    
    try {
      // Save to localStorage
      localStorage.setItem('therapist_profile_details', JSON.stringify(data));
      
      // Update intake storage with new name if changed
      const intakeData = localStorage.getItem(INTAKE_STORAGE_KEY);
      if (intakeData) {
        try {
          const parsed = JSON.parse(intakeData);
          parsed.therapistName = data.fullName;
          parsed.licenseNumber = data.licenseNumber;
          localStorage.setItem(INTAKE_STORAGE_KEY, JSON.stringify(parsed));
        } catch { /* ignore */ }
      }
      
      toast.success('פרופיל המטפל עודכן בהצלחה');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error:', err);
      toast.error('שגיאה בשמירה. נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4" dir="rtl">
      <Helmet>
        <title>עריכת פרופיל מטפל | מערכת ניהול קליניקה</title>
      </Helmet>

      <div className="max-w-2xl mx-auto space-y-6">
        <CrossPlatformBackButton fallbackPath="/dashboard" />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <User className="h-6 w-6 text-jade" />
              עריכת פרופיל מטפל
            </h1>
            <p className="text-muted-foreground mt-1">עדכן את הפרטים האישיים והמקצועיים שלך</p>
          </div>
          {hasProfile && (
            <Badge variant="outline" className="text-jade border-jade">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              פרופיל פעיל
            </Badge>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-jade" />
                  פרטים אישיים
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    name="idNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>מספר ת.ז. *</FormLabel>
                        <FormControl>
                          <Input placeholder="123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                          <Input placeholder="רחוב, עיר" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Professional Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="h-5 w-5 text-jade" />
                  פרטים מקצועיים
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="licenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>מספר רישיון *</FormLabel>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="yearsExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" /> שנות ניסיון
                        </FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="5" {...field} />
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
                        <FormLabel className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4" /> השכלה
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="תואר ומוסד לימודים" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="specializations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>התמחויות</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="פירוט התמחויות וטיפולים מיוחדים..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Clinic Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-jade" />
                  פרטי קליניקה
                </CardTitle>
                <CardDescription>אופציונלי - מלא אם יש לך קליניקה פרטית</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="clinicName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>שם הקליניקה</FormLabel>
                      <FormControl>
                        <Input placeholder="קליניקה לרפואה סינית" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clinicAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>כתובת הקליניקה</FormLabel>
                        <FormControl>
                          <Input placeholder="רחוב, עיר" {...field} />
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
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-jade hover:bg-jade/90"
              >
                {isSubmitting ? (
                  <>שומר...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 ml-2" />
                    שמור פרופיל
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                ביטול
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTier } from '@/hooks/useTier';
import { toast } from 'sonner';
import { User, Stethoscope, MapPin, Award, Leaf } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const profileSchema = z.object({
  businessName: z.string().min(2, 'שם העסק חייב להכיל לפחות 2 תווים').max(100),
  specialty: z.string().min(1, 'יש לבחור התמחות'),
  licenseNumber: z.string().optional(),
  yearsExperience: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  bio: z.string().max(500, 'תיאור מקסימום 500 תווים').optional(),
  website: z.string().url('כתובת אתר לא תקינה').optional().or(z.literal('')),
});

type ProfileForm = z.infer<typeof profileSchema>;

const specialties = [
  'דיקור סיני',
  'צמחי מרפא סיניים',
  'שיאצו',
  'רפלקסולוגיה',
  'טווינא',
  'כוסות רוח',
  'מוקסה',
  'טאי צ\'י / צ\'י גונג',
  'אחר',
];

export default function TherapistProfile() {
  const navigate = useNavigate();
  const { tier } = useTier();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      businessName: '',
      specialty: '',
      licenseNumber: '',
      yearsExperience: '',
      address: '',
      city: '',
      bio: '',
      website: '',
    },
  });

  const tierLabels: Record<string, { label: string; color: string }> = {
    trial: { label: 'ניסיון', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
    standard: { label: 'סטנדרט', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
    premium: { label: 'פרימיום', color: 'bg-jade/10 text-jade border-jade/30' },
  };

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    try {
      // Store profile in localStorage for now
      localStorage.setItem('therapist_profile', JSON.stringify(data));
      toast.success('הפרופיל נשמר בהצלחה!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('שגיאה בשמירת הפרופיל');
    } finally {
      setIsLoading(false);
    }
  };

  // Load existing profile
  useEffect(() => {
    const savedProfile = localStorage.getItem('therapist_profile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        form.reset(profile);
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>השלמת פרופיל מטפל | TCM Clinic</title>
        <meta name="description" content="השלימו את פרטי הפרופיל שלכם" />
      </Helmet>

      <div className="min-h-screen bg-background py-12 px-4" dir="rtl">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-elevated">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-jade-light rounded-full flex items-center justify-center">
                <Leaf className="h-8 w-8 text-jade" />
              </div>
              <div className="flex items-center justify-center gap-3">
                <CardTitle className="font-display text-3xl">פרופיל מטפל</CardTitle>
                {tier && tierLabels[tier] && (
                  <Badge variant="outline" className={tierLabels[tier].color}>
                    {tierLabels[tier].label}
                  </Badge>
                )}
              </div>
              <CardDescription>
                השלימו את הפרטים כדי להתחיל להשתמש במערכת
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Business Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-jade" />
                      פרטי העסק
                    </h3>

                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>שם העסק / קליניקה *</FormLabel>
                          <FormControl>
                            <Input placeholder="לדוגמה: קליניקת איזון" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specialty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>התמחות עיקרית *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="בחרו התמחות" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {specialties.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="licenseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>מספר רישיון</FormLabel>
                            <FormControl>
                              <Input placeholder="אופציונלי" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="yearsExperience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>שנות ניסיון</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="בחרו" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="0-2">0-2 שנים</SelectItem>
                                <SelectItem value="3-5">3-5 שנים</SelectItem>
                                <SelectItem value="6-10">6-10 שנים</SelectItem>
                                <SelectItem value="10+">יותר מ-10 שנים</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-jade" />
                      מיקום
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>עיר</FormLabel>
                            <FormControl>
                              <Input placeholder="לדוגמה: תל אביב" {...field} />
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
                            <FormLabel>כתובת</FormLabel>
                            <FormControl>
                              <Input placeholder="רחוב ומספר" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* About */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Award className="h-5 w-5 text-jade" />
                      אודות
                    </h3>

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>תיאור קצר</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="ספרו קצת על עצמכם וההתמחויות שלכם..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>עד 500 תווים</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>אתר אינטרנט</FormLabel>
                          <FormControl>
                            <Input type="url" placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? 'שומר...' : 'שמירה והמשך'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate('/dashboard')}
                    >
                      דלג
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

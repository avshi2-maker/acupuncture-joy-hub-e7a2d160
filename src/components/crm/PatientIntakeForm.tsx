import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, differenceInYears } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { User, Heart, Baby, Activity, Utensils, Moon, Brain, AlertTriangle, FileSignature, PenTool, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { SignaturePad } from './SignaturePad';
import { MedicalDocumentUpload } from './MedicalDocumentUpload';
import { DietNutritionSelect } from './DietNutritionSelect';
import { validateIsraeliId, looksLikeIsraeliId } from '@/utils/israeliIdValidation';

// Base patient schema
const basePatientSchema = z.object({
  // Basic Info
  id_number: z.string().min(5, 'ID number is required (min 5 digits)').max(15, 'ID number too long'),
  full_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().min(8, 'Valid phone is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  address: z.string().optional(),
  occupation: z.string().optional(),
  
  // Emergency Contact
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().optional(),
  
  // Medical History
  medical_history: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  chief_complaint: z.string().min(1, 'Chief complaint is required'),
  
  // Lifestyle
  diet_notes: z.string().optional(),
  sleep_quality: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  stress_level: z.enum(['low', 'moderate', 'high', 'severe']).optional(),
  exercise_frequency: z.enum(['daily', 'weekly', 'occasionally', 'rarely', 'never']).optional(),
  lifestyle_notes: z.string().optional(),
  
  // TCM Intake
  constitution_type: z.string().optional(),
  tongue_notes: z.string().optional(),
  pulse_notes: z.string().optional(),
  
  // Pregnancy (conditional)
  is_pregnant: z.boolean().default(false),
  pregnancy_weeks: z.number().min(1).max(42).optional().nullable(),
  due_date: z.string().optional().nullable(),
  pregnancy_notes: z.string().optional(),
  obstetric_history: z.string().optional(),
  
  // Consent
  consent_signed: z.boolean().refine(val => val === true, 'Consent is required'),
});

type PatientFormData = z.infer<typeof basePatientSchema>;

// Age-specific questions
const ageGroupQuestions = {
  child: [
    { id: 'birth_history', label: 'Birth History', placeholder: 'Any complications during birth? Premature?' },
    { id: 'vaccinations', label: 'Vaccination Status', placeholder: 'Up to date? Any reactions?' },
    { id: 'developmental', label: 'Developmental Milestones', placeholder: 'Any delays or concerns?' },
    { id: 'school_performance', label: 'School/Learning', placeholder: 'Any learning difficulties?' },
  ],
  teen: [
    { id: 'puberty', label: 'Puberty Status', placeholder: 'Any concerns about development?' },
    { id: 'mental_health', label: 'Mental Health', placeholder: 'Mood, anxiety, stress levels?' },
    { id: 'social', label: 'Social/School Life', placeholder: 'Any challenges?' },
    { id: 'sports', label: 'Sports/Activities', placeholder: 'Active in sports? Any injuries?' },
  ],
  adult: [
    { id: 'work_stress', label: 'Work-Related Stress', placeholder: 'Describe work environment and stress' },
    { id: 'family_history', label: 'Family Medical History', placeholder: 'Heart disease, diabetes, cancer, etc.' },
    { id: 'reproductive', label: 'Reproductive Health', placeholder: 'Any concerns? Menstrual regularity?' },
  ],
  senior: [
    { id: 'mobility', label: 'Mobility & Balance', placeholder: 'Any falls? Use of aids?' },
    { id: 'cognitive', label: 'Cognitive Health', placeholder: 'Memory concerns?' },
    { id: 'chronic_conditions', label: 'Chronic Conditions', placeholder: 'Diabetes, hypertension, arthritis, etc.' },
    { id: 'bone_health', label: 'Bone Health', placeholder: 'Osteoporosis? Fractures?' },
    { id: 'vision_hearing', label: 'Vision & Hearing', placeholder: 'Any changes or concerns?' },
  ],
};

// Pregnancy questions
const pregnancyQuestions = [
  { id: 'gravida_para', label: 'Gravida/Para', placeholder: 'e.g., G2P1 (2 pregnancies, 1 live birth)' },
  { id: 'prenatal_care', label: 'Prenatal Care Provider', placeholder: 'OB/GYN name and contact' },
  { id: 'pregnancy_complications', label: 'Current Pregnancy Complications', placeholder: 'Gestational diabetes, preeclampsia, etc.' },
  { id: 'previous_pregnancies', label: 'Previous Pregnancy Outcomes', placeholder: 'Live births, miscarriages, c-sections, etc.' },
  { id: 'pregnancy_symptoms', label: 'Current Symptoms', placeholder: 'Nausea, back pain, swelling, etc.' },
  { id: 'herbs_supplements', label: 'Current Herbs/Supplements', placeholder: 'Prenatal vitamins, iron, etc.' },
  { id: 'contraindications_awareness', label: 'Treatment Awareness', type: 'info' },
];

function getAgeGroup(dob: string): 'child' | 'teen' | 'adult' | 'senior' {
  const age = differenceInYears(new Date(), new Date(dob));
  if (age < 13) return 'child';
  if (age < 20) return 'teen';
  if (age < 65) return 'adult';
  return 'senior';
}

interface PatientIntakeFormProps {
  patientId?: string;
  onSuccess?: () => void;
}

export function PatientIntakeForm({ patientId, onSuccess }: PatientIntakeFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ageGroup, setAgeGroup] = useState<'child' | 'teen' | 'adult' | 'senior' | null>(null);
  const [ageSpecificAnswers, setAgeSpecificAnswers] = useState<Record<string, string>>({});
  const [pregnancyAnswers, setPregnancyAnswers] = useState<Record<string, string>>({});
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [medicalDocuments, setMedicalDocuments] = useState<File[]>([]);
  const [dietHabits, setDietHabits] = useState<string[]>([]);
  
  // ID Number validation state
  const [idCheckStatus, setIdCheckStatus] = useState<'idle' | 'checking' | 'valid' | 'duplicate' | 'invalid_checksum'>('idle');
  const [isIdDuplicate, setIsIdDuplicate] = useState(false);
  const [idChecksumError, setIdChecksumError] = useState<string | null>(null);

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
        setIdChecksumError(checksumResult.error || 'Invalid ID checksum');
        setIsIdDuplicate(false);
        return;
      }
    }
    
    setIdChecksumError(null);
    setIdCheckStatus('checking');
    
    try {
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('id_number', idNumber)
        .neq('id', patientId || '')
        .maybeSingle();

      if (existingPatient) {
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

  const form = useForm<PatientFormData>({
    resolver: zodResolver(basePatientSchema),
    defaultValues: {
      id_number: '',
      full_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      gender: 'female',
      address: '',
      occupation: '',
      emergency_contact: '',
      emergency_phone: '',
      medical_history: '',
      allergies: '',
      medications: '',
      chief_complaint: '',
      diet_notes: '',
      sleep_quality: undefined,
      stress_level: undefined,
      exercise_frequency: undefined,
      lifestyle_notes: '',
      constitution_type: '',
      tongue_notes: '',
      pulse_notes: '',
      is_pregnant: false,
      pregnancy_weeks: null,
      due_date: null,
      pregnancy_notes: '',
      obstetric_history: '',
      consent_signed: false,
    },
  });

  const watchDob = form.watch('date_of_birth');
  const watchGender = form.watch('gender');
  const watchIsPregnant = form.watch('is_pregnant');

  // Update age group when DOB changes
  useEffect(() => {
    if (watchDob) {
      const group = getAgeGroup(watchDob);
      setAgeGroup(group);
    } else {
      setAgeGroup(null);
    }
  }, [watchDob]);

  // Load existing patient data if editing
  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  const loadPatientData = async () => {
    if (!patientId) return;
    
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    if (data) {
      form.reset({
        ...data,
        id_number: data.id_number || '',
        date_of_birth: data.date_of_birth || '',
        gender: (data.gender as 'male' | 'female' | 'other') || 'female',
        // Ensure Radix Select receives `undefined` (not `null`) to avoid controlled-state loops
        sleep_quality: (data.sleep_quality ?? undefined) as any,
        stress_level: (data.stress_level ?? undefined) as any,
        exercise_frequency: (data.exercise_frequency ?? undefined) as any,
        constitution_type: (data.constitution_type ?? undefined) as any,
      });
    }
  };

  const onSubmit = async (data: PatientFormData) => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    // Block submission if we already know ID is duplicate
    if (isIdDuplicate) {
      toast.error('מספר ת.ז. כבר קיים במערכת! לא ניתן לשמור. / ID number already exists!');
      return;
    }

    setLoading(true);
    try {
      // Double-check for duplicate ID number at submission time
      const { data: existingPatient, error: checkError } = await supabase
        .from('patients')
        .select('id')
        .eq('id_number', data.id_number)
        .neq('id', patientId || '')
        .maybeSingle();

      if (existingPatient) {
        setIsIdDuplicate(true);
        setIdCheckStatus('duplicate');
        toast.error('מספר ת.ז. כבר קיים במערכת! לא ניתן לשמור. / ID number already exists!');
        setLoading(false);
        return;
      }
      // Compile notes with age-specific and pregnancy answers
      let compiledNotes = data.lifestyle_notes || '';
      
      if (ageGroup && Object.keys(ageSpecificAnswers).length > 0) {
        compiledNotes += `\n\n--- Age-Specific (${ageGroup}) ---\n`;
        const questions = ageGroupQuestions[ageGroup];
        questions.forEach(q => {
          if (ageSpecificAnswers[q.id]) {
            compiledNotes += `${q.label}: ${ageSpecificAnswers[q.id]}\n`;
          }
        });
      }

      if (data.is_pregnant && Object.keys(pregnancyAnswers).length > 0) {
        compiledNotes += '\n\n--- Pregnancy Information ---\n';
        pregnancyQuestions.forEach(q => {
          if (pregnancyAnswers[q.id]) {
            compiledNotes += `${q.label}: ${pregnancyAnswers[q.id]}\n`;
          }
        });
      }

      // Add diet habits
      if (dietHabits.length > 0) {
        compiledNotes += '\n\n--- Diet & Nutrition Habits ---\n';
        compiledNotes += dietHabits.join('\n');
      }

      const patientData = {
        id_number: data.id_number,
        full_name: data.full_name,
        therapist_id: user.id,
        email: data.email || null,
        phone: data.phone,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        address: data.address || null,
        occupation: data.occupation || null,
        emergency_contact: data.emergency_contact || null,
        emergency_phone: data.emergency_phone || null,
        medical_history: data.medical_history || null,
        allergies: data.allergies || null,
        medications: data.medications || null,
        chief_complaint: data.chief_complaint,
        diet_notes: [dietHabits.join('; '), data.diet_notes].filter(Boolean).join('\n\n') || null,
        sleep_quality: data.sleep_quality || null,
        stress_level: data.stress_level || null,
        exercise_frequency: data.exercise_frequency || null,
        lifestyle_notes: compiledNotes.trim() || null,
        constitution_type: data.constitution_type || null,
        tongue_notes: data.tongue_notes || null,
        pulse_notes: data.pulse_notes || null,
        is_pregnant: data.is_pregnant,
        pregnancy_weeks: data.is_pregnant ? data.pregnancy_weeks : null,
        due_date: data.is_pregnant ? data.due_date : null,
        pregnancy_notes: data.is_pregnant ? [
          data.pregnancy_notes,
          pregnancyAnswers.pregnancy_complications,
          pregnancyAnswers.pregnancy_symptoms
        ].filter(Boolean).join('\n') || null : null,
        obstetric_history: data.is_pregnant ? [
          data.obstetric_history,
          pregnancyAnswers.gravida_para,
          pregnancyAnswers.previous_pregnancies
        ].filter(Boolean).join('\n') || null : null,
        age_group: ageGroup,
        notes: compiledNotes.trim() || null,
        consent_signed: data.consent_signed,
        consent_signed_at: data.consent_signed ? new Date().toISOString() : null,
      };

      if (patientId) {
        const { error } = await supabase
          .from('patients')
          .update(patientData)
          .eq('id', patientId);

        if (error) throw error;
        toast.success('Patient updated successfully');
      } else {
        const { error } = await supabase
          .from('patients')
          .insert([patientData]);
        if (error) throw error;
        toast.success('Patient created successfully');
      }

      onSuccess?.();
      navigate('/crm/patients');
    } catch (error: any) {
      console.error('Error saving patient:', error);
      toast.error(error.message || 'Failed to save patient');
    } finally {
      setLoading(false);
    }
  };

  const currentAgeQuestions = ageGroup ? ageGroupQuestions[ageGroup] : [];
  const showPregnancySection = watchGender === 'female' && watchIsPregnant;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-jade" />
              Basic Information
            </CardTitle>
            <CardDescription>Patient personal details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="id_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    ID Number (ת.ז.) *
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
                      placeholder="Enter ID number" 
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
                      מספר ת.ז. כבר קיים במערכת! / ID number already exists!
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
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  {ageGroup && (
                    <FormDescription>
                      Age Group: <span className="font-medium capitalize text-jade">{ageGroup}</span>
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone *</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 234 567 8900" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="occupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Occupation</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Teacher, Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Full address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-gold" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="emergency_contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Emergency contact name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergency_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Emergency contact phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Medical History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-destructive" />
              Medical History
            </CardTitle>
            <CardDescription>Important medical information for treatment planning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="chief_complaint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chief Complaint *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What brings you in today? Main symptoms and concerns..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="medical_history"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Past Medical History</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Previous illnesses, surgeries, hospitalizations..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergies</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Food, medication, environmental allergies..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="medications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Medications & Supplements</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="List all current medications, vitamins, and supplements with dosages..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-4" />

            {/* Medical Document Upload */}
            <MedicalDocumentUpload
              maxFiles={5}
              onFilesChange={setMedicalDocuments}
            />
          </CardContent>
        </Card>

        {/* Pregnancy Section (conditional) */}
        {watchGender === 'female' && (
          <Card className="border-pink-200 bg-pink-50/30 dark:bg-pink-950/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Baby className="h-5 w-5 text-pink-500" />
                Pregnancy Information
              </CardTitle>
              <CardDescription>This section is important for treatment safety</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="is_pregnant"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Currently Pregnant</FormLabel>
                      <FormDescription>
                        Check this box if you are currently pregnant
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {showPregnancySection && (
                <>
                  <Separator />
                  
                  <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <strong>Important:</strong> Certain acupuncture points and herbs are contraindicated during pregnancy. Your practitioner will review this information carefully.
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="pregnancy_weeks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weeks Pregnant</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1} 
                              max={42}
                              placeholder="e.g., 12"
                              {...field}
                              value={field.value ?? ''}
                              onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="due_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Due Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Pregnancy-specific questions */}
                  <div className="space-y-4">
                    {pregnancyQuestions.map((q) => (
                      q.type !== 'info' && (
                        <div key={q.id} className="space-y-2">
                          <Label htmlFor={q.id}>{q.label}</Label>
                          <Textarea
                            id={q.id}
                            placeholder={q.placeholder}
                            value={pregnancyAnswers[q.id] || ''}
                            onChange={(e) => setPregnancyAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                          />
                        </div>
                      )
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Age-Specific Questions (conditional) */}
        {ageGroup && currentAgeQuestions.length > 0 && (
          <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                {ageGroup === 'child' && 'Child-Specific Assessment'}
                {ageGroup === 'teen' && 'Teen-Specific Assessment'}
                {ageGroup === 'adult' && 'Adult Health Assessment'}
                {ageGroup === 'senior' && 'Senior Health Assessment'}
              </CardTitle>
              <CardDescription>
                Questions tailored for the {ageGroup} age group
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentAgeQuestions.map((q) => (
                <div key={q.id} className="space-y-2">
                  <Label htmlFor={`age-${q.id}`}>{q.label}</Label>
                  <Textarea
                    id={`age-${q.id}`}
                    placeholder={q.placeholder}
                    value={ageSpecificAnswers[q.id] || ''}
                    onChange={(e) => setAgeSpecificAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Lifestyle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-bamboo" />
              Lifestyle Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="sleep_quality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Sleep Quality
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stress_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Stress Level
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exercise_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Exercise Frequency
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="occasionally">Occasionally</SelectItem>
                        <SelectItem value="rarely">Rarely</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Diet & Nutrition Multi-Select */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                Diet & Nutrition
              </Label>
              <DietNutritionSelect
                value={dietHabits}
                onChange={setDietHabits}
              />
            </div>

            <FormField
              control={form.control}
              name="diet_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Diet Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional dietary notes, restrictions, allergies..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lifestyle_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Lifestyle Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any other relevant lifestyle information..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* TCM Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-jade">
              TCM Assessment
            </CardTitle>
            <CardDescription>Traditional Chinese Medicine diagnostic notes (for practitioner use)</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="tongue_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tongue Diagnosis</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Color, coating, shape, moisture..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pulse_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pulse Diagnosis</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Rate, rhythm, quality, position..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="constitution_type"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Constitution Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select constitution type..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced (平和)</SelectItem>
                      <SelectItem value="qi_deficiency">Qi Deficiency (气虚)</SelectItem>
                      <SelectItem value="yang_deficiency">Yang Deficiency (阳虚)</SelectItem>
                      <SelectItem value="yin_deficiency">Yin Deficiency (阴虚)</SelectItem>
                      <SelectItem value="phlegm_dampness">Phlegm-Dampness (痰湿)</SelectItem>
                      <SelectItem value="damp_heat">Damp-Heat (湿热)</SelectItem>
                      <SelectItem value="blood_stasis">Blood Stasis (血瘀)</SelectItem>
                      <SelectItem value="qi_stagnation">Qi Stagnation (气郁)</SelectItem>
                      <SelectItem value="special">Special Constitution (特禀)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Consent */}
        <Card className="border-jade/30 bg-jade/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-jade" />
              Informed Consent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-background/80 border text-sm space-y-3">
              <p><strong>Treatment Consent:</strong> I understand that Traditional Chinese Medicine (TCM), including acupuncture, cupping, moxibustion, and herbal medicine, are forms of healthcare that may provide benefits but also carry certain risks.</p>
              <p><strong>Acupuncture:</strong> May cause minor bruising, bleeding, or temporary discomfort. Rare risks include infection or nerve damage.</p>
              <p><strong>Herbal Medicine:</strong> May interact with medications or cause allergic reactions. I agree to inform my practitioner of all medications and supplements I take.</p>
              <p><strong>Privacy:</strong> I consent to the collection and storage of my health information for treatment purposes, in accordance with privacy regulations.</p>
            </div>

            <FormField
              control={form.control}
              name="consent_signed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border border-destructive/30 rounded-lg bg-destructive/5">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-destructive data-[state=checked]:bg-destructive"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-base text-destructive font-semibold">
                      I have read and agree to the terms above *
                    </FormLabel>
                    <FormDescription className="text-destructive/80">
                      By checking this box, I acknowledge that I have read, understood, and agree to the informed consent.
                    </FormDescription>
                    <p className="text-xs text-destructive font-medium mt-2 flex items-center gap-1">
                      ⚠️ All patient data is saved exclusively on the Therapist's secure files – never stored on this application.
                    </p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Signature Pad */}
            <Separator className="my-4" />
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <PenTool className="h-4 w-4 text-jade" />
                <Label className="text-base font-medium">Patient Signature</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Please sign below to confirm your consent to treatment
              </p>
              
              {/* Privacy Notice */}
              <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                <p className="text-xs text-destructive font-medium flex items-center gap-1">
                  ⚠️ Signature is saved exclusively on the Therapist's secure files – never stored on this application.
                </p>
                <p className="text-xs text-destructive/80 mt-1" dir="rtl">
                  החתימה נשמרת בתיק המטפל בלבד – לעולם לא מאוחסנת באפליקציה זו.
                </p>
              </div>

              <SignaturePad
                onSave={(dataUrl) => {
                  setSignatureDataUrl(dataUrl);
                  toast.success('Signature captured');
                }}
                onClear={() => setSignatureDataUrl(null)}
                disabled={loading}
              />
              {signatureDataUrl && (
                <p className="text-sm text-jade flex items-center gap-2">
                  ✓ Signature captured successfully
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/crm/patients')}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-jade hover:bg-jade/90"
          >
            {loading ? 'Saving...' : patientId ? 'Update Patient' : 'Create Patient'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

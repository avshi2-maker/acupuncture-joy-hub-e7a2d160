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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { User, Heart, Baby, Activity, Utensils, Moon, Brain, AlertTriangle, FileSignature, PenTool, CheckCircle2, XCircle, Loader2, Calendar, BrainCircuit, Save, ChevronLeft, ChevronRight } from 'lucide-react';
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

// Step-specific field validation
const stepFields: Record<number, (keyof PatientFormData)[]> = {
  0: ['id_number', 'full_name', 'phone', 'date_of_birth', 'gender'],
  1: ['chief_complaint'],
  2: [], // Lifestyle is all optional
  3: ['consent_signed'],
};

// Which steps can be skipped (have no required fields)
const skippableSteps = [2]; // Only Lifestyle step is skippable

const stepTitles = [
  { title: 'Personal Info', icon: User },
  { title: 'Medical History', icon: Heart },
  { title: 'Lifestyle', icon: Activity },
  { title: 'Consent', icon: FileSignature },
];

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
  const [currentStep, setCurrentStep] = useState(0);
  const [ageGroup, setAgeGroup] = useState<'child' | 'teen' | 'adult' | 'senior' | null>(null);
  const [ageSpecificAnswers, setAgeSpecificAnswers] = useState<Record<string, string>>({});
  const [pregnancyAnswers, setPregnancyAnswers] = useState<Record<string, string>>({});
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [medicalDocuments, setMedicalDocuments] = useState<File[]>([]);
  const [dietHabits, setDietHabits] = useState<string[]>([]);
  
  // Post-save navigation dialog
  const [showNavigationDialog, setShowNavigationDialog] = useState(false);
  const [savedPatientId, setSavedPatientId] = useState<string | null>(null);
  
  // ID Number validation state
  const [idCheckStatus, setIdCheckStatus] = useState<'idle' | 'checking' | 'valid' | 'duplicate' | 'invalid_checksum'>('idle');
  const [isIdDuplicate, setIsIdDuplicate] = useState(false);
  const [idChecksumError, setIdChecksumError] = useState<string | null>(null);
  
  // Custom notes alongside dropdowns
  const [customNotes, setCustomNotes] = useState<Record<string, string>>({
    sleep_quality: '',
    stress_level: '',
    exercise_frequency: '',
    constitution_type: '',
  });

  const totalSteps = stepTitles.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

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
    mode: 'onChange', // Validate on change for better UX
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

  // Validate current step before proceeding
  const validateCurrentStep = async (): Promise<boolean> => {
    const fieldsToValidate = stepFields[currentStep];
    
    if (fieldsToValidate.length === 0) {
      return true; // No required fields in this step
    }

    // Trigger validation for only the current step's fields
    const result = await form.trigger(fieldsToValidate);
    
    if (!result) {
      const errors = form.formState.errors;
      const firstErrorField = fieldsToValidate.find(field => errors[field]);
      if (firstErrorField && errors[firstErrorField]) {
        toast.error(`Please fix: ${errors[firstErrorField]?.message}`);
      }
    }

    // Additional check for ID duplicate
    if (currentStep === 0 && isIdDuplicate) {
      toast.error('ID number already exists in system');
      return false;
    }

    return result;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

      // Add custom notes from dropdowns
      const customNoteLabels: Record<string, string> = {
        sleep_quality: 'Sleep Notes',
        stress_level: 'Stress Notes',
        exercise_frequency: 'Exercise Notes',
        constitution_type: 'Constitution Notes',
      };
      const customNotesEntries = Object.entries(customNotes).filter(([_, value]) => value.trim());
      if (customNotesEntries.length > 0) {
        compiledNotes += '\n\n--- Additional Assessment Notes ---\n';
        customNotesEntries.forEach(([key, value]) => {
          compiledNotes += `${customNoteLabels[key] || key}: ${value}\n`;
        });
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

      let resultPatientId = patientId;
      
      if (patientId) {
        const { error } = await supabase
          .from('patients')
          .update(patientData)
          .eq('id', patientId);

        if (error) throw error;
        toast.success('Patient updated successfully');
      } else {
        const { data: insertedPatient, error } = await supabase
          .from('patients')
          .insert([patientData])
          .select('id')
          .single();
        if (error) throw error;
        resultPatientId = insertedPatient?.id;
        toast.success('Patient created successfully');
      }

      onSuccess?.();
      
      // Show navigation dialog instead of auto-navigating
      setSavedPatientId(resultPatientId || null);
      setShowNavigationDialog(true);
    } catch (error: any) {
      console.error('Error saving patient:', error);
      toast.error(error.message || 'Failed to save patient');
    } finally {
      setLoading(false);
    }
  };

  const currentAgeQuestions = ageGroup ? ageGroupQuestions[ageGroup] : [];
  const showPregnancySection = watchGender === 'female' && watchIsPregnant;

  // Handle form errors - show toast with first error
  const handleFormErrors = (errors: any) => {
    const firstErrorKey = Object.keys(errors)[0];
    const firstError = errors[firstErrorKey];
    const errorMessage = firstError?.message || 'Please fill in all required fields';
    toast.error(`Validation Error: ${errorMessage}`);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, handleFormErrors)} className="space-y-6">
        {/* Progress Bar & Step Indicator */}
        <div className="sticky top-0 z-20 -mx-4 px-4 py-4 bg-background/95 backdrop-blur border-b">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span className="font-medium flex items-center gap-2">
                {(() => {
                  const StepIcon = stepTitles[currentStep].icon;
                  return <StepIcon className="h-4 w-4 text-jade" />;
                })()}
                {stepTitles[currentStep].title}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between">
              {stepTitles.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      if (index < currentStep) {
                        setCurrentStep(index);
                      }
                    }}
                    disabled={index > currentStep}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
                      isCurrent 
                        ? 'bg-jade/20 text-jade font-medium' 
                        : isCompleted 
                          ? 'text-jade cursor-pointer hover:bg-jade/10' 
                          : 'text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <StepIcon className="h-3 w-3" />
                    )}
                    <span className="hidden sm:inline">{step.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 0: Basic Information */}
        {currentStep === 0 && (
          <>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          </>
        )}

        {/* Step 1: Medical History */}
        {currentStep === 1 && (
          <>
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
          </>
        )}

        {/* Step 2: Lifestyle */}
        {currentStep === 2 && (
          <>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <Input
                          placeholder="Additional details..."
                          className="mt-2"
                          value={customNotes.sleep_quality}
                          onChange={(e) => setCustomNotes(prev => ({ ...prev, sleep_quality: e.target.value }))}
                        />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <Input
                          placeholder="Additional details..."
                          className="mt-2"
                          value={customNotes.stress_level}
                          onChange={(e) => setCustomNotes(prev => ({ ...prev, stress_level: e.target.value }))}
                        />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <Input
                          placeholder="Additional details..."
                          className="mt-2"
                          value={customNotes.exercise_frequency}
                          onChange={(e) => setCustomNotes(prev => ({ ...prev, exercise_frequency: e.target.value }))}
                        />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Input
                        placeholder="Additional notes about constitution..."
                        className="mt-2"
                        value={customNotes.constitution_type}
                        onChange={(e) => setCustomNotes(prev => ({ ...prev, constitution_type: e.target.value }))}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </>
        )}

        {/* Step 3: Consent */}
        {currentStep === 3 && (
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
                      <FormLabel className="text-base font-medium">
                        I agree to the terms above and consent to treatment *
                      </FormLabel>
                      <p className="text-sm text-muted-foreground" dir="rtl">
                        אני מסכים/ה לתנאים לעיל ומאשר/ת טיפול
                      </p>
                      <div className="text-xs text-destructive/80 mt-2 font-medium">
                        ⚠️ All patient data is saved exclusively on the Therapist's secure files – never stored on this application.
                      </div>
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
        )}

        {/* Navigation Bar */}
        <div className="sticky bottom-0 z-10 -mx-4 px-4 py-4 bg-background/95 backdrop-blur border-t shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={currentStep === 0 ? () => navigate('/crm/patients') : handlePrevious}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {currentStep === 0 ? 'Cancel' : 'Previous'}
            </Button>
            
            <div className="flex items-center gap-2">
              {/* Skip button for optional steps */}
              {currentStep < totalSteps - 1 && skippableSteps.includes(currentStep) && (
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setCurrentStep(prev => prev + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-muted-foreground"
                >
                  Skip
                </Button>
              )}
              
              {currentStep < totalSteps - 1 ? (
                <Button 
                  type="button"
                  onClick={handleNext}
                  className="bg-jade hover:bg-jade/90 gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-jade hover:bg-jade/90 gap-2"
                >
                  <Save className="h-4 w-4" />
                  {loading ? 'Saving...' : patientId ? 'Update & Choose Next' : 'Save & Choose Next'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Post-Save Navigation Dialog */}
      <Dialog open={showNavigationDialog} onOpenChange={setShowNavigationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-jade">
              <CheckCircle2 className="h-5 w-5" />
              Patient Saved Successfully
            </DialogTitle>
            <DialogDescription>
              Where would you like to go next?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => {
                setShowNavigationDialog(false);
                navigate('/crm/calendar');
              }}
            >
              <Calendar className="h-8 w-8 text-gold" />
              <span>Calendar</span>
            </Button>
            <Button
              className="h-24 flex-col gap-2 bg-jade hover:bg-jade/90"
              onClick={() => {
                setShowNavigationDialog(false);
                if (savedPatientId) {
                  navigate(`/tcm-brain?patientId=${savedPatientId}`);
                } else {
                  navigate('/tcm-brain');
                }
              }}
            >
              <BrainCircuit className="h-8 w-8" />
              <span>TCM Brain Session</span>
            </Button>
          </div>
          <div className="pt-2">
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => {
                setShowNavigationDialog(false);
                navigate('/crm/patients');
              }}
            >
              Go to Patient List
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Form>
  );
}

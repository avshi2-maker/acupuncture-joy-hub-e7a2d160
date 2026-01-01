import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, differenceInYears, formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { VoiceTextarea, VoiceInput } from './VoiceInputFields';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { SimpleSelect } from './SimpleSelect';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { User, Heart, Baby, Activity, Utensils, Moon, Brain, AlertTriangle, FileSignature, PenTool, CheckCircle2, XCircle, Loader2, Calendar, BrainCircuit, ChevronLeft, ChevronRight, FileText, Eye, Edit2, CircleDot, RotateCcw, Save, Clock } from 'lucide-react';
import { SignaturePad } from './SignaturePad';
import { MedicalDocumentUpload } from './MedicalDocumentUpload';
import { DietNutritionSelect } from './DietNutritionSelect';
import { PulseDiagnosisSelect } from './PulseDiagnosisSelect';
import { AllergiesSelect } from './AllergiesSelect';
import { MedicationsSupplementsSelect } from './MedicationsSupplementsSelect';
import { TongueDiagnosisSelect } from './TongueDiagnosisSelect';
import { ConstitutionTypeSelect } from './ConstitutionTypeSelect';
import { ChiefComplaintSelect } from './ChiefComplaintSelect';
import { validateIsraeliId, looksLikeIsraeliId } from '@/utils/israeliIdValidation';
import { useIntakeDraftAutosave } from '@/hooks/useIntakeDraftAutosave';

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
  3: [], // Preview step - no validation needed
  4: ['consent_signed'],
};

// All trackable fields per step (for completion indicators)
const stepAllFields: Record<number, (keyof PatientFormData)[]> = {
  0: ['id_number', 'full_name', 'phone', 'date_of_birth', 'gender', 'email', 'address', 'occupation', 'emergency_contact', 'emergency_phone'],
  1: ['chief_complaint', 'medical_history', 'allergies', 'medications'],
  2: ['diet_notes', 'sleep_quality', 'stress_level', 'exercise_frequency', 'lifestyle_notes', 'constitution_type', 'tongue_notes', 'pulse_notes'],
  3: [], // Preview step
  4: ['consent_signed'],
};

// Which steps can be skipped (have no required fields)
const skippableSteps = [2]; // Only Lifestyle step is skippable

const stepTitles = [
  { title: 'Personal Info', icon: User },
  { title: 'Medical History', icon: Heart },
  { title: 'Lifestyle', icon: Activity },
  { title: 'Preview', icon: FileText },
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
  if (age < 18) return 'teen';
  if (age < 20) return 'teen';
  if (age < 65) return 'adult';
  return 'senior';
}

interface PatientIntakeFormProps {
  patientId?: string;
  onSuccess?: () => void;
  returnTo?: string; // e.g. '/video-session' to show back button
  testMode?: boolean; // Enable test mode with demo data
}

// Demo data for test mode
const DEMO_PATIENT_DATA: Partial<PatientFormData> = {
  id_number: '123456782', // Valid Israeli ID checksum
  full_name: 'Test Patient Demo',
  email: 'test@demo.com',
  phone: '050-1234567',
  date_of_birth: '1985-06-15',
  gender: 'female',
  address: '123 Test Street, Tel Aviv',
  occupation: 'Software Developer',
  emergency_contact: 'Demo Emergency',
  emergency_phone: '050-9876543',
  medical_history: 'No significant medical history',
  allergies: 'None known',
  medications: 'Vitamin D',
  chief_complaint: 'Lower back pain',
  diet_notes: 'Vegetarian diet',
  sleep_quality: 'good',
  stress_level: 'moderate',
  exercise_frequency: 'weekly',
  lifestyle_notes: 'Works from home, sits a lot',
  constitution_type: 'Qi Deficiency',
  tongue_notes: 'Pale tongue, thin white coating',
  pulse_notes: 'Weak pulse, especially on left side',
  is_pregnant: false,
  consent_signed: false, // User must still consent
};

export function PatientIntakeForm({ patientId, onSuccess, returnTo, testMode = false }: PatientIntakeFormProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Initialize step from URL or default to 0
  const initialStep = (() => {
    const stepParam = searchParams.get('step');
    if (stepParam) {
      const parsed = parseInt(stepParam, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < stepTitles.length) {
        return parsed;
      }
    }
    return 0;
  })();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [ageGroup, setAgeGroup] = useState<'child' | 'teen' | 'adult' | 'senior' | null>(null);
  const [ageSpecificAnswers, setAgeSpecificAnswers] = useState<Record<string, string>>({});
  const [pregnancyAnswers, setPregnancyAnswers] = useState<Record<string, string>>({});
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [medicalDocuments, setMedicalDocuments] = useState<File[]>([]);
  const [dietHabits, setDietHabits] = useState<string[]>([]);
  const [pulseFindings, setPulseFindings] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [tongueFindings, setTongueFindings] = useState<string[]>([]);
  
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
    chief_complaint: '',
  });

  const totalSteps = stepTitles.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Track whether draft has been shown/dismissed
  const [draftDismissed, setDraftDismissed] = useState(false);

  // Sync current step to URL for sharing/bookmarking
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (currentStep > 0) {
      newParams.set('step', currentStep.toString());
    } else {
      newParams.delete('step');
    }
    // Only update if different to avoid unnecessary history entries
    if (newParams.toString() !== searchParams.toString()) {
      setSearchParams(newParams, { replace: true });
    }
  }, [currentStep, searchParams, setSearchParams]);

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

  // Auto-save hook
  const {
    lastSaved,
    isSaving,
    hasDraft,
    clearDraft,
    restoreDraft,
  } = useIntakeDraftAutosave({
    form,
    customNotes,
    selectedAllergies,
    selectedMedications,
    dietHabits,
    pulseFindings,
    tongueFindings,
    ageSpecificAnswers,
    pregnancyAnswers,
    currentStep,
    patientId,
  });

  // Handle draft restoration
  const handleRestoreDraft = useCallback(() => {
    const draft = restoreDraft();
    if (draft && typeof draft === 'object') {
      // Restore additional state not in form
      if (draft.customNotes) setCustomNotes(draft.customNotes);
      if (draft.selectedAllergies) setSelectedAllergies(draft.selectedAllergies);
      if (draft.selectedMedications) setSelectedMedications(draft.selectedMedications);
      if (draft.dietHabits) setDietHabits(draft.dietHabits);
      if (draft.pulseFindings) setPulseFindings(draft.pulseFindings);
      if (draft.tongueFindings) setTongueFindings(draft.tongueFindings);
      if (draft.ageSpecificAnswers) setAgeSpecificAnswers(draft.ageSpecificAnswers);
      if (draft.pregnancyAnswers) setPregnancyAnswers(draft.pregnancyAnswers);
      if (typeof draft.currentStep === 'number') setCurrentStep(draft.currentStep);
      
      toast.success('Draft restored successfully');
      setDraftDismissed(true);
    }
  }, [restoreDraft]);

  const handleDismissDraft = useCallback(() => {
    clearDraft();
    setDraftDismissed(true);
    toast.info('Draft discarded');
  }, [clearDraft]);

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

  // Focus on the first invalid field
  const focusFirstInvalidField = (fieldsToCheck: (keyof PatientFormData)[]) => {
    const errors = form.formState.errors;
    const firstErrorField = fieldsToCheck.find(field => errors[field]);
    
    if (firstErrorField) {
      // Try to find and focus the input element
      const fieldElement = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
      if (fieldElement) {
        fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          fieldElement.focus();
        }, 300);
      }
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
      // Auto-scroll and focus to the first invalid field
      focusFirstInvalidField(fieldsToValidate);
    }

    // Additional check for ID duplicate
    if (currentStep === 0 && isIdDuplicate) {
      toast.error('ID number already exists in system');
      // Focus the ID field
      const idField = document.querySelector('[name="id_number"]') as HTMLElement;
      if (idField) {
        idField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => idField.focus(), 300);
      }
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

  // Fill form with demo data (test mode)
  const fillDemoData = () => {
    form.reset({
      ...form.getValues(),
      ...DEMO_PATIENT_DATA,
    } as PatientFormData);
    setAgeGroup('adult');
    toast.success('Demo data filled! Review and modify as needed.');
  };

  // Reset form to empty state
  const resetFormToEmpty = () => {
    form.reset({
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
    });
    setCurrentStep(0);
    setAgeGroup(null);
    setAgeSpecificAnswers({});
    setPregnancyAnswers({});
    setSignatureDataUrl(null);
    setDietHabits([]);
    setPulseFindings([]);
    setSelectedAllergies([]);
    setSelectedMedications([]);
    setTongueFindings([]);
    setIdCheckStatus('idle');
    setIsIdDuplicate(false);
    setIdChecksumError(null);
    toast.info('Form reset to empty state');
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
        toast.error('מספר ת.ז. כבר קיים במערכת! חזור לשלב 1 לשנות. / ID number already exists! Go back to step 1 to change.');
        setCurrentStep(0); // Navigate back to step 0 where ID field is
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
        // Clear draft on successful save
        clearDraft();
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

  // Calculate field completion for each step
  const getStepCompletion = (stepIndex: number): { filled: number; total: number; percentage: number } => {
    const fields = stepAllFields[stepIndex] || [];
    if (fields.length === 0) return { filled: 0, total: 0, percentage: 100 };
    
    const values = form.getValues();
    let filled = 0;
    
    fields.forEach(field => {
      const value = values[field];
      if (value !== undefined && value !== null && value !== '') {
        filled++;
      }
    });
    
    return {
      filled,
      total: fields.length,
      percentage: fields.length > 0 ? Math.round((filled / fields.length) * 100) : 100
    };
  };

  // Get all form values for preview
  const formValues = form.watch();

  // Handle form errors - show toast with first error and focus field
  const handleFormErrors = (errors: any) => {
    const firstErrorKey = Object.keys(errors)[0];
    const firstError = errors[firstErrorKey];
    const errorMessage = firstError?.message || 'Please fill in all required fields';
    toast.error(`Validation Error: ${errorMessage}`);
    
    // Focus the first error field
    const fieldElement = document.querySelector(`[name="${firstErrorKey}"]`) as HTMLElement;
    if (fieldElement) {
      fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => fieldElement.focus(), 300);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, handleFormErrors)} className="space-y-6">
        {/* Draft Restore Banner */}
        {hasDraft && !draftDismissed && !patientId && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg p-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Unsaved Draft Found</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">You have an unsaved intake form. Would you like to restore it?</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleRestoreDraft}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Restore Draft
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDismissDraft}
                  className="text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900/30"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Discard
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Auto-save Indicator */}
        {!patientId && (lastSaved || isSaving) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isSaving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving draft...</span>
              </>
            ) : lastSaved ? (
              <>
                <Clock className="h-3 w-3" />
                <span>Draft auto-saved {formatDistanceToNow(lastSaved, { addSuffix: true })}</span>
              </>
            ) : null}
          </div>
        )}

        {/* Test Mode Banner */}
        {testMode && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">Test Mode Active</p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">Use demo data to test the intake flow</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fillDemoData}
                  className="border-amber-400 text-amber-700 hover:bg-amber-100"
                >
                  <BrainCircuit className="h-4 w-4 mr-1" />
                  Fill Demo Data
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetFormToEmpty}
                  className="text-amber-700 hover:bg-amber-100"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar & Step Indicator */}
        <div className="sticky top-0 z-20 -mx-4 px-4 py-4 bg-background/95 backdrop-blur border-b space-y-3">
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
            <div className="flex justify-between gap-1">
              {stepTitles.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                const completion = getStepCompletion(index);
                const hasRequiredFields = (stepFields[index] || []).length > 0;
                const isPreviewStep = index === 3;
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setCurrentStep(index);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex flex-col items-center gap-0.5 text-xs px-1.5 sm:px-2 py-1 rounded-lg transition-colors cursor-pointer min-w-0 flex-1 ${
                      isCurrent 
                        ? 'bg-jade/20 text-jade font-medium' 
                        : isCompleted 
                          ? 'text-jade hover:bg-jade/10' 
                          : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {isCompleted ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <StepIcon className="h-3 w-3" />
                      )}
                      <span className="hidden sm:inline truncate">{step.title}</span>
                    </div>
                    {/* Completion indicator */}
                    {!isPreviewStep && completion.total > 0 && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-8 h-1 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              completion.percentage === 100 
                                ? 'bg-jade' 
                                : hasRequiredFields && completion.percentage < 50 
                                  ? 'bg-amber-500' 
                                  : 'bg-jade/60'
                            }`}
                            style={{ width: `${completion.percentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground hidden sm:inline">
                          {completion.filled}/{completion.total}
                        </span>
                      </div>
                    )}
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
                      <FormControl>
                        <SimpleSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select gender"
                          options={[
                            { value: 'female', label: 'Female' },
                            { value: 'male', label: 'Male' },
                            { value: 'other', label: 'Other' },
                          ]}
                        />
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
                      <ChiefComplaintSelect
                        value={field.value || ''}
                        onValueChange={field.onChange}
                      />
                      <Input
                        placeholder="Or type chief complaint here..."
                        className="mt-1 border-dashed border-amber-400"
                        onChange={(e) => {
                          if (e.target.value) {
                            field.onChange(e.target.value);
                          }
                        }}
                      />
                      <VoiceTextarea 
                        placeholder="Additional details about symptoms and concerns..." 
                        className="min-h-[80px] mt-2"
                        value={customNotes.chief_complaint || ''}
                        onChange={(e) => setCustomNotes(prev => ({ ...prev, chief_complaint: e.target.value }))}
                      />
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
                          <VoiceTextarea 
                            placeholder="Previous illnesses, surgeries, hospitalizations..." 
                            value={field.value}
                            onChange={field.onChange}
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
                        <AllergiesSelect
                          value={selectedAllergies}
                          onChange={(newAllergies) => {
                            setSelectedAllergies(newAllergies);
                            const existingNotes = field.value || '';
                            const selectedText = newAllergies.join('; ');
                            field.onChange(selectedText + (existingNotes && !existingNotes.startsWith(selectedText) ? '\n\nNotes: ' + existingNotes : ''));
                          }}
                        />
                        <Input
                          placeholder="Or type allergies here..."
                          className="mt-1 border-dashed border-amber-400"
                          onChange={(e) => {
                            if (e.target.value) {
                              setSelectedAllergies([e.target.value]);
                              field.onChange(e.target.value);
                            }
                          }}
                        />
                        <FormControl>
                          <VoiceTextarea 
                            placeholder="Additional allergy notes, reactions, severity details..." 
                            className="mt-2"
                            value={field.value?.includes('\n\nNotes: ') ? field.value.split('\n\nNotes: ')[1] : (selectedAllergies.length === 0 ? field.value : '')}
                            onChange={(e) => {
                              const selectedText = selectedAllergies.join('; ');
                              field.onChange(selectedText ? selectedText + (e.target.value ? '\n\nNotes: ' + e.target.value : '') : e.target.value);
                            }}
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
                      <MedicationsSupplementsSelect
                        value={selectedMedications}
                        onChange={(newMedications) => {
                          setSelectedMedications(newMedications);
                          const existingNotes = field.value || '';
                          const selectedText = newMedications.join('; ');
                          field.onChange(selectedText + (existingNotes && !existingNotes.startsWith(selectedText) ? '\n\nDosage Notes: ' + existingNotes : ''));
                        }}
                      />
                      <FormControl>
                        <VoiceTextarea 
                          placeholder="Add dosage details, frequency, or other medication notes..." 
                          className="mt-2"
                          value={field.value?.includes('\n\nDosage Notes: ') ? field.value.split('\n\nDosage Notes: ')[1] : (selectedMedications.length === 0 ? field.value : '')}
                          onChange={(e) => {
                            const selectedText = selectedMedications.join('; ');
                            field.onChange(selectedText ? selectedText + (e.target.value ? '\n\nDosage Notes: ' + e.target.value : '') : e.target.value);
                          }}
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
                              <VoiceTextarea
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
                      <VoiceTextarea
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
                    render={({ field }) => {
                      const labels: Record<string, string> = { excellent: 'Excellent', good: 'Good', fair: 'Fair', poor: 'Poor' };
                      const hint = field.value ? `Selected: ${labels[field.value]}. Add notes...` : 'Additional details...';
                      return (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Sleep Quality
                          </FormLabel>
                          <FormControl>
                            <SimpleSelect
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Select..."
                              options={[
                                { value: 'excellent', label: 'Excellent' },
                                { value: 'good', label: 'Good' },
                                { value: 'fair', label: 'Fair' },
                                { value: 'poor', label: 'Poor' },
                              ]}
                            />
                          </FormControl>
                          <Input
                            placeholder={hint}
                            className="mt-2"
                            value={customNotes.sleep_quality}
                            onChange={(e) => setCustomNotes(prev => ({ ...prev, sleep_quality: e.target.value }))}
                          />
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="stress_level"
                    render={({ field }) => {
                      const labels: Record<string, string> = { low: 'Low', moderate: 'Moderate', high: 'High', severe: 'Severe' };
                      const hint = field.value ? `Selected: ${labels[field.value]}. Add notes...` : 'Additional details...';
                      return (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            Stress Level
                          </FormLabel>
                          <FormControl>
                            <SimpleSelect
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Select..."
                              options={[
                                { value: 'low', label: 'Low' },
                                { value: 'moderate', label: 'Moderate' },
                                { value: 'high', label: 'High' },
                                { value: 'severe', label: 'Severe' },
                              ]}
                            />
                          </FormControl>
                          <Input
                            placeholder={hint}
                            className="mt-2"
                            value={customNotes.stress_level}
                            onChange={(e) => setCustomNotes(prev => ({ ...prev, stress_level: e.target.value }))}
                          />
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="exercise_frequency"
                    render={({ field }) => {
                      const labels: Record<string, string> = { daily: 'Daily', weekly: 'Weekly', occasionally: 'Occasionally', rarely: 'Rarely', never: 'Never' };
                      const hint = field.value ? `Selected: ${labels[field.value]}. Add notes...` : 'Additional details...';
                      return (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Exercise Frequency
                          </FormLabel>
                          <FormControl>
                            <SimpleSelect
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Select..."
                              options={[
                                { value: 'daily', label: 'Daily' },
                                { value: 'weekly', label: 'Weekly' },
                                { value: 'occasionally', label: 'Occasionally' },
                                { value: 'rarely', label: 'Rarely' },
                                { value: 'never', label: 'Never' },
                              ]}
                            />
                          </FormControl>
                          <Input
                            placeholder={hint}
                            className="mt-2"
                            value={customNotes.exercise_frequency}
                            onChange={(e) => setCustomNotes(prev => ({ ...prev, exercise_frequency: e.target.value }))}
                          />
                          <FormMessage />
                        </FormItem>
                      );
                    }}
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
                  <Input
                    placeholder="Or type diet notes here to bypass dropdown..."
                    className="mt-1 border-dashed border-amber-400"
                    onChange={(e) => {
                      if (e.target.value) {
                        setDietHabits([e.target.value]);
                      }
                    }}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="diet_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Diet Notes</FormLabel>
                      <FormControl>
                        <VoiceTextarea 
                          placeholder="Any additional dietary notes, restrictions, allergies..." 
                          value={field.value}
                          onChange={field.onChange}
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
                        <VoiceTextarea 
                          placeholder="Any other relevant lifestyle information..." 
                          value={field.value}
                          onChange={field.onChange}
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
                      <TongueDiagnosisSelect
                        value={tongueFindings}
                        onChange={(newFindings) => {
                          setTongueFindings(newFindings);
                          const existingNotes = field.value || '';
                          const selectedText = newFindings.join('; ');
                          field.onChange(selectedText + (existingNotes && !existingNotes.startsWith(selectedText) ? '\n\nNotes: ' + existingNotes : ''));
                        }}
                        maxSelections={5}
                      />
                      <Input
                        placeholder="Or type tongue findings here..."
                        className="mt-1 border-dashed border-amber-400"
                        onChange={(e) => {
                          if (e.target.value) {
                            setTongueFindings([e.target.value]);
                            field.onChange(e.target.value);
                          }
                        }}
                      />
                      <FormControl>
                        <VoiceTextarea 
                          placeholder="Additional tongue notes (color, coating, moisture, shape)..." 
                          className="mt-2"
                          value={field.value?.includes('\n\nNotes: ') ? field.value.split('\n\nNotes: ')[1] : (tongueFindings.length === 0 ? field.value : '')}
                          onChange={(e) => {
                            const selectedText = tongueFindings.join('; ');
                            field.onChange(selectedText ? selectedText + (e.target.value ? '\n\nNotes: ' + e.target.value : '') : e.target.value);
                          }}
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
                      <PulseDiagnosisSelect
                        value={pulseFindings}
                        onChange={(newFindings) => {
                          setPulseFindings(newFindings);
                          const existingNotes = field.value || '';
                          const selectedText = newFindings.join('; ');
                          field.onChange(selectedText + (existingNotes && !existingNotes.startsWith(selectedText) ? '\n\nNotes: ' + existingNotes : ''));
                        }}
                        maxSelections={5}
                      />
                      <Input
                        placeholder="Or type pulse findings here..."
                        className="mt-1 border-dashed border-amber-400"
                        onChange={(e) => {
                          if (e.target.value) {
                            setPulseFindings([e.target.value]);
                            field.onChange(e.target.value);
                          }
                        }}
                      />
                      <FormControl>
                        <VoiceTextarea 
                          placeholder="Additional pulse notes (rate, rhythm, quality, position)..." 
                          className="mt-2"
                          value={field.value?.includes('\n\nNotes: ') ? field.value.split('\n\nNotes: ')[1] : (pulseFindings.length === 0 ? field.value : '')}
                          onChange={(e) => {
                            const selectedText = pulseFindings.join('; ');
                            field.onChange(selectedText ? selectedText + (e.target.value ? '\n\nNotes: ' + e.target.value : '') : e.target.value);
                          }}
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
                      <ConstitutionTypeSelect
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                      <Input
                        placeholder="Or type constitution here..."
                        className="mt-1 border-dashed border-amber-400"
                        onChange={(e) => {
                          if (e.target.value) {
                            field.onChange(e.target.value);
                          }
                        }}
                      />
                      <VoiceInput
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

        {/* Step 3: Preview/Summary */}
        {currentStep === 3 && (
          <Card className="border-blue-300 bg-blue-50/30 dark:bg-blue-900/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                Review Your Information
              </CardTitle>
              <CardDescription>
                Please review all entered data before proceeding to consent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Info Summary */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-jade" />
                    Personal Information
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(0)}
                    className="text-xs gap-1"
                  >
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3 rounded-lg bg-background border text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">{formValues.full_name || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ID:</span>
                    <p className="font-medium">{formValues.id_number || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">{formValues.phone || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">DOB:</span>
                    <p className="font-medium">{formValues.date_of_birth || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gender:</span>
                    <p className="font-medium capitalize">{formValues.gender || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{formValues.email || '—'}</p>
                  </div>
                  {formValues.address && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Address:</span>
                      <p className="font-medium">{formValues.address}</p>
                    </div>
                  )}
                  {formValues.occupation && (
                    <div>
                      <span className="text-muted-foreground">Occupation:</span>
                      <p className="font-medium">{formValues.occupation}</p>
                    </div>
                  )}
                </div>
                {(formValues.emergency_contact || formValues.emergency_phone) && (
                  <div className="p-2 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-200 text-sm">
                    <span className="text-amber-700 dark:text-amber-300 font-medium">Emergency:</span>{' '}
                    {formValues.emergency_contact} {formValues.emergency_phone && `(${formValues.emergency_phone})`}
                  </div>
                )}
              </div>

              <Separator />

              {/* Medical History Summary */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    <Heart className="h-4 w-4 text-rose-500" />
                    Medical History
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs gap-1"
                  >
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </Button>
                </div>
                <div className="grid gap-3 p-3 rounded-lg bg-background border text-sm">
                  <div>
                    <span className="text-muted-foreground">Chief Complaint:</span>
                    <p className="font-medium text-rose-600 dark:text-rose-400">{formValues.chief_complaint || '—'}</p>
                  </div>
                  {formValues.medical_history && (
                    <div>
                      <span className="text-muted-foreground">Medical History:</span>
                      <p className="font-medium whitespace-pre-wrap">{formValues.medical_history}</p>
                    </div>
                  )}
                  {formValues.allergies && (
                    <div>
                      <span className="text-muted-foreground">Allergies:</span>
                      <p className="font-medium text-amber-600">{formValues.allergies}</p>
                    </div>
                  )}
                  {formValues.medications && (
                    <div>
                      <span className="text-muted-foreground">Medications:</span>
                      <p className="font-medium">{formValues.medications}</p>
                    </div>
                  )}
                </div>
                {formValues.is_pregnant && (
                  <div className="p-2 rounded bg-pink-50 dark:bg-pink-900/20 border border-pink-200 text-sm">
                    <span className="text-pink-700 dark:text-pink-300 font-medium flex items-center gap-1">
                      <Baby className="h-4 w-4" />
                      Pregnant
                    </span>
                    {formValues.pregnancy_weeks && ` - ${formValues.pregnancy_weeks} weeks`}
                    {formValues.due_date && ` (Due: ${formValues.due_date})`}
                  </div>
                )}
              </div>

              <Separator />

              {/* Lifestyle Summary */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-600" />
                    Lifestyle & TCM Assessment
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs gap-1"
                  >
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 rounded-lg bg-background border text-sm">
                  <div>
                    <span className="text-muted-foreground">Sleep:</span>
                    <p className="font-medium capitalize">{formValues.sleep_quality || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Stress:</span>
                    <p className="font-medium capitalize">{formValues.stress_level || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Exercise:</span>
                    <p className="font-medium capitalize">{formValues.exercise_frequency || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Constitution:</span>
                    <p className="font-medium">{formValues.constitution_type || '—'}</p>
                  </div>
                </div>
                {(formValues.tongue_notes || formValues.pulse_notes) && (
                  <div className="grid md:grid-cols-2 gap-3">
                    {formValues.tongue_notes && (
                      <div className="p-2 rounded bg-rose-50 dark:bg-rose-900/20 border text-sm">
                        <span className="text-muted-foreground">Tongue:</span>
                        <p className="font-medium">{formValues.tongue_notes}</p>
                      </div>
                    )}
                    {formValues.pulse_notes && (
                      <div className="p-2 rounded bg-purple-50 dark:bg-purple-900/20 border text-sm">
                        <span className="text-muted-foreground">Pulse:</span>
                        <p className="font-medium">{formValues.pulse_notes}</p>
                      </div>
                    )}
                  </div>
                )}
                {formValues.diet_notes && (
                  <div className="p-2 rounded bg-green-50 dark:bg-green-900/20 border text-sm">
                    <span className="text-muted-foreground">Diet Notes:</span>
                    <p className="font-medium">{formValues.diet_notes}</p>
                  </div>
                )}
                {formValues.lifestyle_notes && (
                  <div className="p-2 rounded bg-background border text-sm">
                    <span className="text-muted-foreground">Lifestyle Notes:</span>
                    <p className="font-medium whitespace-pre-wrap">{formValues.lifestyle_notes}</p>
                  </div>
                )}
              </div>

              {/* Completion Summary */}
              <div className="p-4 rounded-lg bg-jade/10 border border-jade/30">
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <CircleDot className="h-4 w-4 text-jade" />
                  Form Completion Summary
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  {[0, 1, 2].map((stepIdx) => {
                    const completion = getStepCompletion(stepIdx);
                    return (
                      <div key={stepIdx} className="p-2 rounded bg-background border">
                        <p className="text-xs text-muted-foreground">{stepTitles[stepIdx].title}</p>
                        <p className={`font-bold ${completion.percentage === 100 ? 'text-jade' : 'text-amber-600'}`}>
                          {completion.filled}/{completion.total}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  If everything looks correct, click <strong>Next</strong> to proceed to the consent form.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Consent */}
        {currentStep === 4 && (
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

        {/* Navigation Bar - higher z-index to stay above timer widget */}
        <div className="sticky bottom-0 z-30 -mx-4 px-4 py-4 bg-background/95 backdrop-blur border-t shadow-lg mb-20 sm:mb-0">
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
                  <CheckCircle2 className="h-4 w-4" />
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
          <div className={`grid gap-4 pt-4 ${returnTo ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {/* If came from video-session, show prominent return button */}
            {returnTo === '/video-session' && (
              <Button
                className="h-24 flex-col gap-2 bg-jade hover:bg-jade/90"
                onClick={() => {
                  setShowNavigationDialog(false);
                  // Navigate back to video-session with the new patient selected
                  navigate(`/video-session${savedPatientId ? `?newPatientId=${savedPatientId}` : ''}`);
                }}
              >
                <ChevronLeft className="h-8 w-8" />
                <span>חזרה לפגישה / Back to Session</span>
              </Button>
            )}
            
            {!returnTo && (
              <>
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
              </>
            )}
          </div>
          <div className="pt-2">
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => {
                setShowNavigationDialog(false);
                if (returnTo) {
                  navigate(returnTo);
                } else {
                  navigate('/crm/patients');
                }
              }}
            >
              {returnTo ? 'Cancel / ביטול' : 'Go to Patient List'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Form>
  );
}


-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  medical_history TEXT,
  allergies TEXT,
  medications TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create visits table
CREATE TABLE public.visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL,
  visit_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  chief_complaint TEXT,
  tongue_diagnosis TEXT,
  pulse_diagnosis TEXT,
  tcm_pattern TEXT,
  treatment_principle TEXT,
  points_used TEXT[],
  herbs_prescribed TEXT,
  cupping BOOLEAN DEFAULT false,
  moxa BOOLEAN DEFAULT false,
  other_techniques TEXT,
  notes TEXT,
  follow_up_recommended TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create follow_ups table
CREATE TABLE public.follow_ups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL,
  scheduled_date DATE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

-- RLS policies for patients (therapists can only see their own patients)
CREATE POLICY "Therapists can view own patients"
ON public.patients FOR SELECT
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can create patients"
ON public.patients FOR INSERT
WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update own patients"
ON public.patients FOR UPDATE
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete own patients"
ON public.patients FOR DELETE
USING (auth.uid() = therapist_id);

-- RLS policies for visits
CREATE POLICY "Therapists can view own visits"
ON public.visits FOR SELECT
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can create visits"
ON public.visits FOR INSERT
WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update own visits"
ON public.visits FOR UPDATE
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete own visits"
ON public.visits FOR DELETE
USING (auth.uid() = therapist_id);

-- RLS policies for follow_ups
CREATE POLICY "Therapists can view own follow_ups"
ON public.follow_ups FOR SELECT
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can create follow_ups"
ON public.follow_ups FOR INSERT
WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update own follow_ups"
ON public.follow_ups FOR UPDATE
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete own follow_ups"
ON public.follow_ups FOR DELETE
USING (auth.uid() = therapist_id);

-- Triggers for updated_at
CREATE TRIGGER update_patients_updated_at
BEFORE UPDATE ON public.patients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_visits_updated_at
BEFORE UPDATE ON public.visits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_follow_ups_updated_at
BEFORE UPDATE ON public.follow_ups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

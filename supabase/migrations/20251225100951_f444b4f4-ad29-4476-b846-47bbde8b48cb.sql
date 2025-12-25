-- =============================================
-- Multi-Clinic CRM Schema Extension (Part 1: Tables first)
-- =============================================

-- 1. CLINICS TABLE
CREATE TABLE public.clinics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL
);

ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;


-- 2. CLINIC STAFF TABLE
CREATE TYPE public.clinic_role AS ENUM ('owner', 'admin', 'therapist', 'receptionist');

CREATE TABLE public.clinic_staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role clinic_role NOT NULL DEFAULT 'therapist',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, user_id)
);

ALTER TABLE public.clinic_staff ENABLE ROW LEVEL SECURITY;


-- 3. ROOMS TABLE
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER DEFAULT 1,
  color TEXT DEFAULT '#10B981',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;


-- 4. PATIENT CONSENT FORMS TABLE
CREATE TABLE public.patient_consents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  consent_type TEXT NOT NULL,
  form_version TEXT DEFAULT '1.0',
  answers JSONB,
  signature TEXT,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_consents ENABLE ROW LEVEL SECURITY;


-- 5. Security definer function for clinic membership check
CREATE OR REPLACE FUNCTION public.is_clinic_member(_user_id UUID, _clinic_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clinic_staff
    WHERE user_id = _user_id AND clinic_id = _clinic_id
  ) OR EXISTS (
    SELECT 1 FROM public.clinics
    WHERE id = _clinic_id AND owner_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_clinic_admin(_user_id UUID, _clinic_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clinic_staff
    WHERE user_id = _user_id AND clinic_id = _clinic_id AND role IN ('owner', 'admin')
  ) OR EXISTS (
    SELECT 1 FROM public.clinics
    WHERE id = _clinic_id AND owner_id = _user_id
  )
$$;


-- 6. RLS POLICIES (after tables and functions exist)

-- Clinics policies
CREATE POLICY "Users can view clinics they belong to"
  ON public.clinics FOR SELECT
  USING (public.is_clinic_member(auth.uid(), id) OR owner_id = auth.uid());

CREATE POLICY "Clinic owners can manage their clinics"
  ON public.clinics FOR ALL
  USING (owner_id = auth.uid());

-- Clinic staff policies
CREATE POLICY "Staff can view their clinic memberships"
  ON public.clinic_staff FOR SELECT
  USING (user_id = auth.uid() OR public.is_clinic_admin(auth.uid(), clinic_id));

CREATE POLICY "Clinic admins can manage staff"
  ON public.clinic_staff FOR ALL
  USING (public.is_clinic_admin(auth.uid(), clinic_id));

-- Rooms policies
CREATE POLICY "Staff can view rooms in their clinics"
  ON public.rooms FOR SELECT
  USING (public.is_clinic_member(auth.uid(), clinic_id));

CREATE POLICY "Clinic admins can manage rooms"
  ON public.rooms FOR ALL
  USING (public.is_clinic_admin(auth.uid(), clinic_id));

-- Patient consents policies
CREATE POLICY "Therapists can view consents for their patients"
  ON public.patient_consents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.patients p 
    WHERE p.id = patient_consents.patient_id AND p.therapist_id = auth.uid()
  ));

CREATE POLICY "Therapists can create consents"
  ON public.patient_consents FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.patients p 
    WHERE p.id = patient_consents.patient_id AND p.therapist_id = auth.uid()
  ));


-- 7. UPDATE PATIENTS TABLE
ALTER TABLE public.patients 
  ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS occupation TEXT,
  ADD COLUMN IF NOT EXISTS lifestyle_notes TEXT,
  ADD COLUMN IF NOT EXISTS diet_notes TEXT,
  ADD COLUMN IF NOT EXISTS sleep_quality TEXT,
  ADD COLUMN IF NOT EXISTS stress_level TEXT,
  ADD COLUMN IF NOT EXISTS exercise_frequency TEXT,
  ADD COLUMN IF NOT EXISTS constitution_type TEXT,
  ADD COLUMN IF NOT EXISTS tongue_notes TEXT,
  ADD COLUMN IF NOT EXISTS pulse_notes TEXT,
  ADD COLUMN IF NOT EXISTS chief_complaint TEXT,
  ADD COLUMN IF NOT EXISTS is_pregnant BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS pregnancy_weeks INTEGER,
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS pregnancy_notes TEXT,
  ADD COLUMN IF NOT EXISTS obstetric_history TEXT,
  ADD COLUMN IF NOT EXISTS consent_signed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_signed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS consent_signature TEXT,
  ADD COLUMN IF NOT EXISTS age_group TEXT;


-- 8. UPDATE APPOINTMENTS TABLE
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurrence_rule TEXT,
  ADD COLUMN IF NOT EXISTS recurrence_end_date DATE,
  ADD COLUMN IF NOT EXISTS parent_appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3B82F6';


-- 9. TRIGGERS
CREATE TRIGGER update_clinics_updated_at
  BEFORE UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clinic_staff_updated_at
  BEFORE UPDATE ON public.clinic_staff
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 10. INDEXES
CREATE INDEX IF NOT EXISTS idx_clinic_staff_user ON public.clinic_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_clinic_staff_clinic ON public.clinic_staff(clinic_id);
CREATE INDEX IF NOT EXISTS idx_rooms_clinic ON public.rooms(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_room ON public.appointments(room_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic ON public.appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_clinic ON public.patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patient_consents_patient ON public.patient_consents(patient_id);
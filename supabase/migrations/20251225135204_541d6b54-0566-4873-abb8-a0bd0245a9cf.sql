-- Tighten access for therapist registrations (PII)
DROP POLICY IF EXISTS "Anyone can register as therapist" ON public.therapist_registrations;

CREATE POLICY "Authenticated users can register as therapist"
ON public.therapist_registrations
FOR INSERT
TO authenticated
WITH CHECK (true);


-- Strengthen patients access controls (prevent clinic_id / therapist_id manipulation)
DROP POLICY IF EXISTS "Therapists can view own patients" ON public.patients;
DROP POLICY IF EXISTS "Therapists can create patients" ON public.patients;
DROP POLICY IF EXISTS "Therapists can update own patients" ON public.patients;
DROP POLICY IF EXISTS "Therapists can delete own patients" ON public.patients;

CREATE POLICY "Therapists can view own patients"
ON public.patients
FOR SELECT
TO authenticated
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can create patients"
ON public.patients
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = therapist_id
  AND (clinic_id IS NULL OR public.is_clinic_member(auth.uid(), clinic_id))
);

CREATE POLICY "Therapists can update own patients"
ON public.patients
FOR UPDATE
TO authenticated
USING (auth.uid() = therapist_id)
WITH CHECK (
  auth.uid() = therapist_id
  AND (clinic_id IS NULL OR public.is_clinic_member(auth.uid(), clinic_id))
);

CREATE POLICY "Therapists can delete own patients"
ON public.patients
FOR DELETE
TO authenticated
USING (
  auth.uid() = therapist_id
  AND (clinic_id IS NULL OR public.is_clinic_member(auth.uid(), clinic_id))
);

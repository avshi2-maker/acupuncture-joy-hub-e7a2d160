-- Add id_number column to patients table
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS id_number text UNIQUE;

-- Add id_number column to therapist_registrations table
ALTER TABLE public.therapist_registrations ADD COLUMN IF NOT EXISTS id_number text UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_patients_id_number ON public.patients(id_number);
CREATE INDEX IF NOT EXISTS idx_therapist_registrations_id_number ON public.therapist_registrations(id_number);
-- Add intake_status column to patients table to track questionnaire review status
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS intake_status text DEFAULT 'none';

-- Add comment explaining the column values
COMMENT ON COLUMN public.patients.intake_status IS 'Tracks intake questionnaire status: none, pending_review, reviewed';

-- Create index for filtering patients by intake status
CREATE INDEX IF NOT EXISTS idx_patients_intake_status ON public.patients(intake_status);
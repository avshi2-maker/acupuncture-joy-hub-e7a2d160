-- Add special instructions to rooms
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS special_instructions text;

-- Add general instructions to clinics
ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS general_instructions text;
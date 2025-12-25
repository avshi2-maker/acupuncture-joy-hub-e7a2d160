-- Create table for appointment confirmation tokens
CREATE TABLE public.appointment_confirmations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  response text CHECK (response IN ('confirmed', 'cancelled', null)),
  responded_at timestamp with time zone,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for fast token lookup
CREATE INDEX idx_appointment_confirmations_token ON public.appointment_confirmations(token);

-- Enable RLS
ALTER TABLE public.appointment_confirmations ENABLE ROW LEVEL SECURITY;

-- Allow public read/update for confirmation (patients don't have accounts)
CREATE POLICY "Anyone can view confirmations by token" 
ON public.appointment_confirmations 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update confirmations by token" 
ON public.appointment_confirmations 
FOR UPDATE 
USING (true);

-- Therapists can create confirmations for their appointments
CREATE POLICY "Therapists can create confirmations" 
ON public.appointment_confirmations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.appointments a 
    WHERE a.id = appointment_id 
    AND a.therapist_id = auth.uid()
  )
);

-- Therapists can delete their confirmations
CREATE POLICY "Therapists can delete own confirmations" 
ON public.appointment_confirmations 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a 
    WHERE a.id = appointment_id 
    AND a.therapist_id = auth.uid()
  )
);
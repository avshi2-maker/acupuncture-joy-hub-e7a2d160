-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can view confirmations by token" ON public.appointment_confirmations;
DROP POLICY IF EXISTS "Anyone can update confirmations by token" ON public.appointment_confirmations;

-- The edge function uses service role key which bypasses RLS
-- For the client-side, we'll make tokens only accessible via the edge function
-- Therapists can still see their own confirmations

CREATE POLICY "Therapists can view own appointment confirmations"
ON public.appointment_confirmations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.id = appointment_confirmations.appointment_id
    AND a.therapist_id = auth.uid()
  )
);
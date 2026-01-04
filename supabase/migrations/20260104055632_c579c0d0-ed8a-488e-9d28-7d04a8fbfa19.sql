-- Create table for herbal widget legal acknowledgments
CREATE TABLE public.herbal_legal_acknowledgments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  acknowledged_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  session_id text,
  language text DEFAULT 'en'
);

-- Enable RLS
ALTER TABLE public.herbal_legal_acknowledgments ENABLE ROW LEVEL SECURITY;

-- Users can create their own acknowledgments
CREATE POLICY "Users can create own acknowledgments"
ON public.herbal_legal_acknowledgments
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can view their own acknowledgments
CREATE POLICY "Users can view own acknowledgments"
ON public.herbal_legal_acknowledgments
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all acknowledgments for audit
CREATE POLICY "Admins can view all acknowledgments"
ON public.herbal_legal_acknowledgments
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
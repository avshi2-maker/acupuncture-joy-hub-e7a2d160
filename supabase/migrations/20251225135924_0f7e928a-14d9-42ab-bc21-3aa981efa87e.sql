-- Create feedback table for page-specific comments
CREATE TABLE public.page_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url TEXT NOT NULL,
  page_name TEXT,
  feedback_text TEXT NOT NULL,
  visitor_name TEXT,
  visitor_email TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert feedback (public feature)
CREATE POLICY "Anyone can submit feedback"
ON public.page_feedback
FOR INSERT
WITH CHECK (true);

-- Only authenticated admins can view feedback
CREATE POLICY "Admins can view all feedback"
ON public.page_feedback
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);
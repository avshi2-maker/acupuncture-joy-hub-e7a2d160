-- Create usage_logs table to track API consumption per user
CREATE TABLE public.usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'diagnosis', 'points', 'herbs', 'chat', 'other'
  tokens_used INTEGER NOT NULL DEFAULT 1,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying by user and date
CREATE INDEX idx_usage_logs_user_created ON public.usage_logs(user_id, created_at DESC);
CREATE INDEX idx_usage_logs_action_type ON public.usage_logs(action_type);

-- Enable RLS
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage logs
CREATE POLICY "Users can view own usage logs"
ON public.usage_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own usage logs
CREATE POLICY "Users can create own usage logs"
ON public.usage_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all usage logs
CREATE POLICY "Admins can view all usage logs"
ON public.usage_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a view for monthly usage summary
CREATE OR REPLACE VIEW public.monthly_usage_summary AS
SELECT 
  user_id,
  date_trunc('month', created_at) as month,
  COUNT(*) as total_queries,
  SUM(tokens_used) as total_tokens,
  COUNT(DISTINCT patient_id) as unique_patients
FROM public.usage_logs
GROUP BY user_id, date_trunc('month', created_at);
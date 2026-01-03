-- Drop the security definer view and recreate as a function instead
DROP VIEW IF EXISTS public.monthly_usage_summary;

-- Create a secure function to get monthly usage for the current user
CREATE OR REPLACE FUNCTION public.get_user_monthly_usage()
RETURNS TABLE (
  total_queries BIGINT,
  total_tokens BIGINT,
  unique_patients BIGINT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT 
    COUNT(*) as total_queries,
    COALESCE(SUM(tokens_used), 0) as total_tokens,
    COUNT(DISTINCT patient_id) as unique_patients
  FROM public.usage_logs
  WHERE user_id = auth.uid()
    AND created_at >= date_trunc('month', now())
$$;
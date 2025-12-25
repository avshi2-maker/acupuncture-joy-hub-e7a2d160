-- Fix 1: Create secure password validation function
CREATE OR REPLACE FUNCTION public.validate_access_password(password_input TEXT)
RETURNS TABLE(valid BOOLEAN, tier subscription_tier, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pw_record RECORD;
BEGIN
  SELECT ap.tier, ap.expires_at, ap.is_used INTO pw_record
  FROM access_passwords ap
  WHERE ap.plain_password = password_input
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::subscription_tier, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;
  
  IF pw_record.is_used THEN
    RETURN QUERY SELECT false, NULL::subscription_tier, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;
  
  IF pw_record.expires_at IS NOT NULL AND pw_record.expires_at < now() THEN
    RETURN QUERY SELECT false, NULL::subscription_tier, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT true, pw_record.tier, pw_record.expires_at;
END;
$$;

-- Fix 2: Remove public SELECT policy on access_passwords
DROP POLICY IF EXISTS "Anyone can validate password" ON access_passwords;

-- Fix 3: Update signatures storage policies with proper folder-based access
DROP POLICY IF EXISTS "Therapists can upload signatures" ON storage.objects;
DROP POLICY IF EXISTS "Therapists can view signatures" ON storage.objects;
DROP POLICY IF EXISTS "Therapists can update signatures" ON storage.objects;
DROP POLICY IF EXISTS "Therapists can delete signatures" ON storage.objects;

-- Recreate with proper folder-based access (therapist_id as first folder)
CREATE POLICY "Therapists can upload own signatures"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'signatures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Therapists can view own signatures"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'signatures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Therapists can update own signatures"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'signatures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Therapists can delete own signatures"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'signatures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
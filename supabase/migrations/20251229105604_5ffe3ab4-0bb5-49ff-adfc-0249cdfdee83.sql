-- Create function to validate Israeli ID checksum
CREATE OR REPLACE FUNCTION public.validate_israeli_id(id_number text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  clean_id text;
  padded_id text;
  digit int;
  multiplier int;
  result int;
  total int := 0;
  i int;
BEGIN
  -- Return true for empty/null (allow non-Israeli IDs)
  IF id_number IS NULL OR id_number = '' THEN
    RETURN true;
  END IF;
  
  -- Remove non-digits
  clean_id := regexp_replace(id_number, '[^0-9]', '', 'g');
  
  -- Check length (5-9 digits)
  IF length(clean_id) < 5 OR length(clean_id) > 9 THEN
    RETURN true; -- Not an Israeli ID format, allow
  END IF;
  
  -- Pad to 9 digits
  padded_id := lpad(clean_id, 9, '0');
  
  -- Calculate Luhn checksum variant for Israeli IDs
  FOR i IN 1..9 LOOP
    digit := (ascii(substr(padded_id, i, 1)) - 48);
    multiplier := ((i - 1) % 2) + 1; -- Alternates 1, 2, 1, 2...
    result := digit * multiplier;
    
    -- If result > 9, sum its digits
    IF result > 9 THEN
      result := (result / 10) + (result % 10);
    END IF;
    
    total := total + result;
  END LOOP;
  
  -- Valid if divisible by 10
  RETURN total % 10 = 0;
END;
$$;

-- Create trigger function for ID validation
CREATE OR REPLACE FUNCTION public.validate_id_number_trigger()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Only validate if id_number is provided and looks like Israeli ID
  IF NEW.id_number IS NOT NULL AND NEW.id_number != '' THEN
    -- Check if it's a purely numeric ID (Israeli format)
    IF NEW.id_number ~ '^[0-9]+$' THEN
      IF NOT validate_israeli_id(NEW.id_number) THEN
        RAISE EXCEPTION 'Invalid Israeli ID number: checksum validation failed (ספרת ביקורת שגויה)';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add trigger to patients table
DROP TRIGGER IF EXISTS validate_patient_id_number ON patients;
CREATE TRIGGER validate_patient_id_number
  BEFORE INSERT OR UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION validate_id_number_trigger();

-- Add trigger to therapist_registrations table  
DROP TRIGGER IF EXISTS validate_therapist_id_number ON therapist_registrations;
CREATE TRIGGER validate_therapist_id_number
  BEFORE INSERT OR UPDATE ON therapist_registrations
  FOR EACH ROW
  EXECUTE FUNCTION validate_id_number_trigger();
-- Step 1: Handle existing duplicates in patients table by appending suffix
UPDATE patients p
SET id_number = p.id_number || '_DUP_' || p.id
WHERE p.id_number IS NOT NULL
  AND p.id_number != ''
  AND EXISTS (
    SELECT 1 FROM patients p2
    WHERE p2.id_number = p.id_number
      AND p2.id != p.id
      AND p2.created_at < p.created_at
  );

-- Step 2: Handle existing duplicates in therapist_registrations table
UPDATE therapist_registrations t
SET id_number = t.id_number || '_DUP_' || t.id
WHERE t.id_number IS NOT NULL
  AND t.id_number != ''
  AND EXISTS (
    SELECT 1 FROM therapist_registrations t2
    WHERE t2.id_number = t.id_number
      AND t2.id != t.id
      AND t2.created_at < t.created_at
  );

-- Step 3: Add unique constraint on patients.id_number (partial - only non-null/non-empty)
CREATE UNIQUE INDEX IF NOT EXISTS patients_id_number_unique_idx 
ON patients (id_number) 
WHERE id_number IS NOT NULL AND id_number != '';

-- Step 4: Add unique constraint on therapist_registrations.id_number (partial - only non-null/non-empty)
CREATE UNIQUE INDEX IF NOT EXISTS therapist_registrations_id_number_unique_idx 
ON therapist_registrations (id_number) 
WHERE id_number IS NOT NULL AND id_number != '';
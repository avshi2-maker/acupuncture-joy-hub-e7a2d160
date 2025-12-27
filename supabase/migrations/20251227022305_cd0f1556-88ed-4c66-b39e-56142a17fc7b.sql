-- Fix: Add patient ownership validation to video_sessions INSERT policy
DROP POLICY IF EXISTS "Therapists can create own video sessions" ON video_sessions;

CREATE POLICY "Therapists can create own video sessions"
ON video_sessions FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = therapist_id
  AND (
    patient_id IS NULL
    OR EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = patient_id
      AND p.therapist_id = auth.uid()
    )
  )
);

-- Fix: Add patient ownership validation to voice_recordings INSERT policy
DROP POLICY IF EXISTS "Therapists can create own voice recordings" ON voice_recordings;

CREATE POLICY "Therapists can create own voice recordings"
ON voice_recordings FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = therapist_id
  AND (
    patient_id IS NULL
    OR EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = patient_id
      AND p.therapist_id = auth.uid()
    )
  )
);

-- Fix: Add patient ownership validation to appointments INSERT policy
DROP POLICY IF EXISTS "Therapists can create appointments" ON appointments;

CREATE POLICY "Therapists can create appointments"
ON appointments FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = therapist_id
  AND (
    patient_id IS NULL
    OR EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = patient_id
      AND p.therapist_id = auth.uid()
    )
  )
);
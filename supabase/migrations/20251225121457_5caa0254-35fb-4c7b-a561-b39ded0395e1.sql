-- Create video_sessions table to track video call sessions
CREATE TABLE public.video_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    therapist_id UUID NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    notes TEXT,
    anxiety_qa_responses JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for video_sessions
CREATE POLICY "Therapists can view own video sessions" 
ON public.video_sessions 
FOR SELECT 
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can create own video sessions" 
ON public.video_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update own video sessions" 
ON public.video_sessions 
FOR UPDATE 
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete own video sessions" 
ON public.video_sessions 
FOR DELETE 
USING (auth.uid() = therapist_id);

-- Create voice_recordings table for dictated treatment plans
CREATE TABLE public.voice_recordings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    therapist_id UUID NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES public.visits(id) ON DELETE SET NULL,
    video_session_id UUID REFERENCES public.video_sessions(id) ON DELETE SET NULL,
    audio_url TEXT NOT NULL,
    transcription TEXT,
    recording_type TEXT NOT NULL DEFAULT 'treatment_plan',
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voice_recordings ENABLE ROW LEVEL SECURITY;

-- Policies for voice_recordings
CREATE POLICY "Therapists can view own voice recordings" 
ON public.voice_recordings 
FOR SELECT 
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can create own voice recordings" 
ON public.voice_recordings 
FOR INSERT 
WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update own voice recordings" 
ON public.voice_recordings 
FOR UPDATE 
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete own voice recordings" 
ON public.voice_recordings 
FOR DELETE 
USING (auth.uid() = therapist_id);

-- Create storage bucket for voice recordings
INSERT INTO storage.buckets (id, name, public) 
VALUES ('voice-recordings', 'voice-recordings', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for voice recordings bucket
CREATE POLICY "Therapists can upload voice recordings"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'voice-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Therapists can view own voice recordings storage"
ON storage.objects
FOR SELECT
USING (bucket_id = 'voice-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Therapists can delete own voice recordings storage"
ON storage.objects
FOR DELETE
USING (bucket_id = 'voice-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add triggers for updated_at
CREATE TRIGGER update_video_sessions_updated_at
BEFORE UPDATE ON public.video_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
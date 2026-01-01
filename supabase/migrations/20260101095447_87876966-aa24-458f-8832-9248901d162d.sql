-- Create the Master CAF Studies table
CREATE TABLE public.caf_master_studies (
    id INT PRIMARY KEY,
    system_category VARCHAR(50) NOT NULL,
    western_label VARCHAR(100) NOT NULL,
    tcm_pattern VARCHAR(100) NOT NULL,
    key_symptoms TEXT,
    pulse_tongue VARCHAR(255),
    treatment_principle VARCHAR(255),
    acupoints_display VARCHAR(255),
    pharmacopeia_formula VARCHAR(255),
    deep_thinking_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create junction table for linking acupoints to studies
CREATE TABLE public.caf_study_acupoints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    study_id INT NOT NULL REFERENCES public.caf_master_studies(id) ON DELETE CASCADE,
    point_code VARCHAR(10) NOT NULL,
    is_primary_point BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(study_id, point_code)
);

-- Enable RLS
ALTER TABLE public.caf_master_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caf_study_acupoints ENABLE ROW LEVEL SECURITY;

-- Read policies for authenticated users
CREATE POLICY "Authenticated users can read CAF studies"
ON public.caf_master_studies FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can read CAF acupoints"
ON public.caf_study_acupoints FOR SELECT
USING (true);

-- Admin management policies
CREATE POLICY "Admins can manage CAF studies"
ON public.caf_master_studies FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage CAF acupoints"
ON public.caf_study_acupoints FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for common queries
CREATE INDEX idx_caf_western_label ON public.caf_master_studies(western_label);
CREATE INDEX idx_caf_tcm_pattern ON public.caf_master_studies(tcm_pattern);
CREATE INDEX idx_caf_system ON public.caf_master_studies(system_category);
CREATE INDEX idx_caf_acupoints_study ON public.caf_study_acupoints(study_id);
CREATE INDEX idx_caf_acupoints_code ON public.caf_study_acupoints(point_code);

-- Trigger for updated_at
CREATE TRIGGER update_caf_master_studies_updated_at
BEFORE UPDATE ON public.caf_master_studies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
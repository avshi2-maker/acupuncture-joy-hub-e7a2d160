-- Create a table for storing What-If scenarios
CREATE TABLE public.roi_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  scenario_type TEXT NOT NULL CHECK (scenario_type IN ('encyclopedia', 'clinic')),
  configuration JSONB NOT NULL,
  calculations JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.roi_scenarios ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage their own scenarios
CREATE POLICY "Users can view their own scenarios" 
ON public.roi_scenarios 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scenarios" 
ON public.roi_scenarios 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scenarios" 
ON public.roi_scenarios 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scenarios" 
ON public.roi_scenarios 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_roi_scenarios_updated_at
BEFORE UPDATE ON public.roi_scenarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
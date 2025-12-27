-- Add tags column to roi_scenarios table
ALTER TABLE public.roi_scenarios 
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Create index for efficient tag queries
CREATE INDEX idx_roi_scenarios_tags ON public.roi_scenarios USING GIN(tags);
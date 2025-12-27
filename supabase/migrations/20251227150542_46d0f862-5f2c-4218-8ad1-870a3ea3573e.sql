-- Add archived column to roi_scenarios table
ALTER TABLE public.roi_scenarios 
ADD COLUMN archived BOOLEAN DEFAULT false;
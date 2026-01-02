-- Add reminder automation settings to clinics table
ALTER TABLE public.clinics
ADD COLUMN reminder_enabled boolean DEFAULT false,
ADD COLUMN reminder_timing text[] DEFAULT ARRAY['24h']::text[],
ADD COLUMN reminder_channel text DEFAULT 'whatsapp';
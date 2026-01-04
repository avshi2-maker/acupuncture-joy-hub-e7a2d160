-- Create public storage bucket for branding assets (logo for WhatsApp preview, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to branding assets
CREATE POLICY "Public read access for branding assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'branding');

-- Allow authenticated users to upload branding assets (admin only in practice)
CREATE POLICY "Authenticated users can upload branding assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'branding' AND auth.role() = 'authenticated');
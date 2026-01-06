-- Create storage bucket for knowledge assets if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('knowledge-assets', 'knowledge-assets', true, 52428800, ARRAY['text/csv', 'application/pdf', 'text/plain'])
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the bucket
CREATE POLICY "Allow public read access to knowledge-assets" ON storage.objects
FOR SELECT USING (bucket_id = 'knowledge-assets');

CREATE POLICY "Allow authenticated uploads to knowledge-assets" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'knowledge-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated updates to knowledge-assets" ON storage.objects
FOR UPDATE USING (bucket_id = 'knowledge-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated deletes from knowledge-assets" ON storage.objects
FOR DELETE USING (bucket_id = 'knowledge-assets' AND auth.role() = 'authenticated');
-- Create storage bucket for TCM tongue images from the Golden Knowledge Base
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('tcm-tongue-images', 'tcm-tongue-images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Create policies for public read access
CREATE POLICY "TCM tongue images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'tcm-tongue-images');

-- Create policy for authenticated users to upload (admins only for import)
CREATE POLICY "Admins can upload tongue images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'tcm-tongue-images' AND auth.role() = 'authenticated');

-- Add image_ref column to knowledge_chunks if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'knowledge_chunks' 
        AND column_name = 'image_ref'
    ) THEN
        ALTER TABLE public.knowledge_chunks ADD COLUMN image_ref text DEFAULT NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'knowledge_chunks' 
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE public.knowledge_chunks ADD COLUMN image_url text DEFAULT NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'knowledge_chunks' 
        AND column_name = 'image_caption'
    ) THEN
        ALTER TABLE public.knowledge_chunks ADD COLUMN image_caption text DEFAULT NULL;
    END IF;
END $$;

-- Create index for faster image lookups
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_image_ref ON public.knowledge_chunks(image_ref) WHERE image_ref IS NOT NULL;
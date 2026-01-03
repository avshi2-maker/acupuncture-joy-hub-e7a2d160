-- Add language column to knowledge_chunks if not exists
ALTER TABLE public.knowledge_chunks 
ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';

-- Create index for language-based queries
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_language ON public.knowledge_chunks(language);

-- Update existing chunks to be marked as English
UPDATE public.knowledge_chunks SET language = 'en' WHERE language IS NULL;
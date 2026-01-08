-- Add priority_score column to knowledge_chunks for Ferrari algorithm
ALTER TABLE public.knowledge_chunks 
ADD COLUMN IF NOT EXISTS priority_score INTEGER DEFAULT 50;

-- Add nano_prompt column for query pre-processing
ALTER TABLE public.knowledge_chunks 
ADD COLUMN IF NOT EXISTS nano_prompt TEXT;

-- Add index for priority_score queries
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_priority_score 
ON public.knowledge_chunks(priority_score DESC);

-- Comment for documentation
COMMENT ON COLUMN public.knowledge_chunks.priority_score IS 'Ferrari algorithm priority score (0-100). Higher = more authoritative. Used for weighted reranking.';
COMMENT ON COLUMN public.knowledge_chunks.nano_prompt IS 'Nano-prompt for query pre-processing (e.g., tcm_physiology: describe liver_function)';
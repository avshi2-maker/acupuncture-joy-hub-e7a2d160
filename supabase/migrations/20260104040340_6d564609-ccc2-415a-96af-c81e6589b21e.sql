-- Enable extensions first (order matters!)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to knowledge_chunks (1536 dimensions for OpenAI embeddings)
ALTER TABLE public.knowledge_chunks 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create index for full-text search (BM25-style) using trigram
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_content_trgm 
ON public.knowledge_chunks 
USING gin (content gin_trgm_ops);

-- Create index for fast similarity search on embeddings
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding 
ON public.knowledge_chunks 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Create hybrid search function combining vector similarity + keyword matching
CREATE OR REPLACE FUNCTION public.hybrid_search(
  query_embedding vector(1536),
  query_text text,
  match_threshold float DEFAULT 0.80,
  match_count int DEFAULT 20,
  language_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  question text,
  answer text,
  chunk_index int,
  metadata jsonb,
  language text,
  document_id uuid,
  file_name text,
  original_name text,
  category text,
  vector_score float,
  keyword_score float,
  combined_score float,
  confidence text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH 
  -- Vector similarity search (semantic)
  vector_matches AS (
    SELECT 
      kc.id,
      kc.content,
      kc.question,
      kc.answer,
      kc.chunk_index,
      kc.metadata,
      kc.language,
      kc.document_id,
      kd.file_name,
      kd.original_name,
      kd.category,
      1 - (kc.embedding <=> query_embedding) as v_score
    FROM knowledge_chunks kc
    LEFT JOIN knowledge_documents kd ON kc.document_id = kd.id
    WHERE kc.embedding IS NOT NULL
      AND (language_filter IS NULL OR kc.language = language_filter)
    ORDER BY kc.embedding <=> query_embedding
    LIMIT match_count * 2
  ),
  -- Keyword/trigram search (BM25-style)
  keyword_matches AS (
    SELECT 
      kc.id,
      kc.content,
      kc.question,
      kc.answer,
      kc.chunk_index,
      kc.metadata,
      kc.language,
      kc.document_id,
      kd.file_name,
      kd.original_name,
      kd.category,
      similarity(lower(kc.content), lower(query_text)) as k_score
    FROM knowledge_chunks kc
    LEFT JOIN knowledge_documents kd ON kc.document_id = kd.id
    WHERE (language_filter IS NULL OR kc.language = language_filter)
      AND (
        kc.content ILIKE '%' || query_text || '%'
        OR kc.question ILIKE '%' || query_text || '%'
        OR kc.answer ILIKE '%' || query_text || '%'
        OR similarity(lower(kc.content), lower(query_text)) > 0.1
      )
    ORDER BY k_score DESC
    LIMIT match_count * 2
  ),
  -- Combine and rank results
  combined AS (
    SELECT 
      COALESCE(v.id, k.id) as id,
      COALESCE(v.content, k.content) as content,
      COALESCE(v.question, k.question) as question,
      COALESCE(v.answer, k.answer) as answer,
      COALESCE(v.chunk_index, k.chunk_index) as chunk_index,
      COALESCE(v.metadata, k.metadata) as metadata,
      COALESCE(v.language, k.language) as language,
      COALESCE(v.document_id, k.document_id) as document_id,
      COALESCE(v.file_name, k.file_name) as file_name,
      COALESCE(v.original_name, k.original_name) as original_name,
      COALESCE(v.category, k.category) as category,
      COALESCE(v.v_score, 0.0) as vector_score,
      COALESCE(k.k_score, 0.0) as keyword_score,
      -- Combined score: 60% vector + 40% keyword (Reciprocal Rank Fusion style)
      (COALESCE(v.v_score, 0.0) * 0.6 + COALESCE(k.k_score, 0.0) * 0.4) as combined_score
    FROM vector_matches v
    FULL OUTER JOIN keyword_matches k ON v.id = k.id
  )
  SELECT 
    c.id,
    c.content,
    c.question,
    c.answer,
    c.chunk_index,
    c.metadata,
    c.language,
    c.document_id,
    c.file_name,
    c.original_name,
    c.category,
    c.vector_score::float,
    c.keyword_score::float,
    c.combined_score::float,
    CASE 
      WHEN c.combined_score >= 0.90 THEN 'very_high'
      WHEN c.combined_score >= 0.80 THEN 'high'
      WHEN c.combined_score >= 0.60 THEN 'medium'
      WHEN c.combined_score >= 0.40 THEN 'low'
      ELSE 'very_low'
    END as confidence
  FROM combined c
  WHERE c.combined_score >= match_threshold
  ORDER BY c.combined_score DESC
  LIMIT match_count;
END;
$$;

-- Create function for keyword-only search (fallback when no embeddings)
CREATE OR REPLACE FUNCTION public.keyword_search(
  query_text text,
  match_threshold float DEFAULT 0.15,
  match_count int DEFAULT 20,
  language_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  question text,
  answer text,
  chunk_index int,
  metadata jsonb,
  language text,
  document_id uuid,
  file_name text,
  original_name text,
  category text,
  keyword_score float,
  confidence text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH scored AS (
    SELECT 
      kc.id,
      kc.content,
      kc.question,
      kc.answer,
      kc.chunk_index,
      kc.metadata,
      kc.language,
      kc.document_id,
      kd.file_name,
      kd.original_name,
      kd.category,
      -- Calculate relevance score based on multiple factors
      (
        -- Exact phrase match bonus
        CASE WHEN lower(kc.content) LIKE '%' || lower(query_text) || '%' THEN 0.4 ELSE 0.0 END +
        -- Question match bonus
        CASE WHEN kc.question IS NOT NULL AND lower(kc.question) LIKE '%' || lower(query_text) || '%' THEN 0.3 ELSE 0.0 END +
        -- Trigram similarity
        similarity(lower(kc.content), lower(query_text)) * 0.3
      ) as k_score
    FROM knowledge_chunks kc
    LEFT JOIN knowledge_documents kd ON kc.document_id = kd.id
    WHERE (language_filter IS NULL OR kc.language = language_filter)
      AND (
        kc.content ILIKE '%' || query_text || '%'
        OR kc.question ILIKE '%' || query_text || '%'
        OR kc.answer ILIKE '%' || query_text || '%'
        OR similarity(lower(kc.content), lower(query_text)) > 0.1
      )
  )
  SELECT 
    s.id,
    s.content,
    s.question,
    s.answer,
    s.chunk_index,
    s.metadata,
    s.language,
    s.document_id,
    s.file_name,
    s.original_name,
    s.category,
    s.k_score::float as keyword_score,
    CASE 
      WHEN s.k_score >= 0.70 THEN 'very_high'
      WHEN s.k_score >= 0.50 THEN 'high'
      WHEN s.k_score >= 0.30 THEN 'medium'
      WHEN s.k_score >= 0.15 THEN 'low'
      ELSE 'very_low'
    END as confidence
  FROM scored s
  WHERE s.k_score >= match_threshold
  ORDER BY s.k_score DESC
  LIMIT match_count;
END;
$$;
-- Fix RAG RPC overloading + type mismatches breaking PostgREST resolution
-- Drop ALL overloaded versions so RPC calls are unambiguous
DROP FUNCTION IF EXISTS public.keyword_search(text, integer, double precision, text);
DROP FUNCTION IF EXISTS public.keyword_search(text, double precision, integer, text);
DROP FUNCTION IF EXISTS public.hybrid_search(text, integer, double precision, text, text);
DROP FUNCTION IF EXISTS public.hybrid_search(text, double precision, integer, text, text);

-- Keyword-only search (pg_trgm-based)
CREATE OR REPLACE FUNCTION public.keyword_search(
  language_filter text DEFAULT NULL,
  match_count integer DEFAULT 20,
  match_threshold double precision DEFAULT 0.15,
  query_text text DEFAULT NULL
)
RETURNS TABLE(
  answer text,
  category text,
  chunk_index integer,
  confidence text,
  content text,
  document_id uuid,
  file_name text,
  id uuid,
  keyword_score double precision,
  language text,
  metadata jsonb,
  original_name text,
  question text,
  image_ref text,
  image_url text,
  image_caption text
)
LANGUAGE sql
STABLE
AS $$
  WITH q AS (
    SELECT trim(coalesce(query_text, '')) AS qt
  ), scored AS (
    SELECT
      kc.id,
      kc.document_id,
      kc.content,
      kc.question,
      kc.answer,
      kc.chunk_index,
      kc.language,
      kc.metadata,
      kd.file_name,
      kd.original_name,
      kd.category,
      kc.image_ref,
      kc.image_url,
      kc.image_caption,
      GREATEST(
        similarity(kc.content, q.qt),
        similarity(coalesce(kc.question, ''), q.qt),
        similarity(coalesce(kc.answer, ''), q.qt)
      )::double precision AS keyword_score
    FROM public.knowledge_chunks kc
    JOIN public.knowledge_documents kd ON kd.id = kc.document_id
    CROSS JOIN q
    WHERE q.qt <> ''
      AND (language_filter IS NULL OR kc.language = language_filter)
  )
  SELECT
    s.answer,
    s.category,
    s.chunk_index,
    CASE
      WHEN s.keyword_score >= 0.60 THEN 'high'
      WHEN s.keyword_score >= 0.30 THEN 'medium'
      WHEN s.keyword_score >= match_threshold THEN 'low'
      ELSE 'none'
    END AS confidence,
    s.content,
    s.document_id,
    s.file_name,
    s.id,
    s.keyword_score,
    s.language,
    s.metadata,
    s.original_name,
    s.question,
    s.image_ref,
    s.image_url,
    s.image_caption
  FROM scored s
  WHERE s.keyword_score >= match_threshold
  ORDER BY s.keyword_score DESC
  LIMIT match_count;
$$;

-- True hybrid search (vector similarity + keyword score), returns Ferrari score + clinical-standard flag
CREATE OR REPLACE FUNCTION public.hybrid_search(
  language_filter text DEFAULT NULL,
  match_count integer DEFAULT 20,
  match_threshold double precision DEFAULT 0.40,
  query_embedding text DEFAULT NULL,
  query_text text DEFAULT NULL
)
RETURNS TABLE(
  answer text,
  category text,
  chunk_index integer,
  combined_score double precision,
  confidence text,
  content text,
  document_id uuid,
  file_name text,
  id uuid,
  keyword_score double precision,
  language text,
  metadata jsonb,
  original_name text,
  question text,
  vector_score double precision,
  image_ref text,
  image_url text,
  image_caption text,
  priority_score integer,
  nano_prompt text,
  ferrari_score double precision,
  is_clinical_standard boolean
)
LANGUAGE sql
STABLE
AS $$
  WITH q AS (
    SELECT
      trim(coalesce(query_text, '')) AS qt,
      NULLIF(trim(coalesce(query_embedding, '')), '') AS qe
  ), qvec AS (
    SELECT
      qt,
      CASE
        WHEN qe IS NULL THEN NULL
        ELSE (qe)::vector
      END AS v
    FROM q
  ), scored AS (
    SELECT
      kc.id,
      kc.document_id,
      kc.content,
      kc.question,
      kc.answer,
      kc.chunk_index,
      kc.language,
      kc.metadata,
      kd.file_name,
      kd.original_name,
      kd.category,
      kc.image_ref,
      kc.image_url,
      kc.image_caption,
      COALESCE(kc.priority_score, 50)::integer AS priority_score,
      kc.nano_prompt,
      -- Vector similarity score in [0..1] (higher is better)
      CASE
        WHEN qv.v IS NULL OR kc.embedding IS NULL THEN 0::double precision
        ELSE (1 - (kc.embedding <=> qv.v))::double precision
      END AS vector_score,
      -- Keyword similarity score in [0..1]
      CASE
        WHEN qv.qt = '' THEN 0::double precision
        ELSE GREATEST(
          similarity(kc.content, qv.qt),
          similarity(coalesce(kc.question, ''), qv.qt),
          similarity(coalesce(kc.answer, ''), qv.qt)
        )::double precision
      END AS keyword_score
    FROM public.knowledge_chunks kc
    JOIN public.knowledge_documents kd ON kd.id = kc.document_id
    CROSS JOIN qvec qv
    WHERE (qv.qt <> '' OR qv.v IS NOT NULL)
      AND (language_filter IS NULL OR kc.language = language_filter)
  ), ranked AS (
    SELECT
      s.*, 
      (0.70 * s.vector_score + 0.30 * s.keyword_score)::double precision AS combined_score,
      (0.70 * (0.70 * s.vector_score + 0.30 * s.keyword_score) + 0.30 * (s.priority_score / 100.0))::double precision AS ferrari_score,
      (s.priority_score >= 85) AS is_clinical_standard
    FROM scored s
  )
  SELECT
    r.answer,
    r.category,
    r.chunk_index,
    r.combined_score,
    CASE
      WHEN r.ferrari_score >= 0.85 THEN 'very_high'
      WHEN r.ferrari_score >= 0.70 THEN 'high'
      WHEN r.ferrari_score >= 0.55 THEN 'medium'
      WHEN r.ferrari_score >= match_threshold THEN 'low'
      ELSE 'none'
    END AS confidence,
    r.content,
    r.document_id,
    r.file_name,
    r.id,
    r.keyword_score,
    r.language,
    r.metadata,
    r.original_name,
    r.question,
    r.vector_score,
    r.image_ref,
    r.image_url,
    r.image_caption,
    r.priority_score,
    r.nano_prompt,
    r.ferrari_score,
    r.is_clinical_standard
  FROM ranked r
  WHERE r.combined_score >= match_threshold
  ORDER BY r.ferrari_score DESC
  LIMIT match_count;
$$;
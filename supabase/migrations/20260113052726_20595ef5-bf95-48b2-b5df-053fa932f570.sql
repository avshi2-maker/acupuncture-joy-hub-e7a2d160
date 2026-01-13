-- Drop and recreate hybrid_search with smarter question weighting
DROP FUNCTION IF EXISTS public.hybrid_search;

CREATE OR REPLACE FUNCTION public.hybrid_search(
  language_filter text DEFAULT NULL::text, 
  match_count integer DEFAULT 20, 
  match_threshold double precision DEFAULT 0.40, 
  query_embedding text DEFAULT NULL::text, 
  query_text text DEFAULT NULL::text
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
AS $function$
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
      -- Base keyword similarity score in [0..1]
      CASE
        WHEN qv.qt = '' THEN 0::double precision
        ELSE GREATEST(
          similarity(kc.content, qv.qt),
          similarity(coalesce(kc.question, ''), qv.qt),
          similarity(coalesce(kc.answer, ''), qv.qt)
        )::double precision
      END AS base_keyword_score,
      -- Question match boost: 1.5x if question column has strong match
      CASE
        WHEN qv.qt = '' THEN 1.0::double precision
        WHEN similarity(coalesce(kc.question, ''), qv.qt) >= 0.3 THEN 1.5::double precision
        WHEN similarity(coalesce(kc.answer, ''), qv.qt) >= 0.35 THEN 1.3::double precision
        ELSE 1.0::double precision
      END AS question_boost
    FROM public.knowledge_chunks kc
    JOIN public.knowledge_documents kd ON kd.id = kc.document_id
    CROSS JOIN qvec qv
    WHERE (qv.qt <> '' OR qv.v IS NOT NULL)
      AND (language_filter IS NULL OR kc.language = language_filter)
  ), boosted AS (
    SELECT
      s.*,
      -- Apply question boost to keyword score (capped at 1.0)
      LEAST(s.base_keyword_score * s.question_boost, 1.0)::double precision AS keyword_score
    FROM scored s
  ), ranked AS (
    SELECT
      b.*, 
      (0.70 * b.vector_score + 0.30 * b.keyword_score)::double precision AS combined_score,
      (0.70 * (0.70 * b.vector_score + 0.30 * b.keyword_score) + 0.30 * (b.priority_score / 100.0))::double precision AS ferrari_score,
      (b.priority_score >= 85) AS is_clinical_standard
    FROM boosted b
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
$function$;
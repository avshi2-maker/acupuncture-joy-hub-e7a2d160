-- Fix hybrid_search function return type mismatch (real vs double precision)
-- The function returns real but the definition expects double precision

-- First, drop the existing function
DROP FUNCTION IF EXISTS public.hybrid_search(text, double precision, integer, text, text);

-- Recreate with correct return types (using real instead of double precision for score columns)
CREATE OR REPLACE FUNCTION public.hybrid_search(
  query_text text DEFAULT NULL,
  match_threshold double precision DEFAULT 0.0,
  match_count integer DEFAULT 10,
  language_filter text DEFAULT NULL,
  query_embedding text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  question text,
  answer text,
  chunk_index integer,
  language text,
  metadata jsonb,
  file_name text,
  original_name text,
  category text,
  image_ref text,
  image_caption text,
  image_url text,
  nano_prompt text,
  priority_score real,
  vector_score real,
  keyword_score real,
  combined_score real,
  ferrari_score real,
  confidence text,
  is_clinical_standard boolean
)
LANGUAGE plpgsql
AS $$
DECLARE
  search_terms text[];
BEGIN
  -- Split query into search terms
  search_terms := string_to_array(lower(coalesce(query_text, '')), ' ');
  
  RETURN QUERY
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
    kc.image_caption,
    kc.image_url,
    kc.nano_prompt,
    COALESCE(kc.priority_score, 0)::real AS priority_score,
    0::real AS vector_score,
    -- Keyword relevance score based on term matches
    (
      SELECT COUNT(*)::real / GREATEST(array_length(search_terms, 1), 1)::real
      FROM unnest(search_terms) AS term
      WHERE lower(kc.content) LIKE '%' || term || '%'
        OR lower(coalesce(kc.question, '')) LIKE '%' || term || '%'
        OR lower(coalesce(kc.answer, '')) LIKE '%' || term || '%'
    ) AS keyword_score,
    -- Combined score (keyword + priority)
    (
      (
        SELECT COUNT(*)::real / GREATEST(array_length(search_terms, 1), 1)::real
        FROM unnest(search_terms) AS term
        WHERE lower(kc.content) LIKE '%' || term || '%'
          OR lower(coalesce(kc.question, '')) LIKE '%' || term || '%'
          OR lower(coalesce(kc.answer, '')) LIKE '%' || term || '%'
      ) * 0.7 + COALESCE(kc.priority_score, 0) * 0.3
    )::real AS combined_score,
    -- Ferrari score (clinical standard boost)
    CASE 
      WHEN kd.category = 'clinical_standard' THEN 
        (
          (
            SELECT COUNT(*)::real / GREATEST(array_length(search_terms, 1), 1)::real
            FROM unnest(search_terms) AS term
            WHERE lower(kc.content) LIKE '%' || term || '%'
          ) * 1.5
        )::real
      ELSE 
        (
          SELECT COUNT(*)::real / GREATEST(array_length(search_terms, 1), 1)::real
          FROM unnest(search_terms) AS term
          WHERE lower(kc.content) LIKE '%' || term || '%'
        )::real
    END AS ferrari_score,
    -- Confidence level
    CASE 
      WHEN kd.category = 'clinical_standard' THEN 'high'
      WHEN COALESCE(kc.priority_score, 0) > 0.7 THEN 'medium'
      ELSE 'low'
    END AS confidence,
    -- Is clinical standard
    (kd.category = 'clinical_standard')::boolean AS is_clinical_standard
  FROM knowledge_chunks kc
  JOIN knowledge_documents kd ON kc.document_id = kd.id
  WHERE 
    (language_filter IS NULL OR kc.language = language_filter OR kc.language IS NULL)
    AND (
      query_text IS NULL 
      OR lower(kc.content) LIKE '%' || lower(query_text) || '%'
      OR lower(coalesce(kc.question, '')) LIKE '%' || lower(query_text) || '%'
      OR lower(coalesce(kc.answer, '')) LIKE '%' || lower(query_text) || '%'
      OR EXISTS (
        SELECT 1 FROM unnest(search_terms) AS term
        WHERE lower(kc.content) LIKE '%' || term || '%'
          OR lower(coalesce(kc.question, '')) LIKE '%' || term || '%'
      )
    )
  ORDER BY 
    is_clinical_standard DESC,
    combined_score DESC,
    priority_score DESC NULLS LAST
  LIMIT match_count;
END;
$$;

-- Also fix keyword_search function overloading issue by dropping duplicates and creating a single version
DROP FUNCTION IF EXISTS public.keyword_search(text, double precision, integer, text);
DROP FUNCTION IF EXISTS public.keyword_search(text, real, integer, text);

CREATE OR REPLACE FUNCTION public.keyword_search(
  query_text text,
  match_threshold double precision DEFAULT 0.0,
  match_count integer DEFAULT 10,
  language_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  question text,
  answer text,
  chunk_index integer,
  language text,
  metadata jsonb,
  file_name text,
  original_name text,
  category text,
  image_ref text,
  image_caption text,
  image_url text,
  keyword_score real,
  confidence text
)
LANGUAGE plpgsql
AS $$
DECLARE
  search_terms text[];
BEGIN
  search_terms := string_to_array(lower(coalesce(query_text, '')), ' ');
  
  RETURN QUERY
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
    kc.image_caption,
    kc.image_url,
    (
      SELECT COUNT(*)::real / GREATEST(array_length(search_terms, 1), 1)::real
      FROM unnest(search_terms) AS term
      WHERE lower(kc.content) LIKE '%' || term || '%'
        OR lower(coalesce(kc.question, '')) LIKE '%' || term || '%'
        OR lower(coalesce(kc.answer, '')) LIKE '%' || term || '%'
    ) AS keyword_score,
    CASE 
      WHEN kd.category = 'clinical_standard' THEN 'high'
      WHEN COALESCE(kc.priority_score, 0) > 0.7 THEN 'medium'
      ELSE 'low'
    END AS confidence
  FROM knowledge_chunks kc
  JOIN knowledge_documents kd ON kc.document_id = kd.id
  WHERE 
    (language_filter IS NULL OR kc.language = language_filter OR kc.language IS NULL)
    AND (
      lower(kc.content) LIKE '%' || lower(query_text) || '%'
      OR lower(coalesce(kc.question, '')) LIKE '%' || lower(query_text) || '%'
      OR lower(coalesce(kc.answer, '')) LIKE '%' || lower(query_text) || '%'
      OR EXISTS (
        SELECT 1 FROM unnest(search_terms) AS term
        WHERE lower(kc.content) LIKE '%' || term || '%'
      )
    )
  ORDER BY keyword_score DESC, kc.priority_score DESC NULLS LAST
  LIMIT match_count;
END;
$$;
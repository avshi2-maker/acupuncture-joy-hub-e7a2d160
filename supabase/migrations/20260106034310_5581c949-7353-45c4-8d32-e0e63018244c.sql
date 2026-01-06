-- Update the hybrid_search function to include image columns
CREATE OR REPLACE FUNCTION public.hybrid_search(
  language_filter text DEFAULT NULL::text,
  match_count integer DEFAULT 10,
  match_threshold double precision DEFAULT 0.5,
  query_embedding text DEFAULT NULL::text,
  query_text text DEFAULT ''::text
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
  image_caption text
)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  embedding_vector vector(1536);
BEGIN
  -- Parse the embedding from JSON string
  IF query_embedding IS NOT NULL AND query_embedding != '' THEN
    embedding_vector := query_embedding::vector(1536);
  END IF;

  RETURN QUERY
  WITH vector_results AS (
    SELECT 
      kc.id,
      kc.content,
      kc.question,
      kc.answer,
      kc.chunk_index,
      kc.metadata,
      kc.language,
      kc.document_id,
      kc.image_ref,
      kc.image_url,
      kc.image_caption,
      kd.file_name,
      kd.original_name,
      kd.category,
      CASE 
        WHEN embedding_vector IS NOT NULL AND kc.embedding IS NOT NULL 
        THEN 1 - (kc.embedding <=> embedding_vector)
        ELSE 0
      END AS v_score
    FROM knowledge_chunks kc
    JOIN knowledge_documents kd ON kd.id = kc.document_id
    WHERE kd.status = 'indexed'
      AND (language_filter IS NULL OR kc.language = language_filter)
      AND (embedding_vector IS NULL OR kc.embedding IS NOT NULL)
  ),
  keyword_results AS (
    SELECT 
      kc.id,
      kc.content,
      kc.question,
      kc.answer,
      kc.chunk_index,
      kc.metadata,
      kc.language,
      kc.document_id,
      kc.image_ref,
      kc.image_url,
      kc.image_caption,
      kd.file_name,
      kd.original_name,
      kd.category,
      GREATEST(
        similarity(lower(kc.content), lower(query_text)),
        similarity(lower(COALESCE(kc.question, '')), lower(query_text)),
        similarity(lower(COALESCE(kc.answer, '')), lower(query_text))
      ) AS k_score
    FROM knowledge_chunks kc
    JOIN knowledge_documents kd ON kd.id = kc.document_id
    WHERE kd.status = 'indexed'
      AND (language_filter IS NULL OR kc.language = language_filter)
  ),
  combined AS (
    SELECT 
      COALESCE(v.id, k.id) AS id,
      COALESCE(v.content, k.content) AS content,
      COALESCE(v.question, k.question) AS question,
      COALESCE(v.answer, k.answer) AS answer,
      COALESCE(v.chunk_index, k.chunk_index) AS chunk_index,
      COALESCE(v.metadata, k.metadata) AS metadata,
      COALESCE(v.language, k.language) AS language,
      COALESCE(v.document_id, k.document_id) AS document_id,
      COALESCE(v.image_ref, k.image_ref) AS image_ref,
      COALESCE(v.image_url, k.image_url) AS image_url,
      COALESCE(v.image_caption, k.image_caption) AS image_caption,
      COALESCE(v.file_name, k.file_name) AS file_name,
      COALESCE(v.original_name, k.original_name) AS original_name,
      COALESCE(v.category, k.category) AS category,
      COALESCE(v.v_score, 0) AS vector_score,
      COALESCE(k.k_score, 0) AS keyword_score,
      -- Combined score: weighted average favoring vector when available
      CASE 
        WHEN COALESCE(v.v_score, 0) > 0 THEN 
          (COALESCE(v.v_score, 0) * 0.7) + (COALESCE(k.k_score, 0) * 0.3)
        ELSE 
          COALESCE(k.k_score, 0)
      END AS combined_score
    FROM vector_results v
    FULL OUTER JOIN keyword_results k ON v.id = k.id
  )
  SELECT 
    c.answer,
    c.category,
    c.chunk_index,
    c.combined_score,
    CASE 
      WHEN c.combined_score >= 0.90 THEN 'very_high'
      WHEN c.combined_score >= 0.80 THEN 'high'
      WHEN c.combined_score >= 0.60 THEN 'medium'
      WHEN c.combined_score >= 0.40 THEN 'low'
      ELSE 'none'
    END AS confidence,
    c.content,
    c.document_id,
    c.file_name,
    c.id,
    c.keyword_score,
    c.language,
    c.metadata,
    c.original_name,
    c.question,
    c.vector_score,
    c.image_ref,
    c.image_url,
    c.image_caption
  FROM combined c
  WHERE c.combined_score >= match_threshold
  ORDER BY c.combined_score DESC
  LIMIT match_count;
END;
$$;

-- Update the keyword_search function to include image columns
CREATE OR REPLACE FUNCTION public.keyword_search(
  language_filter text DEFAULT NULL::text,
  match_count integer DEFAULT 10,
  match_threshold double precision DEFAULT 0.15,
  query_text text DEFAULT ''::text
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
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    kc.answer,
    kd.category,
    kc.chunk_index,
    CASE 
      WHEN GREATEST(
        similarity(lower(kc.content), lower(query_text)),
        similarity(lower(COALESCE(kc.question, '')), lower(query_text)),
        similarity(lower(COALESCE(kc.answer, '')), lower(query_text))
      ) >= 0.70 THEN 'very_high'
      WHEN GREATEST(
        similarity(lower(kc.content), lower(query_text)),
        similarity(lower(COALESCE(kc.question, '')), lower(query_text)),
        similarity(lower(COALESCE(kc.answer, '')), lower(query_text))
      ) >= 0.50 THEN 'high'
      WHEN GREATEST(
        similarity(lower(kc.content), lower(query_text)),
        similarity(lower(COALESCE(kc.question, '')), lower(query_text)),
        similarity(lower(COALESCE(kc.answer, '')), lower(query_text))
      ) >= 0.30 THEN 'medium'
      WHEN GREATEST(
        similarity(lower(kc.content), lower(query_text)),
        similarity(lower(COALESCE(kc.question, '')), lower(query_text)),
        similarity(lower(COALESCE(kc.answer, '')), lower(query_text))
      ) >= 0.15 THEN 'low'
      ELSE 'none'
    END AS confidence,
    kc.content,
    kc.document_id,
    kd.file_name,
    kc.id,
    GREATEST(
      similarity(lower(kc.content), lower(query_text)),
      similarity(lower(COALESCE(kc.question, '')), lower(query_text)),
      similarity(lower(COALESCE(kc.answer, '')), lower(query_text))
    ) AS keyword_score,
    kc.language,
    kc.metadata,
    kd.original_name,
    kc.question,
    kc.image_ref,
    kc.image_url,
    kc.image_caption
  FROM knowledge_chunks kc
  JOIN knowledge_documents kd ON kd.id = kc.document_id
  WHERE kd.status = 'indexed'
    AND (language_filter IS NULL OR kc.language = language_filter)
    AND GREATEST(
      similarity(lower(kc.content), lower(query_text)),
      similarity(lower(COALESCE(kc.question, '')), lower(query_text)),
      similarity(lower(COALESCE(kc.answer, '')), lower(query_text))
    ) >= match_threshold
  ORDER BY keyword_score DESC
  LIMIT match_count;
END;
$$;
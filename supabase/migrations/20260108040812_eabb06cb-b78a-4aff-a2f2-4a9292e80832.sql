-- Drop existing hybrid_search functions first (there are two overloads)
DROP FUNCTION IF EXISTS public.hybrid_search(text, integer, double precision, text, text);
DROP FUNCTION IF EXISTS public.hybrid_search(vector, text, double precision, integer, text);

-- Create FERRARI-enhanced hybrid_search function
-- 70% relevance (vector similarity) + 30% authority (priority score)
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
  image_caption text,
  priority_score integer,
  nano_prompt text,
  ferrari_score double precision,
  is_clinical_standard boolean
)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
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
      kc.priority_score,
      kc.nano_prompt,
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
      kc.priority_score,
      kc.nano_prompt,
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
      COALESCE(v.priority_score, k.priority_score, 50) AS priority_score,
      COALESCE(v.nano_prompt, k.nano_prompt) AS nano_prompt,
      COALESCE(v.file_name, k.file_name) AS file_name,
      COALESCE(v.original_name, k.original_name) AS original_name,
      COALESCE(v.category, k.category) AS category,
      COALESCE(v.v_score, 0) AS vector_score,
      COALESCE(k.k_score, 0) AS keyword_score,
      -- Standard combined score
      CASE 
        WHEN COALESCE(v.v_score, 0) > 0 THEN 
          (COALESCE(v.v_score, 0) * 0.7) + (COALESCE(k.k_score, 0) * 0.3)
        ELSE 
          COALESCE(k.k_score, 0)
      END AS combined_score,
      -- ★ FERRARI FORMULA ★: 70% relevance + 30% authority
      CASE 
        WHEN COALESCE(v.v_score, 0) > 0 THEN 
          (((COALESCE(v.v_score, 0) * 0.7) + (COALESCE(k.k_score, 0) * 0.3)) * 0.7) + 
          ((COALESCE(v.priority_score, k.priority_score, 50)::float / 100.0) * 0.3)
        ELSE 
          (COALESCE(k.k_score, 0) * 0.7) + 
          ((COALESCE(v.priority_score, k.priority_score, 50)::float / 100.0) * 0.3)
      END AS ferrari_score
    FROM vector_results v
    FULL OUTER JOIN keyword_results k ON v.id = k.id
  )
  SELECT 
    c.answer,
    c.category,
    c.chunk_index,
    c.combined_score,
    CASE 
      WHEN c.ferrari_score >= 0.90 THEN 'very_high'
      WHEN c.ferrari_score >= 0.80 THEN 'high'
      WHEN c.ferrari_score >= 0.60 THEN 'medium'
      WHEN c.ferrari_score >= 0.40 THEN 'low'
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
    c.image_caption,
    c.priority_score,
    c.nano_prompt,
    c.ferrari_score,
    (c.priority_score >= 85) AS is_clinical_standard
  FROM combined c
  WHERE c.ferrari_score >= match_threshold
  ORDER BY c.ferrari_score DESC
  LIMIT match_count;
END;
$function$;
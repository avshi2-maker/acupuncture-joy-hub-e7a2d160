-- Create RAG query audit log table to track all AI/API searches
CREATE TABLE public.rag_query_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  query_text TEXT NOT NULL,
  search_terms TEXT,
  chunks_found INTEGER DEFAULT 0,
  chunks_matched JSONB DEFAULT '[]',
  sources_used JSONB DEFAULT '[]',
  response_preview TEXT,
  ai_model TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rag_query_logs ENABLE ROW LEVEL SECURITY;

-- Users can see their own query logs
CREATE POLICY "Users can view own query logs" 
ON public.rag_query_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own query logs
CREATE POLICY "Users can insert own query logs" 
ON public.rag_query_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all logs
CREATE POLICY "Admins can view all query logs" 
ON public.rag_query_logs 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for performance
CREATE INDEX idx_rag_query_logs_user ON public.rag_query_logs(user_id);
CREATE INDEX idx_rag_query_logs_created ON public.rag_query_logs(created_at DESC);

-- Add comment
COMMENT ON TABLE public.rag_query_logs IS 'Audit trail for all RAG/AI queries with source tracking for legal compliance';
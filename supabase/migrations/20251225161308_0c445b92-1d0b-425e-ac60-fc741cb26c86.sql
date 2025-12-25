-- Create table for tracking knowledge documents
CREATE TABLE public.knowledge_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  row_count INTEGER,
  category TEXT,
  language TEXT DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'pending',
  indexed_at TIMESTAMP WITH TIME ZONE,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for knowledge chunks (for RAG retrieval)
CREATE TABLE public.knowledge_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'qa',
  question TEXT,
  answer TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster text search
CREATE INDEX idx_knowledge_chunks_content ON public.knowledge_chunks USING gin(to_tsvector('english', content));
CREATE INDEX idx_knowledge_chunks_document ON public.knowledge_chunks(document_id);

-- Enable RLS
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- Policies for knowledge_documents
CREATE POLICY "Admins can manage all documents" 
ON public.knowledge_documents 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can read documents" 
ON public.knowledge_documents 
FOR SELECT 
USING (status = 'indexed');

-- Policies for knowledge_chunks
CREATE POLICY "Admins can manage all chunks" 
ON public.knowledge_chunks 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can read chunks" 
ON public.knowledge_chunks 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.knowledge_documents d 
  WHERE d.id = knowledge_chunks.document_id AND d.status = 'indexed'
));

-- Create storage bucket for knowledge files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('knowledge-files', 'knowledge-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Admins can upload knowledge files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'knowledge-files' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can read knowledge files"
ON storage.objects FOR SELECT
USING (bucket_id = 'knowledge-files' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete knowledge files"
ON storage.objects FOR DELETE
USING (bucket_id = 'knowledge-files' AND has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_knowledge_documents_updated_at
BEFORE UPDATE ON public.knowledge_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
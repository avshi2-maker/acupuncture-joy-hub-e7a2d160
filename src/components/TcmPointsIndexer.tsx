import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle2, Loader2, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

interface IndexingState {
  status: 'idle' | 'fetching' | 'parsing' | 'indexing' | 'embedding' | 'done' | 'error';
  current: number;
  total: number;
  message: string;
}

export function TcmPointsIndexer() {
  const [state, setState] = useState<IndexingState>({
    status: 'idle',
    current: 0,
    total: 0,
    message: ''
  });
  const { toast } = useToast();

  const indexTcmPoints = async () => {
    setState({ status: 'fetching', current: 0, total: 0, message: 'Fetching tcm_points.csv...' });

    try {
      // Step 1: Fetch the CSV from public folder
      const response = await fetch('/body-maps/tcm_points.csv');
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status}`);
      }
      const csvContent = await response.text();
      console.log('[TcmPointsIndexer] CSV fetched, length:', csvContent.length);

      // Step 2: Parse CSV
      setState(prev => ({ ...prev, status: 'parsing', message: 'Parsing CSV data...' }));
      const lines = csvContent.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1);
      
      console.log('[TcmPointsIndexer] Parsed headers:', headers);
      console.log('[TcmPointsIndexer] Total rows:', rows.length);

      setState(prev => ({ ...prev, total: rows.length, message: `Found ${rows.length} acupuncture points` }));

      // Step 3: Create document record
      const fileHash = `tcm_points_${Date.now()}`;
      
      // Check if document exists
      const { data: existingDoc } = await supabase
        .from('knowledge_documents')
        .select('id')
        .eq('file_name', 'tcm_points.csv')
        .single();

      let documentId: string;

      if (existingDoc) {
        // Delete old chunks
        await supabase
          .from('knowledge_chunks')
          .delete()
          .eq('document_id', existingDoc.id);
        
        documentId = existingDoc.id;
        
        // Update document
        await supabase
          .from('knowledge_documents')
          .update({
            file_hash: fileHash,
            status: 'indexing',
            row_count: rows.length,
            updated_at: new Date().toISOString()
          })
          .eq('id', documentId);
      } else {
        // Create new document
        const { data: newDoc, error: createError } = await supabase
          .from('knowledge_documents')
          .insert({
            file_name: 'tcm_points.csv',
            original_name: 'tcm_points.csv',
            file_hash: fileHash,
            category: 'acupuncture',
            status: 'indexing',
            row_count: rows.length,
            language: 'en'
          })
          .select('id')
          .single();

        if (createError) throw createError;
        documentId = newDoc.id;
      }

      console.log('[TcmPointsIndexer] Document ID:', documentId);

      // Step 4: Parse and insert chunks one by one (with progress)
      setState(prev => ({ ...prev, status: 'indexing', message: 'Indexing points...' }));

      const chunks: Array<{
        document_id: string;
        chunk_index: number;
        content: string;
        question: string;
        answer: string;
        content_type: string;
        language: string;
        priority_score: number;
        metadata: Json;
      }> = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const values = parseCSVLine(row);
        
        const rowData: Record<string, string> = {};
        headers.forEach((h, idx) => {
          rowData[h] = values[idx] || '';
        });

        const code = rowData['code'] || '';
        const name = rowData['name'] || '';
        const pinyin = rowData['pinyin'] || '';
        const tags = rowData['tags'] || '';
        const imageFile = rowData['image_file'] || '';

        // Create rich content for vector search
        const content = `Acupuncture Point ${code} (${name}, ${pinyin}). Indications: ${tags.replace(/;/g, ', ')}. Image: ${imageFile}`;
        const question = `What is ${code} ${name} used for? When to use ${pinyin}?`;
        const answer = `${code} (${name}/${pinyin}) is indicated for: ${tags.replace(/;/g, ', ')}. Anatomical reference image: ${imageFile}`;

        chunks.push({
          document_id: documentId,
          chunk_index: i,
          content,
          question,
          answer,
          content_type: 'acupoint',
          language: 'en',
          priority_score: 100, // Highest priority
          metadata: {
            source: 'tcm_points.csv',
            source_type: 'tcm_points',
            priority: 1,
            point_code: code,
            point_name: name,
            point_pinyin: pinyin,
            indications: tags.split(';').filter(Boolean),
            image_file: imageFile,
            x_percent: parseFloat(rowData['x_percent']) || 0,
            y_percent: parseFloat(rowData['y_percent']) || 0
          } as Json
        });

        setState(prev => ({ 
          ...prev, 
          current: i + 1, 
          message: `Parsing point ${i + 1} of ${rows.length}: ${code} ${name}` 
        }));
      }

      // Insert all chunks
      console.log('[TcmPointsIndexer] Inserting', chunks.length, 'chunks...');
      
      const batchSize = 50;
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('knowledge_chunks')
          .insert(batch);

        if (insertError) {
          console.error('[TcmPointsIndexer] Insert error:', insertError);
          throw insertError;
        }

        setState(prev => ({
          ...prev,
          current: Math.min(i + batchSize, chunks.length),
          message: `Inserted ${Math.min(i + batchSize, chunks.length)} of ${chunks.length} chunks`
        }));
      }

      // Step 5: Generate embeddings
      setState(prev => ({ ...prev, status: 'embedding', message: 'Generating embeddings (this may take a moment)...' }));

      const { error: embeddingError } = await supabase.functions.invoke('generate-embeddings', {
        body: { documentId, batchSize: 100 }
      });

      if (embeddingError) {
        console.warn('[TcmPointsIndexer] Embedding generation warning:', embeddingError);
        // Don't fail - embeddings can be generated later
      }

      // Step 6: Mark document as complete
      await supabase
        .from('knowledge_documents')
        .update({
          status: 'indexed',
          indexed_at: new Date().toISOString()
        })
        .eq('id', documentId);

      setState({
        status: 'done',
        current: rows.length,
        total: rows.length,
        message: `✓ Successfully indexed ${rows.length} TCM points with priority 1!`
      });

      toast({
        title: 'TCM Points Indexed',
        description: `${rows.length} acupuncture points are now in the knowledge base.`,
      });

      console.log('[TcmPointsIndexer] ✅ Complete!', {
        documentId,
        totalPoints: rows.length
      });

    } catch (error) {
      console.error('[TcmPointsIndexer] Error:', error);
      setState({
        status: 'error',
        current: 0,
        total: 0,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });

      toast({
        title: 'Indexing Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  };

  // CSV line parser that handles quoted values
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const progress = state.total > 0 ? (state.current / state.total) * 100 : 0;

  if (state.status === 'idle') {
    return (
      <Button
        variant="destructive"
        size="sm"
        onClick={indexTcmPoints}
        className="gap-2 animate-pulse"
      >
        <AlertTriangle className="h-4 w-4" />
        ⚠️ FORCE INDEX TCM POINTS
      </Button>
    );
  }

  if (state.status === 'done') {
    return (
      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-4 w-4" />
        <span className="text-xs font-medium">{state.message}</span>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs font-medium">{state.message}</span>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={indexTcmPoints}
          className="gap-2"
        >
          <AlertTriangle className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="w-64 space-y-2">
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
        {state.status === 'embedding' ? (
          <Database className="h-4 w-4 animate-pulse" />
        ) : (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        <span className="text-xs font-medium truncate">{state.message}</span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="text-[10px] text-muted-foreground text-right">
        {state.current} / {state.total}
      </div>
    </div>
  );
}

export default TcmPointsIndexer;

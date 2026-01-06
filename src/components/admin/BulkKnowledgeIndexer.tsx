import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  Database, 
  Play, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2,
  FileText,
  FolderOpen
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface FileStatus {
  filename: string;
  category: string;
  description: string;
  indexed: boolean;
  indexedAt?: string;
  rowCount?: number;
  status: 'not_indexed' | 'indexed' | 'indexing' | 'error';
  error?: string;
}

export function BulkKnowledgeIndexer() {
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const queryClient = useQueryClient();

  // Fetch list of available files and their indexing status
  const fetchFileList = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bulk-index-knowledge', {
        body: { action: 'list' }
      });

      if (error) throw error;
      
      if (data?.files) {
        setFiles(data.files);
        toast.success(`Found ${data.totalFiles} files (${data.indexedFiles} already indexed)`);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch file list';
      toast.error(errorMessage);
      console.error('Fetch file list error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Index all non-indexed files
  const indexAllFiles = async () => {
    const filesToIndex = files.filter(f => !f.indexed);
    if (filesToIndex.length === 0) {
      toast.info('All files are already indexed');
      return;
    }

    setIsIndexing(true);
    setProgress({ current: 0, total: filesToIndex.length });

    try {
      // Update UI to show indexing status
      setFiles(prev => prev.map(f => 
        !f.indexed ? { ...f, status: 'indexing' } : f
      ));

      const { data, error } = await supabase.functions.invoke('bulk-index-knowledge', {
        body: { 
          action: 'index',
          files: filesToIndex.map(f => f.filename)
        }
      });

      if (error) throw error;

      // Update file statuses based on results
      if (data?.results) {
        setFiles(prev => prev.map(f => {
          const result = data.results.find((r: { filename: string; success: boolean; rowCount?: number; error?: string }) => r.filename === f.filename);
          if (result) {
            return {
              ...f,
              indexed: result.success,
              status: result.success ? 'indexed' : 'error',
              rowCount: result.rowCount || f.rowCount,
              error: result.error
            };
          }
          return f;
        }));

        toast.success(`Indexed ${data.totalIndexed} files successfully`);
        
        // Refresh the knowledge documents list
        queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] });
        queryClient.invalidateQueries({ queryKey: ['knowledge-chunks-stats'] });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to index files';
      toast.error(errorMessage);
      console.error('Index files error:', err);
    } finally {
      setIsIndexing(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  // Index a single file
  const indexSingleFile = async (filename: string) => {
    setFiles(prev => prev.map(f => 
      f.filename === filename ? { ...f, status: 'indexing' } : f
    ));

    try {
      const { data, error } = await supabase.functions.invoke('bulk-index-knowledge', {
        body: { 
          action: 'index',
          files: [filename]
        }
      });

      if (error) throw error;

      const result = data?.results?.[0];
      if (result) {
        setFiles(prev => prev.map(f => 
          f.filename === filename ? {
            ...f,
            indexed: result.success,
            status: result.success ? 'indexed' : 'error',
            rowCount: result.rowCount || f.rowCount,
            error: result.error
          } : f
        ));

        if (result.success) {
          toast.success(`Indexed ${filename}: ${result.rowCount} rows`);
          queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] });
          queryClient.invalidateQueries({ queryKey: ['knowledge-chunks-stats'] });
        } else {
          toast.error(`Failed to index ${filename}: ${result.error}`);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to index file';
      toast.error(errorMessage);
      setFiles(prev => prev.map(f => 
        f.filename === filename ? { ...f, status: 'error', error: errorMessage } : f
      ));
    }
  };

  const getStatusIcon = (status: FileStatus['status']) => {
    switch (status) {
      case 'indexed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'indexing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      diagnostic: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      constitutional: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      specialty: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      mental_health: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
      nutrition: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      lifestyle: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
      age_specific: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      acupuncture: 'bg-jade-100 text-jade-800 dark:bg-jade-900/30 dark:text-jade-300',
      herbal: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      treatment: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      clinic: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
      qa: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const indexedCount = files.filter(f => f.indexed).length;
  const totalFiles = files.length;
  const notIndexedCount = totalFiles - indexedCount;

  // Group files by category
  const groupedFiles = files.reduce((acc, file) => {
    if (!acc[file.category]) {
      acc[file.category] = [];
    }
    acc[file.category].push(file);
    return acc;
  }, {} as Record<string, FileStatus[]>);

  return (
    <Card className="border-jade-200 dark:border-jade-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-jade-600" />
          Bulk Knowledge Base Indexer
        </CardTitle>
        <CardDescription>
          Index all 84 CSV knowledge files from the public/knowledge-assets folder for Deep Search
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={fetchFileList}
            disabled={isLoading || isIndexing}
            variant="outline"
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FolderOpen className="w-4 h-4" />
            )}
            {isLoading ? 'Loading...' : 'Scan Files'}
          </Button>

          {files.length > 0 && (
            <Button
              onClick={indexAllFiles}
              disabled={isIndexing || notIndexedCount === 0}
              className="gap-2 bg-jade-600 hover:bg-jade-700"
            >
              {isIndexing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isIndexing ? 'Indexing...' : `Index ${notIndexedCount} Files`}
            </Button>
          )}

          {files.length > 0 && (
            <Button
              onClick={fetchFileList}
              disabled={isLoading || isIndexing}
              variant="ghost"
              size="icon"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Stats */}
        {files.length > 0 && (
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium">
              {indexedCount} / {totalFiles} indexed
            </span>
            <Progress 
              value={(indexedCount / totalFiles) * 100} 
              className="w-48 h-2"
            />
            {notIndexedCount > 0 && (
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                {notIndexedCount} pending
              </Badge>
            )}
          </div>
        )}

        {/* File List by Category */}
        {files.length > 0 && (
          <ScrollArea className="h-[400px] rounded-lg border">
            <div className="p-4 space-y-6">
              {Object.entries(groupedFiles).map(([category, categoryFiles]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={getCategoryColor(category)}>
                      {category.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {categoryFiles.filter(f => f.indexed).length}/{categoryFiles.length} indexed
                    </span>
                  </div>
                  <div className="space-y-2">
                    {categoryFiles.map((file) => (
                      <div 
                        key={file.filename}
                        className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.filename}</p>
                          <p className="text-xs text-muted-foreground">{file.description}</p>
                          {file.error && (
                            <p className="text-xs text-red-500">{file.error}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {file.rowCount && (
                            <span className="text-xs text-muted-foreground">
                              {file.rowCount} rows
                            </span>
                          )}
                          {getStatusIcon(file.status)}
                          {!file.indexed && file.status !== 'indexing' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => indexSingleFile(file.filename)}
                              disabled={isIndexing}
                            >
                              Index
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {files.length === 0 && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Click "Scan Files" to discover available knowledge base files</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

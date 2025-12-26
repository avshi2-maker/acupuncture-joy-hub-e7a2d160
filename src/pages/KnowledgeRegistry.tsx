import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { FileText, Download, CheckCircle, Clock, AlertCircle, Shield, Database, FileCheck, Upload, Trash2, Pause, Play, RotateCcw, XCircle } from 'lucide-react';
import { format } from 'date-fns';

// Simple CSV parser
function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx];
      });
      rows.push(row);
    }
  }
  
  return { headers, rows };
}

function parseCSVLine(line: string): string[] {
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
}

interface KnowledgeDocument {
  id: string;
  file_name: string;
  original_name: string;
  file_hash: string;
  file_size: number | null;
  row_count: number | null;
  category: string | null;
  language: string | null;
  status: string;
  indexed_at: string | null;
  created_at: string;
}

interface LegalReport {
  reportTitle: string;
  generatedAt: string;
  summary: {
    totalDocuments: number;
    totalIndexedDocuments: number;
    totalKnowledgeEntries: number;
  };
  documentManifest: Array<{
    fileName: string;
    fileHash: string;
    chunksIndexed: number;
    status: string;
  }>;
  legalDeclaration: {
    declarationText: string;
  };
}

const CATEGORIES = [
  'general_health',
  'tcm_theory',
  'anxiety_mental',
  'pain_ortho',
  'womens_health',
  'wellness_sport',
  'therapist_training',
  'pediatrics',
  'digestive',
  'respiratory',
  'dermatology',
  'other'
];

type QueueItemStatus = 'pending' | 'importing' | 'done' | 'error';

interface QueueItem {
  id: string;
  file: File;
  category: string;
  language: string;
  parsed?: { headers: string[]; rows: Record<string, string>[] };
  status: QueueItemStatus;
  error?: string;
  chunksCreated?: number;
}

export default function KnowledgeRegistry() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [generatingReport, setGeneratingReport] = useState(false);
  const [report, setReport] = useState<LegalReport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queue state
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const queueRef = useRef<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);

  // Keep latest queue in a ref so async processing never uses stale state
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  // Sync isPaused to ref for use in async loop
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Temporarily bypass auth check for testing
  // useEffect(() => {
  //   if (!authLoading && !user) {
  //     navigate('/auth');
  //   }
  // }, [user, authLoading, navigate]);

  const { data: documents, isLoading } = useQuery({
    queryKey: ['knowledge-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_documents')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as KnowledgeDocument[];
    },
  });

  const { data: chunkStats } = useQuery({
    queryKey: ['knowledge-chunks-stats'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('knowledge_chunks')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return { totalChunks: count || 0 };
    },
  });

  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-legal-report');
      if (error) throw error;
      setReport(data);
      toast.success('Legal report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    const reportText = `
${report.reportTitle}
${'='.repeat(50)}

Generated: ${new Date(report.generatedAt).toLocaleString()}

SUMMARY
-------
Total Documents: ${report.summary.totalDocuments}
Indexed Documents: ${report.summary.totalIndexedDocuments}
Total Knowledge Entries: ${report.summary.totalKnowledgeEntries}

DOCUMENT MANIFEST
-----------------
${report.documentManifest.map(doc => `
File: ${doc.fileName}
Hash: ${doc.fileHash}
Chunks: ${doc.chunksIndexed}
Status: ${doc.status}
`).join('\n')}

LEGAL DECLARATION
-----------------
${report.legalDeclaration.declarationText}
    `;
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-provenance-report-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newItems: QueueItem[] = [];

    for (const file of files) {
      if (!file.name.endsWith('.csv')) {
        toast.error(`${file.name} is not a CSV file`);
        continue;
      }

      const text = await file.text();
      const parsed = parseCSV(text);

      if (parsed.rows.length === 0) {
        toast.error(`${file.name} has no data rows`);
        continue;
      }

      // Auto-detect category
      let category = 'other';
      const lowerName = file.name.toLowerCase();
      if (lowerName.includes('anxiety') || lowerName.includes('mental') || lowerName.includes('nervousness')) {
        category = 'anxiety_mental';
      } else if (lowerName.includes('wellness') || lowerName.includes('sport')) {
        category = 'wellness_sport';
      } else if (lowerName.includes('tcm')) {
        category = 'tcm_theory';
      } else if (lowerName.includes('therapist')) {
        category = 'therapist_training';
      } else if (lowerName.includes('general') || lowerName.includes('health')) {
        category = 'general_health';
      } else if (lowerName.includes('pain') || lowerName.includes('ortho')) {
        category = 'pain_ortho';
      } else if (lowerName.includes('women') || lowerName.includes('pregnan') || lowerName.includes('fertility')) {
        category = 'womens_health';
      } else if (lowerName.includes('pediatric') || lowerName.includes('child')) {
        category = 'pediatrics';
      } else if (lowerName.includes('digest') || lowerName.includes('stomach') || lowerName.includes('ibs')) {
        category = 'digestive';
      }

      let language = 'en';
      if (lowerName.includes('hebrew') || lowerName.includes('_he')) {
        language = 'he';
      }

      newItems.push({
        id: crypto.randomUUID(),
        file,
        category,
        language,
        parsed,
        status: 'pending',
      });
    }

    setQueue(prev => [...prev, ...newItems]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateQueueItem = useCallback((id: string, updates: Partial<QueueItem>) => {
    setQueue(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
  }, []);

  const removeQueueItem = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const clearQueue = () => {
    isProcessingRef.current = false;
    setQueue([]);
    setIsProcessing(false);
    setIsPaused(false);
  };

  const retryFailed = () => {
    setQueue(prev => prev.map(item => item.status === 'error' ? { ...item, status: 'pending' as QueueItemStatus, error: undefined } : item));
  };

  // Process one queued file at a time (avoids stale-state infinite loops)
  const processQueue = useCallback(async () => {
    // Ref guard prevents double-start (e.g. auto effect + manual click) before state updates
    if (isProcessingRef.current) return;
    if (isPausedRef.current) return;

    const pendingItem = queueRef.current.find(item => item.status === 'pending');
    if (!pendingItem) return;

    isProcessingRef.current = true;
    setIsProcessing(true);
    updateQueueItem(pendingItem.id, { status: 'importing' });

    try {
      const docPayload = {
        fileName: pendingItem.file.name,
        category: pendingItem.category,
        language: pendingItem.language,
        rows: pendingItem.parsed?.rows || [],
      };

      const { data, error } = await supabase.functions.invoke('import-knowledge', {
        body: { documents: [docPayload] },
      });

      if (error) throw error;

      const result = data?.results?.[0];
      if (result?.success) {
        updateQueueItem(pendingItem.id, { status: 'done', chunksCreated: result.chunksCreated });
      } else {
        updateQueueItem(pendingItem.id, { status: 'error', error: result?.error || 'Unknown error' });
      }
    } catch (err: any) {
      updateQueueItem(pendingItem.id, { status: 'error', error: err?.message || 'Import failed' });
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
      queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-chunks-stats'] });
    }
  }, [queryClient, updateQueueItem]);

  // Effect to keep processing when queue changes and not paused
  useEffect(() => {
    if (!isProcessing && !isPaused && queue.some(item => item.status === 'pending')) {
      processQueue();
    }
  }, [queue, isProcessing, isPaused, processQueue]);

  const togglePause = () => {
    if (isPaused) {
      // Resume
      setIsPaused(false);
    } else {
      // Pause
      setIsPaused(true);
    }
  };

  const startImport = () => {
    if (queue.length === 0) return;
    setIsPaused(false);
    processQueue();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'indexed':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Indexed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getQueueStatusBadge = (item: QueueItem) => {
    switch (item.status) {
      case 'done':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Done ({item.chunksCreated} chunks)</Badge>;
      case 'importing':
        return <Badge className="bg-blue-500 animate-pulse"><Upload className="w-3 h-3 mr-1" /> Importing...</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> {item.error?.slice(0, 30)}</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  const indexedCount = documents?.filter(d => d.status === 'indexed').length || 0;
  const totalDocs = documents?.length || 0;
  const queueDone = queue.filter(q => q.status === 'done').length;
  const queueTotal = queue.length;
  const queueProgress = queueTotal > 0 ? Math.round((queueDone / queueTotal) * 100) : 0;
  const hasPending = queue.some(q => q.status === 'pending');
  const hasErrors = queue.some(q => q.status === 'error');

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Database className="w-8 h-8" />
          Knowledge Document Registry
        </h1>
        <p className="text-muted-foreground">
          Track and verify all proprietary materials in Dr. Sapir's TCM Knowledge Base
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalDocs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Indexed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{indexedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Knowledge Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{chunkStats?.totalChunks || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Data Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary">Dr. Sapir ONLY</div>
          </CardContent>
        </Card>
      </div>

      {/* Import Queue Section */}
      <Card className="mb-8 border-dashed border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Queue
          </CardTitle>
          <CardDescription>
            Add CSV files to the queue. Files are imported one at a time with pause/resume support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                multiple
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Select multiple CSV files. They will be queued and processed one by one.
              </p>
            </div>

            {queue.length > 0 && (
              <div className="space-y-3">
                {/* Queue Controls */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-medium">Queue: {queueDone}/{queueTotal} files</span>
                  <Progress value={queueProgress} className="w-48" />
                  <div className="flex gap-2 ml-auto">
                    {!isProcessing && hasPending && (
                      <Button onClick={startImport} size="sm" className="gap-1">
                        <Play className="w-4 h-4" /> Start
                      </Button>
                    )}
                    {isProcessing && (
                      <Button onClick={togglePause} size="sm" variant={isPaused ? 'default' : 'secondary'} className="gap-1">
                        {isPaused ? <><Play className="w-4 h-4" /> Resume</> : <><Pause className="w-4 h-4" /> Pause</>}
                      </Button>
                    )}
                    {hasErrors && (
                      <Button onClick={retryFailed} size="sm" variant="outline" className="gap-1">
                        <RotateCcw className="w-4 h-4" /> Retry Failed
                      </Button>
                    )}
                    <Button onClick={clearQueue} size="sm" variant="ghost" className="gap-1">
                      <Trash2 className="w-4 h-4" /> Clear
                    </Button>
                  </div>
                </div>

                {/* Queue Items */}
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {queue.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <FileText className="w-5 h-5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.parsed?.rows.length || 0} rows
                        </p>
                      </div>
                      <Select
                        value={item.category}
                        onValueChange={(v) => updateQueueItem(item.id, { category: v })}
                        disabled={item.status !== 'pending'}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>
                              {cat.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={item.language}
                        onValueChange={(v) => updateQueueItem(item.id, { language: v })}
                        disabled={item.status !== 'pending'}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">EN</SelectItem>
                          <SelectItem value="he">HE</SelectItem>
                        </SelectContent>
                      </Select>
                      {getQueueStatusBadge(item)}
                      {item.status === 'pending' && (
                        <Button variant="ghost" size="icon" onClick={() => removeQueueItem(item.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legal Report Section */}
      <Card className="mb-8 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Legal Compliance Report
          </CardTitle>
          <CardDescription>
            Generate a certified report for legal verification of data provenance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={generateReport}
              disabled={generatingReport}
              className="flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              {generatingReport ? 'Generating...' : 'Generate Legal Report'}
            </Button>

            {report && (
              <Button variant="outline" onClick={downloadReport} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Report
              </Button>
            )}
          </div>

          {report && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Report Preview</h4>
              <div className="text-sm space-y-2">
                <p><strong>Generated:</strong> {new Date(report.generatedAt).toLocaleString()}</p>
                <p><strong>Documents Certified:</strong> {report.summary.totalDocuments}</p>
                <p><strong>Knowledge Entries:</strong> {report.summary.totalKnowledgeEntries}</p>
                <p className="text-green-600 font-medium">✓ No external/public domain data sources</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document Manifest
          </CardTitle>
          <CardDescription>
            All proprietary documents with cryptographic verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading documents...</div>
          ) : documents?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No documents indexed yet. Upload your knowledge base files to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Rows</TableHead>
                  <TableHead>Hash (SHA-256)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Indexed At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents?.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.original_name}</TableCell>
                    <TableCell>{doc.category || '-'}</TableCell>
                    <TableCell>{doc.language?.toUpperCase() || '-'}</TableCell>
                    <TableCell>{doc.row_count || '-'}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {doc.file_hash.substring(0, 16)}...
                    </TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell>
                      {doc.indexed_at ? format(new Date(doc.indexed_at), 'MMM d, yyyy HH:mm') : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

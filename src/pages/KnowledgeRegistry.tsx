import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
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
import { FileText, Download, CheckCircle, Clock, AlertCircle, Shield, Database, FileCheck, Upload, Trash2, Pause, Play, RotateCcw, XCircle, ArrowLeft } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
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
  generatedBy?: string;
  reportVersion?: string;
  summary: {
    totalDocuments: number;
    totalIndexedDocuments: number;
    totalKnowledgeEntries: number;
    dataSourcesCertified?: string;
    externalDataSources?: string;
    publicDomainContent?: string;
  };
  lineItemSummary?: string;
  documentManifest: Array<{
    lineNumber?: number;
    fileName: string;
    storedAs?: string;
    fileHash: string;
    fileSize?: number | null;
    category?: string | null;
    language?: string | null;
    rowCount?: number | null;
    chunksIndexed: number;
    status: string;
    uploadedAt?: string;
    indexedAt?: string | null;
  }>;
  technicalCertification?: {
    systemArchitecture?: string;
    aiModel?: string;
    dataIsolation?: string;
    noExternalKnowledge?: boolean;
    sourceTracing?: string;
    behaviorOnMissingData?: string;
  };
  legalDeclaration: {
    declarationText: string;
    signatureBlock?: {
      preparedFor?: string;
      systemOperator?: string;
      reportVersion?: string;
    };
  };
  verificationInstructions?: string;
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

const BUILTIN_ASSETS = [
  {
    id: 'tongue-diagnosis',
    label: 'tongue-diagnosis.csv',
    path: '/knowledge-assets/tongue-diagnosis.csv',
    defaultCategory: 'tcm_theory',
    defaultLanguage: 'en',
  },
  {
    id: 'diet-nutrition-intake',
    label: 'diet-nutrition-intake.csv',
    path: '/knowledge-assets/diet-nutrition-intake.csv',
    defaultCategory: 'general_health',
    defaultLanguage: 'en',
  },
  {
    id: 'pulse-diagnosis',
    label: 'pulse-diagnosis.csv',
    path: '/knowledge-assets/pulse-diagnosis.csv',
    defaultCategory: 'tcm_theory',
    defaultLanguage: 'en',
  },
  {
    id: 'chronic-pain-management',
    label: 'chronic-pain-management.csv',
    path: '/knowledge-assets/chronic-pain-management.csv',
    defaultCategory: 'pain_ortho',
    defaultLanguage: 'en',
  },
  {
    id: 'digestive-disorders',
    label: 'digestive-disorders.csv',
    path: '/knowledge-assets/digestive-disorders.csv',
    defaultCategory: 'digestive',
    defaultLanguage: 'en',
  },
  {
    id: 'immune-resilience',
    label: 'immune-resilience.csv',
    path: '/knowledge-assets/immune-resilience.csv',
    defaultCategory: 'wellness_sport',
    defaultLanguage: 'en',
  },
  {
    id: 'mental-health-tcm',
    label: 'mental-health-tcm.csv',
    path: '/knowledge-assets/mental-health-tcm.csv',
    defaultCategory: 'anxiety_mental',
    defaultLanguage: 'en',
  },
  {
    id: 'pediatric-acupuncture',
    label: 'pediatric-acupuncture.csv',
    path: '/knowledge-assets/pediatric-acupuncture.csv',
    defaultCategory: 'pediatrics',
    defaultLanguage: 'en',
  },
  {
    id: 'sport-performance-recovery',
    label: 'sport-performance-recovery.csv',
    path: '/knowledge-assets/sport-performance-recovery.csv',
    defaultCategory: 'wellness_sport',
    defaultLanguage: 'en',
  },
  {
    id: 'womens-health-tcm',
    label: 'womens-health-tcm.csv',
    path: '/knowledge-assets/womens-health-tcm.csv',
    defaultCategory: 'womens_health',
    defaultLanguage: 'en',
  },
  {
    id: 'work-stress-burnout',
    label: 'work-stress-burnout.csv',
    path: '/knowledge-assets/work-stress-burnout.csv',
    defaultCategory: 'anxiety_mental',
    defaultLanguage: 'en',
  },
  {
    id: 'extreme-weather-climate',
    label: 'extreme-weather-climate.csv',
    path: '/knowledge-assets/extreme-weather-climate.csv',
    defaultCategory: 'general_health',
    defaultLanguage: 'en',
  },
  {
    id: 'nine-constitutions-qa',
    label: 'nine-constitutions-qa.csv',
    path: '/knowledge-assets/nine-constitutions-qa.csv',
    defaultCategory: 'tcm_theory',
    defaultLanguage: 'en',
  },
] as const;

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
  alreadyIndexed?: boolean;
  existingDocument?: {
    id: string;
    original_name: string;
    created_at: string;
    indexed_at: string | null;
    status: string;
    row_count: number | null;
  };
}

export default function KnowledgeRegistry() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [generatingReport, setGeneratingReport] = useState(false);
  const [report, setReport] = useState<LegalReport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Built-in asset import (one file at a time)
  const [builtInAssetId, setBuiltInAssetId] = useState<(typeof BUILTIN_ASSETS)[number]['id']>('tongue-diagnosis');
  const [builtInCategory, setBuiltInCategory] = useState<string>(BUILTIN_ASSETS[0].defaultCategory);
  const [builtInLanguage, setBuiltInLanguage] = useState<string>(BUILTIN_ASSETS[0].defaultLanguage);
  const [isImportingBuiltIn, setIsImportingBuiltIn] = useState(false);

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

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

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
${'='.repeat(80)}
Report Version: ${report.reportVersion || '1.0'}
Generated: ${new Date(report.generatedAt).toLocaleString()}
Generated By: ${report.generatedBy}

SUMMARY
-------
Total Documents: ${report.summary.totalDocuments}
Indexed Documents: ${report.summary.totalIndexedDocuments}
Total Knowledge Entries: ${report.summary.totalKnowledgeEntries}
Data Sources: ${report.summary.dataSourcesCertified}
External Sources: ${report.summary.externalDataSources}
Public Domain: ${report.summary.publicDomainContent}

${report.lineItemSummary || ''}

DETAILED DOCUMENT MANIFEST
--------------------------
${report.documentManifest.map((doc: any) => `
#${String(doc.lineNumber || 0).padStart(2, '0')} ${doc.fileName}
    Category: ${doc.category || 'N/A'}
    Language: ${doc.language || 'N/A'}
    Rows: ${doc.rowCount || 0}
    Chunks Indexed: ${doc.chunksIndexed}
    File Hash: ${doc.fileHash}
    Status: ${doc.status}
    Uploaded: ${doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : 'N/A'}
    Indexed: ${doc.indexedAt ? new Date(doc.indexedAt).toLocaleString() : 'N/A'}
`).join('\n')}

TECHNICAL CERTIFICATION
-----------------------
System: ${report.technicalCertification?.systemArchitecture || 'RAG System'}
AI Model: ${report.technicalCertification?.aiModel || 'N/A'}
Data Isolation: ${report.technicalCertification?.dataIsolation || 'N/A'}
Source Tracing: ${report.technicalCertification?.sourceTracing || 'N/A'}

LEGAL DECLARATION
-----------------
${report.legalDeclaration.declarationText}

${report.verificationInstructions || ''}
    `;
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TCM_Knowledge_Base_Legal_Report_${format(new Date(), 'yyyy-MM-dd')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.length > 1) {
      toast.error('Please import 1 CSV file at a time.');
    }

    const file = files[0];

    if (isProcessingRef.current) {
      toast.error('An import is already running. Please wait for it to finish.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (!file.name.endsWith('.csv')) {
      toast.error(`${file.name} is not a CSV file`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const text = await file.text();
    const parsed = parseCSV(text);

    if (parsed.rows.length === 0) {
      toast.error(`${file.name} has no data rows`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
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

    const newItem: QueueItem = {
      id: crypto.randomUUID(),
      file,
      category,
      language,
      parsed,
      status: 'pending',
    };

    // Enforce one-at-a-time: replace the queue with this single file
    isProcessingRef.current = false;
    setIsProcessing(false);
    isPausedRef.current = false;
    setIsPaused(false);
    queueRef.current = [newItem];
    setQueue([newItem]);

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
        const alreadyIndexed = Boolean(result?.alreadyIndexed);
        updateQueueItem(pendingItem.id, {
          status: 'done',
          chunksCreated: result.chunksCreated,
          alreadyIndexed,
          existingDocument: result.existingDocument,
        });

        if (alreadyIndexed) {
          toast.info(`Already indexed: ${result.existingDocument?.original_name || pendingItem.file.name}`);
        }
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

  const importBuiltInAsset = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      toast.error('Please sign in to import knowledge.');
      navigate('/auth');
      return;
    }

    const asset = BUILTIN_ASSETS.find(a => a.id === builtInAssetId);
    if (!asset) {
      toast.error('Unknown built-in file');
      return;
    }

    setIsImportingBuiltIn(true);
    try {
      const res = await fetch(asset.path, { cache: 'no-cache' });
      if (!res.ok) {
        throw new Error(`Failed to load ${asset.label}`);
      }

      const text = await res.text();
      const parsed = parseCSV(text);
      if (parsed.rows.length === 0) {
        throw new Error('CSV has no data rows');
      }

      const file = new File([text], asset.label, { type: 'text/csv' });
      const item: QueueItem = {
        id: crypto.randomUUID(),
        file,
        category: builtInCategory || asset.defaultCategory,
        language: builtInLanguage || asset.defaultLanguage,
        parsed,
        status: 'pending',
      };

      // Enforce one-at-a-time: replace the queue with this single file and start immediately
      isProcessingRef.current = false;
      setIsProcessing(false);
      isPausedRef.current = false;
      setIsPaused(false);
      queueRef.current = [item];
      setQueue([item]);

      // Run immediately (queueRef is already updated)
      setTimeout(() => processQueue(), 0);
      toast.success(`Import started: ${asset.label}`);
    } catch (err: any) {
      console.error('Built-in import error:', err);
      toast.error(err?.message || 'Failed to import built-in file');
    } finally {
      setIsImportingBuiltIn(false);
    }
  }, [authLoading, user, navigate, builtInAssetId, builtInCategory, builtInLanguage, processQueue]);

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
        if (item.alreadyIndexed) {
          return (
            <Badge variant="secondary">
              <CheckCircle className="w-3 h-3 mr-1" /> Already indexed
            </Badge>
          );
        }
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" /> Done ({item.chunksCreated} chunks)
          </Badge>
        );
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
      {/* Header with Navigation and Language Switcher */}
      <div className="flex items-center justify-between mb-4">
        {/* Animated Back to Dashboard */}
        <Link
          to="/dashboard"
          className="group inline-flex items-center gap-2 text-sm font-medium py-1.5 px-3 rounded-lg
                     bg-gradient-to-r from-jade-600/10 to-jade-500/5
                     text-jade-700 dark:text-jade-300
                     hover:from-jade-600/20 hover:to-jade-500/10
                     transition-all duration-300 hover:-translate-x-1"
        >
          <ArrowLeft className="h-4 w-4 animate-pulse-arrow" />
          <span className="animate-bounce-subtle">🏠</span>
          Dashboard
        </Link>
        <LanguageSwitcher variant="ghost" isScrolled={true} />
      </div>
      
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
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-medium mb-3">Built-in knowledge files (import 1 at a time)</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:items-end">
                <div className="md:col-span-2">
                  <Select
                    value={builtInAssetId}
                    onValueChange={(v) => {
                      const asset = BUILTIN_ASSETS.find(a => a.id === v);
                      setBuiltInAssetId(v as (typeof BUILTIN_ASSETS)[number]['id']);
                      if (asset) {
                        setBuiltInCategory(asset.defaultCategory);
                        setBuiltInLanguage(asset.defaultLanguage);
                      }
                    }}
                    disabled={isProcessing || isImportingBuiltIn}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a built-in file" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUILTIN_ASSETS.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select
                    value={builtInCategory}
                    onValueChange={setBuiltInCategory}
                    disabled={isProcessing || isImportingBuiltIn}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select
                    value={builtInLanguage}
                    onValueChange={setBuiltInLanguage}
                    disabled={isProcessing || isImportingBuiltIn}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">EN</SelectItem>
                      <SelectItem value="he">HE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <Button
                  onClick={importBuiltInAsset}
                  disabled={isProcessing || isImportingBuiltIn}
                  className="gap-1"
                >
                  <Upload className="w-4 h-4" />
                  {isImportingBuiltIn ? 'Importing…' : 'Import now'}
                </Button>
              </div>
            </div>

            <div>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Select 1 CSV file. It will be queued and processed immediately.
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

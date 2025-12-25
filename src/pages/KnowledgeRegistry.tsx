import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { FileText, Download, CheckCircle, Clock, AlertCircle, Shield, Database, FileCheck, Upload, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

// Simple CSV parser
function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  
  // Parse header
  const headers = parseCSVLine(lines[0]);
  
  // Parse rows
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

interface FileToImport {
  file: File;
  category: string;
  language: string;
  parsed?: { headers: string[]; rows: Record<string, string>[] };
}

export default function KnowledgeRegistry() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [generatingReport, setGeneratingReport] = useState(false);
  const [report, setReport] = useState<LegalReport | null>(null);
  const [filesToImport, setFilesToImport] = useState<FileToImport[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const newFiles: FileToImport[] = [];
    
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
      
      // Auto-detect category from filename
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
      
      // Auto-detect language
      let language = 'en';
      if (lowerName.includes('hebrew') || lowerName.includes('_he')) {
        language = 'he';
      }
      
      newFiles.push({
        file,
        category,
        language,
        parsed
      });
    }
    
    setFilesToImport(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateFileSettings = (index: number, field: 'category' | 'language', value: string) => {
    setFilesToImport(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeFile = (index: number) => {
    setFilesToImport(prev => prev.filter((_, i) => i !== index));
  };

  const importAllFiles = async () => {
    if (filesToImport.length === 0) return;
    
    setImporting(true);
    setImportProgress(0);
    
    const documents = filesToImport.map(f => ({
      fileName: f.file.name,
      category: f.category,
      language: f.language,
      content: f.parsed?.rows || [],
      rows: f.parsed?.rows || []
    }));
    
    try {
      const { data, error } = await supabase.functions.invoke('import-knowledge', {
        body: { documents }
      });
      
      if (error) throw error;
      
      const results = data.results || [];
      const successCount = results.filter((r: any) => r.success).length;
      const failCount = results.filter((r: any) => !r.success).length;
      
      if (successCount > 0) {
        toast.success(`Imported ${successCount} files successfully!`);
      }
      if (failCount > 0) {
        const failedFiles = results.filter((r: any) => !r.success).map((r: any) => `${r.fileName}: ${r.error}`);
        toast.error(`Failed to import ${failCount} files: ${failedFiles.join(', ')}`);
      }
      
      setFilesToImport([]);
      queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-chunks-stats'] });
      
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import files');
    } finally {
      setImporting(false);
      setImportProgress(100);
    }
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

  const indexedCount = documents?.filter(d => d.status === 'indexed').length || 0;
  const totalDocs = documents?.length || 0;

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

      {/* File Upload Section */}
      <Card className="mb-8 border-dashed border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Knowledge Files
          </CardTitle>
          <CardDescription>
            Upload CSV files to add to the knowledge base. Supports Q&A format with various column names.
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
                Select multiple CSV files. Columns like Question/Answer, patient_question/clinic_answer will be auto-detected.
              </p>
            </div>

            {filesToImport.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Files to Import ({filesToImport.length})</h4>
                {filesToImport.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <FileText className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {file.parsed?.rows.length || 0} rows
                      </p>
                    </div>
                    <Select value={file.category} onValueChange={(v) => updateFileSettings(index, 'category', v)}>
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
                    <Select value={file.language} onValueChange={(v) => updateFileSettings(index, 'language', v)}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">EN</SelectItem>
                        <SelectItem value="he">HE</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => removeFile(index)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                
                {importing && (
                  <Progress value={importProgress} className="w-full" />
                )}
                
                <div className="flex gap-2">
                  <Button onClick={importAllFiles} disabled={importing} className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {importing ? 'Importing...' : `Import ${filesToImport.length} Files`}
                  </Button>
                  <Button variant="outline" onClick={() => setFilesToImport([])} disabled={importing}>
                    Clear All
                  </Button>
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

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { FileText, Download, CheckCircle, Clock, AlertCircle, Shield, Database, FileCheck } from 'lucide-react';
import { format } from 'date-fns';

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

export default function KnowledgeRegistry() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [generatingReport, setGeneratingReport] = useState(false);
  const [report, setReport] = useState<LegalReport | null>(null);

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

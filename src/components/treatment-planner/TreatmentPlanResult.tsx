import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardList, FileText, Database, Sparkles, Leaf, User, History, Download, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { TTSButton } from '@/components/audio/TTSButton';

interface Source {
  fileName: string;
  chunkIndex: number;
  preview: string;
  category: string;
}

interface Metadata {
  chunksSearched: number;
  pointsReferenced: number;
  herbsReferenced: number;
  conditionsChecked: number;
  previousVisits: number;
}

interface TreatmentPlanResultProps {
  treatmentPlan: string;
  sources: Source[];
  metadata: Metadata;
  patientName?: string | null;
}

export function TreatmentPlanResult({ treatmentPlan, sources, metadata, patientName }: TreatmentPlanResultProps) {
  
  const handleCopy = () => {
    navigator.clipboard.writeText(treatmentPlan);
    toast.success('Treatment plan copied to clipboard');
  };

  const handleDownload = () => {
    const blob = new Blob([treatmentPlan], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `treatment-plan-${patientName || 'patient'}-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Treatment plan downloaded');
  };

  return (
    <div className="space-y-4">
      {/* Patient Header (if linked) */}
      {patientName && (
        <Card className="bg-jade/5 border-jade/20">
          <CardContent className="py-3 flex items-center gap-3">
            <User className="h-5 w-5 text-jade" />
            <div>
              <span className="text-sm font-medium">Treatment Plan for:</span>
              <span className="ml-2 text-jade font-semibold">{patientName}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Treatment Plan Card */}
      <Card className="border-jade/20">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-jade" />
            AI Treatment Protocol
            <Sparkles className="h-4 w-4 text-gold" />
          </CardTitle>
          <div className="flex gap-2">
            <TTSButton 
              text={treatmentPlan} 
              title="Treatment Plan" 
              size="sm" 
              variant="outline"
              showLabel
              label="Listen"
            />
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[600px] pr-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-lg font-semibold mt-6 mb-3 text-foreground flex items-center gap-2 border-b border-border/50 pb-2">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-medium mt-4 mb-2 text-foreground">
                      {children}
                    </h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm">{children}</li>
                  ),
                  p: ({ children }) => (
                    <p className="text-sm text-muted-foreground mb-3">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-foreground font-semibold">{children}</strong>
                  ),
                  code: ({ children }) => (
                    <code className="px-1.5 py-0.5 rounded bg-jade/10 text-jade text-xs font-mono">
                      {children}
                    </code>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-jade/50 pl-4 italic text-muted-foreground my-3">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {treatmentPlan}
              </ReactMarkdown>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Metadata Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="bg-muted/30">
          <CardContent className="pt-4 text-center">
            <Database className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <div className="text-xl font-bold">{metadata.chunksSearched}</div>
            <div className="text-xs text-muted-foreground">Knowledge</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="pt-4 text-center">
            <Sparkles className="h-5 w-5 mx-auto mb-1 text-jade" />
            <div className="text-xl font-bold">{metadata.pointsReferenced}</div>
            <div className="text-xs text-muted-foreground">Points</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="pt-4 text-center">
            <Leaf className="h-5 w-5 mx-auto mb-1 text-green-500" />
            <div className="text-xl font-bold">{metadata.herbsReferenced}</div>
            <div className="text-xs text-muted-foreground">Herbs</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="pt-4 text-center">
            <FileText className="h-5 w-5 mx-auto mb-1 text-orange-500" />
            <div className="text-xl font-bold">{metadata.conditionsChecked}</div>
            <div className="text-xs text-muted-foreground">Conditions</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="pt-4 text-center">
            <History className="h-5 w-5 mx-auto mb-1 text-purple-500" />
            <div className="text-xl font-bold">{metadata.previousVisits}</div>
            <div className="text-xs text-muted-foreground">Past Visits</div>
          </CardContent>
        </Card>
      </div>

      {/* Sources */}
      {sources.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Knowledge Sources ({sources.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {sources.map((source, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {source.fileName.length > 25 
                    ? source.fileName.substring(0, 25) + '...' 
                    : source.fileName}
                  #{source.chunkIndex}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

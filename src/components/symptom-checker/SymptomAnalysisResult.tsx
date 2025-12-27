import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Brain, FileText, Database, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { TTSButton } from '@/components/audio/TTSButton';

interface Source {
  fileName: string;
  chunkIndex: number;
  preview: string;
  category: string;
}

interface Metadata {
  chunksSearched: number;
  patternsFound: number;
  pointsReferenced: number;
  conditionsChecked: number;
}

interface SymptomAnalysisResultProps {
  analysis: string;
  sources: Source[];
  metadata: Metadata;
}

export function SymptomAnalysisResult({ analysis, sources, metadata }: SymptomAnalysisResultProps) {
  return (
    <div className="space-y-4">
      {/* Analysis Card */}
      <Card className="border-jade/20">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-jade" />
            AI Pattern Analysis
            <Sparkles className="h-4 w-4 text-gold" />
          </CardTitle>
          <TTSButton 
            text={analysis} 
            title="Symptom Analysis" 
            size="sm" 
            variant="outline"
            showLabel
            label="Listen"
          />
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[500px] pr-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-lg font-semibold mt-4 mb-2 text-foreground flex items-center gap-2">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-medium mt-3 mb-1 text-foreground">
                      {children}
                    </h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm">{children}</li>
                  ),
                  p: ({ children }) => (
                    <p className="text-sm text-muted-foreground mb-2">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-foreground font-semibold">{children}</strong>
                  ),
                  code: ({ children }) => (
                    <code className="px-1.5 py-0.5 rounded bg-jade/10 text-jade text-xs font-mono">
                      {children}
                    </code>
                  ),
                }}
              >
                {analysis}
              </ReactMarkdown>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Metadata Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-muted/30">
          <CardContent className="pt-4 text-center">
            <Database className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <div className="text-2xl font-bold">{metadata.chunksSearched}</div>
            <div className="text-xs text-muted-foreground">Knowledge Chunks</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="pt-4 text-center">
            <Brain className="h-5 w-5 mx-auto mb-1 text-purple-500" />
            <div className="text-2xl font-bold">{metadata.patternsFound}</div>
            <div className="text-xs text-muted-foreground">Patterns Found</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="pt-4 text-center">
            <Sparkles className="h-5 w-5 mx-auto mb-1 text-jade" />
            <div className="text-2xl font-bold">{metadata.pointsReferenced}</div>
            <div className="text-xs text-muted-foreground">Acu Points</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="pt-4 text-center">
            <FileText className="h-5 w-5 mx-auto mb-1 text-orange-500" />
            <div className="text-2xl font-bold">{metadata.conditionsChecked}</div>
            <div className="text-xs text-muted-foreground">Conditions</div>
          </CardContent>
        </Card>
      </div>

      {/* Sources */}
      {sources.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Knowledge Sources Used ({sources.length})
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

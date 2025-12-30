import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Search, Database, Brain, CheckCircle2, AlertTriangle, 
  XCircle, Clock, FileText, Eye, EyeOff, ChevronDown, ChevronUp,
  Zap, Shield, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';

export interface TraceStep {
  id: string;
  step: number;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  startTime?: number;
  endTime?: number;
  details?: string;
  data?: any;
}

export interface ChunkMatch {
  id: string;
  fileName: string;
  chunkIndex: number;
  content: string;
  question?: string;
  answer?: string;
  relevanceScore?: number;
}

export interface HallucinationCheck {
  passed: boolean;
  citedSources: string[];
  uncitedClaims: string[];
  confidence: number;
  warnings: string[];
}

interface AITracePanelProps {
  isVisible: boolean;
  steps: TraceStep[];
  contextChunks: ChunkMatch[];
  hallucinationCheck?: HallucinationCheck;
  searchTerms?: string;
  aiResponse?: string;
  isExternal?: boolean;
}

export function AITracePanel({
  isVisible,
  steps,
  contextChunks,
  hallucinationCheck,
  searchTerms,
  aiResponse,
  isExternal
}: AITracePanelProps) {
  const [showContext, setShowContext] = useState(false);
  const [expandedChunk, setExpandedChunk] = useState<string | null>(null);

  if (!isVisible) return null;

  const getStepIcon = (step: TraceStep) => {
    switch (step.status) {
      case 'pending': return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'running': return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStepDuration = (step: TraceStep) => {
    if (step.startTime && step.endTime) {
      return `${step.endTime - step.startTime}ms`;
    }
    return null;
  };

  const totalDuration = steps.reduce((acc, step) => {
    if (step.startTime && step.endTime) {
      return acc + (step.endTime - step.startTime);
    }
    return acc;
  }, 0);

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span>AI Process Trace</span>
            {isExternal && (
              <Badge variant="outline" className="text-amber-600 border-amber-500/30 text-xs">
                External AI
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Total: {totalDuration}ms</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step-by-Step Trace */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Processing Steps
          </h4>
          <div className="space-y-1">
            {steps.map((step, idx) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                  step.status === 'running' ? 'bg-blue-500/10 border border-blue-500/30' :
                  step.status === 'completed' ? 'bg-green-500/5' :
                  step.status === 'error' ? 'bg-red-500/10' : 'bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  {getStepIcon(step)}
                  <span className="font-medium">{step.step}. {step.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {step.details && (
                    <span className="text-muted-foreground">{step.details}</span>
                  )}
                  {getStepDuration(step) && (
                    <Badge variant="secondary" className="text-[10px]">
                      {getStepDuration(step)}
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Search Terms Used */}
        {searchTerms && (
          <div className="p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-xs mb-1">
              <Search className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Search Terms:</span>
            </div>
            <code className="text-xs font-mono bg-background px-2 py-1 rounded block">
              {searchTerms}
            </code>
          </div>
        )}

        {/* Context Chunks Viewer */}
        <Collapsible open={showContext} onOpenChange={setShowContext}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-between text-xs">
              <div className="flex items-center gap-2">
                {showContext ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>View Context Sent to AI ({contextChunks.length} chunks)</span>
              </div>
              {showContext ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <ScrollArea className="h-[200px] rounded-lg border bg-background p-2">
              {contextChunks.length === 0 ? (
                <div className="text-center text-muted-foreground text-xs py-4">
                  No context chunks matched
                </div>
              ) : (
                <div className="space-y-2">
                  {contextChunks.map((chunk, idx) => (
                    <Collapsible
                      key={chunk.id}
                      open={expandedChunk === chunk.id}
                      onOpenChange={(open) => setExpandedChunk(open ? chunk.id : null)}
                    >
                      <CollapsibleTrigger asChild>
                        <div className="p-2 bg-muted/30 rounded cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="w-3 h-3 text-primary" />
                              <span className="text-xs font-medium">{chunk.fileName}</span>
                              <Badge variant="secondary" className="text-[10px]">
                                #{chunk.chunkIndex}
                              </Badge>
                            </div>
                            <ChevronDown className={`w-3 h-3 transition-transform ${expandedChunk === chunk.id ? 'rotate-180' : ''}`} />
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                            {chunk.question || chunk.content.substring(0, 100)}...
                          </p>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-1 p-2 bg-background border rounded text-xs">
                        {chunk.question && (
                          <div className="mb-2">
                            <span className="font-medium text-primary">Q: </span>
                            {chunk.question}
                          </div>
                        )}
                        {chunk.answer && (
                          <div className="mb-2">
                            <span className="font-medium text-green-600">A: </span>
                            {chunk.answer}
                          </div>
                        )}
                        {!chunk.question && !chunk.answer && (
                          <div className="whitespace-pre-wrap">{chunk.content}</div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>

        {/* Hallucination Check */}
        {hallucinationCheck && (
          <div className={`p-3 rounded-lg border ${
            hallucinationCheck.passed 
              ? 'bg-green-500/5 border-green-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className={`w-4 h-4 ${hallucinationCheck.passed ? 'text-green-600' : 'text-red-600'}`} />
                <span className="text-xs font-semibold">
                  Hallucination Check
                </span>
              </div>
              <Badge 
                variant={hallucinationCheck.passed ? 'outline' : 'destructive'}
                className={hallucinationCheck.passed ? 'text-green-600 border-green-500/30' : ''}
              >
                {hallucinationCheck.passed ? 'PASSED' : 'WARNING'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {/* Confidence Score */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-20">Confidence:</span>
                <Progress value={hallucinationCheck.confidence} className="h-2 flex-1" />
                <span className="text-[10px] font-medium">{hallucinationCheck.confidence}%</span>
              </div>

              {/* Cited Sources */}
              {hallucinationCheck.citedSources.length > 0 && (
                <div>
                  <span className="text-[10px] text-muted-foreground">Cited Sources:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {hallucinationCheck.citedSources.map((source, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">
                        <CheckCircle2 className="w-2 h-2 mr-1 text-green-500" />
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {hallucinationCheck.warnings.length > 0 && (
                <div className="mt-2 space-y-1">
                  {hallucinationCheck.warnings.map((warning, i) => (
                    <div key={i} className="flex items-start gap-1 text-[10px] text-amber-600">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Uncited Claims */}
              {hallucinationCheck.uncitedClaims.length > 0 && (
                <div className="mt-2">
                  <span className="text-[10px] text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Potential Uncited Claims:
                  </span>
                  <ul className="text-[10px] text-muted-foreground mt-1 list-disc list-inside">
                    {hallucinationCheck.uncitedClaims.map((claim, i) => (
                      <li key={i}>{claim}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to detect potential hallucinations
export function analyzeHallucination(
  response: string,
  contextChunks: ChunkMatch[],
  isExternal: boolean
): HallucinationCheck {
  if (isExternal) {
    return {
      passed: false,
      citedSources: [],
      uncitedClaims: ['Using external AI - not from proprietary knowledge base'],
      confidence: 0,
      warnings: ['Response from external AI is not verified against Dr. Sapir\'s materials']
    };
  }

  const warnings: string[] = [];
  const citedSources: string[] = [];
  const uncitedClaims: string[] = [];

  // Check for source citations in response
  const sourcePattern = /\[Source:\s*([^\]]+)\]/gi;
  const citationMatches = response.matchAll(sourcePattern);
  for (const match of citationMatches) {
    citedSources.push(match[1].trim());
  }

  // Check if response has citations when context was provided
  if (contextChunks.length > 0 && citedSources.length === 0) {
    warnings.push('Response does not include source citations despite matching chunks');
  }

  // Check for phrases that might indicate made-up content
  const suspiciousPhrases = [
    'I believe',
    'In my opinion',
    'Generally speaking',
    'It is commonly known',
    'Studies show',
    'Research indicates',
    'According to experts'
  ];

  for (const phrase of suspiciousPhrases) {
    if (response.toLowerCase().includes(phrase.toLowerCase())) {
      warnings.push(`Contains potentially unverified phrase: "${phrase}"`);
    }
  }

  // Check if "not found" message but still provides detailed answer
  if (response.includes("don't have information") && response.length > 200) {
    warnings.push('Claims no information but provides detailed response');
  }

  // Calculate confidence based on citation ratio and context match
  let confidence = 100;
  
  if (contextChunks.length === 0) {
    confidence -= 50;
    warnings.push('No matching chunks in knowledge base');
  }
  
  if (citedSources.length === 0 && contextChunks.length > 0) {
    confidence -= 30;
  }
  
  confidence -= warnings.length * 10;
  confidence = Math.max(0, Math.min(100, confidence));

  return {
    passed: warnings.length === 0 && confidence >= 70,
    citedSources,
    uncitedClaims,
    confidence,
    warnings
  };
}

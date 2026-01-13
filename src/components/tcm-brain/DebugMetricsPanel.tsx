import { useState, useEffect, useCallback } from 'react';
import { Bug, ChevronDown, ChevronUp, Rocket, CheckCircle, XCircle, AlertTriangle, Keyboard, BookOpen, Cloud, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ConfidenceGauge } from './ConfidenceGauge';
import { toast } from 'sonner';

interface ChunkDebugInfo {
  index: number;
  sourceName: string;
  sourceId?: string;
  ferrariScore: number;
  keywordScore: number;
  questionBoost: boolean;
  included: boolean;
  reason: string;
}

interface DebugMetadata {
  tokenBudget: {
    used: number;
    max: number;
    percentage: number;
  };
  chunks: {
    found: number;
    included: number;
    dropped: number;
    budgetReached: boolean;
  };
  topChunks: ChunkDebugInfo[];
  thresholds: {
    clinicalStandard: number;
    minHighConfidence: number;
  };
}

interface DebugMetricsPanelProps {
  debugData: DebugMetadata | null;
  searchMethod?: string;
  query?: string;
  response?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DebugMetricsPanel({ 
  debugData, 
  searchMethod, 
  query, 
  response,
  isOpen: controlledIsOpen,
  onOpenChange 
}: DebugMetricsPanelProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Support both controlled and uncontrolled modes
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (value: boolean | ((prev: boolean) => boolean)) => {
    const newValue = typeof value === 'function' ? value(isOpen) : value;
    if (onOpenChange) {
      onOpenChange(newValue);
    } else {
      setInternalIsOpen(newValue);
    }
  };

  // Keyboard shortcut: Ctrl+D / Cmd+D to toggle debug panel
  // Uses capture phase to work even when focused in input boxes
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen((prev: boolean) => !prev);
    }
  }, [onOpenChange]);

  useEffect(() => {
    // Use capture phase to intercept before input elements consume the event
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [handleKeyDown]);

  if (!debugData) return null;

  const { tokenBudget, chunks, topChunks, thresholds } = debugData;
  
  // Calculate confidence from average ferrari_score of included chunks
  const includedChunks = topChunks.filter(c => c.included);
  const avgFerrariScore = includedChunks.length > 0 
    ? includedChunks.reduce((sum, c) => sum + c.ferrariScore, 0) / includedChunks.length 
    : 0;
  const confidencePercent = Math.round(avgFerrariScore * 100);
  
  // Color code confidence: >=85% Green, 70-84% Amber, <70% Red
  const confidenceColor = confidencePercent >= 85 
    ? 'text-emerald-600' 
    : confidencePercent >= 70 
      ? 'text-amber-600' 
      : 'text-destructive';
  
  const confidenceLabel = confidencePercent >= 85 
    ? 'Clinical Standard' 
    : confidencePercent >= 70 
      ? 'Moderate' 
      : 'Low Confidence';
  
  // Determine source type based on RAG hits
  const isLocalRag = chunks.found > 0;
  const sourceLabel = isLocalRag ? '📚 Local RAG' : '☁️ External AI Fallback';
  const sourceColor = isLocalRag ? 'bg-emerald-500/10 text-emerald-700 border-emerald-300' : 'bg-amber-500/10 text-amber-700 border-amber-300';
  
  // Determine budget status color
  const budgetStatus = tokenBudget.percentage >= 90 
    ? 'destructive' 
    : tokenBudget.percentage >= 70 
      ? 'warning' 
      : 'success';

  const budgetColor = budgetStatus === 'destructive' 
    ? 'bg-destructive' 
    : budgetStatus === 'warning' 
      ? 'bg-amber-500' 
      : 'bg-emerald-500';

  // Download report function
  const handleDownloadReport = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const report = {
      timestamp: new Date().toISOString(),
      query: query || 'Unknown Query',
      tokenUsage: {
        used: tokenBudget.used,
        max: tokenBudget.max,
        percentage: tokenBudget.percentage,
        estimatedTokens: Math.round(tokenBudget.used / 4)
      },
      source: isLocalRag ? 'Local RAG' : 'External AI Fallback',
      confidence: {
        percentage: confidencePercent,
        level: confidenceLabel
      },
      chunks: {
        found: chunks.found,
        included: chunks.included,
        dropped: chunks.dropped,
        budgetReached: chunks.budgetReached
      },
      topChunks: topChunks.slice(0, 5).map(chunk => ({
        index: chunk.index,
        sourceName: chunk.sourceName,
        sourceId: chunk.sourceId || 'N/A',
        ferrariScore: chunk.ferrariScore,
        keywordScore: chunk.keywordScore,
        questionBoost: chunk.questionBoost,
        included: chunk.included,
        reason: chunk.reason
      })),
      response: response || 'No response captured',
      thresholds: thresholds,
      searchMethod: searchMethod || 'hybrid'
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brain_log_${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Report downloaded', {
      description: `brain_log_${timestamp}.json`
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-t">
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="w-full flex items-center justify-between px-4 py-2 h-8 text-xs text-muted-foreground hover:text-foreground"
        >
          <div className="flex items-center gap-2">
            <Bug className="h-3 w-3" />
            <span>Debug Metrics</span>
            {chunks.dropped > 0 && (
              <Badge variant="secondary" className="h-4 text-[10px] px-1">
                {chunks.dropped} filtered
              </Badge>
            )}
            <Badge variant="outline" className="h-4 text-[10px] px-1 hidden sm:flex items-center gap-0.5">
              <Keyboard className="h-2 w-2" />
              <span>⌘D</span>
            </Badge>
          </div>
          {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="px-4 pb-3 space-y-3">
        {/* Source + Confidence Gauge Row */}
        <div className="flex items-center gap-4">
          {/* Radial Confidence Gauge */}
          {isLocalRag && includedChunks.length > 0 && (
            <ConfidenceGauge percentage={confidencePercent} size={64} strokeWidth={6} />
          )}
          
          {/* Source Indicator */}
          <div className={cn(
            "flex-1 flex items-center gap-2 px-3 py-2 rounded-md border font-medium text-sm",
            sourceColor
          )}>
            {isLocalRag ? (
              <BookOpen className="h-4 w-4" />
            ) : (
              <Cloud className="h-4 w-4" />
            )}
            <span>{sourceLabel}</span>
            
            <div className="ml-auto flex items-center gap-2">
              {isLocalRag && (
                <Badge variant="outline" className="text-[10px] bg-emerald-500/20 border-emerald-400">
                  {chunks.found} RAG hits
                </Badge>
              )}
            </div>
          </div>
          
          {/* Download Report Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadReport}
            className="flex items-center gap-1.5 text-xs h-8"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Download</span>
            <span className="sm:hidden">📥</span>
          </Button>
        </div>

        {/* Token Budget Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Token Budget</span>
            <span className={cn(
              "font-mono",
              budgetStatus === 'destructive' && 'text-destructive',
              budgetStatus === 'warning' && 'text-amber-600',
              budgetStatus === 'success' && 'text-emerald-600'
            )}>
              {tokenBudget.used.toLocaleString()} / {tokenBudget.max.toLocaleString()} chars
            </span>
          </div>
          <Progress 
            value={tokenBudget.percentage} 
            className="h-2"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>~{Math.round(tokenBudget.used / 4)} tokens used</span>
            <span>{tokenBudget.percentage}% capacity</span>
          </div>
        </div>

        {/* Chunk Summary */}
        <div className="flex items-center gap-2 text-xs">
          <Badge variant="outline" className="text-[10px]">
            {searchMethod || 'search'}
          </Badge>
          <span className="text-muted-foreground">
            {chunks.found} found → {chunks.included} included
          </span>
          {chunks.budgetReached && (
            <Badge variant="destructive" className="text-[10px]">
              <AlertTriangle className="h-2 w-2 mr-1" />
              Budget Full
            </Badge>
          )}
        </div>

        {/* Top Chunks Table */}
        <div className="space-y-1">
          <div className="text-xs font-medium flex items-center gap-1">
            Top Chunks 
            <span className="text-muted-foreground font-normal">
              (threshold: {thresholds.clinicalStandard})
            </span>
          </div>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-[10px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-2 py-1 font-medium">#</th>
                  <th className="text-left px-2 py-1 font-medium">Source</th>
                  <th className="text-right px-2 py-1 font-medium">Ferrari</th>
                  <th className="text-center px-2 py-1 font-medium">Boost</th>
                  <th className="text-center px-2 py-1 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {topChunks.slice(0, 5).map((chunk, i) => (
                  <tr 
                    key={i} 
                    className={cn(
                      "border-t",
                      !chunk.included && "opacity-50 bg-muted/30"
                    )}
                  >
                    <td className="px-2 py-1 text-muted-foreground">{chunk.index}</td>
                    <td className="px-2 py-1 truncate max-w-[100px]" title={chunk.sourceName}>
                      {chunk.sourceName}
                    </td>
                    <td className="px-2 py-1 text-right font-mono">
                      <span className={cn(
                        chunk.ferrariScore >= thresholds.clinicalStandard && "text-emerald-600 font-medium",
                        chunk.ferrariScore < thresholds.clinicalStandard && chunk.index > thresholds.minHighConfidence && "text-amber-600"
                      )}>
                        {chunk.ferrariScore.toFixed(3)}
                      </span>
                    </td>
                    <td className="px-2 py-1 text-center">
                      {chunk.questionBoost && (
                        <span title="Question Boost 1.5x">
                          <Rocket className="h-3 w-3 text-amber-500 inline" />
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {chunk.included ? (
                        <CheckCircle className="h-3 w-3 text-emerald-500 inline" />
                      ) : (
                        <span title={chunk.reason}>
                          <XCircle className="h-3 w-3 text-destructive inline" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <Rocket className="h-3 w-3 text-amber-500" />
            <span>Question Boost (1.5x)</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-emerald-500" />
            <span>Included</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="h-3 w-3 text-destructive" />
            <span>Filtered</span>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
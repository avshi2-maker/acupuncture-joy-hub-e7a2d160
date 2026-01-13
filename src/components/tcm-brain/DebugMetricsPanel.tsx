import { useState, useEffect, useCallback } from 'react';
import { Bug, ChevronDown, ChevronUp, Rocket, CheckCircle, XCircle, AlertTriangle, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ChunkDebugInfo {
  index: number;
  sourceName: string;
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
}

export function DebugMetricsPanel({ debugData, searchMethod }: DebugMetricsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Keyboard shortcut: Ctrl+D / Cmd+D to toggle debug panel
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      setIsOpen(prev => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!debugData) return null;

  const { tokenBudget, chunks, topChunks, thresholds } = debugData;
  
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
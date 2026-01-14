import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuickPromptDropdown } from '@/components/tcm-brain/QuickPromptDropdown';
import { BodyMapCore } from '@/components/session/BodyMapCore';
import { RagSearchPanel } from '@/components/session/RagSearchPanel';
import { AiStatus } from '@/components/ui/AiStatus';
import { PromptMapping } from '@/data/tcm-prompt-mapping';
import { Message } from '@/hooks/useTcmBrainState';
import { cn } from '@/lib/utils';

interface IntelligenceHubProps {
  stackedQueries: PromptMapping[];
  onRemoveFromStack: (mappingId: string) => void;
  onClearStack: () => void;
  onExecuteSynthesis: () => void;
  isAnalyzing: boolean;
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onClear: () => void;
  highlightedPoints?: string[];
  onViewBodyMap?: (points: string[]) => void;
  externalInput?: string;
  onExternalInputHandled?: () => void;
  onQuestionSelect?: (question: string) => void;
}

export function IntelligenceHub({
  stackedQueries,
  onRemoveFromStack,
  onClearStack,
  onExecuteSynthesis,
  isAnalyzing,
  messages,
  isLoading,
  onSendMessage,
  onClear,
  highlightedPoints = [],
  onViewBodyMap,
  externalInput,
  onExternalInputHandled,
  onQuestionSelect
}: IntelligenceHubProps) {
  const [selectedQuestion, setSelectedQuestion] = useState('');

  useEffect(() => {
    if (!externalInput) return;
    setSelectedQuestion(externalInput);
    onExternalInputHandled?.();
  }, [externalInput, onExternalInputHandled]);

  const handleQuestionSelect = (question: string) => {
    setSelectedQuestion(question);
    onQuestionSelect?.(question);
  };

  const hasStackedQueries = stackedQueries.length > 0;

  return (
    <div className="h-[calc(100vh-4rem)] w-full bg-slate-50 flex flex-col overflow-hidden">
      {/* STACKING BAR (Top) - Shows stacked queries only, execute button is in header */}
      <AnimatePresence>
        {hasStackedQueries && (
          <motion.div
            id="stack-display"
            data-teleprompter="stack-display"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mx-4 mt-4 border rounded-xl bg-gradient-to-r from-violet-500/10 via-jade/5 to-amber-500/10 shrink-0"
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-violet-600" />
                  <span className="text-sm font-bold text-violet-700">
                    שאילתות נערמות ({stackedQueries.length})
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClearStack}
                  className="h-7 text-xs text-muted-foreground"
                >
                  נקה הכל
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                {stackedQueries.map((q, index) => (
                  <Badge
                    key={q.id}
                    variant="secondary"
                    className={cn(
                      "gap-1 pl-2 pr-1 py-1 bg-background/80 hover:bg-destructive/10 cursor-pointer group transition-all",
                      isAnalyzing && "animate-pulse border-2 border-violet-400"
                    )}
                    onClick={() => !isAnalyzing && onRemoveFromStack(q.id)}
                  >
                    {isAnalyzing ? (
                      <Loader2 className="h-3 w-3 animate-spin text-violet-600" />
                    ) : (
                      <span className="text-base">{q.icon}</span>
                    )}
                    <span className="text-[10px] max-w-[80px] truncate" dir="rtl">
                      {q.hebrewLabel}
                    </span>
                    {!isAnalyzing && (
                      <span className="text-[10px] text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-3 w-3" />
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3-COLUMN FLEXBOX - RTL Safe */}
      <div className="flex flex-1 min-h-0 gap-4 p-4">
        
        {/* COLUMN 1: Library (START side - Right in RTL) */}
        <aside className="w-80 min-w-[320px] shrink-0 flex flex-col bg-white rounded-xl shadow-sm border-s border-slate-200 overflow-hidden order-first">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              📚 Clinical Library
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <QuickPromptDropdown onSelectQuestion={handleQuestionSelect} />
          </div>
          <div className="p-4 border-t border-slate-100 mt-auto">
            <AiStatus />
          </div>
        </aside>

        {/* COLUMN 2: Main Search (CENTER - Fluid) */}
        <main className="flex-1 min-w-[500px] flex flex-col bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
          <RagSearchPanel />
        </main>

        {/* COLUMN 3: Body Map (END side - Left in RTL) */}
        <aside className="w-96 min-w-[380px] shrink-0 flex flex-col bg-white rounded-xl shadow-sm border-e border-slate-200 overflow-hidden order-last">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              📍 Body Reference
              {highlightedPoints.length > 0 && (
                <Badge variant="secondary" className="text-xs ms-2">
                  {highlightedPoints.length} נקודות
                </Badge>
              )}
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <BodyMapCore 
              className="w-full"
              onPointSelect={(point) => console.log('Point selected:', point)}
            />
          </div>
          
          {highlightedPoints.length > 0 && (
            <div className="p-4 border-t border-slate-200 shrink-0">
              <p className="text-xs font-medium text-slate-500 mb-2">Active Points:</p>
              <div className="flex flex-wrap gap-1">
                {highlightedPoints.map((point) => (
                  <Badge 
                    key={point} 
                    className="bg-jade/20 text-jade border-jade/30 text-xs"
                  >
                    {point}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

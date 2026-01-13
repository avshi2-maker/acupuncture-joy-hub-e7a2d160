import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuickPromptDropdown } from '@/components/tcm-brain/QuickPromptDropdown';
import { BodyMapCore } from '@/components/session/BodyMapCore';
import { RagSearchPanel } from '@/components/session/RagSearchPanel';
import { AiStatus } from '@/components/ui/AiStatus';
import { PromptMapping } from '@/data/tcm-prompt-mapping';
import { Message } from '@/hooks/useTcmBrainState';

interface IntelligenceHubProps {
  // Stacked queries
  stackedQueries: PromptMapping[];
  onRemoveFromStack: (mappingId: string) => void;
  onClearStack: () => void;
  onExecuteSynthesis: () => void;
  isAnalyzing: boolean;
  
  // Chat state
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onClear: () => void;
  
  // Body map state
  highlightedPoints?: string[];
  
  // Optional
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

  // Handle external input
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
    <div className="h-[calc(100vh-4rem)] w-full p-4 bg-slate-50 overflow-hidden flex flex-col">
      {/* STACKING BAR (Top) - Only shows when queries are stacked */}
      <AnimatePresence>
        {hasStackedQueries && (
          <motion.div
            id="stack-display"
            data-teleprompter="stack-display"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-4 border rounded-xl bg-gradient-to-r from-violet-500/10 via-jade/5 to-amber-500/10 shrink-0"
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-violet-600" />
                  <span className="text-sm font-bold text-violet-700">
                    שאילתות נערמות ({stackedQueries.length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onClearStack}
                    className="h-7 text-xs text-muted-foreground"
                  >
                    נקה הכל
                  </Button>
                  <Button
                    id="clinical-synthesis-btn"
                    data-teleprompter="synthesis-btn"
                    size="sm"
                    onClick={onExecuteSynthesis}
                    disabled={isAnalyzing || stackedQueries.length === 0}
                    className="h-7 bg-gradient-to-r from-violet-600 to-jade text-white gap-1"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        מעבד...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3" />
                        סינתזה קלינית
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Stacked Query Icons */}
              <div className="flex flex-wrap gap-1.5">
                {stackedQueries.map((q) => (
                  <Badge
                    key={q.id}
                    variant="secondary"
                    className="gap-1 pl-2 pr-1 py-1 bg-background/80 hover:bg-destructive/10 cursor-pointer group"
                    onClick={() => onRemoveFromStack(q.id)}
                  >
                    <span className="text-base">{q.icon}</span>
                    <span className="text-[10px] max-w-[80px] truncate" dir="rtl">
                      {q.hebrewLabel}
                    </span>
                    <span className="text-[10px] text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                      ✕
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* THE FLEXBOX FRAME: 3 Columns with Fixed Sidebars */}
      <div className="flex flex-row gap-4 flex-1 min-h-0">
        
        {/* LEFT SIDEBAR: The Library (Fixed Width 280px) */}
        <div className="w-[280px] shrink-0 flex flex-col gap-4 bg-white rounded-xl shadow-sm border border-slate-200 p-4 overflow-y-auto">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            📚 Clinical Library
          </h2>
          <QuickPromptDropdown onSelectQuestion={handleQuestionSelect} />
          <div className="mt-auto">
            <AiStatus />
          </div>
        </div>

        {/* CENTER: The Main Stage (Fluid - Takes Remaining Space) */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
            <RagSearchPanel />
          </div>
        </div>

        {/* RIGHT SIDEBAR: The Body Map (Fixed Width 300px) */}
        <div className="w-[300px] shrink-0 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 p-4 overflow-hidden">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            📍 Body Reference
            {highlightedPoints.length > 0 && (
              <Badge variant="secondary" className="text-xs ml-2">
                {highlightedPoints.length} נקודות
              </Badge>
            )}
          </h2>
          
          {/* Body Map Container */}
          <div className="flex-1 relative min-h-0 overflow-hidden">
            <BodyMapCore 
              className="w-full h-full"
              onPointSelect={(point) => console.log('Point selected:', point)}
            />
          </div>
          
          {/* Highlighted Points Display */}
          {highlightedPoints.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200 shrink-0">
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
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Loader2, Trash2, Send, BookOpen, Map } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BrowserVoiceInput } from '@/components/ui/BrowserVoiceInput';
import { AIResponseDisplay } from '@/components/tcm/AIResponseDisplay';
import { PromptMapping } from '@/data/tcm-prompt-mapping';
import { Message } from '@/hooks/useTcmBrainState';
import { QuickPromptDropdown } from '@/components/tcm-brain/QuickPromptDropdown';
import { BodyMapCore } from '@/components/session/BodyMapCore';

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
  const [input, setInput] = useState('');
  const [voiceLanguage, setVoiceLanguage] = useState<'en-US' | 'he-IL'>('he-IL');

  // Handle external input
  useEffect(() => {
    if (!externalInput) return;
    setInput(externalInput);
    onExternalInputHandled?.();
  }, [externalInput, onExternalInputHandled]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      window.dispatchEvent(new CustomEvent('tcm-query-start', { 
        detail: { query: input.trim() } 
      }));
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleQuestionSelect = (question: string) => {
    setInput(question);
    onQuestionSelect?.(question);
  };

  const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop();
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  const hasStackedQueries = stackedQueries.length > 0;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* SECTION 1: Stacking Bar (Top) */}
      <AnimatePresence>
        {hasStackedQueries && (
          <motion.div
            id="stack-display"
            data-teleprompter="stack-display"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b bg-gradient-to-r from-violet-500/10 via-jade/5 to-amber-500/10 shrink-0"
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

      {/* SECTION 2: THREE-COLUMN GRID LAYOUT */}
      <div className="flex-1 overflow-hidden grid grid-cols-12 gap-4 p-4" dir="rtl">
        
        {/* LEFT PANEL (col-span-3): Hebrew Library */}
        <div className="col-span-12 md:col-span-3 flex flex-col gap-3 overflow-y-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-jade" />
              <h3 className="font-bold text-sm text-foreground">ספריית שאלות</h3>
            </div>
            <QuickPromptDropdown onSelectQuestion={handleQuestionSelect} />
          </div>
        </div>

        {/* CENTER PANEL (col-span-6): Main Search */}
        <div className="col-span-12 md:col-span-6 flex flex-col gap-4 overflow-hidden">
          {/* Search Input */}
          <div className="bg-white shadow-sm rounded-xl border p-4 shrink-0">
            <Textarea
              placeholder="תאר תסמינים או שאל שאלה קלינית...&#10;&#10;לדוגמה: מהן נקודות הדיקור המומלצות לכאבי ראש?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && input.trim() && !isLoading) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isLoading}
              className="min-h-[100px] resize-none bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-jade text-base leading-relaxed mb-3"
              dir="rtl"
            />
            
            {/* Action Row */}
            <div className="flex items-center justify-between gap-3">
              {/* Left: Voice + Language */}
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant={voiceLanguage === 'he-IL' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVoiceLanguage('he-IL')}
                  className="h-8 px-2 text-xs"
                  disabled={isLoading}
                >
                  עברית
                </Button>
                <Button
                  type="button"
                  variant={voiceLanguage === 'en-US' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVoiceLanguage('en-US')}
                  className="h-8 px-2 text-xs"
                  disabled={isLoading}
                >
                  EN
                </Button>
                <BrowserVoiceInput
                  onTranscription={(text) => {
                    setInput(input ? `${input} ${text}` : text);
                  }}
                  disabled={isLoading}
                  language={voiceLanguage}
                  size="sm"
                  variant="outline"
                />
              </div>
              
              {/* Right: Send + Clear */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClear}
                  disabled={messages.length === 0}
                  className={cn(
                    "gap-1 h-8 transition-colors",
                    messages.length > 0 
                      ? "text-destructive border-destructive/30 hover:bg-destructive/10" 
                      : "text-muted-foreground"
                  )}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-jade hover:bg-jade/90 text-white gap-1.5 h-8 px-4"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span className="text-xs">שלח</span>
                </Button>
              </div>
            </div>
          </div>

          {/* RAG Output Container */}
          <div 
            className="flex-1 overflow-hidden"
            style={{ minHeight: '250px' }}
          >
            <div 
              className="rag-output-container h-full"
              style={{
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 8px 32px 0 rgba(26, 95, 122, 0.15)',
                overflowY: 'auto',
                fontSize: '1rem',
                lineHeight: '1.7',
              }}
            >
              {(isLoading || messages.length > 0) ? (
                <AIResponseDisplay
                  isLoading={isLoading}
                  content={lastAssistantMessage?.content || ''}
                  query={lastUserMessage?.content || ''}
                  onViewBodyMap={onViewBodyMap || (() => {})}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium mb-1">מוכן לניתוח קליני</p>
                  <p className="text-xs">
                    בחר שאלה מהספרייה או הקלד שאלה בתיבת הקלט
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL (col-span-3): Body Map */}
        <div className="col-span-12 md:col-span-3 flex flex-col gap-3 overflow-hidden">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border shadow-sm p-3 flex-1 overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <Map className="h-5 w-5 text-jade" />
              <h3 className="font-bold text-sm text-foreground">מפת נקודות</h3>
              {highlightedPoints.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {highlightedPoints.length} נקודות
                </Badge>
              )}
            </div>
            <div className="h-[calc(100%-40px)] overflow-auto">
              <BodyMapCore 
                className="w-full"
                onPointSelect={(point) => console.log('Point selected:', point)}
              />
            </div>
            {/* Highlighted Points Display */}
            {highlightedPoints.length > 0 && (
              <div className="mt-2 pt-2 border-t">
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
    </div>
  );
}

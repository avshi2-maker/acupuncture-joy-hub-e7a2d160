import { useState, useEffect, RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Loader2, ArrowRight, Trash2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BrowserVoiceInput } from '@/components/ui/BrowserVoiceInput';
import { AIResponseDisplay } from '@/components/tcm/AIResponseDisplay';
import { QuickPromptDropdown } from '@/components/tcm-brain/QuickPromptDropdown';
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
  
  // Optional
  onViewBodyMap?: (points: string[]) => void;
  externalInput?: string;
  onExternalInputHandled?: () => void;
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
  onViewBodyMap,
  externalInput,
  onExternalInputHandled
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

      {/* SECTION 2: Main Input Box (Middle) */}
      <div className="p-4 border-b bg-card shrink-0 space-y-2">
        {/* Quick Prompt Dropdown - Database Questions */}
        <QuickPromptDropdown
          onSelectQuestion={(question) => {
            setInput(question);
          }}
          disabled={isLoading}
          placeholder="📚 שאלות מוכנות מהמאגר"
          className="w-full"
        />
        
        <div className="flex gap-2">
          <Input
            placeholder="תאר תסמינים או שאל שאלה קלינית..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && input.trim() && !isLoading) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading}
            className="flex-1"
            dir="rtl"
          />
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={voiceLanguage === 'he-IL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVoiceLanguage('he-IL')}
              className="h-10 px-2 text-xs"
              disabled={isLoading}
            >
              עב
            </Button>
            <Button
              type="button"
              variant={voiceLanguage === 'en-US' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVoiceLanguage('en-US')}
              className="h-10 px-2 text-xs"
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
              size="md"
              variant="outline"
          />
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-jade hover:bg-jade/90 text-white gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            disabled={messages.length === 0}
            className={cn(
              "gap-1.5 shrink-0 transition-colors",
              messages.length > 0 
                ? "text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive" 
                : "text-muted-foreground"
            )}
            title="Clear conversation"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">נקה</span>
          </Button>
        </div>
        
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          💡 בחר דפוסים מהעמודה הימנית או הקלד שאלה חופשית
        </p>
      </div>

      {/* SECTION 3: RAG Output Container (Bottom) - GLASSMORPHISM */}
      <div 
        className="flex-1 overflow-hidden m-4"
        style={{
          // CRITICAL: Fixed min/max height to prevent shaking
          minHeight: '300px',
          maxHeight: 'calc(100vh - 400px)',
        }}
      >
        <div 
          className="rag-output-container h-full"
          style={{
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '16px',
            padding: '25px',
            boxShadow: '0 8px 32px 0 rgba(26, 95, 122, 0.15)',
            overflowY: 'auto',
            fontSize: '1.05rem',
            lineHeight: '1.8',
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
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm font-medium mb-2">מוכן לניתוח קליני</p>
              <p className="text-xs">
                בחר דפוסים מהעמודה הימנית או הקלד שאלה בתיבת הקלט
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

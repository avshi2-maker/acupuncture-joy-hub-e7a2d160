import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles, Brain, Loader2, ChevronDown, ChevronUp, Mic, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SessionPhase } from '@/components/session/SessionPhaseIndicator';

interface RAGLiveSummaryZoneEnhancedProps {
  currentPhase: SessionPhase;
  liveTranscription?: string;
  aiSummary?: string;
  isProcessing?: boolean;
  isTranscribing?: boolean;
  highlightKeywords?: string[];
  className?: string;
}

// Phase-specific placeholder content
const PHASE_PLACEHOLDERS: Record<SessionPhase, { he: string; en: string }> = {
  opening: {
    he: 'מקשיב לתלונה העיקרית...',
    en: 'Listening for chief complaint...',
  },
  diagnosis: {
    he: 'מנתח נתוני אבחון - דופק, לשון, תבניות TCM...',
    en: 'Analyzing diagnostic data - pulse, tongue, TCM patterns...',
  },
  treatment: {
    he: 'מסכם את פרוטוקול הטיפול והנקודות שנבחרו...',
    en: 'Summarizing treatment protocol and selected points...',
  },
  closing: {
    he: 'מכין דוח סיום והמלצות להמשך...',
    en: 'Preparing closing report and follow-up recommendations...',
  },
};

// Typing effect component
function TypingText({ text, speed = 30 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const prevTextRef = useRef('');

  useEffect(() => {
    // If text changed, reset
    if (text !== prevTextRef.current) {
      // If new text starts with previous text, continue from there
      if (text.startsWith(prevTextRef.current)) {
        indexRef.current = prevTextRef.current.length;
      } else {
        indexRef.current = 0;
        setDisplayedText('');
      }
      prevTextRef.current = text;
      setIsComplete(false);
    }

    if (indexRef.current >= text.length) {
      setIsComplete(true);
      return;
    }

    const timer = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span>
      {displayedText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-2 h-4 bg-jade ml-1 align-middle"
        />
      )}
    </span>
  );
}

// Highlight keywords in text
function HighlightedText({ text, keywords }: { text: string; keywords: string[] }) {
  if (!keywords.length || !text) return <>{text}</>;

  // Create a regex pattern for all keywords (case-insensitive)
  const pattern = new RegExp(`(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, index) => {
        const isKeyword = keywords.some(k => k.toLowerCase() === part.toLowerCase());
        return isKeyword ? (
          <span 
            key={index} 
            className="font-bold text-gold bg-gold/10 px-1 rounded"
          >
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </>
  );
}

// Level 3: Wrapped in React.memo to prevent re-renders from transcription updates
function RAGLiveSummaryZoneEnhancedInner({
  currentPhase,
  liveTranscription = '',
  aiSummary = '',
  isProcessing = false,
  isTranscribing = false,
  highlightKeywords = [],
  className,
}: RAGLiveSummaryZoneEnhancedProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (scrollRef.current && aiSummary) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiSummary]);

  const placeholder = PHASE_PLACEHOLDERS[currentPhase];
  const hasContent = aiSummary.length > 0 || liveTranscription.length > 0;

  // Parse summary into bullet points
  const bulletPoints = useMemo(() => {
    if (!aiSummary) return [];
    return aiSummary
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[-•*]\s*/, '').trim());
  }, [aiSummary]);

  return (
    <motion.div
      className={cn(
        "relative rounded-xl overflow-hidden",
        // Glass UI styling
        "bg-white/60 dark:bg-card/60",
        "backdrop-blur-xl",
        "border border-jade/20 dark:border-jade/30",
        "shadow-lg shadow-jade/5",
        // Fixed height - Zero Shake Rule
        "h-[200px] flex-shrink-0",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-jade/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-jade to-jade/70 flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">AI Live Summary</h3>
            <p className="text-[10px] text-muted-foreground">סיכום בזמן אמת</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Transcription Status */}
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] px-2 py-0.5 gap-1",
              isTranscribing 
                ? "bg-jade/10 text-jade border-jade/30" 
                : "bg-muted/50 text-muted-foreground border-muted"
            )}
          >
            {isTranscribing ? (
              <>
                <Wifi className="h-3 w-3" />
                <span>מתמלל</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                <span>לא פעיל</span>
              </>
            )}
          </Badge>

          {/* Processing Status */}
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] px-2 py-0.5",
              isProcessing 
                ? "bg-gold/10 text-gold border-gold/30 animate-pulse" 
                : "bg-jade/10 text-jade border-jade/30"
            )}
          >
            {isProcessing ? 'מעבד...' : placeholder.he.split('...')[0]}
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 152, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ height: 152 }}
          >
            <ScrollArea 
              ref={scrollRef}
              className="h-[152px]"
              style={{ height: 152 }}
            >
              <div className="p-4 space-y-3">
                {/* Live transcription snippet */}
                {liveTranscription && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-muted">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <Mic className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] font-medium text-muted-foreground">תמלול חי</span>
                    </div>
                    <p className="text-sm text-foreground/80 line-clamp-2">
                      <HighlightedText 
                        text={liveTranscription.slice(-150)} 
                        keywords={highlightKeywords} 
                      />
                      ...
                    </p>
                  </div>
                )}

                {/* AI Summary with Bullet Points */}
                {hasContent ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-gold" />
                      <span className="text-xs font-semibold text-foreground">סיכום AI</span>
                    </div>
                    
                    {bulletPoints.length > 0 ? (
                      <ul className="space-y-2">
                        {bulletPoints.map((point, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-2 text-sm text-foreground/90"
                          >
                            <span className="text-jade font-bold mt-0.5">•</span>
                            <span>
                              <HighlightedText text={point} keywords={highlightKeywords} />
                            </span>
                          </motion.li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        <TypingText text={aiSummary} speed={20} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-8 w-8 text-jade animate-spin mb-3" />
                        <p className="text-sm text-muted-foreground">{placeholder.he}</p>
                      </>
                    ) : (
                      <>
                        <Brain className="h-10 w-10 text-muted-foreground/30 mb-3" />
                        <p className="text-sm text-muted-foreground font-medium">
                          ממתין לתוכן...
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {placeholder.en}
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white/80 dark:from-card/80 to-transparent pointer-events-none" />
    </motion.div>
  );
}

// Export memoized version
export const RAGLiveSummaryZoneEnhanced = memo(RAGLiveSummaryZoneEnhancedInner);

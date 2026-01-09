import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles, Brain, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SessionPhase } from '@/components/session/SessionPhaseIndicator';

interface RAGLiveSummaryZoneProps {
  currentPhase: SessionPhase;
  liveTranscription?: string;
  aiSummary?: string;
  isProcessing?: boolean;
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

export function RAGLiveSummaryZone({
  currentPhase,
  liveTranscription = '',
  aiSummary = '',
  isProcessing = false,
  className,
}: RAGLiveSummaryZoneProps) {
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

  return (
    <motion.div
      className={cn(
        "relative rounded-xl overflow-hidden flex-shrink-0",
        // Glass UI styling
        "bg-white/60 dark:bg-card/60",
        "backdrop-blur-xl",
        "border border-jade/20 dark:border-jade/30",
        "shadow-lg shadow-jade/5",
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
            animate={{ height: 200, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            // Zero-Shake Rule: Fixed height, no layout shifts when AI streams
            style={{ height: 200, flexShrink: 0 }}
          >
            <ScrollArea 
              ref={scrollRef}
              className="h-[200px]"
              style={{ height: 200 }}
            >
              <div className="p-4 space-y-3">
                {/* Live transcription snippet */}
                {liveTranscription && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-muted">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] font-medium text-muted-foreground">תמלול חי</span>
                    </div>
                    <p className="text-sm text-foreground/80 line-clamp-2">
                      {liveTranscription.slice(-150)}...
                    </p>
                  </div>
                )}

                {/* AI Summary */}
                {hasContent ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-gold" />
                      <span className="text-xs font-semibold text-foreground">סיכום AI</span>
                    </div>
                    <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {aiSummary || (
                        <span className="text-muted-foreground italic">
                          {placeholder.he}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
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
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white/80 dark:from-card/80 to-transparent pointer-events-none" />
    </motion.div>
  );
}

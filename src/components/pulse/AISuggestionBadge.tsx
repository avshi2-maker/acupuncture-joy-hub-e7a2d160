import { motion } from 'framer-motion';
import { Bot, Sparkles, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AISuggestionBadgeProps {
  pulseId: string;
  pulseName: string;
  chineseName: string;
  confidence: number;
  hebrewExplanation: string;
  suggestedPoints: string[];
  onAccept?: () => void;
  onDismiss?: () => void;
  onSpeak?: () => void;
  className?: string;
}

/**
 * AI Suggestion Badge - Phase 5
 * Shows "Suggested by AI" badge with clinical context
 */
export function AISuggestionBadge({
  pulseId,
  pulseName,
  chineseName,
  confidence,
  hebrewExplanation,
  suggestedPoints,
  onAccept,
  onDismiss,
  onSpeak,
  className,
}: AISuggestionBadgeProps) {
  const confidencePercent = Math.round(confidence * 100);
  
  return (
    <motion.div
      className={cn(
        'relative bg-gradient-to-br from-amber-950/90 via-amber-900/80 to-amber-950/90',
        'border border-amber-500/40 rounded-xl p-4',
        'backdrop-blur-md shadow-lg shadow-amber-500/10',
        className
      )}
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Header with AI badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            className="flex items-center gap-1.5 bg-amber-400/20 text-amber-300 px-2 py-1 rounded-full text-xs font-medium"
            animate={{
              boxShadow: [
                '0 0 5px rgba(251, 191, 36, 0.3)',
                '0 0 15px rgba(251, 191, 36, 0.5)',
                '0 0 5px rgba(251, 191, 36, 0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Bot className="h-3.5 w-3.5" />
            <span>הוצע ע"י AI</span>
            <Sparkles className="h-3 w-3" />
          </motion.div>
          
          {/* Confidence indicator */}
          <div className="text-[10px] text-muted-foreground">
            {confidencePercent}% ביטחון
          </div>
        </div>

        {/* Speak button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-amber-400/70 hover:text-amber-300 hover:bg-amber-500/10"
          onClick={onSpeak}
        >
          <Volume2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Pulse info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-amber-300 font-medium text-sm">{pulseName}</span>
          <span className="text-amber-400/60 text-xs">{chineseName}</span>
        </div>
        
        {/* Hebrew explanation */}
        <p className="text-amber-100/80 text-sm leading-relaxed text-right" dir="rtl">
          {hebrewExplanation}
        </p>
      </div>

      {/* Suggested points */}
      {suggestedPoints.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] text-amber-400/60 mb-1.5">נקודות מומלצות:</div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedPoints.slice(0, 5).map((point) => (
              <motion.span
                key={point}
                className="px-2 py-0.5 bg-jade/20 text-jade border border-jade/30 rounded-full text-xs font-mono"
                whileHover={{ scale: 1.05, borderColor: 'rgba(var(--jade), 0.6)' }}
              >
                {point}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30"
          onClick={onAccept}
        >
          <Sparkles className="h-3.5 w-3.5 ml-1.5" />
          הפעל על מפת הגוף
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
          onClick={onDismiss}
        >
          דחה
        </Button>
      </div>
    </motion.div>
  );
}

// Compact inline version for pulse cards
export function AISuggestionInlineBadge({ className }: { className?: string }) {
  return (
    <motion.span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
        'bg-amber-400/20 text-amber-300 text-[10px] font-medium',
        'border border-amber-400/30',
        className
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        boxShadow: [
          '0 0 3px rgba(251, 191, 36, 0.2)',
          '0 0 8px rgba(251, 191, 36, 0.4)',
          '0 0 3px rgba(251, 191, 36, 0.2)',
        ],
      }}
      transition={{ 
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
        boxShadow: { duration: 2, repeat: Infinity },
      }}
    >
      <Bot className="h-3 w-3" />
      AI
    </motion.span>
  );
}

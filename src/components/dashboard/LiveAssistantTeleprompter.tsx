import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Activity, 
  MapPin, 
  FileCheck, 
  Sparkles,
  AlertCircle 
} from 'lucide-react';

/**
 * Live Assistant Teleprompter - Phase 7: Contextual Nudges
 * Displays real-time guidance based on session state
 */

interface LiveAssistantTeleprompterProps {
  hasPulse: boolean;
  hasPoints: boolean;
  pointCount: number;
  isSessionEnding?: boolean;
  hasContradictions?: boolean;
  className?: string;
}

interface NudgeMessage {
  id: string;
  icon: React.ReactNode;
  message: string;
  priority: 'high' | 'medium' | 'low';
  color: string;
}

export function LiveAssistantTeleprompter({
  hasPulse,
  hasPoints,
  pointCount,
  isSessionEnding = false,
  hasContradictions = false,
  className,
}: LiveAssistantTeleprompterProps) {
  
  // Generate contextual nudges based on session state
  const nudges = useMemo<NudgeMessage[]>(() => {
    const messages: NudgeMessage[] = [];
    
    // Missing pulse nudge (high priority)
    if (!hasPulse) {
      messages.push({
        id: 'missing-pulse',
        icon: <Activity className="h-4 w-4" />,
        message: 'כדאי לבדוק דופק כעת לדיוק האבחנה.',
        priority: 'high',
        color: 'text-amber-500',
      });
    }
    
    // Points selected nudge (medium priority)
    if (hasPoints && pointCount > 0) {
      messages.push({
        id: 'points-selected',
        icon: <MapPin className="h-4 w-4" />,
        message: `${pointCount} נקודות מוצגות על מפת הגוף. לחץ עליהן למידע טכני (עומק/זווית).`,
        priority: 'medium',
        color: 'text-jade',
      });
    }
    
    // Contradictions warning
    if (hasContradictions) {
      messages.push({
        id: 'contradictions',
        icon: <AlertCircle className="h-4 w-4" />,
        message: 'זוהו סתירות קליניות. בדוק את האזהרות לפני סיום.',
        priority: 'high',
        color: 'text-red-500',
      });
    }
    
    // Session ending nudge (high priority)
    if (isSessionEnding && hasPulse) {
      messages.push({
        id: 'session-ending',
        icon: <FileCheck className="h-4 w-4" />,
        message: "ה-AI הכין טיוטת סיכום. לחץ על 'סיום וסיכום' להפקה.",
        priority: 'high',
        color: 'text-jade',
      });
    }
    
    // AI ready nudge (low priority - default state)
    if (hasPulse && !hasPoints && !isSessionEnding) {
      messages.push({
        id: 'ai-ready',
        icon: <Sparkles className="h-4 w-4" />,
        message: 'ה-AI מנתח... עקוב אחרי נצנוצי הנקודות על המפה.',
        priority: 'low',
        color: 'text-primary',
      });
    }
    
    return messages.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [hasPulse, hasPoints, pointCount, isSessionEnding, hasContradictions]);
  
  // Show only the highest priority nudge
  const activeNudge = nudges[0];
  
  if (!activeNudge) return null;
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeNudge.id}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl",
          "bg-card/60 backdrop-blur-sm border border-border/50",
          "shadow-sm",
          className
        )}
        dir="rtl"
      >
        {/* Icon with colored background */}
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
          activeNudge.priority === 'high' && "bg-amber-500/20",
          activeNudge.priority === 'medium' && "bg-jade/20",
          activeNudge.priority === 'low' && "bg-primary/20",
        )}>
          <span className={activeNudge.color}>
            {activeNudge.icon}
          </span>
        </div>
        
        {/* Message */}
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">
          {activeNudge.message}
        </p>
        
        {/* Pulse indicator for high priority */}
        {activeNudge.priority === 'high' && (
          <motion.div
            className={cn("w-2 h-2 rounded-full flex-shrink-0", activeNudge.color.replace('text-', 'bg-'))}
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default LiveAssistantTeleprompter;

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger, 
  TooltipProvider 
} from '@/components/ui/tooltip';
import { HelpCircle, Compass, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Help Floating Action Button - Phase 7: Ghost Guide Trigger
 * Provides quick access to the Golden Path walkthrough
 */

interface HelpFABProps {
  onClick: () => void;
  className?: string;
  variant?: 'default' | 'compact';
  isSessionActive?: boolean;
}

export function HelpFAB({ 
  onClick, 
  className,
  variant = 'default',
  isSessionActive = false
}: HelpFABProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={cn(
              "fixed z-50",
              variant === 'default' ? "bottom-6 left-6" : "bottom-4 left-4",
              className
            )}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.5 }}
          >
            <Button
              onClick={onClick}
              size={variant === 'compact' ? 'icon' : 'default'}
              className={cn(
                "rounded-full shadow-lg transition-all duration-300",
                "bg-gradient-to-br from-jade to-jade/80",
                "hover:from-jade/90 hover:to-jade/70",
                "hover:shadow-xl hover:shadow-jade/30",
                "text-white",
                variant === 'default' && "gap-2 px-5",
                isSessionActive && "ring-2 ring-jade/50 ring-offset-2 ring-offset-background"
              )}
            >
              {isSessionActive ? (
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Sparkles className="h-5 w-5" />
                </motion.div>
              ) : (
                <Compass className="h-5 w-5" />
              )}
              {variant === 'default' && (
                <span className="font-medium">מדריך</span>
              )}
            </Button>
            
            {/* Pulse ring when session active */}
            {isSessionActive && (
              <motion.div
                className="absolute inset-0 rounded-full bg-jade/30"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-card border-jade/30">
          <p className="font-medium">מדריך Golden Path</p>
          <p className="text-xs text-muted-foreground">סיור מודרך מדופק לסיכום</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default HelpFAB;

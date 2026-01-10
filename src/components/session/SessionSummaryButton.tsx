import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface SessionSummaryButtonProps {
  pointCount: number;
  pulseCount: number;
  onClick: () => void;
  disabled?: boolean;
}

export function SessionSummaryButton({
  pointCount,
  pulseCount,
  onClick,
  disabled = false,
}: SessionSummaryButtonProps) {
  const hasData = pointCount > 0 || pulseCount > 0;

  if (!hasData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <Button
        id="SessionSummaryButton"
        onClick={onClick}
        disabled={disabled}
        className="gap-2 bg-gradient-to-r from-jade to-jade/80 hover:from-jade/90 hover:to-jade/70 text-white shadow-lg relative overflow-hidden group"
        size="lg"
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        
        <FileCheck className="h-5 w-5" />
        <span className="font-medium" dir="rtl">סיום וסיכום</span>
        
        {/* Count badges */}
        <div className="flex items-center gap-1 mr-1">
          {pointCount > 0 && (
            <Badge 
              variant="secondary" 
              className="bg-white/20 text-white border-white/30 text-xs px-1.5"
            >
              <Sparkles className="h-3 w-3 mr-0.5" />
              {pointCount}
            </Badge>
          )}
        </div>
      </Button>
    </motion.div>
  );
}

export default SessionSummaryButton;

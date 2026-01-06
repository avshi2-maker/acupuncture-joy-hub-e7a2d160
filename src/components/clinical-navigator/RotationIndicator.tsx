import { motion } from 'framer-motion';
import { RotateCw, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RotationIndicatorProps {
  isRotating: boolean;
  direction?: 'left' | 'right';
  targetView?: string;
  className?: string;
}

export function RotationIndicator({ 
  isRotating, 
  direction = 'right',
  targetView,
  className 
}: RotationIndicatorProps) {
  if (!isRotating) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={cn(
        "absolute inset-0 z-20 flex items-center justify-center",
        "bg-background/60 backdrop-blur-sm rounded-lg",
        className
      )}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Spinning rotation icon */}
        <motion.div
          animate={{ 
            rotateY: direction === 'right' ? [0, 180, 360] : [0, -180, -360],
          }}
          transition={{ 
            duration: 0.6, 
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 0.2
          }}
          className="relative"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="relative">
            {/* Outer glow ring */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ 
                duration: 0.8, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-full bg-jade/30 blur-md"
              style={{ transform: 'scale(1.5)' }}
            />
            
            {/* Main icon container */}
            <motion.div
              animate={{ rotate: direction === 'right' ? 360 : -360 }}
              transition={{ 
                duration: 0.6, 
                ease: "linear",
                repeat: Infinity 
              }}
              className="relative p-4 rounded-full bg-gradient-to-br from-jade/20 to-jade/40 border-2 border-jade/60"
            >
              <RotateCw className="h-8 w-8 text-jade" />
            </motion.div>
          </div>
        </motion.div>

        {/* Status text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center gap-1"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Eye className="h-4 w-4 text-jade" />
            <span>AI Switching View</span>
          </div>
          {targetView && (
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-xs text-jade font-semibold uppercase tracking-wider"
            >
              → {targetView} View
            </motion.span>
          )}
        </motion.div>

        {/* Progress bar */}
        <motion.div 
          className="w-32 h-1 bg-muted rounded-full overflow-hidden"
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ 
              duration: 0.6, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="h-full w-1/2 bg-gradient-to-r from-transparent via-jade to-transparent"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

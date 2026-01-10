import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PointSparkleOverlayProps {
  isSparklingPoint: (code: string) => boolean;
  highlightedPoints: string[];
  className?: string;
}

/**
 * Point Sparkle Overlay - Phase 5: Visual Sync
 * Renders sparkle effects on points when AI mentions them
 * Phase 7 Final: React.memo for zero-lag during video calls
 */
export const PointSparkleOverlay = memo(function PointSparkleOverlay({
  isSparklingPoint,
  highlightedPoints,
  className,
}: PointSparkleOverlayProps) {
  const sparklingPoints = highlightedPoints.filter(isSparklingPoint);
  
  if (sparklingPoints.length === 0) return null;
  
  return (
    <div className={cn("absolute inset-0 pointer-events-none z-50", className)}>
      <AnimatePresence>
        {sparklingPoints.map((point) => (
          <SparkleEffectMemo key={point} pointCode={point} />
        ))}
      </AnimatePresence>
    </div>
  );
});

// Individual sparkle effect for a point
// Phase 7: Hardware-accelerated with will-change for zero-latency
function SparkleEffect({ pointCode }: { pointCode: string }) {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ 
        willChange: 'transform, opacity',
        transform: 'translateZ(0)', // Force GPU layer
        backfaceVisibility: 'hidden',
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 0.8, 1, 0],
        scale: [0.5, 1.2, 1, 1.3, 0.8],
      }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ 
        duration: 2,
        ease: 'easeInOut',
      }}
    >
      {/* Sparkle particles - GPU accelerated */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-amber-400 rounded-full"
          style={{
            left: '50%',
            top: '50%',
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
          }}
          animate={{
            x: [0, Math.cos((i * 60) * Math.PI / 180) * 20],
            y: [0, Math.sin((i * 60) * Math.PI / 180) * 20],
            opacity: [1, 0],
            scale: [1, 0.5],
          }}
          transition={{
            duration: 0.8,
            delay: 0.1 * i,
            ease: 'easeOut',
          }}
        />
      ))}
      
      {/* Central glow - GPU accelerated */}
      <motion.div
        className="w-4 h-4 rounded-full bg-amber-400/80"
        style={{
          willChange: 'transform, box-shadow',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
        }}
        animate={{
          boxShadow: [
            '0 0 8px 2px rgba(251, 191, 36, 0.4)',
            '0 0 20px 8px rgba(251, 191, 36, 0.8)',
            '0 0 8px 2px rgba(251, 191, 36, 0.4)',
          ],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 0.6,
          repeat: 2,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
}

// Memoized SparkleEffect for performance
const SparkleEffectMemo = memo(SparkleEffect);

// Badge component to show point code with sparkle
interface SparklePointBadgeProps {
  pointCode: string;
  isSparkle: boolean;
  onClick?: () => void;
  className?: string;
}

// Phase 7 Final: Hardware-accelerated SparklePointBadge with React.memo
export const SparklePointBadge = memo(function SparklePointBadge({
  pointCode,
  isSparkle,
  onClick,
  className,
}: SparklePointBadgeProps) {
  return (
    <motion.button
      className={cn(
        "relative px-2 py-0.5 rounded-full text-xs font-mono transition-all",
        isSparkle 
          ? "bg-amber-400/30 text-amber-200 border border-amber-400/60" 
          : "bg-jade/20 text-jade border border-jade/30",
        className
      )}
      style={{
        willChange: isSparkle ? 'transform, box-shadow' : 'auto',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)', // Force GPU compositing
      }}
      onClick={onClick}
      animate={isSparkle ? {
        boxShadow: [
          '0 0 5px rgba(251, 191, 36, 0.3)',
          '0 0 15px rgba(251, 191, 36, 0.6)',
          '0 0 5px rgba(251, 191, 36, 0.3)',
        ],
        scale: [1, 1.05, 1],
      } : {}}
      transition={{
        duration: 1,
        repeat: isSparkle ? Infinity : 0,
        ease: 'easeInOut',
      }}
    >
      {pointCode}
      
      {/* Sparkle indicator - GPU accelerated */}
      <AnimatePresence>
        {isSparkle && (
          <motion.span
            className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full"
            style={{ 
              willChange: 'transform', 
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.3, 1] }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
});

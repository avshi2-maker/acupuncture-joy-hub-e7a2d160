import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GoldBreathingIconProps {
  isGlowing: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  badge?: string | number;
  badgeColor?: 'gold' | 'jade' | 'red';
}

/**
 * Gold Breathing Icon Component - Phase 5
 * Wraps any icon with a gold breathing/pulsing animation
 * Used for AI Smart-Suggest visual feedback
 */
export function GoldBreathingIcon({
  isGlowing,
  children,
  onClick,
  className,
  size = 'md',
  badge,
  badgeColor = 'gold',
}: GoldBreathingIconProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const badgeColorClasses = {
    gold: 'bg-amber-400 text-amber-950',
    jade: 'bg-jade text-white',
    red: 'bg-red-500 text-white',
  };

  return (
    <motion.div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full cursor-pointer transition-all',
        sizeClasses[size],
        className
      )}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Outer glow ring */}
      <AnimatePresence>
        {isGlowing && (
          <motion.div
            className="absolute inset-0 rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.3, 1],
              boxShadow: [
                '0 0 10px 2px rgba(251, 191, 36, 0.3), 0 0 20px 4px rgba(251, 191, 36, 0.2)',
                '0 0 20px 6px rgba(251, 191, 36, 0.6), 0 0 40px 12px rgba(251, 191, 36, 0.4)',
                '0 0 10px 2px rgba(251, 191, 36, 0.3), 0 0 20px 4px rgba(251, 191, 36, 0.2)',
              ],
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              background: 'radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Inner breathing ring */}
      <AnimatePresence>
        {isGlowing && (
          <motion.div
            className="absolute inset-1 rounded-full border-2 border-amber-400/60"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.5, 1, 0.5],
              borderColor: [
                'rgba(251, 191, 36, 0.4)',
                'rgba(251, 191, 36, 1)',
                'rgba(251, 191, 36, 0.4)',
              ],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </AnimatePresence>

      {/* Icon container */}
      <motion.div
        className={cn(
          'relative z-10 flex items-center justify-center rounded-full',
          isGlowing && 'text-amber-400'
        )}
        animate={isGlowing ? {
          filter: [
            'drop-shadow(0 0 2px rgba(251, 191, 36, 0.5))',
            'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))',
            'drop-shadow(0 0 2px rgba(251, 191, 36, 0.5))',
          ],
        } : {}}
        transition={{
          duration: 1.5,
          repeat: isGlowing ? Infinity : 0,
          ease: 'easeInOut',
        }}
      >
        {children}
      </motion.div>

      {/* Badge indicator */}
      <AnimatePresence>
        {badge !== undefined && (
          <motion.div
            className={cn(
              'absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold px-1',
              badgeColorClasses[badgeColor]
            )}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            {badge}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI suggested badge */}
      <AnimatePresence>
        {isGlowing && (
          <motion.div
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-medium text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            🤖 AI Suggested
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
  rotation: number;
  size: number;
}

interface CelebrationConfettiProps {
  show: boolean;
  onComplete?: () => void;
}

const JADE_COLORS = [
  'hsl(158, 64%, 52%)', // jade
  'hsl(158, 64%, 62%)', // jade-light
  'hsl(158, 64%, 42%)', // jade-dark
  'hsl(38, 70%, 50%)',  // gold
  'hsl(38, 70%, 60%)',  // gold-light
  'hsl(0, 0%, 100%)',   // white
];

export function CelebrationConfetti({ show, onComplete }: CelebrationConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (show) {
      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        color: JADE_COLORS[Math.floor(Math.random() * JADE_COLORS.length)],
        rotation: Math.random() * 360,
        size: 8 + Math.random() * 8,
      }));
      setPieces(newPieces);

      // Cleanup after animation
      const timeout = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && pieces.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                opacity: 1,
                x: `${piece.x}vw`,
                y: '-20px',
                rotate: 0,
                scale: 1,
              }}
              animate={{
                opacity: [1, 1, 0],
                y: '110vh',
                rotate: piece.rotation + 720,
                scale: [1, 1.2, 0.8],
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              style={{
                position: 'absolute',
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                boxShadow: `0 0 ${piece.size / 2}px ${piece.color}`,
              }}
            />
          ))}
          
          {/* Central jade glow burst */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.8, 0], scale: [0, 1.5, 2] }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, hsl(158 64% 52% / 0.4) 0%, transparent 70%)',
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
}

// Hook to trigger celebration
export function useCelebration() {
  const [showCelebration, setShowCelebration] = useState(false);

  const celebrate = () => {
    setShowCelebration(true);
  };

  const onCelebrationComplete = () => {
    setShowCelebration(false);
  };

  return {
    showCelebration,
    celebrate,
    onCelebrationComplete,
    CelebrationComponent: () => (
      <CelebrationConfetti 
        show={showCelebration} 
        onComplete={onCelebrationComplete} 
      />
    ),
  };
}

export default CelebrationConfetti;

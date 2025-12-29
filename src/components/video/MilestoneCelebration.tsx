import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { toast } from 'sonner';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocityX: number;
  velocityY: number;
  delay: number;
}

interface MilestoneCelebrationProps {
  sessionDuration: number;
  sessionStatus: 'idle' | 'running' | 'paused' | 'ended';
}

const MILESTONE_MINUTES = [15, 30, 45];
const CONFETTI_COLORS = [
  'bg-jade', 'bg-amber-400', 'bg-rose-400', 'bg-sky-400', 
  'bg-violet-400', 'bg-emerald-400', 'bg-orange-400', 'bg-pink-400'
];

export function MilestoneCelebration({ sessionDuration, sessionStatus }: MilestoneCelebrationProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [showBadge, setShowBadge] = useState<number | null>(null);
  const celebratedMilestones = useRef<Set<number>>(new Set());
  const haptic = useHapticFeedback();

  useEffect(() => {
    if (sessionStatus !== 'running') return;

    const currentMinutes = Math.floor(sessionDuration / 60);

    for (const milestone of MILESTONE_MINUTES) {
      if (
        currentMinutes === milestone && 
        !celebratedMilestones.current.has(milestone) &&
        sessionDuration % 60 < 2 // Only trigger in the first 2 seconds of the milestone minute
      ) {
        celebratedMilestones.current.add(milestone);
        triggerCelebration(milestone);
        break;
      }
    }
  }, [sessionDuration, sessionStatus]);

  // Reset milestones when session is reset
  useEffect(() => {
    if (sessionStatus === 'idle') {
      celebratedMilestones.current.clear();
    }
  }, [sessionStatus]);

  const triggerCelebration = (milestone: number) => {
    // Haptic feedback
    haptic.success();
    setTimeout(() => haptic.light(), 100);
    setTimeout(() => haptic.light(), 200);

    // Show toast
    const messages: Record<number, string> = {
      15: '🎉 15 minutes! Great start!',
      30: '🏆 30 minutes! Halfway champion!',
      45: '⭐ 45 minutes! Session superstar!',
    };
    toast.success(messages[milestone] || `🎊 ${milestone} minute milestone!`, {
      duration: 4000,
    });

    // Generate confetti
    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100,
        y: -10,
        rotation: Math.random() * 360,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 8 + Math.random() * 8,
        velocityX: (Math.random() - 0.5) * 4,
        velocityY: 2 + Math.random() * 3,
        delay: Math.random() * 0.5,
      });
    }
    setConfetti(pieces);
    setShowBadge(milestone);

    // Clear confetti after animation
    setTimeout(() => {
      setConfetti([]);
    }, 3000);

    // Hide badge after a bit
    setTimeout(() => {
      setShowBadge(null);
    }, 4000);
  };

  if (confetti.length === 0 && !showBadge) return null;

  return (
    <>
      {/* Confetti container */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className={cn(
              piece.color,
              'absolute rounded-sm animate-confetti-fall'
            )}
            style={{
              left: `${piece.x}%`,
              width: `${piece.size}px`,
              height: `${piece.size * 0.6}px`,
              transform: `rotate(${piece.rotation}deg)`,
              animationDelay: `${piece.delay}s`,
              animationDuration: '3s',
            }}
          />
        ))}
      </div>

      {/* Milestone badge */}
      {showBadge && (
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="animate-scale-in">
            <div className="bg-gradient-to-br from-jade to-emerald-600 text-white rounded-2xl px-8 py-4 shadow-2xl">
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {showBadge === 15 && '🎉'}
                  {showBadge === 30 && '🏆'}
                  {showBadge === 45 && '⭐'}
                </div>
                <div className="text-2xl font-bold">{showBadge} MIN</div>
                <div className="text-sm opacity-90 mt-1">
                  {showBadge === 15 && 'Great Start!'}
                  {showBadge === 30 && 'Halfway There!'}
                  {showBadge === 45 && 'Almost Done!'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

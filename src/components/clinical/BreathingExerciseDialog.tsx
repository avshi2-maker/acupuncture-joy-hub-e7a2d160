import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wind, Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreathingExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Phase = 'ready' | 'inhale' | 'hold' | 'exhale';

const PHASE_DURATIONS = {
  inhale: 4000,
  hold: 7000,
  exhale: 8000,
};

const PHASE_TEXT: Record<Phase, { main: string; sub: string }> = {
  ready: { main: 'מוכנים?', sub: 'שיטת 4-7-8 להרגעה עמוקה' },
  inhale: { main: 'שאפו...', sub: '4 שניות' },
  hold: { main: 'החזיקו...', sub: '7 שניות' },
  exhale: { main: 'נשפו...', sub: '8 שניות' },
};

export const BreathingExerciseDialog: React.FC<BreathingExerciseDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [phase, setPhase] = useState<Phase>('ready');
  const [isRunning, setIsRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  const runCycle = useCallback(() => {
    // Inhale
    setPhase('inhale');
    setTimeout(() => {
      // Hold
      setPhase('hold');
      setTimeout(() => {
        // Exhale
        setPhase('exhale');
        setTimeout(() => {
          setCycleCount(prev => prev + 1);
          // Continue or stop after 3 cycles
          setPhase('inhale');
        }, PHASE_DURATIONS.exhale);
      }, PHASE_DURATIONS.hold);
    }, PHASE_DURATIONS.inhale);
  }, []);

  useEffect(() => {
    if (!isRunning || phase === 'ready') return;

    const totalCycleTime = PHASE_DURATIONS.inhale + PHASE_DURATIONS.hold + PHASE_DURATIONS.exhale;
    
    const interval = setInterval(() => {
      if (cycleCount >= 3) {
        setIsRunning(false);
        setPhase('ready');
        setCycleCount(0);
        clearInterval(interval);
      }
    }, totalCycleTime);

    return () => clearInterval(interval);
  }, [isRunning, cycleCount]);

  useEffect(() => {
    if (isRunning && phase === 'ready') {
      runCycle();
    }
  }, [isRunning, phase, runCycle]);

  useEffect(() => {
    if (isRunning && phase !== 'ready') {
      const phases: Phase[] = ['inhale', 'hold', 'exhale'];
      const currentIndex = phases.indexOf(phase);
      const nextPhase = phases[(currentIndex + 1) % 3];
      
      const timer = setTimeout(() => {
        if (nextPhase === 'inhale') {
          setCycleCount(prev => prev + 1);
        }
        if (cycleCount < 3) {
          setPhase(nextPhase);
        } else {
          setIsRunning(false);
          setPhase('ready');
          setCycleCount(0);
        }
      }, PHASE_DURATIONS[phase]);

      return () => clearTimeout(timer);
    }
  }, [phase, isRunning, cycleCount]);

  const handleStart = () => {
    setIsRunning(true);
    setCycleCount(0);
    setPhase('inhale');
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setPhase('ready');
    setCycleCount(0);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      handleReset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-transparent">
        <div 
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)',
          }}
        >
          {/* Glass Overlay */}
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center p-8 min-h-[400px]">
            {/* Header - shown before start */}
            {phase === 'ready' && !isRunning && (
              <div className="text-center mb-6 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-600/20 flex items-center justify-center mx-auto mb-3">
                  <Wind className="h-6 w-6 text-emerald-700" />
                </div>
                <h3 className="text-lg font-semibold text-emerald-800">
                  זיהינו רמת מתח גבוהה
                </h3>
                <p className="text-sm text-emerald-700/80 mt-1">
                  בואו נאזן את ה-Qi לפני המפגש.
                  <br />
                  תרגיל קצר להרגעת הנפש.
                </p>
              </div>
            )}

            {/* Breathing Circle */}
            <div className="relative h-44 w-44 flex items-center justify-center mb-6">
              <div 
                className={cn(
                  "absolute inset-0 rounded-full bg-emerald-600 opacity-80 transition-transform",
                  "shadow-[0_0_30px_rgba(44,110,73,0.4)]",
                  phase === 'inhale' && "animate-[breathe-grow_4s_ease-in-out_forwards]",
                  phase === 'hold' && "animate-[breathe-pulse_1s_ease-in-out_infinite] scale-110",
                  phase === 'exhale' && "animate-[breathe-shrink_8s_ease-in-out_forwards]",
                  phase === 'ready' && "scale-75"
                )}
              />
              
              {/* Inner glow */}
              <div 
                className={cn(
                  "absolute inset-4 rounded-full bg-emerald-400/50 blur-sm transition-transform",
                  phase === 'inhale' && "animate-[breathe-grow_4s_ease-in-out_forwards]",
                  phase === 'hold' && "animate-[breathe-pulse_1s_ease-in-out_infinite] scale-110",
                  phase === 'exhale' && "animate-[breathe-shrink_8s_ease-in-out_forwards]",
                  phase === 'ready' && "scale-75"
                )}
              />

              {/* Cycle counter */}
              {isRunning && (
                <span className="relative z-10 text-white font-bold text-2xl">
                  {cycleCount + 1}/3
                </span>
              )}
            </div>

            {/* Instruction Text */}
            <div className="text-center min-h-[60px]">
              <p className="text-2xl font-bold text-emerald-700">
                {PHASE_TEXT[phase].main}
              </p>
              <p className="text-sm text-emerald-600/80 mt-1">
                {PHASE_TEXT[phase].sub}
              </p>
            </div>

            {/* Controls */}
            <div className="flex gap-3 mt-4">
              {!isRunning ? (
                <Button
                  onClick={handleStart}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 py-2 text-lg gap-2"
                >
                  <Play className="h-5 w-5" />
                  התחל לנשום
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handlePause}
                    variant="outline"
                    className="rounded-full border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                  >
                    <Pause className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="rounded-full border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

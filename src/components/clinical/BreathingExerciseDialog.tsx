import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface BreathingExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoTriggered?: boolean;
}

type Phase = 'ready' | 'inhale' | 'hold' | 'exhale' | 'complete';

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
  complete: { main: 'כל הכבוד!', sub: 'השלמת את התרגיל בהצלחה' },
};

const AUDIO_PROMPTS = {
  inhale: 'gentle soft rising chime meditation bell ascending tone calm',
  hold: 'soft steady singing bowl gentle hum meditation calm',
  exhale: 'long descending soft wind chime release peaceful exhale tone',
};

export const BreathingExerciseDialog: React.FC<BreathingExerciseDialogProps> = ({
  open,
  onOpenChange,
  autoTriggered = false,
}) => {
  const [phase, setPhase] = useState<Phase>('ready');
  const [isRunning, setIsRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioCache, setAudioCache] = useState<Record<string, string>>({});
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const haptic = useHapticFeedback();

  // Generate and cache audio for a phase
  const generateAudio = useCallback(async (phaseKey: 'inhale' | 'hold' | 'exhale') => {
    if (audioCache[phaseKey]) return audioCache[phaseKey];
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-sfx`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            prompt: AUDIO_PROMPTS[phaseKey], 
            duration: phaseKey === 'exhale' ? 3 : 2 
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to generate audio');
      
      const data = await response.json();
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      
      setAudioCache(prev => ({ ...prev, [phaseKey]: audioUrl }));
      return audioUrl;
    } catch (error) {
      console.error('Audio generation error:', error);
      return null;
    }
  }, [audioCache]);

  // Pre-load audio when starting
  const preloadAudio = useCallback(async () => {
    setIsLoadingAudio(true);
    try {
      await Promise.all([
        generateAudio('inhale'),
        generateAudio('hold'),
        generateAudio('exhale'),
      ]);
    } catch (error) {
      console.error('Failed to preload audio:', error);
    }
    setIsLoadingAudio(false);
  }, [generateAudio]);

  // Play audio for current phase
  const playPhaseAudio = useCallback(async (phaseKey: 'inhale' | 'hold' | 'exhale') => {
    if (isMuted) return;
    
    let audioUrl = audioCache[phaseKey];
    if (!audioUrl) {
      audioUrl = await generateAudio(phaseKey);
    }
    
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(e => console.log('Audio play prevented:', e));
    }
  }, [isMuted, audioCache, generateAudio]);

  // Phase transition logic with progress bar and countdown
  useEffect(() => {
    if (!isRunning || phase === 'ready' || phase === 'complete') return;

    // Play audio and haptic at phase start (only for breathing phases)
    if (phase === 'inhale' || phase === 'hold' || phase === 'exhale') {
      playPhaseAudio(phase);
      // Haptic feedback: different patterns for each phase
      if (phase === 'inhale') {
        haptic.light(); // Short gentle vibration for inhale
      } else if (phase === 'hold') {
        haptic.medium(); // Medium vibration for hold
      } else if (phase === 'exhale') {
        haptic.heavy(); // Longer vibration for exhale
      }
    }

    // Reset progress at phase start
    setProgress(0);

    // Progress bar update
    const phaseDuration = PHASE_DURATIONS[phase as keyof typeof PHASE_DURATIONS];
    const phaseDurationSeconds = phaseDuration / 1000;
    const updateInterval = 50; // Update every 50ms for smooth animation
    let elapsed = 0;

    // Initialize countdown
    setCountdown(phaseDurationSeconds);

    // Countdown timer (updates every second)
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        const newVal = prev - 1;
        return newVal >= 0 ? newVal : 0;
      });
    }, 1000);

    progressIntervalRef.current = setInterval(() => {
      elapsed += updateInterval;
      const newProgress = Math.min((elapsed / phaseDuration) * 100, 100);
      setProgress(newProgress);
    }, updateInterval);

    const phases: Phase[] = ['inhale', 'hold', 'exhale'];
    const currentIndex = phases.indexOf(phase);
    const nextPhase = phases[(currentIndex + 1) % 3];
    
    const timer = setTimeout(() => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      setProgress(0);
      setCountdown(0);

      if (nextPhase === 'inhale') {
        const newCount = cycleCount + 1;
        setCycleCount(newCount);
        if (newCount >= 3) {
          setIsRunning(false);
          setPhase('complete');
          return;
        }
      }
      setPhase(nextPhase);
    }, phaseDuration);

    return () => {
      clearTimeout(timer);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [phase, isRunning, cycleCount, playPhaseAudio]);

  const handleStart = async () => {
    if (Object.keys(audioCache).length === 0) {
      await preloadAudio();
    }
    setIsRunning(true);
    setCycleCount(0);
    setPhase('inhale');
  };

  const handlePause = () => {
    setIsRunning(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setPhase('ready');
    setCycleCount(0);
    setProgress(0);
    setCountdown(0);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      handleReset();
    }
    onOpenChange(newOpen);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-transparent">
        {/* Hidden audio element */}
        <audio ref={audioRef} />
        
        <div 
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)',
          }}
        >
          {/* Glass Overlay */}
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
          
          {/* Close Button */}
          <button
            onClick={() => handleOpenChange(false)}
            className="absolute top-4 right-4 z-20 text-emerald-700/60 hover:text-emerald-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className="absolute top-4 left-4 z-20 text-emerald-700/60 hover:text-emerald-700 transition-colors"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center p-8 min-h-[400px]">
            {/* Header - shown before start */}
            {phase === 'ready' && !isRunning && (
              <div className="text-center mb-6 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-600/20 flex items-center justify-center mx-auto mb-3">
                  <Wind className="h-6 w-6 text-emerald-700" />
                </div>
                {autoTriggered && (
                  <h3 className="text-lg font-semibold text-emerald-800">
                    זיהינו רמת מתח גבוהה
                  </h3>
                )}
                <p className="text-sm text-emerald-700/80 mt-1">
                  הכנו עבורך תרגיל נשימה קצר (4-7-8)
                  <br />
                  להורדת דופק מיידית.
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

              {/* Countdown Timer & Cycle Counter - shown during exercise */}
              {isRunning && phase !== 'ready' && phase !== 'complete' && (
                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-white font-extrabold text-5xl drop-shadow-lg">
                    {countdown}
                  </span>
                  <span className="text-white/90 text-sm font-medium mt-1 bg-black/10 px-3 py-0.5 rounded-full">
                    מחזור {cycleCount + 1}/3
                  </span>
                </div>
              )}
              
              {/* Ready state - shown before start */}
              {!isRunning && phase === 'ready' && (
                <span className="relative z-10 text-white/80 font-bold text-lg">
                  3 מחזורים
                </span>
              )}

              {/* Complete state checkmark */}
              {phase === 'complete' && (
                <span className="relative z-10 text-white font-extrabold text-4xl">✓</span>
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

            {/* Progress Bar */}
            {isRunning && phase !== 'ready' && phase !== 'complete' && (
              <div className="w-3/5 h-1.5 bg-emerald-200 rounded-full overflow-hidden mt-4">
                <div 
                  className="h-full bg-emerald-600 rounded-full transition-[width] duration-50 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Complete state - additional message */}
            {phase === 'complete' && (
              <p className="text-emerald-600/80 text-sm mt-2">
                אתם מוכנים להמשיך.
              </p>
            )}

            {/* Controls */}
            {/* Controls */}
            <div className="flex gap-3 mt-4">
              {phase === 'complete' ? (
                <Button
                  onClick={() => handleOpenChange(false)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 py-2 text-lg"
                >
                  חזרה לדשבורד
                </Button>
              ) : !isRunning ? (
                <Button
                  onClick={handleStart}
                  disabled={isLoadingAudio}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 py-2 text-lg gap-2"
                >
                  <Play className="h-5 w-5" />
                  {isLoadingAudio ? 'טוען...' : 'התחל תרגיל'}
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

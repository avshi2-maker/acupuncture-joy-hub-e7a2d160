import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BreathingExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoTriggered?: boolean;
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Phase transition logic
  useEffect(() => {
    if (!isRunning || phase === 'ready') return;

    // Play audio at phase start
    playPhaseAudio(phase);

    const phases: Phase[] = ['inhale', 'hold', 'exhale'];
    const currentIndex = phases.indexOf(phase);
    const nextPhase = phases[(currentIndex + 1) % 3];
    
    const timer = setTimeout(() => {
      if (nextPhase === 'inhale') {
        const newCount = cycleCount + 1;
        setCycleCount(newCount);
        if (newCount >= 3) {
          setIsRunning(false);
          setPhase('ready');
          setCycleCount(0);
          toast.success('כל הכבוד! סיימת 3 מחזורי נשימה', {
            description: 'רמת הלחץ שלך צריכה לרדת משמעותית',
          });
          return;
        }
      }
      setPhase(nextPhase);
    }, PHASE_DURATIONS[phase]);

    return () => clearTimeout(timer);
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

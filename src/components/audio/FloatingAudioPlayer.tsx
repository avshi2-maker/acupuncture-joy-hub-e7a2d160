import { useState, useRef, useEffect, createContext, useContext, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX, Pause, Play, X, Loader2, SkipBack, SkipForward } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface AudioPlayerContextType {
  playText: (text: string, title?: string) => Promise<void>;
  stop: () => void;
  isPlaying: boolean;
  isLoading: boolean;
  currentTitle: string | null;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
};

interface AudioPlayerProviderProps {
  children: React.ReactNode;
}

export function AudioPlayerProvider({ children }: AudioPlayerProviderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTitle, setCurrentTitle] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearProgressInterval = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    clearProgressInterval();
    setIsPlaying(false);
    setProgress(0);
    setIsVisible(false);
    setCurrentTitle(null);
  }, [clearProgressInterval]);

  const playText = useCallback(async (text: string, title?: string) => {
    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    clearProgressInterval();

    if (!text || text.trim().length === 0) {
      toast.error('No text to speak');
      return;
    }

    // Limit text length for TTS
    const maxLength = 4000;
    const trimmedText = text.length > maxLength 
      ? text.substring(0, maxLength) + '...' 
      : text;

    setIsLoading(true);
    setIsVisible(true);
    setCurrentTitle(title || 'Audio');

    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: trimmedText, 
          voice: 'nova',
          language: 'he' 
        },
      });

      if (error) throw error;
      if (!data?.audioContent) throw new Error('No audio content received');

      const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
      const audio = new Audio(audioSrc);
      audioRef.current = audio;

      audio.volume = isMuted ? 0 : volume;

      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setProgress(0);
        clearProgressInterval();
      };

      audio.onerror = () => {
        setIsPlaying(false);
        toast.error('Error playing audio');
        clearProgressInterval();
      };

      // Start progress tracking
      progressIntervalRef.current = setInterval(() => {
        if (audio && !audio.paused) {
          setProgress(audio.currentTime);
        }
      }, 100);

      await audio.play();
      setIsPlaying(true);

    } catch (error) {
      console.error('TTS error:', error);
      toast.error('Failed to generate audio');
      setIsVisible(false);
    } finally {
      setIsLoading(false);
    }
  }, [clearProgressInterval, isMuted, volume]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioRef.current) {
      audioRef.current.volume = newMuted ? 0 : volume;
    }
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      clearProgressInterval();
    };
  }, [clearProgressInterval]);

  const contextValue: AudioPlayerContextType = {
    playText,
    stop,
    isPlaying,
    isLoading,
    currentTitle,
  };

  return (
    <AudioPlayerContext.Provider value={contextValue}>
      {children}
      
      {/* Floating Player */}
      {isVisible && (
        <Card className={cn(
          "fixed bottom-4 right-4 z-50 p-3 shadow-2xl border-primary/20 bg-background/95 backdrop-blur-md",
          "w-80 animate-in slide-in-from-bottom-5 fade-in duration-300"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <Volume2 className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-medium truncate">{currentTitle}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={stop}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1 mb-2">
            <Slider
              value={[progress]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              disabled={isLoading}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => skip(-10)}
                disabled={isLoading}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button
                variant="default"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={togglePlayPause}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => skip(10)}
                disabled={isLoading}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="w-16"
              />
            </div>
          </div>
        </Card>
      )}
    </AudioPlayerContext.Provider>
  );
}

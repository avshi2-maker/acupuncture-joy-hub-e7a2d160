import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SpeedControl, PlaybackSpeed } from './SpeedControl';

interface NarrationControlsProps {
  /** Whether audio is muted */
  isMuted: boolean;
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Whether audio is loading */
  isLoading: boolean;
  /** Current point being narrated */
  currentPoint: string | null;
  /** Current playback speed */
  playbackSpeed: PlaybackSpeed;
  /** Toggle mute callback */
  onToggleMute: () => void;
  /** Speed change callback */
  onSpeedChange: (speed: PlaybackSpeed) => void;
  /** Language for labels */
  language?: 'en' | 'he';
  className?: string;
}

/**
 * Overlay controls for audio narration during 3D point tour
 */
export function NarrationControls({
  isMuted,
  isPlaying,
  isLoading,
  currentPoint,
  playbackSpeed,
  onToggleMute,
  onSpeedChange,
  language = 'en',
  className
}: NarrationControlsProps) {
  const labels = {
    muted: language === 'he' ? 'השתק' : 'Muted',
    unmute: language === 'he' ? 'הפעל קול' : 'Unmute',
    speaking: language === 'he' ? 'מדבר' : 'Speaking',
    loading: language === 'he' ? 'טוען' : 'Loading',
  };

  return (
    <div className={cn(
      'absolute top-3 right-3 z-20 flex items-center gap-2',
      className
    )}>
      {/* Status indicator */}
      <AnimatePresence>
        {(isPlaying || isLoading) && !isMuted && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            <Badge 
              variant="outline" 
              className={cn(
                'gap-1 bg-background/80 backdrop-blur-sm',
                isPlaying && 'border-jade text-jade'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {labels.loading}
                </>
              ) : isPlaying && currentPoint ? (
                <>
                  <Volume2 className="h-3 w-3 animate-pulse" />
                  {currentPoint}
                </>
              ) : null}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speed toggle button */}
      <SpeedControl
        speed={playbackSpeed}
        onSpeedChange={onSpeedChange}
        disabled={isMuted}
      />

      {/* Mute toggle button */}
      <Button
        variant={isMuted ? 'secondary' : 'default'}
        size="icon"
        className={cn(
          'h-9 w-9 rounded-full shadow-lg',
          !isMuted && 'bg-jade hover:bg-jade/90'
        )}
        onClick={onToggleMute}
        title={isMuted ? labels.unmute : labels.muted}
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Gauge } from 'lucide-react';

export type PlaybackSpeed = 0.5 | 1.0 | 1.5 | 2.0;

const SPEED_OPTIONS: { value: PlaybackSpeed; label: string; description: string }[] = [
  { value: 0.5, label: '0.5x', description: 'Slow Study' },
  { value: 1.0, label: '1x', description: 'Normal' },
  { value: 1.5, label: '1.5x', description: 'Fast Review' },
  { value: 2.0, label: '2x', description: 'Speed Listen' },
];

interface SpeedControlProps {
  speed: PlaybackSpeed;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Playback speed control for audio narration
 * Cycles through: 0.5x → 1x → 1.5x → 2x → 0.5x
 */
export function SpeedControl({ 
  speed, 
  onSpeedChange, 
  disabled = false,
  className 
}: SpeedControlProps) {
  const currentIndex = SPEED_OPTIONS.findIndex(opt => opt.value === speed);
  const currentOption = SPEED_OPTIONS[currentIndex];

  const handleCycle = () => {
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
    onSpeedChange(SPEED_OPTIONS[nextIndex].value);
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleCycle}
      disabled={disabled}
      className={cn(
        'h-9 gap-1.5 rounded-full shadow-lg bg-background/80 backdrop-blur-sm',
        'hover:bg-background/90 transition-all',
        className
      )}
      title={currentOption?.description || 'Change speed'}
    >
      <Gauge className="h-4 w-4" />
      <span className="font-medium text-xs min-w-[2.5rem]">
        {currentOption?.label || '1x'}
      </span>
    </Button>
  );
}

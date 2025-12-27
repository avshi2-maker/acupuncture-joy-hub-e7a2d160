import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useAudioPlayer } from './FloatingAudioPlayer';
import { cn } from '@/lib/utils';

interface TTSButtonProps {
  text: string;
  title?: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  showLabel?: boolean;
  label?: string;
}

export function TTSButton({ 
  text, 
  title,
  className = '', 
  size = 'icon',
  variant = 'ghost',
  showLabel = false,
  label = 'Listen'
}: TTSButtonProps) {
  const { playText, stop, isPlaying, isLoading, currentTitle } = useAudioPlayer();
  
  const isCurrentlyPlaying = isPlaying && currentTitle === (title || 'Audio');

  const handleClick = async () => {
    if (isCurrentlyPlaying) {
      stop();
    } else {
      await playText(text, title);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading || !text}
      variant={variant}
      size={size}
      className={cn(showLabel && 'gap-1.5', className)}
      title={isCurrentlyPlaying ? 'Stop audio' : 'Listen to Hebrew audio'}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isCurrentlyPlaying ? (
        <VolumeX className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
      {showLabel && <span>{isCurrentlyPlaying ? 'Stop' : label}</span>}
    </Button>
  );
}

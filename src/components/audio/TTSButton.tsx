import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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
  label = 'האזן'
}: TTSButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load voices on mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const handleClick = async () => {
    if (!text) {
      toast({
        title: "שגיאה",
        description: "אין טקסט להשמעה",
        variant: "destructive",
      });
      return;
    }

    // If playing, stop
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // Check browser support
    if (!('speechSynthesis' in window)) {
      toast({
        title: "שגיאה",
        description: "הדפדפן שלך לא תומך בהקראה",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to find a Hebrew voice
      const voices = window.speechSynthesis.getVoices();
      const hebrewVoice = voices.find(voice => 
        voice.lang.startsWith('he') || voice.lang.startsWith('iw')
      );
      
      if (hebrewVoice) {
        utterance.voice = hebrewVoice;
      }
      
      utterance.lang = 'he-IL';
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onstart = () => {
        setIsLoading(false);
        setIsPlaying(true);
      };

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = () => {
        setIsLoading(false);
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('TTS error:', error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading || !text}
      variant={variant}
      size={size}
      className={cn(showLabel && 'gap-1.5', className)}
      title={isPlaying ? 'עצור הקראה' : 'האזן לטקסט'}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPlaying ? (
        <VolumeX className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
      {showLabel && <span>{isPlaying ? 'עצור' : label}</span>}
    </Button>
  );
}

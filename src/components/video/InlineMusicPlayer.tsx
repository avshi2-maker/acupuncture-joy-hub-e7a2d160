import { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, Volume2, VolumeX, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BuiltInSound {
  id: string;
  nameHe: string;
  description: string;
  audioUrl: string;
  emoji: string;
}

const builtInSounds: BuiltInSound[] = [
  {
    id: 'rain',
    nameHe: 'גשם',
    description: 'צלילי גשם מרגיעים',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/05/16/audio_1333dfb359.mp3',
    emoji: '🌧️',
  },
  {
    id: 'ocean',
    nameHe: 'גלי ים',
    description: 'גלים שוברים על החוף',
    audioUrl: 'https://cdn.pixabay.com/audio/2024/11/04/audio_4956b9edd1.mp3',
    emoji: '🌊',
  },
  {
    id: 'birds',
    nameHe: 'ציפורים',
    description: 'שירת ציפורים ביער',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/03/10/audio_d79888256a.mp3',
    emoji: '🐦',
  },
  {
    id: 'wind',
    nameHe: 'רוח',
    description: 'רוח נושבת בעדינות',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/10/30/audio_fb047a9b18.mp3',
    emoji: '💨',
  },
];

interface InlineMusicPlayerProps {
  onClose: () => void;
}

export function InlineMusicPlayer({ onClose }: InlineMusicPlayerProps) {
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const storedVolume = localStorage.getItem('tcm-music-volume');
    if (storedVolume) {
      setVolume(parseFloat(storedVolume));
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    localStorage.setItem('tcm-music-volume', volume.toString());
  }, [volume]);

  const playSound = (sound: BuiltInSound) => {
    if (currentSound === sound.id && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(sound.audioUrl);
    audio.loop = true;
    audio.volume = volume;
    audio.play().catch(console.error);
    
    audioRef.current = audio;
    setCurrentSound(sound.id);
    setIsPlaying(true);
  };

  const stopAll = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentSound(null);
  };

  const toggleMute = () => {
    setVolume(volume > 0 ? 0 : 0.5);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <Card className="border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium">מוזיקה מרגיעה</span>
          </div>
          <div className="flex items-center gap-1">
            {isPlaying && (
              <Button size="sm" variant="ghost" onClick={stopAll} className="h-6 px-2 text-xs">
                עצור
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onClose} className="h-6 w-6 p-0">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Sound Buttons */}
        <div className="flex gap-1 mb-2">
          {builtInSounds.map((sound) => {
            const isActive = currentSound === sound.id;
            return (
              <button
                key={sound.id}
                onClick={() => playSound(sound)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-0.5 p-2 rounded-lg border transition-all text-center',
                  isActive && isPlaying
                    ? 'bg-amber-500 border-amber-600 text-white shadow-md'
                    : 'bg-background border-border hover:bg-amber-100 dark:hover:bg-amber-900/30'
                )}
                title={sound.description}
              >
                <span className="text-lg">{sound.emoji}</span>
                <span className="text-[9px] font-medium">{sound.nameHe}</span>
              </button>
            );
          })}
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="p-1 rounded hover:bg-muted transition-colors">
            {volume === 0 ? (
              <VolumeX className="h-3 w-3 text-muted-foreground" />
            ) : (
              <Volume2 className="h-3 w-3 text-amber-600" />
            )}
          </button>
          <Slider
            value={[volume]}
            onValueChange={(v) => setVolume(v[0])}
            max={1}
            step={0.05}
            className="flex-1"
          />
          <span className="text-[10px] text-muted-foreground w-7">{Math.round(volume * 100)}%</span>
        </div>
      </CardContent>
    </Card>
  );
}

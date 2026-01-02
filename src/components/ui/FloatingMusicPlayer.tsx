import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Music, X, Volume2, ExternalLink, Star, Play, Pause, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MusicSource {
  id: string;
  name: string;
  nameHe: string;
  url: string;
  description: string;
}

interface BuiltInSound {
  id: string;
  nameHe: string;
  description: string;
  audioUrl: string;
}

// Free ambient sounds from reliable CDN sources
const builtInSounds: BuiltInSound[] = [
  {
    id: 'rain',
    nameHe: 'גשם',
    description: 'צלילי גשם מרגיעים',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/05/16/audio_1333dfb359.mp3',
  },
  {
    id: 'ocean',
    nameHe: 'גלי ים',
    description: 'גלים שוברים על החוף',
    audioUrl: 'https://cdn.pixabay.com/audio/2024/11/04/audio_4956b9edd1.mp3',
  },
  {
    id: 'birds',
    nameHe: 'ציפורים',
    description: 'שירת ציפורים ביער',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/03/10/audio_d79888256a.mp3',
  },
  {
    id: 'wind',
    nameHe: 'רוח',
    description: 'רוח נושבת בעדינות',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/10/30/audio_fb047a9b18.mp3',
  },
];

const musicSources: MusicSource[] = [
  {
    id: 'ocean-ext',
    name: 'Ocean Waves',
    nameHe: 'גלי ים מתקדם',
    url: 'https://mynoise.net/NoiseMachines/oceanNoiseGenerator.php',
    description: 'צלילי גלים מרגיעים',
  },
  {
    id: 'forest',
    name: 'Forest Sounds',
    nameHe: 'צלילי יער',
    url: 'https://mynoise.net/NoiseMachines/japaneseGardenSoundscapeGenerator.php',
    description: 'ציפורים וטבע',
  },
  {
    id: 'tibetan',
    name: 'Tibetan Bowls',
    nameHe: 'קערות טיבטיות',
    url: 'https://mynoise.net/NoiseMachines/tibetanSingingBowlsDroneGenerator.php',
    description: 'צלילי מדיטציה עמוקים',
  },
  {
    id: 'rain-ext',
    name: 'Rain & Thunder',
    nameHe: 'גשם ורעמים',
    url: 'https://rainymood.com/',
    description: 'צלילי גשם מרגיעים',
  },
  {
    id: 'fireplace',
    name: 'Fireplace',
    nameHe: 'אח בוער',
    url: 'https://mynoise.net/NoiseMachines/campfireNoiseGenerator.php',
    description: 'צלילי אש מרגיעים',
  },
  {
    id: 'lofi',
    name: 'Lofi.cafe',
    nameHe: 'לופי קפה',
    url: 'https://lofi.cafe/',
    description: 'מוזיקת לופי מרגיעה',
  },
  {
    id: 'generative',
    name: 'Generative FM',
    nameHe: 'מוזיקה גנרטיבית',
    url: 'https://generative.fm/',
    description: 'אמביינט אינסופי',
  },
  {
    id: 'nature',
    name: 'A Soft Murmur',
    nameHe: 'לחישה רכה',
    url: 'https://asoftmurmur.com/',
    description: 'מיקס צלילים מותאם אישית',
  },
];

const FAVORITES_KEY = 'tcm-music-favorites';
const VOLUME_KEY = 'tcm-music-volume';

export function FloatingMusicPlayer() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load favorites and volume from localStorage on mount
  useEffect(() => {
    const storedFavorites = localStorage.getItem(FAVORITES_KEY);
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch {
        setFavorites([]);
      }
    }
    
    const storedVolume = localStorage.getItem(VOLUME_KEY);
    if (storedVolume) {
      setVolume(parseFloat(storedVolume));
    }
  }, []);

  // Update audio volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    localStorage.setItem(VOLUME_KEY, volume.toString());
  }, [volume]);

  // Hide on TCM Brain page and Video Session page (have their own controls)
  if (location.pathname === '/tcm-brain' || location.pathname === '/video-session') {
    return null;
  }

  const saveFavorites = (newFavorites: string[]) => {
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorites.includes(id)) {
      saveFavorites(favorites.filter(f => f !== id));
    } else {
      saveFavorites([...favorites, id]);
    }
  };

  const openMusicSource = (url: string) => {
    window.open(url, 'music_player', 'width=400,height=600,left=100,top=100');
  };

  const playBuiltInSound = (sound: BuiltInSound) => {
    // If clicking the same sound, toggle play/pause
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

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Create and play new audio
    const audio = new Audio(sound.audioUrl);
    audio.loop = true;
    audio.volume = volume;
    audio.play().catch(console.error);
    
    audioRef.current = audio;
    setCurrentSound(sound.id);
    setIsPlaying(true);

    // Handle audio ending (shouldn't happen with loop, but just in case)
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentSound(null);
    };
  };

  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentSound(null);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (volume > 0) {
      setVolume(0);
    } else {
      setVolume(0.5);
    }
  };

  // Sort sources: favorites first, then others
  const sortedSources = [...musicSources].sort((a, b) => {
    const aFav = favorites.includes(a.id);
    const bFav = favorites.includes(b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  const hasFavorites = favorites.length > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          className={`fixed top-20 right-4 z-50 h-12 w-12 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
            isPlaying 
              ? 'bg-amber-500 hover:bg-amber-600 animate-pulse' 
              : 'bg-jade hover:bg-jade/90'
          } text-white`}
          aria-label="פתח נגן מוזיקה"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Music className="h-5 w-5" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        side="bottom" 
        align="start" 
        className="w-80 p-0 bg-background border border-border shadow-xl"
        sideOffset={8}
      >
        <div className="p-4 border-b border-border bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-jade" />
              <h3 className="font-medium text-foreground">מוזיקה מרגיעה</h3>
            </div>
            {isPlaying && (
              <Button
                size="sm"
                variant="ghost"
                onClick={stopAllAudio}
                className="h-7 px-2 text-xs"
              >
                עצור הכל
              </Button>
            )}
          </div>
          
          {/* Volume Control */}
          <div className="flex items-center gap-3 mt-3">
            <button 
              onClick={toggleMute}
              className="p-1 rounded hover:bg-muted transition-colors"
            >
              {volume === 0 ? (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Volume2 className="h-4 w-4 text-jade" />
              )}
            </button>
            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              max={1}
              step={0.05}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8 text-left">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        <Tabs defaultValue="builtin" className="w-full">
          <TabsList className="w-full grid grid-cols-2 h-9 rounded-none border-b border-border bg-transparent">
            <TabsTrigger value="builtin" className="text-xs data-[state=active]:bg-muted">
              🎧 נגן מובנה
            </TabsTrigger>
            <TabsTrigger value="external" className="text-xs data-[state=active]:bg-muted">
              🌐 מקורות חיצוניים
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builtin" className="mt-0">
            <div className="p-2 max-h-48 overflow-y-auto">
              {builtInSounds.map((sound) => {
                const isActive = currentSound === sound.id;
                return (
                  <button
                    key={sound.id}
                    onClick={() => playBuiltInSound(sound)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-right ${
                      isActive ? 'bg-jade/10 border border-jade/30' : 'hover:bg-muted/80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isActive && isPlaying ? (
                        <Pause className="h-5 w-5 text-jade" />
                      ) : (
                        <Play className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 mr-2">
                      <div className="font-medium text-foreground text-sm">
                        {sound.nameHe}
                        {isActive && isPlaying && (
                          <span className="mr-2 text-jade text-xs">♪ מתנגן</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{sound.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="external" className="mt-0">
            <div className="p-2 max-h-48 overflow-y-auto">
              <p className="text-xs text-muted-foreground px-2 mb-2">
                {hasFavorites ? '⭐ המועדפים שלך מופיעים ראשונים' : 'לחץ על ⭐ לשמירת מועדפים'}
              </p>
              {sortedSources.map((source, index) => {
                const isFavorite = favorites.includes(source.id);
                const isFirstNonFavorite = hasFavorites && !isFavorite && 
                  (index === 0 || favorites.includes(sortedSources[index - 1].id));
                
                return (
                  <div key={source.id}>
                    {isFirstNonFavorite && (
                      <div className="border-t border-border my-2" />
                    )}
                    <button
                      onClick={() => openMusicSource(source.url)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/80 transition-colors text-right group"
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => toggleFavorite(source.id, e)}
                          className="p-1 rounded hover:bg-muted transition-colors"
                          aria-label={isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
                        >
                          <Star 
                            className={`h-4 w-4 transition-colors ${
                              isFavorite 
                                ? 'fill-amber-400 text-amber-400' 
                                : 'text-muted-foreground hover:text-amber-400'
                            }`} 
                          />
                        </button>
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex-1 mr-2">
                        <div className="font-medium text-foreground text-sm">
                          {source.nameHe}
                        </div>
                        <div className="text-xs text-muted-foreground">{source.description}</div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        <div className="p-3 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            🎵 כל המקורות חינמיים ללא פרסומות
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

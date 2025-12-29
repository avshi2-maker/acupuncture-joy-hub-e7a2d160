import { useState, useEffect } from 'react';
import { Music, X, Volume2, ExternalLink, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface MusicSource {
  id: string;
  name: string;
  nameHe: string;
  url: string;
  description: string;
}

const musicSources: MusicSource[] = [
  // Nature Sounds
  {
    id: 'ocean',
    name: 'Ocean Waves',
    nameHe: 'גלי ים',
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
    id: 'rain',
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
  // Music Streams
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
  {
    id: 'focus',
    name: 'Noisli',
    nameHe: 'נויזלי',
    url: 'https://www.noisli.com/',
    description: 'צלילי רקע לריכוז',
  },
];

const FAVORITES_KEY = 'tcm-music-favorites';

export function FloatingMusicPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  // Save favorites to localStorage
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
          className="fixed bottom-20 left-4 z-50 h-12 w-12 rounded-full shadow-lg bg-jade hover:bg-jade/90 text-white transition-all duration-300 hover:scale-110"
          aria-label="פתח נגן מוזיקה"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Music className="h-5 w-5" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        side="top" 
        align="start" 
        className="w-72 p-0 bg-background border border-border shadow-xl"
        sideOffset={8}
      >
        <div className="p-4 border-b border-border bg-muted/50">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-jade" />
            <h3 className="font-medium text-foreground">מוזיקה מרגיעה לטיפול</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {hasFavorites ? 'המועדפים שלך מופיעים ראשונים' : 'לחץ על ⭐ לשמירת מועדפים'}
          </p>
        </div>
        <div className="p-2 max-h-64 overflow-y-auto">
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
                    <div className="font-medium text-foreground text-sm flex items-center justify-end gap-1">
                      {source.nameHe}
                    </div>
                    <div className="text-xs text-muted-foreground">{source.description}</div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
        <div className="p-3 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            🎵 כל המקורות חינמיים ללא פרסומות
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

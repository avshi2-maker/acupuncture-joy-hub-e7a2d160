import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface SoundSource {
  id: string;
  name: string;
  nameHe: string;
  url: string;
  emoji: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  errorMessage?: string;
}

// Test multiple audio sources to find working ones
const AUDIO_SOURCES: Omit<SoundSource, 'status'>[] = [
  // Pixabay sources (previously used)
  {
    id: 'pixabay-rain',
    name: 'Rain (Pixabay)',
    nameHe: 'גשם',
    url: 'https://cdn.pixabay.com/audio/2022/05/16/audio_1333dfb359.mp3',
    emoji: '🌧️',
  },
  {
    id: 'pixabay-ocean',
    name: 'Ocean (Pixabay)',
    nameHe: 'גלי ים',
    url: 'https://cdn.pixabay.com/audio/2024/11/04/audio_4956b9edd1.mp3',
    emoji: '🌊',
  },
  // Free sound sources
  {
    id: 'freesound-rain',
    name: 'Rain (FreeSound)',
    nameHe: 'גשם',
    url: 'https://freesound.org/data/previews/531/531947_5674468-lq.mp3',
    emoji: '🌧️',
  },
  // Soundjay
  {
    id: 'soundjay-birds',
    name: 'Birds (SoundJay)',
    nameHe: 'ציפורים',
    url: 'https://www.soundjay.com/nature/sounds/birds-1.mp3',
    emoji: '🐦',
  },
  // Zapsplat style (public domain)
  {
    id: 'mixkit-rain',
    name: 'Rain Loop (Mixkit)',
    nameHe: 'גשם',
    url: 'https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3',
    emoji: '🌧️',
  },
  {
    id: 'mixkit-forest',
    name: 'Forest (Mixkit)',
    nameHe: 'יער',
    url: 'https://assets.mixkit.co/active_storage/sfx/2499/2499-preview.mp3',
    emoji: '🌲',
  },
  {
    id: 'mixkit-ocean',
    name: 'Ocean (Mixkit)',
    nameHe: 'ים',
    url: 'https://assets.mixkit.co/active_storage/sfx/2432/2432-preview.mp3',
    emoji: '🌊',
  },
  {
    id: 'mixkit-wind',
    name: 'Wind (Mixkit)',
    nameHe: 'רוח',
    url: 'https://assets.mixkit.co/active_storage/sfx/2527/2527-preview.mp3',
    emoji: '💨',
  },
];

export default function MusicPlayerTest() {
  const [sources, setSources] = useState<SoundSource[]>(
    AUDIO_SOURCES.map(s => ({ ...s, status: 'idle' as const }))
  );
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isTestingAll, setIsTestingAll] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const updateSourceStatus = (id: string, status: SoundSource['status'], errorMessage?: string) => {
    setSources(prev => prev.map(s => 
      s.id === id ? { ...s, status, errorMessage } : s
    ));
  };

  const testSource = async (source: SoundSource): Promise<boolean> => {
    updateSourceStatus(source.id, 'loading');
    
    return new Promise((resolve) => {
      const audio = new Audio();
      
      const cleanup = () => {
        audio.removeEventListener('canplaythrough', onSuccess);
        audio.removeEventListener('error', onError);
        audio.src = '';
      };

      const onSuccess = () => {
        updateSourceStatus(source.id, 'success');
        cleanup();
        resolve(true);
      };

      const onError = (e: Event) => {
        const error = audio.error;
        let message = 'Unknown error';
        if (error) {
          switch (error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              message = 'Playback aborted';
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              message = 'Network error';
              break;
            case MediaError.MEDIA_ERR_DECODE:
              message = 'Decode error';
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              message = 'Format not supported';
              break;
          }
        }
        updateSourceStatus(source.id, 'error', message);
        cleanup();
        resolve(false);
      };

      audio.addEventListener('canplaythrough', onSuccess, { once: true });
      audio.addEventListener('error', onError, { once: true });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (sources.find(s => s.id === source.id)?.status === 'loading') {
          updateSourceStatus(source.id, 'error', 'Timeout - took too long');
          cleanup();
          resolve(false);
        }
      }, 10000);

      audio.src = source.url;
      audio.load();
    });
  };

  const testAllSources = async () => {
    setIsTestingAll(true);
    setSources(prev => prev.map(s => ({ ...s, status: 'idle' as const, errorMessage: undefined })));
    
    for (const source of sources) {
      await testSource(source);
    }
    
    setIsTestingAll(false);
  };

  const playSource = async (source: SoundSource) => {
    // Stop current if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // If clicking same source, just stop
    if (currentlyPlaying === source.id) {
      setCurrentlyPlaying(null);
      return;
    }

    // Create new audio and play
    const audio = new Audio(source.url);
    audio.loop = true;
    audio.volume = volume;
    
    try {
      await audio.play();
      audioRef.current = audio;
      setCurrentlyPlaying(source.id);
      updateSourceStatus(source.id, 'success');
    } catch (err: any) {
      console.error('[MusicTest] Play error:', err);
      updateSourceStatus(source.id, 'error', err.message || 'Play failed');
      setCurrentlyPlaying(null);
    }
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setCurrentlyPlaying(null);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    setVolume(volume > 0 ? 0 : 0.5);
    if (audioRef.current) {
      audioRef.current.volume = volume > 0 ? 0 : 0.5;
    }
  };

  const workingSources = sources.filter(s => s.status === 'success');
  const failedSources = sources.filter(s => s.status === 'error');

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back button */}
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🎵 Music Player Test</span>
              <Badge variant={workingSources.length > 0 ? 'default' : 'secondary'}>
                {workingSources.length}/{sources.length} working
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={testAllSources} 
                disabled={isTestingAll}
                className="gap-2"
              >
                {isTestingAll && <Loader2 className="h-4 w-4 animate-spin" />}
                Test All Sources
              </Button>
              
              {currentlyPlaying && (
                <Button variant="destructive" onClick={stopPlayback} className="gap-2">
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              )}
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <button onClick={toggleMute} className="p-1 hover:bg-background rounded">
                {volume === 0 ? (
                  <VolumeX className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Volume2 className="h-5 w-5 text-primary" />
                )}
              </button>
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.05}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12">
                {Math.round(volume * 100)}%
              </span>
            </div>

            {/* Audio Sources List */}
            <div className="space-y-2">
              {sources.map((source) => {
                const isPlaying = currentlyPlaying === source.id;
                
                return (
                  <div 
                    key={source.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      isPlaying 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-card border-border hover:bg-muted/50'
                    }`}
                  >
                    {/* Play Button */}
                    <Button
                      size="icon"
                      variant={isPlaying ? 'default' : 'outline'}
                      onClick={() => playSource(source)}
                      disabled={source.status === 'loading'}
                      className="h-10 w-10 shrink-0"
                    >
                      {source.status === 'loading' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{source.emoji}</span>
                        <span className="font-medium truncate">{source.name}</span>
                        {isPlaying && (
                          <Badge variant="default" className="animate-pulse">
                            Playing
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{source.url}</p>
                      {source.errorMessage && (
                        <p className="text-xs text-destructive">{source.errorMessage}</p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="shrink-0">
                      {source.status === 'success' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {source.status === 'error' && (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      {source.status === 'loading' && (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            {(workingSources.length > 0 || failedSources.length > 0) && (
              <div className="p-3 rounded-lg bg-muted text-sm">
                <p><strong>Summary:</strong></p>
                {workingSources.length > 0 && (
                  <p className="text-green-600">✅ {workingSources.length} sources working</p>
                )}
                {failedSources.length > 0 && (
                  <p className="text-destructive">❌ {failedSources.length} sources failed</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Test which audio sources work in your browser, then we'll use the working ones for the final player.
        </p>
      </div>
    </div>
  );
}

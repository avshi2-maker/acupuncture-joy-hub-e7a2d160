import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { ThemedClockWidget, getClockTheme, type ClockTheme } from '@/components/ui/ThemedClockWidget';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import {
  Play,
  Pause,
  Square,
  Users,
  Calendar,
  HelpCircle,
  Music,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Home,
  Printer,
  Download,
  MessageSquare,
  Mic,
  MicOff,
  Accessibility,
  Plus,
  Minus
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface BuiltInSound {
  id: string;
  nameHe: string;
  name: string;
  audioUrl: string;
}

const builtInSounds: BuiltInSound[] = [
  { id: 'rain', nameHe: 'גשם', name: 'Rain', audioUrl: 'https://cdn.pixabay.com/audio/2022/05/16/audio_1333dfb359.mp3' },
  { id: 'ocean', nameHe: 'גלי ים', name: 'Ocean', audioUrl: 'https://cdn.pixabay.com/audio/2024/11/04/audio_4956b9edd1.mp3' },
  { id: 'birds', nameHe: 'ציפורים', name: 'Birds', audioUrl: 'https://cdn.pixabay.com/audio/2022/03/10/audio_d79888256a.mp3' },
  { id: 'wind', nameHe: 'רוח', name: 'Wind', audioUrl: 'https://cdn.pixabay.com/audio/2022/10/30/audio_fb047a9b18.mp3' },
];

export type TcmVoiceCommand = 
  | 'generate-summary'
  | 'save-to-patient'
  | 'export-session'
  | 'print-report'
  | 'share-whatsapp'
  | 'generate-audio'
  | 'start-session'
  | 'pause-session'
  | 'end-session'
  | 'clear-chat'
  | 'next-tab'
  | 'previous-tab';

interface TcmBrainToolbarProps {
  sessionStatus: 'idle' | 'running' | 'paused' | 'ended';
  sessionSeconds: number;
  formatSessionTime: (seconds: number) => string;
  onStartSession: () => void;
  onPauseSession: () => void;
  onContinueSession: () => void;
  onEndSession: () => void;
  onExport?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  onVoiceCommand?: (command: TcmVoiceCommand) => void;
  isSessionActive?: boolean;
}

// Voice command mappings
const ENGLISH_COMMANDS: Record<string, TcmVoiceCommand> = {
  'generate summary': 'generate-summary',
  'create summary': 'generate-summary',
  'summary': 'generate-summary',
  'save to patient': 'save-to-patient',
  'save': 'save-to-patient',
  'export': 'export-session',
  'print': 'print-report',
  'share': 'share-whatsapp',
  'whatsapp': 'share-whatsapp',
  'start session': 'start-session',
  'start': 'start-session',
  'pause': 'pause-session',
  'end session': 'end-session',
  'clear': 'clear-chat',
  'next tab': 'next-tab',
  'previous tab': 'previous-tab',
};

const HEBREW_COMMANDS: Record<string, TcmVoiceCommand> = {
  'סיכום': 'generate-summary',
  'שמור': 'save-to-patient',
  'ייצא': 'export-session',
  'הדפס': 'print-report',
  'וואטסאפ': 'share-whatsapp',
  'התחל': 'start-session',
  'השהה': 'pause-session',
  'סיים': 'end-session',
  'נקה': 'clear-chat',
  'הבא': 'next-tab',
  'הקודם': 'previous-tab',
};

export function TcmBrainToolbar({
  sessionStatus,
  sessionSeconds,
  formatSessionTime,
  onStartSession,
  onPauseSession,
  onContinueSession,
  onEndSession,
  onExport,
  onPrint,
  onShare,
  onVoiceCommand,
  isSessionActive
}: TcmBrainToolbarProps) {
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize, highContrast, setHighContrast } = useAccessibility();
  const haptic = useHapticFeedback();
  const [clockTheme] = useState<ClockTheme>(getClockTheme());
  const [musicOpen, setMusicOpen] = useState(false);
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);

  // Voice command state
  const [isListening, setIsListening] = useState(false);
  const [isAwake, setIsAwake] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'en' | 'he'>('en');
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null);
  const awakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isVoiceSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const currentCommands = voiceLang === 'he' ? HEBREW_COMMANDS : ENGLISH_COMMANDS;
  const currentWakeWord = voiceLang === 'he' ? 'היי סיאם' : 'hey cm';

  const processTranscript = useCallback((transcript: string) => {
    const lowerTranscript = transcript.toLowerCase().trim();
    if (lowerTranscript.includes(currentWakeWord.toLowerCase())) {
      setIsAwake(true);
      haptic.medium();
      toast.info(voiceLang === 'he' ? '🎙️ מקשיב...' : '🎙️ Listening...', { duration: 2000 });
      if (awakeTimeoutRef.current) clearTimeout(awakeTimeoutRef.current);
      awakeTimeoutRef.current = setTimeout(() => setIsAwake(false), 6000);
      const afterWakeWord = lowerTranscript.split(currentWakeWord.toLowerCase())[1]?.trim();
      if (afterWakeWord) processCommand(afterWakeWord);
      return;
    }
    if (isAwake) processCommand(lowerTranscript);
  }, [currentWakeWord, isAwake, haptic, voiceLang]);

  const processCommand = useCallback((text: string) => {
    for (const [phrase, command] of Object.entries(currentCommands)) {
      if (text.includes(phrase)) {
        setIsAwake(false);
        haptic.success();
        onVoiceCommand?.(command);
        toast.success(`✓ ${command}`, { duration: 2000 });
        if (awakeTimeoutRef.current) clearTimeout(awakeTimeoutRef.current);
        return;
      }
    }
  }, [onVoiceCommand, haptic, currentCommands]);

  const startListening = useCallback(() => {
    if (!isVoiceSupported) return;
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = voiceLang === 'he' ? 'he-IL' : 'en-US';

      recognitionRef.current.onresult = (event) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;
        if (event.results[last].isFinal) processTranscript(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied');
          setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening && recognitionRef.current) recognitionRef.current.start();
      };

      recognitionRef.current.start();
      setIsListening(true);
      haptic.light();
      toast.success(voiceLang === 'he' ? '🎙️ אמור "היי סיאם"' : '🎙️ Say "Hey CM"', { duration: 2000 });
    } catch (error) {
      console.error('Speech recognition error:', error);
    }
  }, [isVoiceSupported, isListening, processTranscript, haptic, voiceLang]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setIsAwake(false);
    haptic.light();
  }, [haptic]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (awakeTimeoutRef.current) clearTimeout(awakeTimeoutRef.current);
    };
  }, []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const playSound = (sound: BuiltInSound) => {
    if (currentSound === sound.id && audioElement) {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }

    const audio = new Audio(sound.audioUrl);
    audio.loop = true;
    audio.volume = volume;
    audio.play().catch(console.error);
    
    setAudioElement(audio);
    setCurrentSound(sound.id);
    setIsPlaying(true);
  };

  const stopMusic = () => {
    if (audioElement) {
      audioElement.pause();
      setAudioElement(null);
    }
    setIsPlaying(false);
    setCurrentSound(null);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioElement) {
      audioElement.volume = newVolume;
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-wrap items-center gap-2 p-2 bg-card/80 backdrop-blur-sm border-b">
        {/* Gold Clock Widget */}
        <ThemedClockWidget theme={clockTheme} className="hidden md:flex" />

        {/* Session Controls */}
        <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-lg">
          {(sessionStatus === 'idle' || sessionStatus === 'ended') ? (
            <Button size="sm" variant="default" className="h-8 bg-jade hover:bg-jade/90" onClick={onStartSession}>
              <Play className="h-4 w-4 mr-1" />
              Start
            </Button>
          ) : sessionStatus === 'running' ? (
            <Button size="sm" variant="secondary" className="h-8" onClick={onPauseSession}>
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
          ) : (
            <Button size="sm" variant="default" className="h-8 bg-jade hover:bg-jade/90" onClick={onContinueSession}>
              <Play className="h-4 w-4 mr-1" />
              Resume
            </Button>
          )}
          
          {(sessionStatus !== 'idle' && sessionStatus !== 'ended') && (
            <>
              <Button size="sm" variant="destructive" className="h-8" onClick={onEndSession}>
                <Square className="h-3 w-3 mr-1" />
                End
              </Button>
              <Badge variant="outline" className={`ml-1 ${sessionStatus === 'running' ? 'bg-jade/10 text-jade animate-pulse' : ''}`}>
                {formatSessionTime(sessionSeconds)}
              </Badge>
            </>
          )}
        </div>

        <div className="h-6 w-px bg-border hidden sm:block" />

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                <Link to="/dashboard"><Home className="h-4 w-4" /></Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Dashboard</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                <Link to="/crm/patients"><Users className="h-4 w-4" /></Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>CRM Patients</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                <Link to="/crm/calendar"><Calendar className="h-4 w-4" /></Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Calendar</TooltipContent>
          </Tooltip>
        </div>

        <div className="h-6 w-px bg-border hidden sm:block" />

        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          {onExport && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onExport}>
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export Session</TooltipContent>
            </Tooltip>
          )}

          {onPrint && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onPrint}>
                  <Printer className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Print Report</TooltipContent>
            </Tooltip>
          )}

          {onShare && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onShare}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share via WhatsApp</TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="flex-1" />

        {/* Right Side Tools */}
        <div className="flex items-center gap-1">
          {/* Music Player */}
          <Popover open={musicOpen} onOpenChange={setMusicOpen}>
            <PopoverTrigger asChild>
              <Button 
                size="sm" 
                variant={isPlaying ? 'default' : 'ghost'} 
                className={cn(
                  'h-8 w-8 p-0 relative overflow-hidden',
                  isPlaying && 'bg-amber-500 hover:bg-amber-600'
                )}
              >
                {isPlaying ? (
                  <div className="flex items-end justify-center gap-[2px] h-4 w-4">
                    <span className="w-[3px] bg-white rounded-full animate-[equalizer_0.5s_ease-in-out_infinite]" style={{ height: '60%' }} />
                    <span className="w-[3px] bg-white rounded-full animate-[equalizer_0.5s_ease-in-out_infinite_0.1s]" style={{ height: '100%' }} />
                    <span className="w-[3px] bg-white rounded-full animate-[equalizer_0.5s_ease-in-out_infinite_0.2s]" style={{ height: '40%' }} />
                    <span className="w-[3px] bg-white rounded-full animate-[equalizer_0.5s_ease-in-out_infinite_0.3s]" style={{ height: '80%' }} />
                  </div>
                ) : (
                  <Music className="h-4 w-4" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="end">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Background Music</span>
                  {isPlaying && (
                    <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={stopMusic}>
                      Stop
                    </Button>
                  )}
                </div>
                
                {/* Volume */}
                <div className="flex items-center gap-2">
                  <button onClick={() => setVolume(volume > 0 ? 0 : 0.5)} className="p-1">
                    {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-jade" />}
                  </button>
                  <Slider value={[volume]} onValueChange={handleVolumeChange} max={1} step={0.05} className="flex-1" />
                  <span className="text-xs w-8">{Math.round(volume * 100)}%</span>
                </div>

                {/* Sound Options */}
                <div className="grid grid-cols-2 gap-2">
                  {builtInSounds.map((sound) => (
                    <button
                      key={sound.id}
                      onClick={() => playSound(sound)}
                      className={`p-2 rounded-lg text-xs text-center transition-colors ${
                        currentSound === sound.id && isPlaying
                          ? 'bg-jade/20 border border-jade text-jade'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {sound.name}
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Voice Commands */}
          {isVoiceSupported && (
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      setVoiceLang(prev => prev === 'en' ? 'he' : 'en');
                      toast.info(voiceLang === 'en' ? '🇮🇱 עברית' : '🇺🇸 English', { duration: 1000 });
                    }}
                  >
                    <span className="text-[10px] font-bold">{voiceLang === 'he' ? 'EN' : 'עב'}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{voiceLang === 'he' ? 'Switch to English' : 'Switch to Hebrew'}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant={isListening ? 'default' : 'ghost'}
                    className={cn(
                      'h-8 w-8 p-0',
                      isListening && 'bg-jade hover:bg-jade/90',
                      isAwake && 'animate-pulse'
                    )}
                    onClick={isListening ? stopListening : startListening}
                  >
                    {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isListening ? 'Stop Voice Commands' : 'Start Voice Commands'}
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Accessibility */}
          <Popover open={accessibilityOpen} onOpenChange={setAccessibilityOpen}>
            <PopoverTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Accessibility className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="end">
              <div className="space-y-3">
                <h4 className="text-sm font-medium">נגישות / Accessibility</h4>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">גודל טקסט / Text Size</label>
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        const sizes = ['small', 'medium', 'large', 'xlarge'] as const;
                        const idx = sizes.indexOf(fontSize);
                        if (idx > 0) setFontSize(sizes[idx - 1]);
                      }}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-xs font-medium capitalize">{fontSize}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        const sizes = ['small', 'medium', 'large', 'xlarge'] as const;
                        const idx = sizes.indexOf(fontSize);
                        if (idx < sizes.length - 1) setFontSize(sizes[idx + 1]);
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Theme Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</TooltipContent>
          </Tooltip>

          {/* Help */}
          <Popover open={helpOpen} onOpenChange={setHelpOpen}>
            <PopoverTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
              <div className="space-y-3">
                <h4 className="font-semibold">TCM Brain Help</h4>
                <div className="text-sm space-y-2 text-muted-foreground">
                  <p><strong>Voice Commands:</strong> Say "Hey CM" followed by:</p>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li>"Generate summary" - AI summary</li>
                    <li>"Save to patient" - Save to CRM</li>
                    <li>"Start/Pause/End session"</li>
                    <li>"Next/Previous tab"</li>
                  </ul>
                  <p className="pt-2"><strong>Hebrew:</strong> אמור "היי סיאם" ואז:</p>
                  <ul className="list-disc list-inside text-xs space-y-1" dir="rtl">
                    <li>סיכום - צור סיכום</li>
                    <li>שמור - שמור למטופל</li>
                    <li>התחל/השהה/סיים</li>
                  </ul>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Knowledge assets flash when relevant to AI responses.
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </TooltipProvider>
  );
}

// Type declarations for Speech Recognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInterface;
    webkitSpeechRecognition: new () => SpeechRecognitionInterface;
  }
}

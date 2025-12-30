import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, X, Languages, Copy, Check, ClipboardPaste } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FloatingVoiceButtonProps {
  className?: string;
}

// Get speech recognition constructor
const getSpeechRecognition = (): any => {
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
};

const VOICE_LANGUAGES = [
  { code: 'he-IL', label: 'עברית', flag: '🇮🇱' },
  { code: 'en-US', label: 'English', flag: '🇺🇸' },
  { code: 'ru-RU', label: 'Русский', flag: '🇷🇺' },
  { code: 'ar-SA', label: 'العربية', flag: '🇸🇦' },
  { code: 'zh-CN', label: '中文', flag: '🇨🇳' },
];

export function FloatingVoiceButton({ className }: FloatingVoiceButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [language, setLanguage] = useState('he-IL');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [copied, setCopied] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = language;

    recognitionInstance.onstart = () => {
      setIsListening(true);
    };

    recognitionInstance.onresult = (event: any) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptText = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptText;
        } else {
          interim += transcriptText;
        }
      }

      setInterimTranscript(interim);

      if (finalTranscript) {
        setTranscript(prev => prev ? `${prev} ${finalTranscript}` : finalTranscript);
      }
    };

    recognitionInstance.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);

      if (event.error === 'no-speech') {
        toast.info('לא זוהה דיבור');
      } else if (event.error === 'not-allowed') {
        toast.error('גישה למיקרופון נדחתה');
      }
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);

    return () => {
      try {
        recognitionInstance.abort();
      } catch (e) {
        // Ignore
      }
    };
  }, [language]);

  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.lang = language;
        recognition.start();
        toast.info('מקשיב... דבר עכשיו');
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast.error('לא ניתן להפעיל זיהוי קולי');
      }
    }
  }, [recognition, isListening, language]);

  const copyToClipboard = async () => {
    if (!transcript) return;
    
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      toast.success('הועתק ללוח');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('שגיאה בהעתקה');
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  const handleClose = () => {
    if (isListening && recognition) {
      recognition.stop();
    }
    setIsOpen(false);
    clearTranscript();
  };

  if (!isSupported) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full shadow-lg',
          'bg-gradient-to-br from-jade to-jade-600 hover:from-jade-600 hover:to-jade-700',
          'transition-all duration-300 hover:scale-110',
          isOpen && 'hidden',
          className
        )}
        size="icon"
      >
        <Mic className="h-6 w-6 text-white" />
      </Button>

      {/* Expanded Voice Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 animate-fade-in-up">
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-jade/20 to-gold/10 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  isListening ? 'bg-red-500 animate-pulse' : 'bg-muted-foreground/30'
                )} />
                <span className="font-medium text-sm">
                  {isListening ? 'מקליט...' : 'הקלטה קולית'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {/* Language Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2 gap-1">
                      <Languages className="h-4 w-4" />
                      <span className="text-xs">
                        {VOICE_LANGUAGES.find(l => l.code === language)?.flag}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {VOICE_LANGUAGES.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={cn(
                          'cursor-pointer',
                          language === lang.code && 'bg-jade/10'
                        )}
                      >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Transcript Area */}
            <div className="p-4 min-h-[120px] max-h-[200px] overflow-y-auto">
              {transcript || interimTranscript ? (
                <div className="space-y-2">
                  {transcript && (
                    <p className="text-sm leading-relaxed" dir="auto">
                      {transcript}
                    </p>
                  )}
                  {interimTranscript && (
                    <p className="text-sm text-muted-foreground italic" dir="auto">
                      {interimTranscript}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-4">
                  <Mic className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    לחץ על כפתור המיקרופון והתחל לדבר
                  </p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-3 border-t border-border/50 bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-1">
                {transcript && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyToClipboard}
                          className="h-8 px-2 text-xs gap-1"
                        >
                          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>העתק ללוח</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            // Find the currently focused input/textarea and paste
                            const activeElement = document.activeElement;
                            if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
                              const start = activeElement.selectionStart || 0;
                              const end = activeElement.selectionEnd || 0;
                              const currentValue = activeElement.value;
                              const newValue = currentValue.slice(0, start) + transcript + currentValue.slice(end);
                              
                              // Create and dispatch input event
                              const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                                activeElement instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
                                'value'
                              )?.set;
                              
                              if (nativeInputValueSetter) {
                                nativeInputValueSetter.call(activeElement, newValue);
                                activeElement.dispatchEvent(new Event('input', { bubbles: true }));
                              }
                              
                              toast.success('הודבק בהצלחה');
                            } else {
                              // Copy to clipboard if no input is focused
                              navigator.clipboard.writeText(transcript);
                              toast.info('הועתק ללוח - לחץ על שדה טקסט והדבק');
                            }
                          }}
                          className="h-8 px-2 text-xs gap-1 bg-jade hover:bg-jade/90"
                        >
                          <ClipboardPaste className="h-3 w-3" />
                          הדבק
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>הדבק לשדה הנוכחי</TooltipContent>
                    </Tooltip>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearTranscript}
                      className="h-8 px-2 text-xs text-muted-foreground"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>

              {/* Main Mic Button */}
              <Button
                onClick={toggleListening}
                className={cn(
                  'h-12 w-12 rounded-full transition-all duration-200',
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse ring-4 ring-red-500/30'
                    : 'bg-jade hover:bg-jade/90'
                )}
                size="icon"
              >
                {isListening ? (
                  <MicOff className="h-5 w-5 text-white" />
                ) : (
                  <Mic className="h-5 w-5 text-white" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

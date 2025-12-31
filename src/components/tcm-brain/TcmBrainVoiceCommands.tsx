import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { toast } from 'sonner';

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

interface TcmBrainVoiceCommandsProps {
  onCommand: (command: TcmVoiceCommand) => void;
  isSessionActive: boolean;
  wakeWord?: string;
  language?: 'en' | 'he';
}

// English voice commands
const ENGLISH_COMMANDS: Record<string, TcmVoiceCommand> = {
  'generate summary': 'generate-summary',
  'create summary': 'generate-summary',
  'summary': 'generate-summary',
  'summarize': 'generate-summary',
  'ai summary': 'generate-summary',
  'topic summary': 'generate-summary',
  'save to patient': 'save-to-patient',
  'save patient': 'save-to-patient',
  'save': 'save-to-patient',
  'save file': 'save-to-patient',
  'save record': 'save-to-patient',
  'export': 'export-session',
  'export session': 'export-session',
  'download': 'export-session',
  'download session': 'export-session',
  'print': 'print-report',
  'print report': 'print-report',
  'print session': 'print-report',
  'share whatsapp': 'share-whatsapp',
  'whatsapp': 'share-whatsapp',
  'send whatsapp': 'share-whatsapp',
  'share': 'share-whatsapp',
  'generate audio': 'generate-audio',
  'create audio': 'generate-audio',
  'make mp3': 'generate-audio',
  'audio': 'generate-audio',
  'mp3': 'generate-audio',
  'start session': 'start-session',
  'begin session': 'start-session',
  'start': 'start-session',
  'pause session': 'pause-session',
  'pause': 'pause-session',
  'end session': 'end-session',
  'stop session': 'end-session',
  'finish': 'end-session',
  'clear': 'clear-chat',
  'clear chat': 'clear-chat',
  'reset': 'clear-chat',
  'next tab': 'next-tab',
  'next': 'next-tab',
  'previous tab': 'previous-tab',
  'previous': 'previous-tab',
  'back': 'previous-tab',
};

// Hebrew voice commands
const HEBREW_COMMANDS: Record<string, TcmVoiceCommand> = {
  // Summary - סיכום
  'סיכום': 'generate-summary',
  'צור סיכום': 'generate-summary',
  'סכם': 'generate-summary',
  'תסכם': 'generate-summary',
  'סיכום נושא': 'generate-summary',
  
  // Save - שמור
  'שמור': 'save-to-patient',
  'שמור למטופל': 'save-to-patient',
  'שמור קובץ': 'save-to-patient',
  'שמור לתיק': 'save-to-patient',
  'שמירה': 'save-to-patient',
  
  // Export - ייצוא
  'ייצא': 'export-session',
  'ייצוא': 'export-session',
  'הורד': 'export-session',
  'הורדה': 'export-session',
  
  // Print - הדפסה
  'הדפס': 'print-report',
  'הדפסה': 'print-report',
  'הדפס דוח': 'print-report',
  
  // WhatsApp - וואטסאפ
  'שלח וואטסאפ': 'share-whatsapp',
  'וואטסאפ': 'share-whatsapp',
  'שתף': 'share-whatsapp',
  'שיתוף': 'share-whatsapp',
  
  // Audio - אודיו
  'צור אודיו': 'generate-audio',
  'אודיו': 'generate-audio',
  'הקלטה': 'generate-audio',
  'mp3': 'generate-audio',
  
  // Session - טיפול
  'התחל טיפול': 'start-session',
  'התחל': 'start-session',
  'התחלה': 'start-session',
  'עצור': 'pause-session',
  'השהה': 'pause-session',
  'הפסקה': 'pause-session',
  'סיים טיפול': 'end-session',
  'סיום': 'end-session',
  'סיים': 'end-session',
  
  // Clear - נקה
  'נקה': 'clear-chat',
  'ניקוי': 'clear-chat',
  'אפס': 'clear-chat',
  'מחק': 'clear-chat',
  
  // Navigation - ניווט
  'הבא': 'next-tab',
  'טאב הבא': 'next-tab',
  'קדימה': 'next-tab',
  'הקודם': 'previous-tab',
  'טאב קודם': 'previous-tab',
  'אחורה': 'previous-tab',
  'חזור': 'previous-tab',
};

const COMMAND_LABELS: Record<TcmVoiceCommand, { en: string; he: string }> = {
  'generate-summary': { en: '📝 Generate Summary', he: '📝 צור סיכום' },
  'save-to-patient': { en: '💾 Save to Patient', he: '💾 שמור למטופל' },
  'export-session': { en: '📥 Export Session', he: '📥 ייצא טיפול' },
  'print-report': { en: '🖨️ Print Report', he: '🖨️ הדפס דוח' },
  'share-whatsapp': { en: '💬 Share WhatsApp', he: '💬 שתף בוואטסאפ' },
  'generate-audio': { en: '🔊 Generate MP3', he: '🔊 צור אודיו' },
  'start-session': { en: '▶️ Start Session', he: '▶️ התחל טיפול' },
  'pause-session': { en: '⏸️ Pause Session', he: '⏸️ השהה טיפול' },
  'end-session': { en: '⏹️ End Session', he: '⏹️ סיים טיפול' },
  'clear-chat': { en: '🗑️ Clear Chat', he: '🗑️ נקה צאט' },
  'next-tab': { en: '➡️ Next Tab', he: '➡️ טאב הבא' },
  'previous-tab': { en: '⬅️ Previous Tab', he: '⬅️ טאב קודם' },
};

export function TcmBrainVoiceCommands({ 
  onCommand, 
  isSessionActive,
  wakeWord = 'hey cm',
  language: initialLanguage = 'en'
}: TcmBrainVoiceCommandsProps) {
  const [isListening, setIsListening] = useState(false);
  const [isAwake, setIsAwake] = useState(false);
  const [lastCommand, setLastCommand] = useState<TcmVoiceCommand | null>(null);
  const [language, setLanguage] = useState<'en' | 'he'>(initialLanguage);
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null);
  const awakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const haptic = useHapticFeedback();

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const currentCommands = language === 'he' ? HEBREW_COMMANDS : ENGLISH_COMMANDS;
  const currentWakeWord = language === 'he' ? 'היי סיאם' : wakeWord;

  const processTranscript = useCallback((transcript: string) => {
    const lowerTranscript = transcript.toLowerCase().trim();
    console.log('[TcmVoice] Transcript:', lowerTranscript, 'Language:', language);

    if (lowerTranscript.includes(currentWakeWord.toLowerCase())) {
      setIsAwake(true);
      haptic.medium();
      toast.info(language === 'he' ? '🎙️ מקשיב לפקודה...' : '🎙️ Listening for command...', { duration: 2000 });
      
      if (awakeTimeoutRef.current) clearTimeout(awakeTimeoutRef.current);
      awakeTimeoutRef.current = setTimeout(() => setIsAwake(false), 6000);
      
      const afterWakeWord = lowerTranscript.split(currentWakeWord.toLowerCase())[1]?.trim();
      if (afterWakeWord) processCommand(afterWakeWord);
      return;
    }

    if (isAwake) processCommand(lowerTranscript);
  }, [currentWakeWord, isAwake, haptic, language]);

  const processCommand = useCallback((text: string) => {
    for (const [phrase, command] of Object.entries(currentCommands)) {
      if (text.includes(phrase)) {
        setLastCommand(command);
        setIsAwake(false);
        haptic.success();
        onCommand(command);
        toast.success(COMMAND_LABELS[command][language], { duration: 2000 });
        
        if (awakeTimeoutRef.current) clearTimeout(awakeTimeoutRef.current);
        return;
      }
    }
    
    toast.info(
      language === 'he' 
        ? `פקודה לא מוכרת: "${text}"` 
        : `Command not recognized: "${text}"`, 
      { duration: 2000 }
    );
  }, [onCommand, haptic, currentCommands, language]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      toast.error(language === 'he' ? 'פקודות קוליות לא נתמכות' : 'Voice commands not supported');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'he' ? 'he-IL' : 'en-US';

      recognitionRef.current.onresult = (event) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;
        if (event.results[last].isFinal) processTranscript(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech error:', event.error);
        if (event.error === 'not-allowed') {
          toast.error(language === 'he' ? 'גישה למיקרופון נדחתה' : 'Microphone access denied');
          setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening && recognitionRef.current) recognitionRef.current.start();
      };

      recognitionRef.current.start();
      setIsListening(true);
      haptic.light();
      toast.success(
        language === 'he' 
          ? '🎙️ פקודות קוליות פעילות - אמור "היי סיאם"'
          : '🎙️ Voice commands active - Say "Hey CM"', 
        { duration: 3000 }
      );
    } catch (error) {
      console.error('Speech recognition error:', error);
      toast.error(language === 'he' ? 'נכשל בהפעלת פקודות קוליות' : 'Failed to start voice commands');
    }
  }, [isSupported, isListening, processTranscript, haptic, language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setIsAwake(false);
    haptic.light();
  }, [haptic]);

  const toggleLanguage = useCallback(() => {
    const wasListening = isListening;
    if (wasListening) stopListening();
    
    setLanguage(prev => {
      const newLang = prev === 'en' ? 'he' : 'en';
      toast.info(newLang === 'he' ? '🇮🇱 עברית' : '🇺🇸 English', { duration: 1500 });
      return newLang;
    });
    
    // Restart listening with new language
    setTimeout(() => {
      if (wasListening) startListening();
    }, 100);
  }, [isListening, stopListening, startListening]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (awakeTimeoutRef.current) clearTimeout(awakeTimeoutRef.current);
    };
  }, []);

  if (!isSupported) return null;

  return (
    <div className="fixed bottom-24 left-4 z-40 flex flex-col gap-2">
      {/* Language toggle */}
      <button
        onClick={toggleLanguage}
        className={cn(
          'w-10 h-10 rounded-full shadow-md flex items-center justify-center transition-all duration-200',
          'bg-card border border-border text-muted-foreground hover:bg-muted'
        )}
        aria-label={language === 'he' ? 'Switch to English' : 'Switch to Hebrew'}
      >
        <span className="text-xs font-bold">{language === 'he' ? 'EN' : 'עב'}</span>
      </button>

      {/* Main voice button */}
      <button
        onClick={isListening ? stopListening : startListening}
        className={cn(
          'w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 touch-manipulation',
          isListening 
            ? isAwake 
              ? 'bg-jade text-white animate-pulse scale-110' 
              : 'bg-jade/80 text-white'
            : 'bg-card border border-border text-muted-foreground hover:bg-muted'
        )}
        aria-label={isListening ? 'Stop voice commands' : 'Start voice commands'}
      >
        {isListening ? (
          <div className="relative">
            <Mic className={cn('h-6 w-6', isAwake && 'animate-bounce')} />
            {isAwake && <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />}
          </div>
        ) : (
          <MicOff className="h-6 w-6" />
        )}
      </button>
      
      {isListening && (
        <div className="absolute -top-8 left-0 right-0 text-center whitespace-nowrap">
          <span className={cn(
            'text-[10px] px-2 py-0.5 rounded-full',
            isAwake ? 'bg-jade text-white' : 'bg-muted text-muted-foreground'
          )}>
            {isAwake 
              ? (language === 'he' ? 'מקשיב...' : 'Listening...') 
              : (language === 'he' ? 'אמור "היי סיאם"' : 'Say "Hey CM"')}
          </span>
        </div>
      )}

      {lastCommand && (
        <div className="absolute top-20 left-0 text-center whitespace-nowrap">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/80 text-muted-foreground">
            {language === 'he' ? 'אחרון: ' : 'Last: '}{COMMAND_LABELS[lastCommand][language]}
          </span>
        </div>
      )}
    </div>
  );
}

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

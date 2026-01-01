import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Languages } from 'lucide-react';
import { useWebSpeechRecognition } from '@/hooks/useWebSpeechRecognition';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface InlineVoiceTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onVoiceInput?: (text: string) => void;
  showLanguageSelector?: boolean;
  defaultLanguage?: string;
}

export interface InlineVoiceTextareaRef {
  focus: () => void;
  startVoice: () => void;
  stopVoice: () => void;
}

const LANGUAGES = [
  { code: 'he-IL', label: 'עברית', flag: '🇮🇱' },
  { code: 'en-US', label: 'English', flag: '🇺🇸' },
  { code: 'ar-SA', label: 'العربية', flag: '🇸🇦' },
  { code: 'ru-RU', label: 'Русский', flag: '🇷🇺' },
  { code: 'zh-CN', label: '中文', flag: '🇨🇳' },
];

export const InlineVoiceTextarea = forwardRef<InlineVoiceTextareaRef, InlineVoiceTextareaProps>(
  ({ 
    value, 
    onChange, 
    onVoiceInput,
    showLanguageSelector = true,
    defaultLanguage = 'he-IL',
    className,
    ...props 
  }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [language, setLanguage] = useState(defaultLanguage);
    const [pendingText, setPendingText] = useState('');
    
    const {
      isListening,
      isSupported,
      interimTranscript,
      startListening,
      stopListening,
    } = useWebSpeechRecognition({
      language,
      continuous: true,
      interimResults: true,
      onResult: (transcript, isFinal) => {
        if (isFinal) {
          // Append final transcript to value
          const newValue = value + (value && !value.endsWith(' ') ? ' ' : '') + transcript;
          const syntheticEvent = {
            target: { value: newValue }
          } as React.ChangeEvent<HTMLTextAreaElement>;
          onChange(syntheticEvent);
          onVoiceInput?.(transcript);
          setPendingText('');
        } else {
          setPendingText(transcript);
        }
      },
      onError: (error) => {
        if (error === 'not-allowed') {
          toast.error('Microphone access denied. Please allow microphone access.');
        } else {
          toast.error(`Voice error: ${error}`);
        }
      },
    });

    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      startVoice: startListening,
      stopVoice: stopListening,
    }));

    const toggleListening = () => {
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    };

    const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

    if (!isSupported) {
      return (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          className={className}
          {...props}
        />
      );
    }

    return (
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value + (pendingText ? (value && !value.endsWith(' ') ? ' ' : '') + pendingText : '')}
          onChange={(e) => {
            // Only update if not from pending text
            if (!pendingText) {
              onChange(e);
            }
          }}
          className={cn(
            className,
            'pr-20',
            isListening && 'ring-2 ring-rose-500/50 border-rose-500'
          )}
          {...props}
        />
        
        {/* Interim text indicator */}
        {pendingText && (
          <div className="absolute bottom-full left-0 mb-1 px-2 py-1 bg-rose-500/10 text-rose-600 text-xs rounded-md border border-rose-200">
            🎤 {pendingText}
          </div>
        )}
        
        {/* Voice controls */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1">
          {showLanguageSelector && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  title="Select language"
                >
                  <span className="text-sm">{currentLang.flag}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border shadow-lg z-50">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(language === lang.code && 'bg-accent')}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Button
            type="button"
            variant={isListening ? 'destructive' : 'ghost'}
            size="icon"
            onClick={toggleListening}
            className={cn(
              'h-8 w-8 transition-all',
              isListening && 'animate-pulse shadow-lg'
            )}
            title={isListening ? 'Stop dictation' : 'Start voice dictation'}
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Listening indicator */}
        {isListening && (
          <div className="absolute -top-1 -right-1 h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
          </div>
        )}
      </div>
    );
  }
);

InlineVoiceTextarea.displayName = 'InlineVoiceTextarea';

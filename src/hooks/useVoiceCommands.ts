import { useEffect, useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

export interface VoiceCommand {
  patterns: string[];
  action: () => void;
  description: string;
  category: 'session' | 'navigation' | 'ai' | 'utility';
}

interface UseVoiceCommandsOptions {
  commands: VoiceCommand[];
  enabled?: boolean;
  language?: string;
  onCommandRecognized?: (command: string, matched: VoiceCommand | null) => void;
  showToasts?: boolean;
}

export function useVoiceCommands({
  commands,
  enabled = true,
  language = 'he-IL',
  onCommandRecognized,
  showToasts = true,
}: UseVoiceCommandsOptions) {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const haptic = useHapticFeedback();

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const matchCommand = useCallback((transcript: string): VoiceCommand | null => {
    const normalizedTranscript = transcript.toLowerCase().trim();
    
    for (const command of commands) {
      for (const pattern of command.patterns) {
        if (normalizedTranscript.includes(pattern.toLowerCase())) {
          return command;
        }
      }
    }
    return null;
  }, [commands]);

  const processTranscript = useCallback((transcript: string) => {
    const matched = matchCommand(transcript);
    
    setLastCommand(transcript);
    onCommandRecognized?.(transcript, matched);
    
    if (matched) {
      haptic.success();
      if (showToasts) {
        toast.success(`Command: ${matched.description}`, { duration: 2000 });
      }
      matched.action();
    } else {
      haptic.light();
      if (showToasts) {
        toast.info(`Heard: "${transcript}"`, { 
          description: 'No matching command found',
          duration: 2000 
        });
      }
    }
  }, [matchCommand, haptic, showToasts, onCommandRecognized]);

  useEffect(() => {
    if (!isSupported || !enabled) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    const recognition = recognitionRef.current;
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        const transcript = result[0].transcript;
        console.log('[VoiceCommands] Recognized:', transcript);
        processTranscript(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error('[VoiceCommands] Error:', event.error);
      }
    };

    recognition.onend = () => {
      // Auto-restart if still enabled
      if (isListening && enabled) {
        try {
          recognition.start();
        } catch (e) {
          console.log('[VoiceCommands] Failed to restart');
        }
      }
    };

    return () => {
      recognition.stop();
    };
  }, [isSupported, enabled, language, processTranscript, isListening]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
      haptic.medium();
      if (showToasts) {
        toast.info('🎤 Voice commands active', { duration: 2000 });
      }
    } catch (error) {
      console.error('[VoiceCommands] Start error:', error);
    }
  }, [isSupported, haptic, showToasts]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
      setIsListening(false);
      if (showToasts) {
        toast.info('🎤 Voice commands stopped', { duration: 1500 });
      }
    } catch (error) {
      console.error('[VoiceCommands] Stop error:', error);
    }
  }, [showToasts]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    lastCommand,
    startListening,
    stopListening,
    toggleListening,
    commands,
  };
}

// Predefined command patterns for common actions
export const COMMON_COMMAND_PATTERNS = {
  // Session controls
  start: ['start', 'התחל', 'begin', 'go'],
  stop: ['stop', 'עצור', 'end', 'finish', 'סיים'],
  pause: ['pause', 'השהה', 'hold'],
  resume: ['resume', 'המשך', 'continue'],
  reset: ['reset', 'איפוס', 'clear', 'נקה'],
  
  // Navigation
  next: ['next', 'הבא', 'forward'],
  previous: ['previous', 'הקודם', 'back', 'אחורה'],
  save: ['save', 'שמור', 'keep'],
  
  // AI
  diagnose: ['diagnose', 'אבחן', 'analysis', 'ניתוח'],
  suggest: ['suggest', 'הצע', 'recommend', 'המלץ'],
  summary: ['summary', 'סיכום', 'summarize'],
  
  // Utility
  help: ['help', 'עזרה', 'assist'],
  print: ['print', 'הדפס'],
  share: ['share', 'שתף', 'send', 'שלח'],
};

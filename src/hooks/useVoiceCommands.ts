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
  wakeWord?: string;
  wakeWordEnabled?: boolean;
  wakeWordTimeout?: number; // ms to stay "awake" after wake word
  onWakeWordDetected?: () => void;
}

export function useVoiceCommands({
  commands,
  enabled = true,
  language = 'he-IL',
  onCommandRecognized,
  showToasts = true,
  wakeWord = 'hey doctor',
  wakeWordEnabled = false,
  wakeWordTimeout = 5000,
  onWakeWordDetected,
}: UseVoiceCommandsOptions) {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [isAwake, setIsAwake] = useState(false);
  const recognitionRef = useRef<any>(null);
  const awakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  const checkWakeWord = useCallback((transcript: string): boolean => {
    if (!wakeWordEnabled || !wakeWord) return true; // No wake word required
    
    const normalizedTranscript = transcript.toLowerCase().trim();
    const normalizedWakeWord = wakeWord.toLowerCase().trim();
    
    return normalizedTranscript.includes(normalizedWakeWord);
  }, [wakeWord, wakeWordEnabled]);

  const resetAwakeTimeout = useCallback(() => {
    if (awakeTimeoutRef.current) {
      clearTimeout(awakeTimeoutRef.current);
    }
    awakeTimeoutRef.current = setTimeout(() => {
      setIsAwake(false);
      if (showToasts) {
        toast.info('💤 Voice commands sleeping - say wake word to activate', { duration: 2000 });
      }
    }, wakeWordTimeout);
  }, [wakeWordTimeout, showToasts]);

  const processTranscript = useCallback((transcript: string) => {
    const normalizedTranscript = transcript.toLowerCase().trim();
    
    // If wake word is enabled, check for it
    if (wakeWordEnabled) {
      const wakeWordDetected = checkWakeWord(normalizedTranscript);
      
      if (wakeWordDetected && !isAwake) {
        // Wake word detected - activate and strip wake word from transcript
        setIsAwake(true);
        resetAwakeTimeout();
        haptic.medium();
        onWakeWordDetected?.();
        if (showToasts) {
          toast.success(`👂 Listening! Say your command...`, { duration: 2000 });
        }
        
        // Try to process any command that follows the wake word
        const wakeWordIndex = normalizedTranscript.indexOf(wakeWord.toLowerCase());
        const commandPart = normalizedTranscript.slice(wakeWordIndex + wakeWord.length).trim();
        
        if (commandPart) {
          const matched = matchCommand(commandPart);
          setLastCommand(commandPart);
          onCommandRecognized?.(commandPart, matched);
          
          if (matched) {
            haptic.success();
            if (showToasts) {
              toast.success(`Command: ${matched.description}`, { duration: 2000 });
            }
            matched.action();
            resetAwakeTimeout();
          }
        }
        return;
      }
      
      if (!isAwake) {
        // Not awake and no wake word - ignore
        return;
      }
      
      // Already awake - process command
      resetAwakeTimeout();
    }
    
    // Process the command
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
  }, [matchCommand, haptic, showToasts, onCommandRecognized, wakeWordEnabled, isAwake, checkWakeWord, resetAwakeTimeout, wakeWord, onWakeWordDetected]);

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
      if (awakeTimeoutRef.current) {
        clearTimeout(awakeTimeoutRef.current);
      }
    };
  }, [isSupported, enabled, language, processTranscript, isListening]);

  // Cleanup awake timeout on unmount
  useEffect(() => {
    return () => {
      if (awakeTimeoutRef.current) {
        clearTimeout(awakeTimeoutRef.current);
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
      // If no wake word, consider immediately awake
      if (!wakeWordEnabled) {
        setIsAwake(true);
      }
      haptic.medium();
      if (showToasts) {
        const message = wakeWordEnabled 
          ? `🎤 Listening for "${wakeWord}"...` 
          : '🎤 Voice commands active';
        toast.info(message, { duration: 2000 });
      }
    } catch (error) {
      console.error('[VoiceCommands] Start error:', error);
    }
  }, [isSupported, haptic, showToasts, wakeWordEnabled, wakeWord]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsAwake(false);
      if (awakeTimeoutRef.current) {
        clearTimeout(awakeTimeoutRef.current);
      }
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
    isAwake,
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

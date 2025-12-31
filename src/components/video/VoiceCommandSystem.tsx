import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { toast } from 'sonner';

interface VoiceCommandSystemProps {
  onCommand: (command: string) => void;
  isSessionActive: boolean;
  wakeWord?: string;
}

type VoiceCommand = 
  | 'start' 
  | 'stop' 
  | 'pause' 
  | 'resume' 
  | 'reset' 
  | 'timestamp' 
  | 'feeling-better' 
  | 'needs-followup'
  | 'start-recording'
  | 'stop-recording'
  | 'generate-summary'
  // AI cue commands
  | 'objection-detected'
  | 'positive-signal'
  | 'resistance-detected'
  | 'red-flag'
  | 'closing-time'
  | 'fear-objection'
  | 'cost-objection'
  | 'time-objection'
  | 'skepticism-objection';

const VOICE_COMMANDS: Record<string, VoiceCommand> = {
  'start': 'start',
  'start session': 'start',
  'begin': 'start',
  'stop': 'stop',
  'end': 'stop',
  'end session': 'stop',
  'finish': 'stop',
  'pause': 'pause',
  'hold': 'pause',
  'resume': 'resume',
  'continue': 'resume',
  'reset': 'reset',
  'restart': 'reset',
  'timestamp': 'timestamp',
  'mark': 'timestamp',
  'marker': 'timestamp',
  'feeling better': 'feeling-better',
  'patient better': 'feeling-better',
  'improved': 'feeling-better',
  'needs follow up': 'needs-followup',
  'follow up': 'needs-followup',
  'followup': 'needs-followup',
  // Recording commands
  'start recording': 'start-recording',
  'begin recording': 'start-recording',
  'record': 'start-recording',
  'stop recording': 'stop-recording',
  'end recording': 'stop-recording',
  'finish recording': 'stop-recording',
  // Summary commands
  'generate summary': 'generate-summary',
  'create summary': 'generate-summary',
  'summary': 'generate-summary',
  'summarize': 'generate-summary',
  'ai summary': 'generate-summary',
  // AI Cue commands - for real-time suggestions
  'objection detected': 'objection-detected',
  'objection': 'objection-detected',
  'patient objecting': 'objection-detected',
  'positive signal': 'positive-signal',
  'positive': 'positive-signal',
  'good sign': 'positive-signal',
  'interested': 'positive-signal',
  'resistance detected': 'resistance-detected',
  'resistance': 'resistance-detected',
  'hesitant': 'resistance-detected',
  'red flag': 'red-flag',
  'warning': 'red-flag',
  'concern': 'red-flag',
  'closing time': 'closing-time',
  'close now': 'closing-time',
  'ready to close': 'closing-time',
  // Specific objection types
  'fear objection': 'fear-objection',
  'scared of needles': 'fear-objection',
  'afraid': 'fear-objection',
  'cost objection': 'cost-objection',
  'too expensive': 'cost-objection',
  'money concern': 'cost-objection',
  'time objection': 'time-objection',
  'no time': 'time-objection',
  'too busy': 'time-objection',
  'skepticism objection': 'skepticism-objection',
  'doesn\'t believe': 'skepticism-objection',
  'skeptical': 'skepticism-objection',
};

export function VoiceCommandSystem({ 
  onCommand, 
  isSessionActive,
  wakeWord = 'hey cm' 
}: VoiceCommandSystemProps) {
  const [isListening, setIsListening] = useState(false);
  const [isAwake, setIsAwake] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null);
  const awakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const haptic = useHapticFeedback();

  // Check if speech recognition is supported
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const processTranscript = useCallback((transcript: string) => {
    const lowerTranscript = transcript.toLowerCase().trim();
    console.log('Voice transcript:', lowerTranscript);

    // Check for wake word
    if (lowerTranscript.includes(wakeWord.toLowerCase())) {
      setIsAwake(true);
      haptic.medium();
      toast.info('🎙️ Listening for command...', { duration: 2000 });
      
      // Auto-deactivate after 5 seconds
      if (awakeTimeoutRef.current) {
        clearTimeout(awakeTimeoutRef.current);
      }
      awakeTimeoutRef.current = setTimeout(() => {
        setIsAwake(false);
      }, 5000);
      
      // Check if command is in the same phrase
      const afterWakeWord = lowerTranscript.split(wakeWord.toLowerCase())[1]?.trim();
      if (afterWakeWord) {
        processCommand(afterWakeWord);
      }
      return;
    }

    // Process command if awake
    if (isAwake) {
      processCommand(lowerTranscript);
    }
  }, [wakeWord, isAwake, haptic]);

  const processCommand = useCallback((text: string) => {
    // Find matching command
    for (const [phrase, command] of Object.entries(VOICE_COMMANDS)) {
      if (text.includes(phrase)) {
        setLastCommand(command);
        setIsAwake(false);
        haptic.success();
        onCommand(command);
        toast.success(`✓ Command: ${command}`, { duration: 2000 });
        
        if (awakeTimeoutRef.current) {
          clearTimeout(awakeTimeoutRef.current);
        }
        return;
      }
    }
    
    // No command found
    toast.info(`Command not recognized: "${text}"`, { duration: 2000 });
  }, [onCommand, haptic]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      toast.error('Voice commands not supported in this browser');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;
        
        if (event.results[last].isFinal) {
          processTranscript(transcript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied');
          setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        // Restart if still supposed to be listening
        if (isListening && recognitionRef.current) {
          recognitionRef.current.start();
        }
      };

      recognitionRef.current.start();
      setIsListening(true);
      haptic.light();
      toast.success('🎙️ Voice commands active - Say "Hey CM"', { duration: 3000 });
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast.error('Failed to start voice commands');
    }
  }, [isSupported, isListening, processTranscript, haptic]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setIsAwake(false);
    haptic.light();
    toast.info('Voice commands disabled');
  }, [haptic]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (awakeTimeoutRef.current) {
        clearTimeout(awakeTimeoutRef.current);
      }
    };
  }, []);

  if (!isSupported) return null;

  return (
    <div className="md:hidden fixed bottom-24 left-4 z-40">
      <button
        onClick={isListening ? stopListening : startListening}
        className={cn(
          'w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300',
          'touch-manipulation',
          isListening 
            ? isAwake 
              ? 'bg-jade text-white animate-pulse scale-110' 
              : 'bg-jade/80 text-white'
            : 'bg-card border border-border text-muted-foreground'
        )}
      >
        {isListening ? (
          <div className="relative">
            <Mic className={cn('h-6 w-6', isAwake && 'animate-bounce')} />
            {isAwake && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
            )}
          </div>
        ) : (
          <MicOff className="h-6 w-6" />
        )}
      </button>
      
      {/* Status indicator */}
      {isListening && (
        <div className="absolute -top-8 left-0 right-0 text-center">
          <span className={cn(
            'text-[10px] px-2 py-0.5 rounded-full',
            isAwake ? 'bg-jade text-white' : 'bg-muted text-muted-foreground'
          )}>
            {isAwake ? 'Listening...' : 'Say "Hey CM"'}
          </span>
        </div>
      )}
    </div>
  );
}

// Add type declaration for Speech Recognition
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

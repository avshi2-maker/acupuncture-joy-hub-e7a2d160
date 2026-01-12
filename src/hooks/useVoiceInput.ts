import { useState, useEffect, useCallback, useRef } from 'react';

interface UseVoiceInputOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

interface UseVoiceInputReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

/**
 * Custom hook for voice input using Web Speech API.
 * Provides real-time speech-to-text transcription.
 */
export function useVoiceInput({
  language = 'en-US',
  continuous = false,
  interimResults = true,
  onResult,
  onError,
  onEnd,
}: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const isStoppingRef = useRef(false);

  // Check if Web Speech API is supported
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Initialize recognition instance
  useEffect(() => {
    if (!isSupported) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();

    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      isStoppingRef.current = false;
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
      
      // Only call onEnd if we're not intentionally stopping
      if (!isStoppingRef.current) {
        onEnd?.();
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += text;
        } else {
          interim += text;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => {
          const newTranscript = prev ? `${prev} ${finalTranscript}`.trim() : finalTranscript.trim();
          onResult?.(newTranscript, true);
          return newTranscript;
        });
        setInterimTranscript('');
      } else {
        setInterimTranscript(interim);
        onResult?.(interim, false);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      let errorMessage = 'Speech recognition error';

      switch (event.error) {
        case 'not-allowed':
        case 'permission-denied':
          errorMessage = 'Microphone permission denied. Please allow microphone access.';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please check your device.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'aborted':
          // User aborted, not an error
          return;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }

      setError(errorMessage);
      setIsListening(false);
      onError?.(errorMessage);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [isSupported, language, continuous, interimResults, onResult, onError, onEnd]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition is not supported in this browser.');
      onError?.('Speech recognition is not supported in this browser.');
      return;
    }

    setError(null);
    setTranscript('');
    setInterimTranscript('');
    isStoppingRef.current = false;

    try {
      recognitionRef.current.start();
    } catch (e) {
      // Recognition might already be running
      console.warn('Speech recognition start error:', e);
    }
  }, [isSupported, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      isStoppingRef.current = true;
      recognitionRef.current.stop();
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
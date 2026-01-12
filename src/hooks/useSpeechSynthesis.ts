import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechSynthesisOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
  lang?: string;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface UseSpeechSynthesisReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  voices: SpeechSynthesisVoice[];
  speak: (text: string) => void;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
}

/**
 * Custom hook for text-to-speech using Web Speech Synthesis API.
 * Provides voice feedback capabilities.
 */
export function useSpeechSynthesis({
  rate = 1,
  pitch = 1,
  volume = 1,
  voice = null,
  lang = 'en-US',
  onEnd,
  onError,
}: UseSpeechSynthesisOptions = {}): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check if Web Speech Synthesis is supported
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    // Load voices immediately if available
    loadVoices();

    // Also listen for voiceschanged event (async loading in some browsers)
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [isSupported]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  const speak = useCallback((text: string) => {
    if (!isSupported) {
      onError?.('Speech synthesis is not supported in this browser.');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Clean text for better speech (remove markdown, excessive punctuation)
    const cleanText = text
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/\*\*/g, '') // Remove bold
      .replace(/\*/g, '') // Remove italic
      .replace(/`/g, '') // Remove code ticks
      .replace(/\n{2,}/g, '. ') // Replace multiple newlines with pause
      .replace(/\n/g, ' ') // Replace single newlines with space
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.lang = lang;

    // Find a suitable voice
    if (voice) {
      utterance.voice = voice;
    } else {
      // Try to find a natural-sounding English voice
      const preferredVoice = voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.includes('Natural') || v.name.includes('Enhanced') || v.name.includes('Google'))
      ) || voices.find(v => v.lang.startsWith('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      onEnd?.();
    };

    utterance.onerror = (event) => {
      setIsSpeaking(false);
      setIsPaused(false);
      if (event.error !== 'canceled') {
        onError?.(`Speech synthesis error: ${event.error}`);
      }
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, rate, pitch, volume, voice, lang, voices, onEnd, onError]);

  const cancel = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.pause();
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (isSupported && isPaused) {
      window.speechSynthesis.resume();
    }
  }, [isSupported, isPaused]);

  return {
    isSupported,
    isSpeaking,
    isPaused,
    voices,
    speak,
    cancel,
    pause,
    resume,
  };
}

/**
 * Extracts the most important part of an AI response for TTS.
 * Prioritizes summary sentences or the first paragraph.
 */
export function extractSpeakableContent(text: string, maxLength = 500): string {
  if (!text) return '';

  // Try to find a summary section
  const summaryMatch = text.match(/(?:summary|in summary|to summarize|key points?)[:.]?\s*([^.!?]+[.!?])/i);
  if (summaryMatch) {
    return summaryMatch[1].trim();
  }

  // Try to find the first meaningful paragraph
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 20);
  if (paragraphs.length > 0) {
    const firstParagraph = paragraphs[0].trim();
    if (firstParagraph.length <= maxLength) {
      return firstParagraph;
    }
    // Truncate at sentence boundary
    const sentences = firstParagraph.match(/[^.!?]+[.!?]+/g) || [firstParagraph];
    let result = '';
    for (const sentence of sentences) {
      if ((result + sentence).length <= maxLength) {
        result += sentence;
      } else {
        break;
      }
    }
    return result.trim() || sentences[0].slice(0, maxLength);
  }

  // Fallback: just take the first chunk
  return text.slice(0, maxLength).trim();
}
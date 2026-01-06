import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PointNarrationData {
  code: string;
  name_english: string;
  name_pinyin: string;
  name_chinese: string;
  indications: string[] | null;
  actions: string[] | null;
}

export type PlaybackSpeed = 0.5 | 1.0 | 1.5 | 2.0;

interface UseTourNarrationOptions {
  /** Called when narration starts for a point */
  onNarrationStart?: (point: string) => void;
  /** Called when narration ends for a point */
  onNarrationEnd?: (point: string) => void;
  /** Called when ready to move to next point */
  onReadyForNext?: () => void;
  /** Language for narration */
  language?: 'en' | 'he';
  /** Initial playback speed */
  initialSpeed?: PlaybackSpeed;
}

/**
 * Hook for managing audio narration during sequential point tours
 * Uses OpenAI TTS via edge function for high-quality voice synthesis
 */
export function useTourNarration(options: UseTourNarrationOptions = {}) {
  const { 
    onNarrationStart, 
    onNarrationEnd, 
    onReadyForNext,
    language = 'en',
    initialSpeed = 1.0
  } = options;

  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPoint, setCurrentPoint] = useState<string | null>(null);
  const [pointsCache, setPointsCache] = useState<Map<string, PointNarrationData>>(new Map());
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(initialSpeed);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Preload point data for narration
  const preloadPointData = useCallback(async (pointCodes: string[]) => {
    if (pointCodes.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('acupuncture_points')
        .select('code, name_english, name_pinyin, name_chinese, indications, actions')
        .in('code', pointCodes.map(p => p.toUpperCase().replace('-', '')));

      if (!error && data) {
        const newCache = new Map(pointsCache);
        data.forEach((point: PointNarrationData) => {
          newCache.set(point.code.toUpperCase(), point);
        });
        setPointsCache(newCache);
      }
    } catch (err) {
      console.error('Error preloading point data:', err);
    }
  }, [pointsCache]);

  // Generate narration text for a point
  const generateNarrationText = useCallback((pointCode: string): string => {
    const normalizedCode = pointCode.toUpperCase().replace('-', '');
    const pointData = pointsCache.get(normalizedCode);

    if (!pointData) {
      // Fallback if no data found
      return language === 'he' 
        ? `נקודה ${pointCode}`
        : `Point ${pointCode}`;
    }

    // Build narration text
    const { name_english, name_pinyin, indications, actions } = pointData;
    
    // Get primary indication or action for brief narration
    const primaryIndication = indications?.[0] || actions?.[0] || '';
    
    if (language === 'he') {
      return `${name_pinyin}. ${name_english}. ${primaryIndication ? `משמש ל${primaryIndication}.` : ''}`;
    }
    
    return `${name_pinyin}. ${name_english}. ${primaryIndication ? `Used for ${primaryIndication}.` : ''}`;
  }, [pointsCache, language]);

  // Stop current audio
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  // Play narration for a point
  const playNarration = useCallback(async (pointCode: string) => {
    if (isMuted) {
      // If muted, just signal ready for next immediately
      onReadyForNext?.();
      return;
    }

    setCurrentPoint(pointCode);
    setIsLoading(true);
    stopAudio();

    const text = generateNarrationText(pointCode);
    
    try {
      abortControllerRef.current = new AbortController();
      
      onNarrationStart?.(pointCode);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            text,
            voice: 'nova', // Professional, calm voice
            language
          }),
          signal: abortControllerRef.current.signal
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'TTS request failed');
      }

      const data = await response.json();
      
      if (!data.audioContent) {
        throw new Error('No audio content received');
      }

      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      const audio = new Audio(audioUrl);
      
      // Set playback speed (preserves pitch in modern browsers)
      audio.playbackRate = playbackSpeed;
      audioRef.current = audio;

      audio.onplay = () => {
        setIsLoading(false);
        setIsPlaying(true);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentPoint(null);
        onNarrationEnd?.(pointCode);
        onReadyForNext?.();
      };

      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsLoading(false);
        setIsPlaying(false);
        onNarrationEnd?.(pointCode);
        onReadyForNext?.();
      };

      await audio.play();
      
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return; // Intentionally aborted
      }
      console.error('Narration error:', error);
      setIsLoading(false);
      setIsPlaying(false);
      onNarrationEnd?.(pointCode);
      onReadyForNext?.();
    }
  }, [isMuted, generateNarrationText, stopAudio, onNarrationStart, onNarrationEnd, onReadyForNext, language]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    if (!isMuted && isPlaying) {
      stopAudio();
    }
  }, [isMuted, isPlaying, stopAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  // Update playback speed on existing audio
  const updateSpeed = useCallback((speed: PlaybackSpeed) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, []);

  return {
    // State
    isMuted,
    isPlaying,
    isLoading,
    currentPoint,
    playbackSpeed,
    
    // Actions
    playNarration,
    stopAudio,
    toggleMute,
    preloadPointData,
    setMuted: setIsMuted,
    setPlaybackSpeed: updateSpeed,
  };
}

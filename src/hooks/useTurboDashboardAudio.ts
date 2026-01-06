import { useCallback, useRef } from 'react';

interface UseTurboDashboardAudioOptions {
  enabled?: boolean;
  volume?: number;
}

export function useTurboDashboardAudio({
  enabled = true,
  volume = 0.25,
}: UseTurboDashboardAudioOptions = {}) {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Engine revving sound - for scanning state
  const playEngineRevving = useCallback(() => {
    if (!enabled) return;
    
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      // Create oscillator for engine sound
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Low frequency rumble
      oscillator.frequency.setValueAtTime(80, now);
      oscillator.frequency.linearRampToValueAtTime(150, now + 0.3);
      oscillator.frequency.linearRampToValueAtTime(200, now + 0.5);
      oscillator.type = 'sawtooth';
      
      // Low-pass filter for engine-like quality
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.linearRampToValueAtTime(600, now + 0.5);
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume * 0.6, now + 0.1);
      gainNode.gain.linearRampToValueAtTime(volume * 0.4, now + 0.5);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
      
      oscillator.start(now);
      oscillator.stop(now + 0.7);
    } catch (err) {
      console.error('[TurboDashboardAudio] Error playing engine rev:', err);
    }
  }, [enabled, volume, getAudioContext]);

  // Source locked chime - triumphant ascending tones
  const playSourceLocked = useCallback(() => {
    if (!enabled) return;
    
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      const playTone = (startTime: number, freq: number, duration: number = 0.15) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(volume * 0.5, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      // Triumphant ascending chord: C - E - G - C (major chord)
      playTone(now, 523.25, 0.12);        // C5
      playTone(now + 0.08, 659.25, 0.15); // E5
      playTone(now + 0.16, 783.99, 0.18); // G5
      playTone(now + 0.26, 1046.50, 0.25); // C6 (sustained)
      
    } catch (err) {
      console.error('[TurboDashboardAudio] Error playing locked chime:', err);
    }
  }, [enabled, volume, getAudioContext]);

  // External data warning - double-beep alert
  const playExternalWarning = useCallback(() => {
    if (!enabled) return;
    
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      const playWarningTone = (startTime: number) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = 600;
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(volume * 0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.1);
      };
      
      // Double beep warning
      playWarningTone(now);
      playWarningTone(now + 0.15);
      
    } catch (err) {
      console.error('[TurboDashboardAudio] Error playing external warning:', err);
    }
  }, [enabled, volume, getAudioContext]);

  // Fail/no match sound - descending disappointed tone
  const playNoMatch = useCallback(() => {
    if (!enabled) return;
    
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Descending tone
      oscillator.frequency.setValueAtTime(400, now);
      oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.3);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(volume * 0.4, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      
      oscillator.start(now);
      oscillator.stop(now + 0.3);
    } catch (err) {
      console.error('[TurboDashboardAudio] Error playing no match:', err);
    }
  }, [enabled, volume, getAudioContext]);

  // Scanning start beep
  const playScanStart = useCallback(() => {
    if (!enabled) return;
    
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Quick ascending sweep
      oscillator.frequency.setValueAtTime(300, now);
      oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.15);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(volume * 0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      
      oscillator.start(now);
      oscillator.stop(now + 0.15);
    } catch (err) {
      console.error('[TurboDashboardAudio] Error playing scan start:', err);
    }
  }, [enabled, volume, getAudioContext]);

  return {
    playEngineRevving,
    playSourceLocked,
    playExternalWarning,
    playNoMatch,
    playScanStart,
  };
}

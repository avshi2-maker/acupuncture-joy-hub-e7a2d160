import { useCallback, useRef } from 'react';

interface UseVoiceCommandAudioOptions {
  enabled?: boolean;
  successFrequency?: number;
  failureFrequency?: number;
  volume?: number;
}

export function useVoiceCommandAudio({
  enabled = true,
  successFrequency = 880,
  failureFrequency = 330,
  volume = 0.3,
}: UseVoiceCommandAudioOptions = {}) {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playBeep = useCallback((frequency: number, duration: number = 0.15) => {
    if (!enabled) return;
    
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      const now = ctx.currentTime;
      gainNode.gain.setValueAtTime(volume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
      
      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch (err) {
      console.error('[VoiceCommandAudio] Error playing beep:', err);
    }
  }, [enabled, volume, getAudioContext]);

  const playSuccess = useCallback(() => {
    if (!enabled) return;
    
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      // Play ascending two-tone success sound
      const playTone = (startTime: number, freq: number) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(volume, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.12);
      };
      
      playTone(now, successFrequency);
      playTone(now + 0.12, successFrequency * 1.25); // Higher second tone
    } catch (err) {
      console.error('[VoiceCommandAudio] Error playing success:', err);
    }
  }, [enabled, volume, successFrequency, getAudioContext]);

  const playFailure = useCallback(() => {
    if (!enabled) return;
    
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      // Play single low tone for failure
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = failureFrequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(volume * 0.7, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      
      oscillator.start(now);
      oscillator.stop(now + 0.25);
    } catch (err) {
      console.error('[VoiceCommandAudio] Error playing failure:', err);
    }
  }, [enabled, volume, failureFrequency, getAudioContext]);

  const playListeningStart = useCallback(() => {
    if (!enabled) return;
    
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      // Quick ascending chirp
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(440, now);
      oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(volume * 0.5, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      
      oscillator.start(now);
      oscillator.stop(now + 0.1);
    } catch (err) {
      console.error('[VoiceCommandAudio] Error playing listening start:', err);
    }
  }, [enabled, volume, getAudioContext]);

  const playListeningStop = useCallback(() => {
    if (!enabled) return;
    
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      // Quick descending chirp
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(880, now);
      oscillator.frequency.exponentialRampToValueAtTime(440, now + 0.1);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(volume * 0.5, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      
      oscillator.start(now);
      oscillator.stop(now + 0.1);
    } catch (err) {
      console.error('[VoiceCommandAudio] Error playing listening stop:', err);
    }
  }, [enabled, volume, getAudioContext]);

  return {
    playBeep,
    playSuccess,
    playFailure,
    playListeningStart,
    playListeningStop,
  };
}

import { useState, useCallback, useEffect } from 'react';
import { SessionPhase, getPhaseFromDuration } from '@/components/session/SessionPhaseIndicator';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { toast } from 'sonner';

const STORAGE_KEY = 'session-phase-override';

interface StoredPhaseData {
  phase: SessionPhase;
  sessionStartTime: number;
  timestamp: number;
}

// Phase transition sound URLs (using simple beeps)
const phaseTransitionSounds = {
  opening: '/audio/phase-opening.mp3',
  diagnosis: '/audio/phase-diagnosis.mp3',
  treatment: '/audio/phase-treatment.mp3',
  closing: '/audio/phase-closing.mp3',
};

const phaseLabelsHe: Record<SessionPhase, string> = {
  opening: 'פתיחה',
  diagnosis: 'אבחון',
  treatment: 'טיפול',
  closing: 'סיום',
};

export function useSessionPhase(sessionDuration: number, sessionStartTime?: number | null) {
  const [manualPhase, setManualPhase] = useState<SessionPhase | null>(null);
  const haptic = useHapticFeedback();

  // Load persisted phase on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: StoredPhaseData = JSON.parse(stored);
        // Only restore if same session (within 4 hours)
        const isRecentSession = Date.now() - data.timestamp < 4 * 60 * 60 * 1000;
        const isSameSession = sessionStartTime && Math.abs(data.sessionStartTime - sessionStartTime) < 1000;
        
        if (isRecentSession && (isSameSession || !sessionStartTime)) {
          setManualPhase(data.phase);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [sessionStartTime]);

  // Play transition sound
  const playTransitionSound = useCallback((phase: SessionPhase) => {
    try {
      // Create a simple audio context beep as fallback
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different phases
      const frequencies: Record<SessionPhase, number> = {
        opening: 523.25, // C5
        diagnosis: 659.25, // E5
        treatment: 783.99, // G5
        closing: 1046.50, // C6
      };
      
      oscillator.frequency.value = frequencies[phase];
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // Audio not available, fail silently
    }
  }, []);

  // Set phase with effects
  const setPhase = useCallback((phase: SessionPhase) => {
    // Haptic feedback
    haptic.medium();
    
    // Play sound
    playTransitionSound(phase);
    
    // Update state
    setManualPhase(phase);
    
    // Persist to localStorage
    try {
      const data: StoredPhaseData = {
        phase,
        sessionStartTime: sessionStartTime || Date.now(),
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage not available
    }
    
    // Show toast
    toast.success(`שלב: ${phaseLabelsHe[phase]}`, {
      duration: 2000,
      icon: phase === 'opening' ? '✨' : phase === 'diagnosis' ? '🩺' : phase === 'treatment' ? '💉' : '✅',
    });
  }, [haptic, playTransitionSound, sessionStartTime]);

  // Clear manual override
  const clearManualPhase = useCallback(() => {
    setManualPhase(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Get current phase (manual override or auto-calculated)
  const currentPhase = manualPhase || getPhaseFromDuration(sessionDuration);
  
  // Check if using manual override
  const isManualOverride = manualPhase !== null;

  return {
    currentPhase,
    setPhase,
    clearManualPhase,
    isManualOverride,
  };
}

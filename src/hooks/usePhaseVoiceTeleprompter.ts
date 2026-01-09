import { useEffect, useRef, useCallback } from 'react';
import { SessionPhase } from '@/components/session/SessionPhaseIndicator';
import { useHapticFeedback } from './useHapticFeedback';

// Hebrew voice prompts for each session phase
const PHASE_VOICE_PROMPTS: Record<SessionPhase, string> = {
  opening: 'שלום, התחלנו את הפגישה. זכור לבדוק את התלונה העיקרית של המטופל.',
  diagnosis: 'אנחנו בשלב האבחון. שים לב לדופק וללשון. המערכת מחכה לנתונים שלך.',
  treatment: 'שלב הטיפול התחיל. הנקודות המומלצות מופיעות כעת על מפת הגוף.',
  closing: 'אנחנו מסיימים. הדוח הקליני מוכן לשליחה בווטסאפ או במייל.',
};

// Phase display labels
const PHASE_LABELS: Record<SessionPhase, { he: string; en: string }> = {
  opening: { he: 'פתיחה', en: 'Opening' },
  diagnosis: { he: 'אבחון', en: 'Diagnosis' },
  treatment: { he: 'טיפול', en: 'Treatment' },
  closing: { he: 'סיום', en: 'Closing' },
};

interface UsePhaseVoiceTeleprompterOptions {
  enabled?: boolean;
  voiceEnabled?: boolean;
  hapticEnabled?: boolean;
  onPhaseChange?: (phase: SessionPhase, prevPhase: SessionPhase) => void;
}

export function usePhaseVoiceTeleprompter(
  currentPhase: SessionPhase,
  options: UsePhaseVoiceTeleprompterOptions = {}
) {
  const { 
    enabled = true, 
    voiceEnabled = true, 
    hapticEnabled = true,
    onPhaseChange 
  } = options;
  
  const prevPhaseRef = useRef<SessionPhase>(currentPhase);
  const isFirstMount = useRef(true);
  const haptic = useHapticFeedback();

  // Speak function using Web Speech API
  // Uses lower volume (0.5) to avoid interfering with Zoom/Meet audio
  // Patient on call should NOT hear these prompts
  const speak = useCallback((text: string) => {
    if (!voiceEnabled || typeof window === 'undefined') return;
    
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      // Lower volume to not interfere with call audio
      // This audio plays through device speakers only, not through call
      utterance.volume = 0.5;
      
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn('Speech synthesis not available:', error);
    }
  }, [voiceEnabled]);

  // Get the voice prompt for a phase
  const getPhasePrompt = useCallback((phase: SessionPhase) => {
    return PHASE_VOICE_PROMPTS[phase];
  }, []);

  // Get phase label
  const getPhaseLabel = useCallback((phase: SessionPhase, language: 'he' | 'en' = 'he') => {
    return PHASE_LABELS[phase][language];
  }, []);

  // Handle phase transition
  useEffect(() => {
    if (!enabled) return;
    
    // Skip first mount to avoid speaking on initial render
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    
    const prevPhase = prevPhaseRef.current;
    
    if (prevPhase !== currentPhase) {
      // Trigger haptic feedback
      if (hapticEnabled) {
        haptic.medium();
      }
      
      // Speak the phase prompt
      if (voiceEnabled) {
        const prompt = getPhasePrompt(currentPhase);
        speak(prompt);
      }
      
      // Notify callback
      onPhaseChange?.(currentPhase, prevPhase);
      
      // Update ref
      prevPhaseRef.current = currentPhase;
    }
  }, [currentPhase, enabled, voiceEnabled, hapticEnabled, speak, getPhasePrompt, haptic, onPhaseChange]);

  // Manually trigger voice for current phase
  const speakCurrentPhase = useCallback(() => {
    const prompt = getPhasePrompt(currentPhase);
    speak(prompt);
  }, [currentPhase, getPhasePrompt, speak]);

  // Cancel any ongoing speech
  const cancelSpeech = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
    }
  }, []);

  return {
    currentPhase,
    phaseLabel: getPhaseLabel(currentPhase),
    phaseLabelEn: getPhaseLabel(currentPhase, 'en'),
    phasePrompt: getPhasePrompt(currentPhase),
    speak,
    speakCurrentPhase,
    cancelSpeech,
    getPhasePrompt,
    getPhaseLabel,
  };
}

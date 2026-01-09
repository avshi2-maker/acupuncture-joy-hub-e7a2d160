import { useState, useEffect, useCallback, useRef } from 'react';
import { useHapticFeedback } from './useHapticFeedback';
import { PROMPT_MAPPINGS, getVoiceText } from '@/data/tcm-prompt-mapping';

export interface SmartSuggestMatch {
  id: string;
  keyword: string;
  hebrewLabel: string;
  voiceText?: string;
}

// Keyword to icon ID mapping for Smart-Suggest
const TCM_KEYWORDS: Record<string, string> = {
  // Yin-Yang
  'stress': 'wellness-category-stress',
  'לחץ': 'wellness-category-stress',
  'anxiety': 'wellness-category-stress',
  'חרדה': 'wellness-category-stress',
  
  // Pregnancy & Women
  'pregnancy': 'ai-clinical-pregnancy',
  'הריון': 'ai-clinical-pregnancy',
  'pregnant': 'ai-clinical-pregnancy',
  'בהריון': 'ai-clinical-pregnancy',
  'מחזור': 'gyn_irregular',
  'period': 'gyn_irregular',
  'פוריות': 'gyn_fertility_cold',
  'fertility': 'gyn_fertility_cold',
  
  // Orthopedic - Back
  'back': 'musculoskeletal-back',
  'גב': 'musculoskeletal-back',
  'lower back': 'ortho_back_trauma',
  'כאב גב': 'ortho_back_trauma',
  'sciatica': 'ortho_sciatica',
  'סיאטיקה': 'ortho_sciatica',
  
  // Orthopedic - Neck/Shoulder
  'neck': 'ortho_neck',
  'צוואר': 'ortho_neck',
  'shoulder': 'ortho_shoulder',
  'כתף': 'ortho_shoulder',
  
  // Orthopedic - Other
  'knee': 'ortho_cartilage',
  'ברך': 'ortho_cartilage',
  'joint': 'ortho_heat',
  'מפרק': 'ortho_heat',
  'arthritis': 'ortho_cartilage',
  'דלקת מפרקים': 'ortho_cartilage',
  
  // Emotional
  'grief': 'wellness-category-grief',
  'אבל': 'wellness-category-grief',
  'trauma': 'wellness-category-trauma',
  'טראומה': 'wellness-category-trauma',
  'fear': 'wellness-category-fear',
  'פחד': 'wellness-category-fear',
  'anger': 'wellness-category-anger',
  'כעס': 'wellness-category-anger',
  'depression': 'yy_depression',
  'דיכאון': 'yy_depression',
  
  // Sleep
  'sleep': 'yy_insomnia',
  'שינה': 'yy_insomnia',
  'insomnia': 'yy_insomnia',
  'נדודי שינה': 'yy_insomnia',
  
  // Elderly
  'elderly': 'ai-clinical-elderly',
  'קשיש': 'ai-clinical-elderly',
  'senior': 'ai-clinical-elderly',
  'מבוגר': 'ai-clinical-elderly',
  
  // Pediatric
  'child': 'ai-clinical-pediatric',
  'ילד': 'ai-clinical-pediatric',
  'pediatric': 'ai-clinical-pediatric',
  'ילדים': 'ai-clinical-pediatric',
  
  // Nutrition
  'nutrition': 'wellness-category-nutrition',
  'תזונה': 'wellness-category-nutrition',
  'diet': 'wellness-category-nutrition',
  'דיאטה': 'wellness-category-nutrition',
  
  // Kidney/Energy
  'kidney': 'yy_kidney_balance',
  'כליות': 'yy_kidney_balance',
  'fatigue': 'yy_yang_strengthen',
  'עייפות': 'yy_yang_strengthen',
  'energy': 'yy_yang_strengthen',
  'אנרגיה': 'yy_yang_strengthen',
  
  // Liver
  'liver': 'yy_liver_yang',
  'כבד': 'yy_liver_yang',
  'headache': 'yy_liver_yang',
  'כאב ראש': 'yy_liver_yang',
};

interface UseSmartSuggestOptions {
  enabled?: boolean;
  voiceEnabled?: boolean;
  onMatch?: (match: SmartSuggestMatch) => void;
  debounceMs?: number;
}

// Default debounce of 2 seconds to prevent "Christmas tree flickering"
const DEFAULT_DEBOUNCE_MS = 2000;

export function useSmartSuggest(
  liveTranscription: string,
  options: UseSmartSuggestOptions = {}
) {
  const { enabled = true, voiceEnabled = false, onMatch, debounceMs = DEFAULT_DEBOUNCE_MS } = options;
  const [activeMatches, setActiveMatches] = useState<Map<string, SmartSuggestMatch>>(new Map());
  const [pulsingIds, setPulsingIds] = useState<Set<string>>(new Set());
  const haptic = useHapticFeedback();
  const lastProcessedRef = useRef<string>('');
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const pulseTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Speak function for voice tutor
  const speak = useCallback((text: string) => {
    if (!voiceEnabled || typeof window === 'undefined') return;
    
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn('Speech synthesis not available:', error);
    }
  }, [voiceEnabled]);

  // Trigger gold pulse animation on an icon
  const triggerGoldPulse = useCallback((iconId: string, durationMs: number = 3000) => {
    setPulsingIds(prev => new Set(prev).add(iconId));
    
    // Clear existing timeout for this icon
    const existingTimeout = pulseTimeoutsRef.current.get(iconId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Set timeout to remove pulse
    const timeout = setTimeout(() => {
      setPulsingIds(prev => {
        const next = new Set(prev);
        next.delete(iconId);
        return next;
      });
      pulseTimeoutsRef.current.delete(iconId);
    }, durationMs);
    
    pulseTimeoutsRef.current.set(iconId, timeout);
  }, []);

  // Process transcription for keyword matches
  const processTranscription = useCallback((text: string) => {
    if (!enabled || !text || text === lastProcessedRef.current) return;
    
    lastProcessedRef.current = text;
    const lowerText = text.toLowerCase();
    const newMatches = new Map<string, SmartSuggestMatch>();
    
    Object.entries(TCM_KEYWORDS).forEach(([keyword, iconId]) => {
      if (lowerText.includes(keyword.toLowerCase())) {
        // Check if we already have this match
        if (!activeMatches.has(iconId)) {
          const mapping = PROMPT_MAPPINGS.find(m => m.id === iconId);
          const match: SmartSuggestMatch = {
            id: iconId,
            keyword,
            hebrewLabel: mapping?.hebrewLabel || keyword,
            voiceText: mapping?.voiceText,
          };
          
          newMatches.set(iconId, match);
          
          // Trigger visual feedback
          triggerGoldPulse(iconId);
          haptic.medium();
          
          // Notify callback
          onMatch?.(match);
          
          // Voice feedback if enabled
          if (voiceEnabled && mapping?.voiceText) {
            speak(`זיהיתי הקשר ל${mapping.hebrewLabel}. ${mapping.voiceText}`);
          }
        }
      }
    });
    
    // Merge new matches with existing
    if (newMatches.size > 0) {
      setActiveMatches(prev => new Map([...prev, ...newMatches]));
    }
  }, [enabled, activeMatches, triggerGoldPulse, haptic, onMatch, voiceEnabled, speak]);

  // Effect to process transcription with debounce
  useEffect(() => {
    if (!enabled || !liveTranscription) return;
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      processTranscription(liveTranscription);
    }, debounceMs);
    
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [liveTranscription, enabled, debounceMs, processTranscription]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pulseTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      pulseTimeoutsRef.current.clear();
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Clear all matches
  const clearMatches = useCallback(() => {
    setActiveMatches(new Map());
    setPulsingIds(new Set());
    lastProcessedRef.current = '';
  }, []);

  // Check if an icon is currently pulsing
  const isPulsing = useCallback((iconId: string) => {
    return pulsingIds.has(iconId);
  }, [pulsingIds]);

  return {
    activeMatches: Array.from(activeMatches.values()),
    pulsingIds,
    isPulsing,
    triggerGoldPulse,
    clearMatches,
    speak,
  };
}

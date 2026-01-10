import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SupportStep {
  id: string;
  text: string;
  fallbackSelector?: string;
  isHighPriority?: boolean; // Phase 7: High-focus steps
}

/**
 * Phase 7: Ghost Guide - Updated Teleprompter Steps
 * Focuses on the "Pulse-to-Point" workflow for new therapists
 */
const supportSteps: SupportStep[] = [
  // Phase 7: Pulse Gallery High-Focus Step
  { 
    id: 'pulse-gallery-icon',
    text: '✨ התחל כאן: בחר דופק כדי להפעיל את ה-AI ומפת הדיקור. לחיצה תחשוף את גלריית הדפוסים.',
    fallbackSelector: '[data-teleprompter="pulse-gallery"], [data-guide="pulse-gallery"]',
    isHighPriority: true,
  },
  { 
    id: 'clinical-query-selector', 
    text: 'שלב 1: בחר דפוסי אבחנה מכאן. השתמש באקורדיון כדי למצוא התמחויות.',
    fallbackSelector: '[data-teleprompter="query-selector"]'
  },
  // Phase 7: Magic Sparkle Intro - Center Column
  {
    id: 'center-column',
    text: '🌟 כאן ה-AI יציע לך נקודות בזמן אמת. פשוט עקוב אחרי הנצנוץ על מפת הגוף - הנקודות יידלקו אוטומטית.',
    fallbackSelector: '[data-teleprompter="center-column"], [data-guide="ai-suggestions"]',
    isHighPriority: true,
  },
  { 
    id: 'stack-display', 
    text: 'שלב 2: כאן תוכל לראות את ה-Stack שלך. כל קליק מוסיף נושא נוסף לניתוח.',
    fallbackSelector: '[data-teleprompter="stack-display"]'
  },
  // Phase 7: Body Map Spotlight
  {
    id: 'body-map-container',
    text: '🗺️ מפת הגוף: כאן יוצגו הנקודות המומלצות. נקודות מנצנצות הן הצעות AI. לחץ על נקודה לפרטים טכניים.',
    fallbackSelector: '[data-teleprompter="body-map"], [data-guide="body-map"]',
  },
  { 
    id: 'clinical-synthesis-btn', 
    text: 'שלב 3: לחץ כאן לביצוע "סינתזה קלינית". המערכת תשלב הכל בבת אחת.',
    fallbackSelector: '[data-teleprompter="synthesis-btn"]'
  },
  // Phase 7: Draft Protocol Widget
  {
    id: 'draft-protocol-widget',
    text: '📋 טיוטת הפרוטוקול: כאן נאספות כל הנקודות שנבחרו - גם ידנית וגם מהצעות AI. ניתן למחוק בלחיצה.',
    fallbackSelector: '[data-teleprompter="draft-protocol"], [data-guide="protocol-widget"]',
  },
  { 
    id: 'rag-output-container', 
    text: 'שלב 4: כאן יופיע הדו"ח הסופי. תוכל לגלול בלי שהמסך ירעד.',
    fallbackSelector: '.rag-output-container'
  },
  // Phase 7: Closing Spotlight - Summary Button
  {
    id: 'session-summary-btn',
    text: '🎉 סיימת? לחיצה אחת תפיק דוח מלא לווטסאפ של המטופל, כולל כל הנקודות והאבחנות. פשוט תעתיק ותשלח!',
    fallbackSelector: '[data-teleprompter="summary-btn"], [data-guide="finish-button"]',
    isHighPriority: true,
  },
];

interface TherapistTeleprompterProps {
  isOpen: boolean;
  onClose: () => void;
  onSkipGuide?: () => void; // Phase 7: Skip for experienced users
}

export function TherapistTeleprompter({ isOpen, onClose, onSkipGuide }: TherapistTeleprompterProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const currentStepData = supportSteps[currentStep];
  const isHighPriority = currentStepData?.isHighPriority;

  const findElement = useCallback((step: SupportStep): HTMLElement | null => {
    // Try ID first
    let el = document.getElementById(step.id);
    if (el) return el;
    
    // Try fallback selector
    if (step.fallbackSelector) {
      el = document.querySelector(step.fallbackSelector);
      if (el) return el as HTMLElement;
    }
    
    return null;
  }, []);

  const updatePosition = useCallback(() => {
    if (!isOpen || currentStep >= supportSteps.length) return;
    
    const step = supportSteps[currentStep];
    const el = findElement(step);
    
    if (el) {
      const rect = el.getBoundingClientRect();
      setHighlightRect(rect);
      
      // Position tooltip below or above element
      const viewportHeight = window.innerHeight;
      const tooltipHeight = 140; // Slightly larger for high-priority steps
      
      if (rect.bottom + tooltipHeight + 20 < viewportHeight) {
        // Below element
        setTooltipPosition({
          top: rect.bottom + 15,
          left: Math.max(20, rect.left)
        });
      } else {
        // Above element
        setTooltipPosition({
          top: rect.top - tooltipHeight - 15,
          left: Math.max(20, rect.left)
        });
      }
      
      // Add highlight class
      document.querySelectorAll('.teleprompter-highlight').forEach(e => 
        e.classList.remove('teleprompter-highlight', 'teleprompter-priority')
      );
      el.classList.add('teleprompter-highlight');
      if (step.isHighPriority) {
        el.classList.add('teleprompter-priority');
      }
    }
  }, [isOpen, currentStep, findElement]);

  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      document.querySelectorAll('.teleprompter-highlight').forEach(e => 
        e.classList.remove('teleprompter-highlight')
      );
    };
  }, [updatePosition]);

  const nextStep = () => {
    if (currentStep < supportSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    document.querySelectorAll('.teleprompter-highlight').forEach(e => {
      e.classList.remove('teleprompter-highlight', 'teleprompter-priority');
    });
    setCurrentStep(0);
    onClose();
  };

  const handleSkip = () => {
    handleClose();
    onSkipGuide?.();
  };

  if (!isOpen) return null;

  // Dynamic background gradient based on priority
  const tooltipBackground = isHighPriority
    ? 'linear-gradient(135deg, hsl(158 64% 42%), hsl(158 64% 32%))' // Jade for priority
    : 'linear-gradient(135deg, hsl(38 70% 50%), hsl(38 60% 40%))'; // Gold for normal

  const tooltipShadow = isHighPriority
    ? '0 8px 32px rgba(52, 211, 153, 0.4), 0 0 0 1px rgba(255,255,255,0.2)'
    : '0 8px 32px rgba(212, 175, 55, 0.4), 0 0 0 1px rgba(255,255,255,0.2)';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark overlay with cutout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] pointer-events-auto"
            onClick={handleClose}
            style={{
              background: highlightRect 
                ? `radial-gradient(ellipse ${highlightRect.width + 40}px ${highlightRect.height + 40}px at ${highlightRect.left + highlightRect.width / 2}px ${highlightRect.top + highlightRect.height / 2}px, transparent 0%, rgba(0,0,0,0.8) 100%)`
                : 'rgba(0,0,0,0.8)'
            }}
          />

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed z-[10001] pointer-events-auto"
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              maxWidth: 'min(400px, calc(100vw - 40px))'
            }}
          >
            <div 
              className={`p-4 rounded-xl shadow-2xl ${isHighPriority ? 'ring-2 ring-white/40' : ''}`}
              style={{
                background: tooltipBackground,
                boxShadow: tooltipShadow,
              }}
            >
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-1">
                  {supportSteps.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === currentStep 
                          ? 'bg-white' 
                          : i < currentStep 
                            ? 'bg-white/60' 
                            : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white/80 hover:text-white hover:bg-white/20"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Text */}
              <p 
                className="text-sm font-medium leading-relaxed mb-4"
                style={{ color: 'hsl(25 30% 10%)' }}
                dir="rtl"
              >
                {supportSteps[currentStep]?.text}
              </p>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="text-xs h-8 text-black/70 hover:text-black hover:bg-white/20 disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4 ml-1" />
                    הקודם
                  </Button>
                  
                  {/* Skip button for experienced users */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-xs h-8 text-black/50 hover:text-black hover:bg-white/20 gap-1"
                  >
                    <SkipForward className="h-3 w-3" />
                    דלג על ההדרכה
                  </Button>
                </div>
                
                <Button
                  size="sm"
                  onClick={nextStep}
                  className="text-xs h-8 bg-white/90 text-black hover:bg-white"
                >
                  {currentStep === supportSteps.length - 1 ? 'סיים' : 'הבא'}
                  {currentStep < supportSteps.length - 1 && <ChevronLeft className="h-4 w-4 mr-1" />}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

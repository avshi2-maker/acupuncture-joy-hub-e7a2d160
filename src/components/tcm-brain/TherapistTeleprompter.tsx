import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SupportStep {
  id: string;
  text: string;
  fallbackSelector?: string;
}

const supportSteps: SupportStep[] = [
  { 
    id: 'clinical-query-selector', 
    text: 'שלב 1: בחר דפוסי אבחנה מכאן. השתמש באקורדיון כדי למצוא התמחויות.',
    fallbackSelector: '[data-teleprompter="query-selector"]'
  },
  { 
    id: 'stack-display', 
    text: 'שלב 2: כאן תוכל לראות את ה-Stack שלך. כל קליק מוסיף נושא נוסף לניתוח.',
    fallbackSelector: '[data-teleprompter="stack-display"]'
  },
  { 
    id: 'clinical-synthesis-btn', 
    text: 'שלב 3: לחץ כאן לביצוע "סינתזה קלינית". המערכת תשלח הכל בבת אחת לחיסכון בטוקנים.',
    fallbackSelector: '[data-teleprompter="synthesis-btn"]'
  },
  { 
    id: 'rag-output-container', 
    text: 'שלב 4: כאן יופיע הדו"ח הסופי. תוכל לגלול בלי שהמסך ירעד.',
    fallbackSelector: '.rag-output-container'
  }
];

interface TherapistTeleprompterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TherapistTeleprompter({ isOpen, onClose }: TherapistTeleprompterProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

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
      const tooltipHeight = 120;
      
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
        e.classList.remove('teleprompter-highlight')
      );
      el.classList.add('teleprompter-highlight');
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
    document.querySelectorAll('.teleprompter-highlight').forEach(e => 
      e.classList.remove('teleprompter-highlight')
    );
    setCurrentStep(0);
    onClose();
  };

  if (!isOpen) return null;

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
              className="p-4 rounded-xl shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, hsl(38 70% 50%), hsl(38 60% 40%))',
                boxShadow: '0 8px 32px rgba(212, 175, 55, 0.4), 0 0 0 1px rgba(255,255,255,0.2)'
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
              <div className="flex items-center justify-between">
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

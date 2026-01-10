import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';

interface GuideStep {
  id: string;
  elementId: string;
  message: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

// Phase 7: Golden Path - Jade Spotlight Guide Steps
const VIDEO_SESSION_GUIDE_STEPS: GuideStep[] = [
  {
    id: 'pulse-gallery',
    elementId: 'PulseGalleryIcon',
    message: '✨ התחל כאן: בחר דופק כדי להפעיל את ה-AI ומפת הדיקור.',
    position: 'bottom',
  },
  {
    id: 'body-map',
    elementId: 'BodyMapContainer',
    message: '🗺️ מפת הגוף - כאן הנקודות "מנצנצות" בזמן אמת כש-AI מזהה אותן.',
    position: 'left',
  },
  {
    id: 'ai-center',
    elementId: 'RAGLiveSummaryZone',
    message: '🤖 כאן ה-AI יציע לך נקודות בזמן אמת. פשוט עקוב אחרי הנצנוץ על מפת הגוף.',
    position: 'top',
  },
  {
    id: 'draft-protocol',
    elementId: 'DraftProtocolWidget',
    message: '📋 פרוטוקול הטיפול נבנה כאן אוטומטית - עומק, זווית והכל.',
    position: 'left',
  },
  {
    id: 'session-summary',
    elementId: 'SessionSummaryButton',
    message: '🎯 סיימת? לחיצה אחת תפיק דוח מלא לווטסאפ של המטופל, כולל כל הנקודות והאבחנות.',
    position: 'top',
  },
];

interface UseVideoSessionGuideOptions {
  onComplete?: () => void;
  autoStart?: boolean;
}

// Gold pulse animation class name
const GOLD_PULSE_CLASS = 'video-session-guide-pulse';

export function useVideoSessionGuide(options: UseVideoSessionGuideOptions = {}) {
  const { onComplete, autoStart = false } = options;
  
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // Inject CSS for gold pulse animation
  useEffect(() => {
    const styleId = 'video-session-guide-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes goldPulseGuide {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(218, 165, 32, 0.7),
                        0 0 20px 5px rgba(218, 165, 32, 0.3);
          }
          50% { 
            box-shadow: 0 0 0 15px rgba(218, 165, 32, 0),
                        0 0 40px 10px rgba(218, 165, 32, 0.5);
          }
        }
        
        /* Phase 7: Jade Spotlight - Golden Path */
        .${GOLD_PULSE_CLASS} {
          animation: jadeSpotlight 1.8s ease-in-out infinite !important;
          position: relative;
          z-index: 9998 !important;
          outline: 4px solid hsl(158, 64%, 52%) !important;
          outline-offset: 6px !important;
          border-radius: 16px !important;
          box-shadow: 0 0 30px 10px hsla(158, 64%, 52%, 0.4),
                      inset 0 0 20px hsla(158, 64%, 52%, 0.1) !important;
        }
        
        @keyframes jadeSpotlight {
          0%, 100% { 
            box-shadow: 0 0 20px 5px hsla(158, 64%, 52%, 0.3),
                        0 0 40px 15px hsla(158, 64%, 52%, 0.15);
            outline-color: hsl(158, 64%, 52%);
          }
          50% { 
            box-shadow: 0 0 40px 15px hsla(158, 64%, 52%, 0.5),
                        0 0 60px 25px hsla(158, 64%, 52%, 0.25);
            outline-color: hsl(158, 64%, 62%);
          }
        }
        
        .video-session-guide-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          z-index: 9997;
          pointer-events: none;
          transition: opacity 0.4s ease;
        }
        
        .video-session-guide-tooltip {
          position: fixed;
          z-index: 9999;
          max-width: 280px;
          padding: 16px 20px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border: 2px solid rgba(218, 165, 32, 0.6);
          border-radius: 16px;
          color: white;
          font-size: 15px;
          line-height: 1.5;
          direction: rtl;
          text-align: right;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4),
                      0 0 20px rgba(218, 165, 32, 0.2);
          animation: tooltipFadeIn 0.3s ease-out;
        }
        
        @keyframes tooltipFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .video-session-guide-tooltip::before {
          content: '✨';
          display: block;
          margin-bottom: 8px;
          font-size: 20px;
        }
        
        .video-session-guide-tooltip-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(218, 165, 32, 0.3);
        }
        
        .video-session-guide-tooltip-progress {
          font-size: 12px;
          color: rgba(218, 165, 32, 0.8);
        }
        
        .video-session-guide-tooltip-button {
          background: linear-gradient(135deg, #DAA520, #B8860B);
          color: #000;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .video-session-guide-tooltip-button:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(218, 165, 32, 0.4);
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Clean up function
  const cleanup = useCallback(() => {
    if (highlightedElement) {
      highlightedElement.classList.remove(GOLD_PULSE_CLASS);
    }
    if (overlayRef.current) {
      overlayRef.current.remove();
      overlayRef.current = null;
    }
    if (tooltipRef.current) {
      tooltipRef.current.remove();
      tooltipRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setHighlightedElement(null);
  }, [highlightedElement]);

  // Position tooltip relative to element
  const positionTooltip = useCallback((element: HTMLElement, position: GuideStep['position'] = 'bottom') => {
    if (!tooltipRef.current) return;
    
    const rect = element.getBoundingClientRect();
    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();
    const padding = 20;
    
    let top = 0;
    let left = 0;
    
    switch (position) {
      case 'top':
        top = rect.top - tooltipRect.height - padding;
        left = rect.left + (rect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = rect.bottom + padding;
        left = rect.left + (rect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = rect.top + (rect.height - tooltipRect.height) / 2;
        left = rect.left - tooltipRect.width - padding;
        break;
      case 'right':
        top = rect.top + (rect.height - tooltipRect.height) / 2;
        left = rect.right + padding;
        break;
    }
    
    // Keep within viewport
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));
    
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }, []);

  // Highlight a specific step
  const highlightStep = useCallback((stepIndex: number) => {
    cleanup();
    
    if (stepIndex >= VIDEO_SESSION_GUIDE_STEPS.length) {
      setIsActive(false);
      setCurrentStepIndex(0);
      onComplete?.();
      toast.success('🎉 סיור ההדרכה הסתיים!', { duration: 3000 });
      return;
    }
    
    const step = VIDEO_SESSION_GUIDE_STEPS[stepIndex];
    const element = document.getElementById(step.elementId);
    
    if (!element) {
      console.warn(`[VideoSessionGuide] Element not found: ${step.elementId}`);
      // Skip to next step after delay
      timeoutRef.current = setTimeout(() => {
        highlightStep(stepIndex + 1);
      }, 500);
      return;
    }
    
    // Create overlay
    if (!overlayRef.current) {
      const overlay = document.createElement('div');
      overlay.className = 'video-session-guide-overlay';
      document.body.appendChild(overlay);
      overlayRef.current = overlay;
    }
    
    // Apply gold pulse to element
    element.classList.add(GOLD_PULSE_CLASS);
    setHighlightedElement(element);
    
    // Scroll element into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'video-session-guide-tooltip';
    tooltip.innerHTML = `
      <div>${step.message}</div>
      <div class="video-session-guide-tooltip-footer">
        <span class="video-session-guide-tooltip-progress">${stepIndex + 1} / ${VIDEO_SESSION_GUIDE_STEPS.length}</span>
        <button class="video-session-guide-tooltip-button">
          ${stepIndex < VIDEO_SESSION_GUIDE_STEPS.length - 1 ? 'הבא ←' : 'סיום ✓'}
        </button>
      </div>
    `;
    
    // Handle next button click
    const button = tooltip.querySelector('button');
    button?.addEventListener('click', () => {
      setCurrentStepIndex(stepIndex + 1);
      highlightStep(stepIndex + 1);
    });
    
    document.body.appendChild(tooltip);
    tooltipRef.current = tooltip;
    
    // Position tooltip after it's rendered
    requestAnimationFrame(() => {
      positionTooltip(element, step.position);
    });
    
    setCurrentStepIndex(stepIndex);
  }, [cleanup, onComplete, positionTooltip]);

  // Start the guide
  const startVideoSessionGuide = useCallback(() => {
    setIsActive(true);
    setCurrentStepIndex(0);
    highlightStep(0);
    toast.info('🧭 מתחיל סיור הדרכה...', { duration: 2000 });
  }, [highlightStep]);

  // Stop the guide
  const stopGuide = useCallback(() => {
    cleanup();
    setIsActive(false);
    setCurrentStepIndex(0);
  }, [cleanup]);

  // Next step
  const nextStep = useCallback(() => {
    if (isActive && currentStepIndex < VIDEO_SESSION_GUIDE_STEPS.length - 1) {
      highlightStep(currentStepIndex + 1);
    }
  }, [isActive, currentStepIndex, highlightStep]);

  // Previous step
  const prevStep = useCallback(() => {
    if (isActive && currentStepIndex > 0) {
      highlightStep(currentStepIndex - 1);
    }
  }, [isActive, currentStepIndex, highlightStep]);

  // Auto start if enabled
  useEffect(() => {
    if (autoStart) {
      // Delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startVideoSessionGuide();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStart, startVideoSessionGuide]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Handle escape key to close guide
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        stopGuide();
        toast.info('סיור ההדרכה הופסק');
      }
    };
    
    if (isActive) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isActive, stopGuide]);

  return {
    isActive,
    currentStepIndex,
    totalSteps: VIDEO_SESSION_GUIDE_STEPS.length,
    currentStep: VIDEO_SESSION_GUIDE_STEPS[currentStepIndex],
    startVideoSessionGuide,
    stopGuide,
    nextStep,
    prevStep,
  };
}

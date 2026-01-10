import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Compass, Activity, MapPin, FileCheck, Sparkles, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Golden Path Guide - Phase 7: Pulse-to-Point Mastery Walkthrough
 * Jade spotlight guided tour for the TCM workflow
 */

interface GuideStep {
  targetId: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  position: 'right' | 'center' | 'left';
  spotlight: 'pulse' | 'map' | 'summary' | 'protocol' | 'ai';
}

const GOLDEN_PATH_STEPS: GuideStep[] = [
  {
    targetId: 'PulseGalleryIcon',
    title: '1. בחירת דופק',
    description: 'התחלו כאן: לחצו על הדופק כדי לסנכרן את מפת הגוף. ה-AI יתחיל לנתח ולהציע נקודות.',
    icon: <Activity className="h-5 w-5" />,
    position: 'left',
    spotlight: 'pulse',
  },
  {
    targetId: 'BodyMapContainer',
    title: '2. מפת הגוף',
    description: 'המפה תתעדכן אוטומטית לפי ממצאי הדופק והצעות ה-AI. נקודות מומלצות "ינצנצו" בזהב.',
    icon: <MapPin className="h-5 w-5" />,
    position: 'center',
    spotlight: 'map',
  },
  {
    targetId: 'RAGLiveSummaryZone',
    title: '3. ניתוח AI',
    description: 'כאן ה-AI יציע לך נקודות בזמן אמת. פשוט עקוב אחרי הנצנוץ על מפת הגוף.',
    icon: <Sparkles className="h-5 w-5" />,
    position: 'center',
    spotlight: 'ai',
  },
  {
    targetId: 'DraftProtocolWidget',
    title: '4. פרוטוקול טיפול',
    description: 'הנקודות שנבחרו מופיעות כאן עם מידע טכני מלא: עומק, זווית ופעולה קלינית.',
    icon: <MapPin className="h-5 w-5" />,
    position: 'right',
    spotlight: 'protocol',
  },
  {
    targetId: 'SessionSummaryButton',
    title: '5. סיום וסיכום',
    description: "בלחיצה אחת, המערכת תפיק סיכום טיפול מלא לוואטסאפ של המטופל, כולל כל הנקודות והאבחנות.",
    icon: <FileCheck className="h-5 w-5" />,
    position: 'center',
    spotlight: 'summary',
  },
];

interface GoldenPathGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GoldenPathGuide({ isOpen, onClose }: GoldenPathGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = useCallback(() => {
    if (currentStep < GOLDEN_PATH_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
      setCurrentStep(0);
    }
  }, [currentStep, onClose]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    onClose();
    setCurrentStep(0);
  }, [onClose]);

  const step = GOLDEN_PATH_STEPS[currentStep];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark overlay with backdrop blur - z-[9997] to stay below Economy Monitor */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9997]"
            onClick={onClose}
          />

          {/* Jade Spotlight Effect - z-[9998] below Economy Monitor */}
          <motion.div
            key={step.targetId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed z-[9998] pointer-events-none",
              step.position === 'right' && "top-0 right-0 w-1/4 h-full lg:block hidden",
              step.position === 'center' && "top-0 left-1/4 w-1/2 h-full lg:block hidden",
              step.position === 'left' && "top-0 left-0 w-1/4 h-full lg:block hidden",
            )}
          >
            {/* Jade spotlight border with animation */}
            <motion.div 
              className="absolute inset-4 rounded-2xl"
              style={{
                boxShadow: '0 0 60px 20px hsla(158, 64%, 52%, 0.4), inset 0 0 40px 10px hsla(158, 64%, 52%, 0.1)',
                border: '4px solid hsl(158, 64%, 52%)',
              }}
              animate={{
                boxShadow: [
                  '0 0 40px 15px hsla(158, 64%, 52%, 0.3), inset 0 0 30px 8px hsla(158, 64%, 52%, 0.08)',
                  '0 0 80px 30px hsla(158, 64%, 52%, 0.5), inset 0 0 50px 15px hsla(158, 64%, 52%, 0.15)',
                  '0 0 40px 15px hsla(158, 64%, 52%, 0.3), inset 0 0 30px 8px hsla(158, 64%, 52%, 0.08)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>

          {/* Guide Card - z-[9999] between spotlight and Economy Monitor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-lg"
          >
            <div className="bg-card/95 backdrop-blur-xl border border-jade/40 rounded-2xl shadow-2xl shadow-jade/20 p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-jade to-jade/70 flex items-center justify-center text-white shadow-lg shadow-jade/30">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{step.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      שלב {currentStep + 1} מתוך {GOLDEN_PATH_STEPS.length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSkip}
                    className="text-muted-foreground hover:text-foreground gap-1"
                  >
                    <SkipForward className="h-3 w-3" />
                    דלג
                  </Button>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6 leading-relaxed text-right" dir="rtl">
                {step.description}
              </p>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mb-4">
                {GOLDEN_PATH_STEPS.map((_, i) => (
                  <motion.div
                    key={i}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      i === currentStep 
                        ? "bg-jade w-8" 
                        : i < currentStep 
                          ? "bg-jade/50 w-2" 
                          : "bg-muted w-2"
                    )}
                    layoutId={`dot-${i}`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="gap-2"
                >
                  <ChevronRight className="h-4 w-4" />
                  הקודם
                </Button>
                <Button
                  onClick={handleNext}
                  size="sm"
                  className="bg-jade hover:bg-jade/90 gap-2 shadow-lg shadow-jade/30"
                >
                  {currentStep === GOLDEN_PATH_STEPS.length - 1 ? (
                    <>סיום ✨</>
                  ) : (
                    <>הבא<ChevronLeft className="h-4 w-4" /></>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook to control the Golden Path Guide
export function useGoldenPathGuide() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const startGoldenPath = useCallback(() => {
    setIsGuideOpen(true);
  }, []);

  const closeGoldenPath = useCallback(() => {
    setIsGuideOpen(false);
  }, []);

  return {
    isGuideOpen,
    startGoldenPath,
    closeGoldenPath,
  };
}

export default GoldenPathGuide;

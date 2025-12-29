import { useState, useEffect } from 'react';
import { X, Calendar, Users, Video, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const TUTORIAL_SEEN_KEY = 'workflow_tutorial_seen';

interface WorkflowTutorialProps {
  onClose?: () => void;
}

const steps = [
  {
    icon: Calendar,
    title: 'שלב 1: קביעת תור',
    description: 'התחילו ביומן התורים - קבעו תור למטופל קיים או חדש. זהו השלב הראשון בכל טיפול.',
    tip: 'ביומן תוכלו לראות את כל התורים שלכם ולהוסיף חדשים',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Users,
    title: 'שלב 2: הסכמת מטופל',
    description: 'וודאו שהמטופל חתם על טופס הסכמה לטיפול. זה נדרש לפני תחילת כל טיפול.',
    tip: 'המטופל יכול לחתום בטאבלט או בטלפון',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    icon: Video,
    title: 'שלב 3: התחלת טיפול',
    description: 'אחרי שהתור נקבע והמטופל חתם - התחילו את הטיפול! תוכלו לבחור פגישת וידאו או טיפול סטנדרטי.',
    tip: 'הטיפול יתחיל ישירות מהתור ביומן',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
];

export function WorkflowTutorial({ onClose }: WorkflowTutorialProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem(TUTORIAL_SEEN_KEY);
    if (!seen) {
      // Show tutorial after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
    setIsVisible(false);
    onClose?.();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-md p-6 shadow-2xl border-jade/20 animate-scale-in bg-card">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 p-1 rounded-full hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-jade/10 text-jade text-sm font-medium mb-4">
            <span>🎯</span>
            <span>מדריך התחלה מהירה</span>
          </div>
          <h2 className="font-display text-2xl mb-1">ברוכים הבאים!</h2>
          <p className="text-muted-foreground text-sm">הכירו את 3 השלבים להתחלת טיפול</p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentStep 
                  ? 'bg-jade w-6' 
                  : index < currentStep 
                    ? 'bg-jade/60' 
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-full ${step.bgColor} flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`h-8 w-8 ${step.color}`} />
          </div>
          <h3 className="font-display text-xl mb-2">{step.title}</h3>
          <p className="text-muted-foreground mb-4">{step.description}</p>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-sm">
            <span className="text-jade">💡</span>
            <span>{step.tip}</span>
          </div>
        </div>

        {/* Visual workflow preview */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {steps.map((s, index) => {
            const StepIcon = s.icon;
            const isActive = index === currentStep;
            const isPast = index < currentStep;
            return (
              <div key={index} className="flex items-center">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                  isActive 
                    ? 'bg-jade border-jade scale-110' 
                    : isPast 
                      ? 'bg-jade/20 border-jade/50' 
                      : 'bg-muted border-muted-foreground/30'
                }`}>
                  {isPast ? (
                    <CheckCircle2 className="h-5 w-5 text-jade" />
                  ) : (
                    <StepIcon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-6 h-0.5 ${isPast ? 'bg-jade' : 'bg-muted'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            הקודם
          </Button>
          
          <Button
            onClick={handleNext}
            className="gap-2 bg-jade hover:bg-jade-dark"
          >
            {currentStep === steps.length - 1 ? (
              <>
                בואו נתחיל!
                <CheckCircle2 className="h-4 w-4" />
              </>
            ) : (
              <>
                הבא
                <ArrowLeft className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Skip */}
        <button
          onClick={handleClose}
          className="w-full text-center text-sm text-muted-foreground mt-4 hover:text-foreground transition-colors"
        >
          דילוג על ההדרכה
        </button>
      </Card>
    </div>
  );
}

// Function to reset tutorial (for testing)
export function resetWorkflowTutorial() {
  localStorage.removeItem(TUTORIAL_SEEN_KEY);
}

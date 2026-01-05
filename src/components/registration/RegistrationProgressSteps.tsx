import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  label: string;
  labelShort?: string;
}

const steps: Step[] = [
  { id: 1, label: 'פרטים בסיסיים', labelShort: 'פרטים' },
  { id: 2, label: 'טופס קליטה', labelShort: 'קליטה' },
  { id: 3, label: 'בחירת תוכנית', labelShort: 'תוכנית' },
];

interface RegistrationProgressStepsProps {
  currentStep: 1 | 2 | 3;
  className?: string;
}

export function RegistrationProgressSteps({ currentStep, className }: RegistrationProgressStepsProps) {
  return (
    <div className={cn("w-full", className)} dir="rtl">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
                    isCompleted && "bg-jade text-white",
                    isCurrent && "bg-jade text-white ring-4 ring-jade/30 animate-pulse",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground border-2 border-border"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium text-center max-w-[80px]",
                    isCurrent && "text-jade font-bold",
                    isCompleted && "text-jade",
                    !isCompleted && !isCurrent && "text-muted-foreground"
                  )}
                >
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.labelShort || step.label}</span>
                </span>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2 rounded-full transition-all duration-500",
                    isCompleted ? "bg-jade" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

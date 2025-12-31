import { cn } from '@/lib/utils';
import { Check, Circle, User, Play, Mic, BookOpen, FileText } from 'lucide-react';

interface WorkflowStep {
  id: string;
  label: string;
  labelHe: string;
  icon: React.ElementType;
  isComplete: boolean;
  isCurrent: boolean;
}

interface SessionWorkflowIndicatorProps {
  hasPatient: boolean;
  isSessionStarted: boolean;
  isRecording: boolean;
  guideCompleted: boolean;
  hasNotes: boolean;
}

export function SessionWorkflowIndicator({
  hasPatient,
  isSessionStarted,
  isRecording,
  guideCompleted,
  hasNotes,
}: SessionWorkflowIndicatorProps) {
  const steps: WorkflowStep[] = [
    {
      id: 'patient',
      label: 'Patient',
      labelHe: 'מטופל',
      icon: User,
      isComplete: hasPatient,
      isCurrent: !hasPatient,
    },
    {
      id: 'start',
      label: 'Start',
      labelHe: 'התחל',
      icon: Play,
      isComplete: isSessionStarted,
      isCurrent: hasPatient && !isSessionStarted,
    },
    {
      id: 'record',
      label: 'Record',
      labelHe: 'הקלט',
      icon: Mic,
      isComplete: isRecording,
      isCurrent: isSessionStarted && !isRecording,
    },
    {
      id: 'guide',
      label: 'Guide',
      labelHe: 'מדריך',
      icon: BookOpen,
      isComplete: guideCompleted,
      isCurrent: isRecording && !guideCompleted,
    },
    {
      id: 'notes',
      label: 'Notes',
      labelHe: 'הערות',
      icon: FileText,
      isComplete: hasNotes,
      isCurrent: guideCompleted && !hasNotes,
    },
  ];

  // Find current step index
  const currentIndex = steps.findIndex(s => s.isCurrent);
  const progressPercent = currentIndex >= 0 
    ? (currentIndex / (steps.length - 1)) * 100 
    : steps.every(s => s.isComplete) ? 100 : 0;

  return (
    <div className="w-full px-2">
      {/* Progress bar */}
      <div className="relative h-1 bg-muted rounded-full mb-2 overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-jade to-gold transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      {/* Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const showConnector = index < steps.length - 1;
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center transition-all',
                    'border-2',
                    step.isComplete 
                      ? 'bg-jade border-jade text-white' 
                      : step.isCurrent 
                        ? 'bg-gold/20 border-gold text-gold animate-pulse' 
                        : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  {step.isComplete ? (
                    <Check className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  ) : (
                    <Icon className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  )}
                </div>
                <span className={cn(
                  'text-[8px] md:text-[9px] mt-0.5 font-medium text-center leading-tight',
                  step.isComplete ? 'text-jade' : step.isCurrent ? 'text-gold' : 'text-muted-foreground'
                )}>
                  {step.labelHe}
                </span>
              </div>
              
              {/* Connector line */}
              {showConnector && (
                <div 
                  className={cn(
                    'flex-1 h-0.5 mx-1 transition-colors',
                    step.isComplete ? 'bg-jade' : 'bg-muted'
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

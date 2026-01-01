import { cn } from '@/lib/utils';
import { Sparkles, Stethoscope, Activity, CheckCircle } from 'lucide-react';

export type SessionPhase = 'opening' | 'diagnosis' | 'treatment' | 'closing';

interface PhaseStep {
  id: SessionPhase;
  label: string;
  labelHe: string;
  icon: React.ElementType;
}

const phases: PhaseStep[] = [
  { id: 'opening', label: 'Opening', labelHe: 'פתיחה', icon: Sparkles },
  { id: 'diagnosis', label: 'Diagnosis', labelHe: 'אבחון', icon: Stethoscope },
  { id: 'treatment', label: 'Treatment', labelHe: 'טיפול', icon: Activity },
  { id: 'closing', label: 'Closing', labelHe: 'סיום', icon: CheckCircle },
];

interface SessionPhaseIndicatorProps {
  currentPhase: SessionPhase;
  onPhaseClick?: (phase: SessionPhase) => void;
  className?: string;
}

export function SessionPhaseIndicator({ 
  currentPhase, 
  onPhaseClick,
  className 
}: SessionPhaseIndicatorProps) {
  const currentIndex = phases.findIndex(p => p.id === currentPhase);
  const progressPercent = ((currentIndex + 1) / phases.length) * 100;

  return (
    <div className={cn("w-full", className)}>
      {/* Progress bar */}
      <div className="relative h-1.5 bg-muted rounded-full mb-3 overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-jade via-gold to-jade transition-all duration-700 ease-out rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      {/* Phase steps */}
      <div className="flex items-center justify-between">
        {phases.map((phase, index) => {
          const Icon = phase.icon;
          const isCompleted = index < currentIndex;
          const isCurrent = phase.id === currentPhase;
          const showConnector = index < phases.length - 1;
          
          return (
            <div key={phase.id} className="flex items-center flex-1">
              {/* Phase circle */}
              <button
                onClick={() => onPhaseClick?.(phase.id)}
                disabled={!onPhaseClick}
                className={cn(
                  "flex flex-col items-center group transition-all",
                  onPhaseClick && "cursor-pointer hover:scale-105"
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300',
                    'border-2 shadow-sm',
                    isCompleted 
                      ? 'bg-jade border-jade text-white shadow-jade/30' 
                      : isCurrent 
                        ? 'bg-gold/20 border-gold text-gold shadow-gold/40 animate-pulse' 
                        : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 md:h-5 md:w-5",
                    isCurrent && "animate-pulse"
                  )} />
                </div>
                <span className={cn(
                  'text-[10px] md:text-xs mt-1.5 text-center leading-tight transition-all',
                  isCompleted ? 'text-jade font-bold' : 
                  isCurrent ? 'text-gold font-extrabold' : 
                  'text-muted-foreground font-medium'
                )}>
                  {phase.labelHe}
                </span>
                <span className={cn(
                  'text-[8px] md:text-[10px] text-center leading-tight',
                  isCompleted ? 'text-jade/70 font-semibold' : 
                  isCurrent ? 'text-gold/80 font-bold' : 
                  'text-muted-foreground/60 font-normal'
                )}>
                  {phase.label}
                </span>
              </button>
              
              {/* Connector line */}
              {showConnector && (
                <div 
                  className={cn(
                    'flex-1 h-0.5 mx-2 transition-all duration-500',
                    isCompleted ? 'bg-jade' : 'bg-muted'
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

// Helper to determine phase from session duration (in seconds)
export function getPhaseFromDuration(durationSeconds: number): SessionPhase {
  const minutes = durationSeconds / 60;
  if (minutes < 5) return 'opening';
  if (minutes < 20) return 'diagnosis';
  if (minutes < 40) return 'treatment';
  return 'closing';
}

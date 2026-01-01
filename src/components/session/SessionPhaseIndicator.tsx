import { cn } from '@/lib/utils';
import { Sparkles, Stethoscope, Activity, CheckCircle, User, LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type SessionPhase = 'opening' | 'diagnosis' | 'treatment' | 'closing';

interface PhaseStep {
  id: SessionPhase;
  label: string;
  labelHe: string;
  icon: LucideIcon;
  tools: string[];
  toolsHe: string[];
}

const phases: PhaseStep[] = [
  { 
    id: 'opening', 
    label: 'Opening', 
    labelHe: 'פתיחה', 
    icon: Sparkles,
    tools: ['Patient History', 'Chief Complaint', 'Intake Review'],
    toolsHe: ['היסטוריה', 'תלונה עיקרית', 'קליטה'],
  },
  { 
    id: 'diagnosis', 
    label: 'Diagnosis', 
    labelHe: 'אבחון', 
    icon: Stethoscope,
    tools: ['Pulse', 'Tongue', 'TCM Brain'],
    toolsHe: ['דופק', 'לשון', 'מוח TCM'],
  },
  { 
    id: 'treatment', 
    label: 'Treatment', 
    labelHe: 'טיפול', 
    icon: Activity,
    tools: ['Points', 'Herbs', 'Body Map'],
    toolsHe: ['נקודות', 'צמחים', 'מפת גוף'],
  },
  { 
    id: 'closing', 
    label: 'Closing', 
    labelHe: 'סיום', 
    icon: CheckCircle,
    tools: ['Summary', 'Follow-up', 'Report'],
    toolsHe: ['סיכום', 'המשך טיפול', 'דוח'],
  },
];

interface SessionPhaseIndicatorProps {
  currentPhase: SessionPhase;
  onPhaseClick?: (phase: SessionPhase) => void;
  patientName?: string | null;
  showTools?: boolean;
  className?: string;
}

export function SessionPhaseIndicator({ 
  currentPhase, 
  onPhaseClick,
  patientName,
  showTools = true,
  className 
}: SessionPhaseIndicatorProps) {
  const currentIndex = phases.findIndex(p => p.id === currentPhase);
  const progressPercent = ((currentIndex + 1) / phases.length) * 100;
  const currentPhaseData = phases.find(p => p.id === currentPhase);

  return (
    <div className={cn("w-full space-y-2", className)}>
      {/* Patient Badge + Phase Tools */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {patientName && (
          <Badge variant="outline" className="bg-jade/10 text-jade border-jade/30 font-bold text-xs gap-1">
            <User className="h-3 w-3" />
            {patientName}
          </Badge>
        )}
        
        {showTools && currentPhaseData && (
          <div className="flex items-center gap-1 flex-wrap justify-end flex-1">
            <span className="text-[10px] text-muted-foreground font-medium mr-1">כלים מומלצים:</span>
            {currentPhaseData.toolsHe.map((tool, i) => (
              <Badge 
                key={i} 
                variant="secondary" 
                className="text-[9px] px-1.5 py-0 h-5 bg-gold/10 text-gold border-gold/20 font-semibold"
              >
                {tool}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
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
                  onPhaseClick && "cursor-pointer hover:scale-110 active:scale-95"
                )}
              >
                <div
                  className={cn(
                    'w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all duration-300',
                    'border-2 shadow-md',
                    isCompleted 
                      ? 'bg-jade border-jade text-white shadow-jade/40' 
                      : isCurrent 
                        ? 'bg-gold/20 border-gold text-gold shadow-gold/50 ring-2 ring-gold/30 ring-offset-2 ring-offset-background' 
                        : 'bg-muted border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/50'
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 md:h-5 md:w-5",
                    isCurrent && "animate-pulse"
                  )} />
                </div>
                <span className={cn(
                  'text-[11px] md:text-sm mt-1.5 text-center leading-tight transition-all',
                  isCompleted ? 'text-jade font-bold' : 
                  isCurrent ? 'text-gold font-extrabold text-shadow-sm' : 
                  'text-muted-foreground font-medium'
                )}>
                  {phase.labelHe}
                </span>
                <span className={cn(
                  'text-[9px] md:text-xs text-center leading-tight',
                  isCompleted ? 'text-jade/80 font-semibold' : 
                  isCurrent ? 'text-gold/90 font-bold' : 
                  'text-muted-foreground/70 font-normal'
                )}>
                  {phase.label}
                </span>
              </button>
              
              {/* Connector line */}
              {showConnector && (
                <div 
                  className={cn(
                    'flex-1 h-1 mx-2 rounded-full transition-all duration-500',
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

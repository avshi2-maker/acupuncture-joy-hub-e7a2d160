import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SessionPointMarkerProps {
  code: string;
  label: string;
  hebrewLabel: string;
  function?: string;
  x: number;
  y: number;
  isActive: boolean;
  onClick: () => void;
}

/**
 * Phase #001: Interactive point marker with Popover for clinical info
 * Shows Hebrew card on click with name and function
 */
export function SessionPointMarker({
  code,
  label,
  hebrewLabel,
  function: pointFunction,
  x,
  y,
  isActive,
  onClick,
}: SessionPointMarkerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <g
          className="cursor-pointer"
          onClick={onClick}
          role="button"
          tabIndex={0}
          aria-label={`${code} - ${hebrewLabel}`}
        >
          {/* Outer glow ring when active */}
          {isActive && (
            <>
              <circle
                cx={x}
                cy={y}
                r="14"
                className="fill-primary/20"
                style={{
                  animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                }}
              />
              <circle
                cx={x}
                cy={y}
                r="10"
                className="fill-primary/30"
              />
            </>
          )}
          
          {/* Main point circle */}
          <circle
            cx={x}
            cy={y}
            r="7"
            className={cn(
              'transition-all duration-300',
              isActive
                ? 'fill-primary stroke-primary-foreground stroke-1'
                : 'fill-muted-foreground/40 stroke-muted-foreground/60 stroke-1 hover:fill-primary/60 hover:stroke-primary'
            )}
            style={{
              filter: isActive ? 'drop-shadow(0 0 6px hsl(var(--primary)))' : 'none',
            }}
          />
          
          {/* Point code label */}
          <text
            x={x}
            y={y + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            className={cn(
              'text-[5px] font-bold pointer-events-none select-none tracking-tight',
              isActive ? 'fill-primary-foreground' : 'fill-background'
            )}
          >
            {code}
          </text>
        </g>
      </PopoverTrigger>
      
      <PopoverContent 
        side="left" 
        sideOffset={12}
        className="w-56 bg-card/95 backdrop-blur-sm border-border/50 shadow-xl"
        dir="rtl"
      >
        <div className="space-y-3">
          {/* Header with code and status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">{code}</span>
              {isActive && (
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </div>
          </div>
          
          {/* Hebrew Name */}
          <div>
            <div className="text-base font-semibold text-foreground">{hebrewLabel}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
          
          {/* Clinical Function */}
          {pointFunction && (
            <div className="pt-2 border-t border-border/50">
              <div className="text-xs font-medium text-muted-foreground mb-1">פעולה קלינית:</div>
              <div className="text-sm text-foreground leading-relaxed">{pointFunction}</div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

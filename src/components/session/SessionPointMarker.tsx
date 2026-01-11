import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SessionPointMarkerProps {
  code: string;
  label: string;
  x: number; // SVG coordinate
  y: number; // SVG coordinate
  isActive: boolean;
  onClick: () => void;
}

/**
 * Phase #001: Interactive point marker with glow animation
 * Uses Tailwind animate-pulse when active
 */
export function SessionPointMarker({
  code,
  label,
  x,
  y,
  isActive,
  onClick,
}: SessionPointMarkerProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <g
          className="cursor-pointer transition-transform hover:scale-110"
          onClick={onClick}
          style={{ transformOrigin: `${x}px ${y}px` }}
        >
          {/* Outer glow ring when active */}
          {isActive && (
            <circle
              cx={x}
              cy={y}
              r="12"
              className="fill-primary/20 animate-ping"
              style={{ animationDuration: '1.5s' }}
            />
          )}
          
          {/* Main point circle */}
          <circle
            cx={x}
            cy={y}
            r="8"
            className={cn(
              'transition-all duration-300 stroke-2',
              isActive
                ? 'fill-primary stroke-primary animate-pulse shadow-lg'
                : 'fill-muted-foreground/30 stroke-muted-foreground/60 hover:fill-primary/50 hover:stroke-primary'
            )}
            style={{
              filter: isActive ? 'drop-shadow(0 0 8px hsl(var(--primary)))' : 'none',
            }}
          />
          
          {/* Point code label */}
          <text
            x={x}
            y={y + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            className={cn(
              'text-[6px] font-bold pointer-events-none select-none',
              isActive ? 'fill-primary-foreground' : 'fill-foreground'
            )}
          >
            {code}
          </text>
        </g>
      </TooltipTrigger>
      <TooltipContent side="left" className="text-sm">
        <div className="font-semibold">{code}</div>
        <div className="text-muted-foreground text-xs">{label}</div>
      </TooltipContent>
    </Tooltip>
  );
}

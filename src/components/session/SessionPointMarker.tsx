import { cn } from '@/lib/utils';

interface SessionPointMarkerProps {
  code: string;
  x: number;
  y: number;
  isActive: boolean;
}

/**
 * Phase #001: SVG-only point marker with glow animation
 * The popover is handled separately in BodyMapCore using HTML
 */
export function SessionPointMarker({
  code,
  x,
  y,
  isActive,
}: SessionPointMarkerProps) {
  return (
    <g className="pointer-events-none">
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
            : 'fill-muted-foreground/40 stroke-muted-foreground/60 stroke-1'
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
          'text-[5px] font-bold select-none tracking-tight',
          isActive ? 'fill-primary-foreground' : 'fill-background'
        )}
      >
        {code}
      </text>
    </g>
  );
}

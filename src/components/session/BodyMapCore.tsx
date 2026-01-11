import { useCallback, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SessionPointMarker } from './SessionPointMarker';
import { PointInfoCard } from './PointInfoCard';

import bodyFigureFront from '@/assets/body-figures/adult_front_clinical.png';

/**
 * Phase #001: Primary acupuncture points with SVG coordinates (200x400 viewBox)
 */
type Point = {
  code: 'ST40' | 'SP9' | 'LV3' | 'LI4';
  label: string;
  hebrewLabel: string;
  function?: string;
  x: number;
  y: number;
  protocols: string[];
};

type PointCode = Point['code'];

const PRIMARY_POINTS: Point[] = [
  {
    code: 'ST40',
    label: 'Fenglong (Abundant Bulge)',
    hebrewLabel: 'פנג לונג',
    function: 'התמרת ליחה, ניקוז לחות.',
    x: 82,
    y: 310,
    protocols: ['slippery'],
  },
  {
    code: 'SP9',
    label: 'Yinlingquan (Yin Mound Spring)',
    hebrewLabel: 'ין לינג צ׳ואן',
    function: 'ניקוז לחות מהמחמם התחתון.',
    x: 115,
    y: 272,
    protocols: ['slippery'],
  },
  {
    code: 'LV3',
    label: 'Taichong (Supreme Rush)',
    hebrewLabel: 'טאי צ׳ונג',
    function: 'הנעת צ׳י הכבד, הרגעת נפש, ויסות מחזור.',
    x: 115,
    y: 385,
    protocols: [],
  },
  {
    code: 'LI4',
    label: 'Hegu (Union Valley)',
    hebrewLabel: 'הא גו',
    function: 'שחרור רוח, כאבי ראש, ויסות מעי גס.',
    x: 28,
    y: 260,
    protocols: [],
  },
];


type PopoverState = {
  code: PointCode;
  anchor: { xPct: number; yPct: number };
} | null;

interface BodyMapCoreProps {
  className?: string;
  onPointSelect?: (code: string, isActive: boolean) => void;
}

/**
 * Phase #001: Core Body Map Component
 * - Uses clinic assets (png) for the body figure
 * - Uses an SVG overlay for point visuals
 * - Uses a portal popover to prevent clipping on mobile
 */
export function BodyMapCore({ className, onPointSelect }: BodyMapCoreProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePoints, setActivePoints] = useState<Set<PointCode>>(new Set());
  const [activeProtocol, setActiveProtocol] = useState<string | null>(null);
  const [popover, setPopover] = useState<PopoverState>(null);

  const togglePoint = useCallback(
    (code: PointCode) => {
      setActivePoints((prev) => {
        const next = new Set(prev);
        const isNowActive = !next.has(code);
        if (isNowActive) next.add(code);
        else next.delete(code);

        // Avoid render-phase updates in parent
        setTimeout(() => onPointSelect?.(code, isNowActive), 0);
        return next;
      });
      setActiveProtocol(null);
    },
    [onPointSelect]
  );

  const handlePointTap = useCallback(
    (code: PointCode, anchor: { xPct: number; yPct: number }) => {
      setPopover((prev) => (prev?.code === code ? null : { code, anchor }));
      togglePoint(code);
    },
    [togglePoint]
  );

  const activateSlipperyProtocol = useCallback(() => {
    const slipperyPoints = PRIMARY_POINTS.filter((p) => p.protocols.includes('slippery'));

    if (activeProtocol === 'slippery') {
      setActiveProtocol(null);
      setActivePoints((prev) => {
        const next = new Set(prev);
        slipperyPoints.forEach((p) => next.delete(p.code));
        return next;
      });
      slipperyPoints.forEach((p) => setTimeout(() => onPointSelect?.(p.code, false), 0));
    } else {
      setActiveProtocol('slippery');
      setActivePoints((prev) => {
        const next = new Set(prev);
        slipperyPoints.forEach((p) => next.add(p.code));
        return next;
      });
      slipperyPoints.forEach((p) => setTimeout(() => onPointSelect?.(p.code, true), 0));
    }
  }, [activeProtocol, onPointSelect]);

  const activeCount = activePoints.size;

  const popoverPoint = useMemo(() => {
    if (!popover) return null;
    return PRIMARY_POINTS.find((p) => p.code === popover.code) ?? null;
  }, [popover]);

  const svgPos = (x: number, y: number) => ({
    xPct: x / 200,
    yPct: y / 400,
    left: `${(x / 200) * 100}%`,
    top: `${(y / 400) * 100}%`,
  });

  return (
    <Card className={className}>
      <CardHeader className="pb-3 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2.5 text-lg font-medium tracking-tight">
            <MapPin className="h-5 w-5 text-primary" />
            <span>מפת גוף אינטראקטיבית</span>
          </CardTitle>
          {activeCount > 0 && (
            <Badge variant="default" className="animate-pulse font-medium">
              {activeCount} נקודות פעילות
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant={activeProtocol === 'slippery' ? 'default' : 'outline'}
            size="sm"
            onClick={activateSlipperyProtocol}
            className="gap-2.5 font-medium tracking-wide px-4 py-2 h-auto rounded-full transition-all duration-300 hover:shadow-md"
          >
            <Droplets className="h-4 w-4" />
            <span>דופק חלקלק</span>
            <span className="text-xs opacity-70">(Slippery)</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div ref={containerRef} className="relative w-full max-w-xs mx-auto aspect-[1/2] min-h-[320px] overflow-hidden rounded-md">
          {/* Body figure asset */}
          <img
            src={bodyFigureFront}
            alt="איור גוף רפואי"
            className="absolute inset-0 w-full h-full object-contain select-none"
            draggable={false}
            loading="eager"
          />

          {/* SVG overlay for point visuals */}
          <svg
            viewBox="0 0 200 400"
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {PRIMARY_POINTS.map((p) => (
              <SessionPointMarker key={p.code} code={p.code} x={p.x} y={p.y} isActive={activePoints.has(p.code)} />
            ))}
          </svg>

          {/* HTML tap targets */}
          {PRIMARY_POINTS.map((p) => {
            const pos = svgPos(p.x, p.y);
            return (
              <button
                key={`hit-${p.code}`}
                type="button"
                className={cn(
                  'absolute w-9 h-9 -translate-x-1/2 -translate-y-1/2 rounded-full z-10',
                  'bg-transparent hover:bg-primary/10 transition-colors'
                )}
                style={{ left: pos.left, top: pos.top }}
                onClick={() => handlePointTap(p.code, { xPct: pos.xPct, yPct: pos.yPct })}
                aria-label={`${p.code} - ${p.hebrewLabel}`}
              />
            );
          })}

          <PointInfoCard
            open={!!popover && !!popoverPoint}
            anchor={popover?.anchor ?? null}
            point={popoverPoint}
            isActive={popoverPoint ? activePoints.has(popoverPoint.code) : false}
            onClose={() => setPopover(null)}
            containerRef={containerRef}
          />
        </div>

        {/* Active Points Legend */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {PRIMARY_POINTS.map((p) => (
            <button
              key={p.code}
              type="button"
              onClick={() => togglePoint(p.code)}
              className={cn(
                'px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-300',
                activePoints.has(p.code)
                  ? 'bg-primary text-primary-foreground shadow-md animate-pulse'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50'
              )}
            >
              <span className="font-bold">{p.code}</span>
              <span className="mx-1.5 opacity-50">•</span>
              <span>{p.hebrewLabel}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

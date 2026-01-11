import { useLayoutEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PointInfo = {
  code: string;
  label: string;
  hebrewLabel: string;
  function?: string;
};

interface PointInfoCardProps {
  open: boolean;
  anchor: { xPct: number; yPct: number } | null; // 0..1 within container
  point: PointInfo | null;
  isActive: boolean;
  onClose: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Phase #001: In-container popover card.
 * Stays INSIDE the body-map box (no clipping on mobile).
 */
export function PointInfoCard({
  open,
  anchor,
  point,
  isActive,
  onClose,
  containerRef,
}: PointInfoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchor || !point) return;
    const container = containerRef.current;
    const card = cardRef.current;
    if (!container || !card) return;

    const cr = container.getBoundingClientRect();
    const pr = card.getBoundingClientRect();

    const margin = 10;
    const ax = cr.width * anchor.xPct;
    const ay = cr.height * anchor.yPct;

    // Prefer right side unless too tight
    const preferRight = ax < cr.width / 2;
    const desiredLeft = preferRight ? ax + 14 : ax - 14 - pr.width;
    const left = clamp(desiredLeft, margin, cr.width - margin - pr.width);

    // Vertically center around anchor, clamp inside
    const desiredTop = ay - pr.height / 2;
    const top = clamp(desiredTop, margin, cr.height - margin - pr.height);

    setPos({ left, top });
  }, [open, anchor?.xPct, anchor?.yPct, point?.code, containerRef]);

  if (!open || !anchor || !point) return null;

  return (
    <div
      className="absolute inset-0 z-30"
      onPointerDown={onClose}
      aria-hidden={!open}
    >
      <div
        ref={cardRef}
        dir="rtl"
        onPointerDown={(e) => e.stopPropagation()}
        className={cn(
          'absolute w-[min(78vw,260px)] rounded-lg border border-border/50 bg-card/95 backdrop-blur-sm shadow-xl p-3',
          'animate-in fade-in zoom-in-95 duration-200'
        )}
        style={pos ? { left: pos.left, top: pos.top } : undefined}
      >
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">{point.code}</span>
              {isActive && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="סגירה"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div>
            <div className="text-base font-semibold text-foreground">{point.hebrewLabel}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{point.label}</div>
          </div>

          {point.function && (
            <div className="pt-2 border-t border-border/50">
              <div className="text-xs font-medium text-muted-foreground mb-1">פעולה קלינית:</div>
              <div className="text-sm text-foreground leading-relaxed">{point.function}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

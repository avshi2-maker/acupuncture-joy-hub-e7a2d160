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
  anchor: { xPct: number; yPct: number } | null;
  point: PointInfo | null;
  isActive: boolean;
  onClose: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Phase #001: In-container popover card with edge detection.
 * - Stays INSIDE the body-map box (no clipping).
 * - Flips horizontally and vertically based on available space.
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
  const [style, setStyle] = useState<React.CSSProperties>({});

  useLayoutEffect(() => {
    if (!open || !anchor || !point) {
      setStyle({});
      return;
    }

    const container = containerRef.current;
    const card = cardRef.current;
    if (!container || !card) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const cardRect = card.getBoundingClientRect();
    const pw = cardRect.width || 240;
    const ph = cardRect.height || 140;

    const ax = cw * anchor.xPct;
    const ay = ch * anchor.yPct;

    const margin = 8;
    const gap = 12;

    // Horizontal positioning with flip
    const spaceRight = cw - ax - gap;
    const spaceLeft = ax - gap;
    const preferRight = spaceRight >= pw + margin || spaceRight > spaceLeft;
    
    let left: number;
    if (preferRight) {
      left = clamp(ax + gap, margin, cw - margin - pw);
    } else {
      left = clamp(ax - gap - pw, margin, cw - margin - pw);
    }

    // Vertical positioning with flip
    const spaceBelow = ch - ay - gap;
    const spaceAbove = ay - gap;
    const preferBelow = spaceBelow >= ph + margin || spaceBelow > spaceAbove;

    let top: number;
    if (preferBelow) {
      top = clamp(ay + gap, margin, ch - margin - ph);
    } else {
      top = clamp(ay - gap - ph, margin, ch - margin - ph);
    }

    // Final clamp to ensure fully inside
    left = clamp(left, margin, cw - margin - pw);
    top = clamp(top, margin, ch - margin - ph);

    setStyle({ left, top });
  }, [open, anchor?.xPct, anchor?.yPct, point?.code, containerRef]);

  if (!open || !anchor || !point) return null;

  return (
    <div
      ref={cardRef}
      dir="rtl"
      className={cn(
        'absolute z-30 w-[min(75%,260px)] rounded-lg border border-border bg-card shadow-xl p-3',
        'animate-in fade-in zoom-in-95 duration-200'
      )}
      style={style}
      aria-hidden={!open}
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
  );
}

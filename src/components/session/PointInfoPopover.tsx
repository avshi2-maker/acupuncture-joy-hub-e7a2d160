import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

type PointInfo = {
  code: string;
  label: string;
  hebrewLabel: string;
  function?: string;
};

interface PointInfoPopoverProps {
  open: boolean;
  anchorRect: DOMRect | null;
  point: PointInfo | null;
  isActive: boolean;
  onClose: () => void;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Phase #001: Viewport-safe popover (portal) for point details.
 * Fixes clipping issues on mobile by rendering into document.body.
 */
export function PointInfoPopover({
  open,
  anchorRect,
  point,
  isActive,
  onClose,
}: PointInfoPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  const isReady = open && !!anchorRect && !!point;

  const anchorCenter = useMemo(() => {
    if (!anchorRect) return null;
    return {
      x: anchorRect.left + anchorRect.width / 2,
      y: anchorRect.top + anchorRect.height / 2,
    };
  }, [anchorRect]);

  useLayoutEffect(() => {
    if (!isReady || !anchorRect || !anchorCenter) return;

    const el = popoverRef.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 12;

    // Default size if not measured yet
    const rect = el?.getBoundingClientRect();
    const pw = rect?.width ?? 220;
    const ph = rect?.height ?? 160;

    // Choose side with more space
    const preferRight = anchorCenter.x < vw / 2;
    const rightX = anchorRect.right + 12;
    const leftX = anchorRect.left - 12 - pw;

    const left = clamp(preferRight ? rightX : leftX, margin, vw - margin - pw);
    const top = clamp(anchorCenter.y - ph / 2, margin, vh - margin - ph);

    setPos({ left, top });
  }, [isReady, anchorRect, anchorCenter, point?.code]);

  useEffect(() => {
    if (!isReady) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const onResize = () => {
      // Recompute position on resize/orientation change
      setPos(null);
      requestAnimationFrame(() => {
        if (!popoverRef.current) return;
        // Trigger layout effect by updating state
        setPos({ left: 0, top: 0 });
        setPos(null);
      });
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [isReady, onClose]);

  if (!isReady) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100]" onPointerDown={onClose}>
      <div
        ref={popoverRef}
        dir="rtl"
        onPointerDown={(e) => e.stopPropagation()}
        className="fixed w-[min(92vw,280px)] rounded-lg border border-border/50 bg-card/95 backdrop-blur-sm shadow-xl p-3 animate-in fade-in zoom-in-95 duration-200"
        style={pos ? { left: pos.left, top: pos.top } : undefined}
      >
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">{point!.code}</span>
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
            <div className="text-base font-semibold text-foreground">{point!.hebrewLabel}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{point!.label}</div>
          </div>

          {point!.function && (
            <div className="pt-2 border-t border-border/50">
              <div className="text-xs font-medium text-muted-foreground mb-1">פעולה קלינית:</div>
              <div className="text-sm text-foreground leading-relaxed">{point!.function}</div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

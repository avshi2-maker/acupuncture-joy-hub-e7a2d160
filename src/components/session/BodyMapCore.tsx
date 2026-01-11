import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, User, Ear, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PointInfoPopover } from './PointInfoPopover';
import {
  CLINICAL_POINTS,
  ClinicalPoint,
  ViewType,
  getDefaultAssetForView,
} from '@/data/clinicalMapData';

// ES6 IMPORTS - This is the ONLY way Vite serves src/assets correctly
import chestPng from '@/assets/body-figures/chest.png';
import tonguePng from '@/assets/body-figures/tongue.png';
import earPng from '@/assets/body-figures/ear.png';
import abdomenFemalePng from '@/assets/body-figures/abdomen_female.png';
import handDorsumPng from '@/assets/body-figures/hand_dorsum.png';
import lowerLegPng from '@/assets/body-figures/lower_leg.png';
import footTopPng from '@/assets/body-figures/foot_top.png';

// Map asset filenames to imported modules
const ASSET_MAP: Record<string, string> = {
  'chest.png': chestPng,
  'tongue.png': tonguePng,
  'ear.png': earPng,
  'abdomen_female.png': abdomenFemalePng,
  'hand_dorsum.png': handDorsumPng,
  'lower_leg.png': lowerLegPng,
  'foot_top.png': footTopPng,
};

type PopoverState = {
  point: ClinicalPoint;
  anchorRect: DOMRect;
} | null;

interface BodyMapCoreProps {
  className?: string;
  onPointSelect?: (code: string, isActive: boolean) => void;
}

/**
 * Clinical Body Map Component
 * - Uses chest.png as default view
 * - Supports Body/Tongue/Ear view toggle
 * - Displays Hebrew clinical functions
 */
export function BodyMapCore({ className, onPointSelect }: BodyMapCoreProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePoints, setActivePoints] = useState<Set<string>>(new Set());
  const [currentView, setCurrentView] = useState<ViewType>('body');
  const [currentAsset, setCurrentAsset] = useState<string>('chest.png');
  const [imageError, setImageError] = useState<string | null>(null);
  const [popover, setPopover] = useState<PopoverState>(null);

  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);
  const [imgNatural, setImgNatural] = useState<{ w: number; h: number } | null>(null);

  // Get current image source (no fallback: missing image must show error)
  const currentImageSrc = ASSET_MAP[currentAsset];

  // Get points for current asset
  const currentPoints = useMemo(() => {
    return CLINICAL_POINTS.filter(p => p.assetFileName === currentAsset);
  }, [currentAsset]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;
      setContainerSize({ w: rect.width, h: rect.height });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Compute the rendered "object-contain" box
  const containBox = useMemo(() => {
    if (!containerSize || !imgNatural) return null;

    const scale = Math.min(containerSize.w / imgNatural.w, containerSize.h / imgNatural.h);
    const w = imgNatural.w * scale;
    const h = imgNatural.h * scale;
    const x = (containerSize.w - w) / 2;
    const y = (containerSize.h - h) / 2;

    return { x, y, w, h, scale };
  }, [containerSize, imgNatural]);

  const togglePoint = useCallback(
    (code: string) => {
      setActivePoints((prev) => {
        const next = new Set(prev);
        const isNowActive = !next.has(code);
        if (isNowActive) next.add(code);
        else next.delete(code);

        setTimeout(() => onPointSelect?.(code, isNowActive), 0);
        return next;
      });
    },
    [onPointSelect]
  );

  const handlePointTap = useCallback(
    (point: ClinicalPoint, anchorRect: DOMRect) => {
      setPopover((prev) => (prev?.point.pointCode === point.pointCode ? null : { point, anchorRect }));
      togglePoint(point.pointCode);
    },
    [togglePoint]
  );

  const handleViewChange = useCallback((view: ViewType) => {
    setCurrentView(view);
    setCurrentAsset(getDefaultAssetForView(view));
    setImageError(null);
    setPopover(null);
    setImgNatural(null); // Reset for new image
  }, []);

  const activeCount = activePoints.size;

  return (
    <Card className={cn('relative z-10', className)}>
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

        {/* View Toggle: Body / Tongue / Ear */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={currentView === 'body' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewChange('body')}
            className="gap-2 rounded-full"
          >
            <User className="h-4 w-4" />
            <span>גוף</span>
          </Button>
          <Button
            variant={currentView === 'tongue' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewChange('tongue')}
            className="gap-2 rounded-full"
          >
            <Languages className="h-4 w-4" />
            <span>לשון</span>
          </Button>
          <Button
            variant={currentView === 'ear' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewChange('ear')}
            className="gap-2 rounded-full"
          >
            <Ear className="h-4 w-4" />
            <span>אוזן</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div
          ref={containerRef}
          className="relative w-full max-w-xs mx-auto aspect-[1/2] min-h-[320px] overflow-hidden rounded-md"
        >
          {/* Rendered image box */}
          <div
            className="absolute"
            style={
              containBox
                ? { left: containBox.x, top: containBox.y, width: containBox.w, height: containBox.h }
                : { inset: 0 }
            }
          >
            {/* Body figure asset (absolute background layer) */}
            {!currentImageSrc || imageError ? (
              <div className="absolute inset-0 z-0 flex items-center justify-center rounded-md border border-destructive/30 bg-background">
                <div className="max-w-[240px] text-center">
                  <p className="text-sm font-semibold text-destructive">Missing body figure asset</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Expected file: <span className="font-mono">{currentAsset}</span>
                  </p>
                </div>
              </div>
            ) : (
              <>
                <img
                  src={currentImageSrc}
                  alt="איור גוף רפואי"
                  className="absolute inset-0 z-0 w-full h-full object-contain select-none"
                  draggable={false}
                  loading="eager"
                  onLoad={(e) =>
                    setImgNatural({
                      w: e.currentTarget.naturalWidth || 0,
                      h: e.currentTarget.naturalHeight || 0,
                    })
                  }
                  onError={() => setImageError(`404 Image Missing: ${currentAsset}`)}
                />

                {/* Acupuncture point overlays (HTML only, no SVG/canvas) */}
                {currentPoints.map((p) => {
                  const isActive = activePoints.has(p.pointCode);

                  return (
                    <button
                      key={p.pointCode}
                      type="button"
                      className={cn(
                        'absolute z-10 -translate-x-1/2 -translate-y-1/2',
                        'h-9 w-9 rounded-full flex items-center justify-center',
                        'text-[10px] font-bold select-none',
                        'border border-border bg-background/70 backdrop-blur-sm',
                        'transition-all duration-200',
                        'hover:bg-accent/40',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        isActive &&
                          'bg-primary text-primary-foreground border-primary shadow-[0_0_0_8px_hsl(var(--primary)/0.15)]'
                      )}
                      style={{ left: `${p.xPercentage}%`, top: `${p.yPercentage}%` }}
                      onClick={(e) => handlePointTap(p, e.currentTarget.getBoundingClientRect())}
                      aria-label={`${p.pointCode} - ${p.hebrewName}`}
                    >
                      {p.pointCode}
                    </button>
                  );
                })}
              </>
            )}
          </div>

          <PointInfoPopover
            open={!!popover}
            anchorRect={popover?.anchorRect ?? null}
            point={popover?.point ? {
              code: popover.point.pointCode,
              label: popover.point.hebrewName,
              hebrewLabel: popover.point.hebrewName,
              function: popover.point.clinicalFunction,
            } : null}
            isActive={popover?.point ? activePoints.has(popover.point.pointCode) : false}
            onClose={() => setPopover(null)}
          />
        </div>

        {/* Active Points Legend with Hebrew Clinical Functions */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {currentPoints.map((p) => (
            <button
              key={p.pointCode}
              type="button"
              onClick={() => togglePoint(p.pointCode)}
              className={cn(
                'px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-300',
                activePoints.has(p.pointCode)
                  ? 'bg-primary text-primary-foreground shadow-md animate-pulse'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50'
              )}
            >
              <span className="font-bold">{p.pointCode}</span>
              <span className="mx-1.5 opacity-50">•</span>
              <span>{p.hebrewName}</span>
            </button>
          ))}
        </div>

        {/* Clinical Function Display */}
        {currentPoints.length > 0 && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/50">
            <p className="text-xs text-muted-foreground mb-2 text-center">פונקציה קלינית:</p>
            <div className="space-y-1">
              {currentPoints.map(p => (
                <p key={p.pointCode} className="text-sm text-center">
                  <span className="font-semibold text-primary">{p.pointCode}:</span>{' '}
                  <span className="text-foreground">{p.clinicalFunction}</span>
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

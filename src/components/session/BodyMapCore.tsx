import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Droplets, User, Ear, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SessionPointMarker } from './SessionPointMarker';
import { PointInfoPopover } from './PointInfoPopover';
import { 
  CLINICAL_POINTS, 
  ClinicalPoint, 
  ViewType, 
  getPointsForView, 
  getDefaultAssetForView 
} from '@/data/clinicalMapData';

// Import body figure assets
import chestImg from '@/assets/body-figures/chest.png';
import tongueImg from '@/assets/body-figures/tongue.png';
import earImg from '@/assets/body-figures/ear.png';
import abdomenFemaleImg from '@/assets/body-figures/abdomen_female.png';
import handDorsumImg from '@/assets/body-figures/hand_dorsum.png';
import lowerLegImg from '@/assets/body-figures/lower_leg.png';
import footTopImg from '@/assets/body-figures/foot_top.png';

// Asset mapping
const ASSET_MAP: Record<string, string> = {
  'chest.png': chestImg,
  'tongue.png': tongueImg,
  'ear.png': earImg,
  'abdomen_female.png': abdomenFemaleImg,
  'hand_dorsum.png': handDorsumImg,
  'lower_leg.png': lowerLegImg,
  'foot_top.png': footTopImg,
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
  const [popover, setPopover] = useState<PopoverState>(null);

  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);
  const [imgNatural, setImgNatural] = useState<{ w: number; h: number } | null>(null);

  // Get current image source
  const currentImageSrc = ASSET_MAP[currentAsset] || chestImg;

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
            {/* Body figure asset */}
            <img
              src={currentImageSrc}
              alt="איור גוף רפואי"
              className="absolute inset-0 w-full h-full object-contain select-none"
              draggable={false}
              loading="eager"
              onLoad={(e) =>
                setImgNatural({
                  w: e.currentTarget.naturalWidth || 0,
                  h: e.currentTarget.naturalHeight || 0,
                })
              }
            />

            {/* SVG overlay for point visuals */}
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              {currentPoints.map((p) => (
                <SessionPointMarker 
                  key={p.pointCode} 
                  code={p.pointCode} 
                  x={p.xPercentage} 
                  y={p.yPercentage} 
                  isActive={activePoints.has(p.pointCode)} 
                />
              ))}
            </svg>

            {/* HTML tap targets */}
            {currentPoints.map((p) => (
              <button
                key={`hit-${p.pointCode}`}
                type="button"
                className={cn(
                  'absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full z-10',
                  'bg-transparent hover:bg-primary/10 transition-colors',
                  activePoints.has(p.pointCode) && 'ring-2 ring-primary ring-offset-2'
                )}
                style={{ 
                  left: `${p.xPercentage}%`, 
                  top: `${p.yPercentage}%` 
                }}
                onClick={(e) => handlePointTap(p, e.currentTarget.getBoundingClientRect())}
                aria-label={`${p.pointCode} - ${p.hebrewName}`}
              />
            ))}
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

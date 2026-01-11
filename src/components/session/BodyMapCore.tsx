import { useState, useCallback, useRef } from 'react';
import { HumanSilhouetteSvg } from './HumanSilhouetteSvg';
import { SessionPointMarker } from './SessionPointMarker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Droplets, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Phase #001: Primary acupuncture points with SVG coordinates
 * Mapped to new Zen-clinical human silhouette (200x400 viewBox)
 */
const PRIMARY_POINTS = [
  {
    code: 'ST40',
    label: 'Fenglong (Abundant Bulge)',
    hebrewLabel: 'פנג לונג',
    function: 'מפזר ליחה, מבהיר את הראש',
    x: 72,
    y: 325,
    meridian: 'Stomach',
    protocols: ['slippery'],
  },
  {
    code: 'SP9',
    label: 'Yinlingquan (Yin Mound Spring)',
    hebrewLabel: 'ין לינג צ׳ואן',
    function: 'מייבש רטיבות, מחזק את הטחול',
    x: 85,
    y: 268,
    meridian: 'Spleen',
    protocols: ['slippery'],
  },
  {
    code: 'LV3',
    label: 'Taichong (Supreme Rush)',
    hebrewLabel: 'טאי צ׳ונג',
    function: 'מרגיע את הכבד, מסדיר את זרימת הצ׳י',
    x: 130,
    y: 385,
    meridian: 'Liver',
    protocols: [],
  },
  {
    code: 'LI4',
    label: 'Hegu (Union Valley)',
    hebrewLabel: 'הא גו',
    function: 'משחרר את החיצוני, מרגיע כאב',
    x: 185,
    y: 218,
    meridian: 'Large Intestine',
    protocols: [],
  },
];

interface BodyMapCoreProps {
  className?: string;
  onPointSelect?: (code: string, isActive: boolean) => void;
}

/**
 * Phase #001: Core Body Map Component
 * Interactive SVG with 4 primary points and glow animations
 */
export function BodyMapCore({ className, onPointSelect }: BodyMapCoreProps) {
  const [activePoints, setActivePoints] = useState<Set<string>>(new Set());
  const [activeProtocol, setActiveProtocol] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const togglePoint = useCallback((code: string) => {
    setActivePoints(prev => {
      const next = new Set(prev);
      const isNowActive = !next.has(code);
      if (isNowActive) {
        next.add(code);
      } else {
        next.delete(code);
      }
      // Use setTimeout to avoid setState during render
      setTimeout(() => onPointSelect?.(code, isNowActive), 0);
      return next;
    });
    setActiveProtocol(null);
  }, [onPointSelect]);

  const handlePointClick = useCallback((code: string) => {
    setSelectedPoint(prev => prev === code ? null : code);
    togglePoint(code);
  }, [togglePoint]);

  const activateSlipperyProtocol = useCallback(() => {
    const slipperyPoints = PRIMARY_POINTS.filter(p => p.protocols.includes('slippery'));
    
    if (activeProtocol === 'slippery') {
      setActiveProtocol(null);
      setActivePoints(prev => {
        const next = new Set(prev);
        slipperyPoints.forEach(p => next.delete(p.code));
        return next;
      });
      slipperyPoints.forEach(p => {
        setTimeout(() => onPointSelect?.(p.code, false), 0);
      });
    } else {
      setActiveProtocol('slippery');
      setActivePoints(prev => {
        const next = new Set(prev);
        slipperyPoints.forEach(p => next.add(p.code));
        return next;
      });
      slipperyPoints.forEach(p => {
        setTimeout(() => onPointSelect?.(p.code, true), 0);
      });
    }
  }, [activeProtocol, onPointSelect]);

  const activeCount = activePoints.size;
  const selectedPointData = PRIMARY_POINTS.find(p => p.code === selectedPoint);

  // Convert SVG coordinates to percentage for HTML overlay
  const getPointPosition = (x: number, y: number) => ({
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
        
        {/* Protocol Buttons - Refined Zen styling */}
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
        {/* Responsive container that maintains aspect ratio */}
        <div 
          ref={containerRef}
          className="relative w-full max-w-xs mx-auto aspect-[1/2] min-h-[320px]"
        >
          {/* SVG Silhouette with point markers */}
          <HumanSilhouetteSvg className="w-full h-full">
            {PRIMARY_POINTS.map(point => (
              <SessionPointMarker
                key={point.code}
                code={point.code}
                x={point.x}
                y={point.y}
                isActive={activePoints.has(point.code)}
              />
            ))}
          </HumanSilhouetteSvg>

          {/* HTML Clickable overlays for each point */}
          {PRIMARY_POINTS.map(point => {
            const pos = getPointPosition(point.x, point.y);
            return (
              <button
                key={`click-${point.code}`}
                onClick={() => handlePointClick(point.code)}
                className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer z-10 hover:bg-primary/10 transition-colors"
                style={{ left: pos.left, top: pos.top }}
                aria-label={`${point.code} - ${point.hebrewLabel}`}
              />
            );
          })}

          {/* Point Info Popover */}
          {selectedPointData && (
            <div
              className="absolute z-20 w-52 bg-card/95 backdrop-blur-sm border border-border/50 shadow-xl rounded-lg p-3 animate-in fade-in zoom-in-95 duration-200"
              style={{
                left: selectedPointData.x < 100 ? `${(selectedPointData.x / 200) * 100 + 12}%` : 'auto',
                right: selectedPointData.x >= 100 ? `${100 - (selectedPointData.x / 200) * 100 + 12}%` : 'auto',
                top: `${(selectedPointData.y / 400) * 100}%`,
                transform: 'translateY(-50%)',
              }}
              dir="rtl"
            >
              <div className="space-y-2.5">
                {/* Header with code and close button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">{selectedPointData.code}</span>
                    {activePoints.has(selectedPointData.code) && (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedPoint(null)}
                    className="p-1 hover:bg-muted rounded-full transition-colors"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
                
                {/* Hebrew Name */}
                <div>
                  <div className="text-base font-semibold text-foreground">{selectedPointData.hebrewLabel}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{selectedPointData.label}</div>
                </div>
                
                {/* Clinical Function */}
                {selectedPointData.function && (
                  <div className="pt-2 border-t border-border/50">
                    <div className="text-xs font-medium text-muted-foreground mb-1">פעולה קלינית:</div>
                    <div className="text-sm text-foreground leading-relaxed">{selectedPointData.function}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Active Points Legend - Refined */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {PRIMARY_POINTS.map(point => (
            <button
              key={point.code}
              onClick={() => handlePointClick(point.code)}
              className={cn(
                'px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-300',
                activePoints.has(point.code)
                  ? 'bg-primary text-primary-foreground shadow-md animate-pulse'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50'
              )}
            >
              <span className="font-bold">{point.code}</span>
              <span className="mx-1.5 opacity-50">•</span>
              <span>{point.hebrewLabel}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

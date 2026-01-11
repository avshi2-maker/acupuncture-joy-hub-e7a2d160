import { useState, useCallback } from 'react';
import { HumanSilhouetteSvg } from './HumanSilhouetteSvg';
import { SessionPointMarker } from './SessionPointMarker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Droplets } from 'lucide-react';
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
    x: 72,   // Left lower leg - lateral
    y: 325,  // Mid-calf level
    meridian: 'Stomach',
    protocols: ['slippery'],
  },
  {
    code: 'SP9',
    label: 'Yinlingquan (Yin Mound Spring)',
    hebrewLabel: 'ין לינג צ׳ואן',
    function: 'מייבש רטיבות, מחזק את הטחול',
    x: 85,   // Left leg - medial knee
    y: 268,  // Below knee level
    meridian: 'Spleen',
    protocols: ['slippery'],
  },
  {
    code: 'LV3',
    label: 'Taichong (Supreme Rush)',
    hebrewLabel: 'טאי צ׳ונג',
    function: 'מרגיע את הכבד, מסדיר את זרימת הצ׳י',
    x: 130,  // Right foot dorsum
    y: 385,  // Foot level
    meridian: 'Liver',
    protocols: [],
  },
  {
    code: 'LI4',
    label: 'Hegu (Union Valley)',
    hebrewLabel: 'הא גו',
    function: 'משחרר את החיצוני, מרגיע כאב',
    x: 185,  // Right hand
    y: 218,  // Hand level
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

  const togglePoint = useCallback((code: string) => {
    setActivePoints(prev => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
        onPointSelect?.(code, false);
      } else {
        next.add(code);
        onPointSelect?.(code, true);
      }
      return next;
    });
    // Clear protocol when manually toggling points
    setActiveProtocol(null);
  }, [onPointSelect]);

  const activateSlipperyProtocol = useCallback(() => {
    if (activeProtocol === 'slippery') {
      // Deactivate
      setActiveProtocol(null);
      const slipperyPoints = PRIMARY_POINTS.filter(p => p.protocols.includes('slippery'));
      setActivePoints(prev => {
        const next = new Set(prev);
        slipperyPoints.forEach(p => {
          next.delete(p.code);
          onPointSelect?.(p.code, false);
        });
        return next;
      });
    } else {
      // Activate ST40 and SP9
      setActiveProtocol('slippery');
      const slipperyPoints = PRIMARY_POINTS.filter(p => p.protocols.includes('slippery'));
      setActivePoints(prev => {
        const next = new Set(prev);
        slipperyPoints.forEach(p => {
          if (!next.has(p.code)) {
            next.add(p.code);
            onPointSelect?.(p.code, true);
          }
        });
        return next;
      });
    }
  }, [activeProtocol, onPointSelect]);

  const activeCount = activePoints.size;

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
        <div className="relative w-full max-w-xs mx-auto aspect-[1/2] min-h-[320px]">
          <HumanSilhouetteSvg className="w-full h-full">
            {PRIMARY_POINTS.map(point => (
              <SessionPointMarker
                key={point.code}
                code={point.code}
                label={point.label}
                hebrewLabel={point.hebrewLabel}
                function={point.function}
                x={point.x}
                y={point.y}
                isActive={activePoints.has(point.code)}
                onClick={() => togglePoint(point.code)}
              />
            ))}
          </HumanSilhouetteSvg>
        </div>

        {/* Active Points Legend - Refined */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {PRIMARY_POINTS.map(point => (
            <button
              key={point.code}
              onClick={() => togglePoint(point.code)}
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

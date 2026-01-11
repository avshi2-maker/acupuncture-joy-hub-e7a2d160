import { useState, useCallback } from 'react';
import { HumanSilhouetteSvg } from './HumanSilhouetteSvg';
import { SessionPointMarker } from './SessionPointMarker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

/**
 * Phase #001: Primary acupuncture points with SVG coordinates
 * Mapped to front-facing human silhouette (200x400 viewBox)
 */
const PRIMARY_POINTS = [
  {
    code: 'ST40',
    label: 'Fenglong (Abundant Bulge)',
    hebrewLabel: 'פנג לונג',
    x: 65,   // Left lower leg - lateral
    y: 310,  // Mid-calf level
    meridian: 'Stomach',
  },
  {
    code: 'SP9',
    label: 'Yinlingquan (Yin Mound Spring)',
    hebrewLabel: 'ין לינג צ׳ואן',
    x: 82,   // Left leg - medial knee
    y: 265,  // Below knee level
    meridian: 'Spleen',
  },
  {
    code: 'LV3',
    label: 'Taichong (Supreme Rush)',
    hebrewLabel: 'טאי צ׳ונג',
    x: 140,  // Right foot dorsum
    y: 375,  // Foot level
    meridian: 'Liver',
  },
  {
    code: 'LI4',
    label: 'Hegu (Union Valley)',
    hebrewLabel: 'הא גו',
    x: 180,  // Right hand
    y: 215,  // Hand level
    meridian: 'Large Intestine',
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
  }, [onPointSelect]);

  const activeCount = activePoints.size;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            <span>מפת גוף אינטראקטיבית</span>
          </CardTitle>
          {activeCount > 0 && (
            <Badge variant="default" className="animate-pulse">
              {activeCount} נקודות פעילות
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative w-full max-w-sm mx-auto aspect-[1/2]">
          <HumanSilhouetteSvg className="w-full h-full">
            {PRIMARY_POINTS.map(point => (
              <SessionPointMarker
                key={point.code}
                code={point.code}
                label={point.label}
                x={point.x}
                y={point.y}
                isActive={activePoints.has(point.code)}
                onClick={() => togglePoint(point.code)}
              />
            ))}
          </HumanSilhouetteSvg>
        </div>

        {/* Active Points Legend */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {PRIMARY_POINTS.map(point => (
            <button
              key={point.code}
              onClick={() => togglePoint(point.code)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${activePoints.has(point.code)
                  ? 'bg-primary text-primary-foreground shadow-md animate-pulse'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }
              `}
            >
              <span className="font-bold">{point.code}</span>
              <span className="mx-1.5">•</span>
              <span>{point.hebrewLabel}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

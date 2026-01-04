import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, ChevronRight, Image as ImageIcon, Sparkles, ExternalLink } from 'lucide-react';
import { usePointFigureMapping } from '@/hooks/usePointFigureMapping';
import { RAGBodyFigureDisplay } from '@/components/acupuncture/RAGBodyFigureDisplay';
import { FigureMapping } from '@/data/point-figure-mapping';

interface ExtractedPointsDisplayProps {
  extractedPoints?: {
    pointCodes: string[];
    extraPoints: string[];
    allPoints: string[];
    figureReferences: string[];
    totalPointsFound: number;
  };
  onPointClick?: (code: string) => void;
  className?: string;
}

export function ExtractedPointsDisplay({ 
  extractedPoints, 
  onPointClick,
  className = ''
}: ExtractedPointsDisplayProps) {
  const [showBodyFigures, setShowBodyFigures] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  
  const { 
    findBestFigureForPoint, 
    getFiguresForPoints 
  } = usePointFigureMapping();

  if (!extractedPoints || extractedPoints.totalPointsFound === 0) {
    return null;
  }

  const { pointCodes, extraPoints, allPoints } = extractedPoints;
  
  // Get matching figures for all points
  const matchingFigures = getFiguresForPoints(allPoints);
  
  const handlePointClick = (code: string) => {
    setSelectedPoint(code);
    onPointClick?.(code);
  };

  const PointBadge = ({ code, isExtra = false }: { code: string; isExtra?: boolean }) => {
    const figure = findBestFigureForPoint(code);
    const hasFigure = !!figure;
    
    return (
      <Badge
        variant="outline"
        className={`cursor-pointer text-xs transition-all hover:scale-105 ${
          hasFigure 
            ? 'border-jade/50 bg-jade/10 hover:bg-jade/20 text-jade-foreground' 
            : 'border-muted-foreground/30 hover:bg-muted'
        } ${isExtra ? 'border-dashed' : ''} ${
          selectedPoint === code ? 'ring-2 ring-jade ring-offset-1' : ''
        }`}
        onClick={() => handlePointClick(code)}
      >
        {hasFigure && <ImageIcon className="w-3 h-3 mr-1 text-jade" />}
        {code}
        {isExtra && <span className="ml-1 opacity-60 text-[10px]">(Extra)</span>}
      </Badge>
    );
  };

  return (
    <div className={`mt-2 ${className}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 text-jade" />
          <span className="font-medium">Points Found:</span>
        </div>
        
        {/* Regular meridian points */}
        {pointCodes.slice(0, 6).map(code => (
          <PointBadge key={code} code={code} />
        ))}
        
        {/* Extra points */}
        {extraPoints.slice(0, 3).map(code => (
          <PointBadge key={code} code={code} isExtra />
        ))}
        
        {/* Show more indicator */}
        {allPoints.length > 9 && (
          <Badge variant="secondary" className="text-xs">
            +{allPoints.length - 9} more
          </Badge>
        )}
        
        {/* View Body Figures button */}
        {matchingFigures.length > 0 && (
          <Dialog open={showBodyFigures} onOpenChange={setShowBodyFigures}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs gap-1 border-jade/40 text-jade hover:bg-jade/10"
              >
                <ImageIcon className="w-3 h-3" />
                View on Body ({matchingFigures.length})
                <ChevronRight className="w-3 h-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-jade" />
                  Acupuncture Points from Response
                  <Badge className="bg-jade">{allPoints.length} points</Badge>
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh]">
                <RAGBodyFigureDisplay
                  pointCodes={allPoints}
                  allowSelection={true}
                  onPointSelect={handlePointClick}
                />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Quick figure preview when point is selected */}
      {selectedPoint && matchingFigures.length > 0 && (
        <Card className="mt-2 p-3 bg-jade/5 border-jade/20 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-jade" />
              {selectedPoint} - Body Location
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 text-xs"
              onClick={() => setSelectedPoint(null)}
            >
              ×
            </Button>
          </div>
          <RAGBodyFigureDisplay
            pointCodes={[selectedPoint]}
            compact
            allowSelection={false}
          />
        </Card>
      )}
    </div>
  );
}

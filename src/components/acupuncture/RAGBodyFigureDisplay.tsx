import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BodyFigureWithPoints } from './BodyFigureWithPoints';
import { usePointFigureMapping } from '@/hooks/usePointFigureMapping';
import { MapPin, Sparkles, ChevronRight, ImageIcon, Zap } from 'lucide-react';
import { FigureMapping } from '@/data/point-figure-mapping';
import { motion, AnimatePresence } from 'framer-motion';

interface RAGBodyFigureDisplayProps {
  /** AI response text containing point references */
  aiResponseText?: string;
  /** Explicitly specified point codes (alternative to parsing from text) */
  pointCodes?: string[];
  /** Called when user selects a point for more info */
  onPointSelect?: (code: string) => void;
  /** Called when user wants to generate a protocol for selected points */
  onGenerateProtocol?: (points: string[]) => void;
  /** Show point selection mode */
  allowSelection?: boolean;
  /** Compact display mode */
  compact?: boolean;
  /** Active point for celebration animation */
  celebratingPoint?: string | null;
  className?: string;
}

/**
 * RAG-aware body figure display component
 * Automatically shows the correct body figures based on AI response or point codes
 * With 3D-like celebration animations when points are highlighted
 */
export function RAGBodyFigureDisplay({
  aiResponseText = '',
  pointCodes = [],
  onPointSelect,
  onGenerateProtocol,
  allowSelection = true,
  compact = false,
  celebratingPoint = null,
  className = ''
}: RAGBodyFigureDisplayProps) {
  const { 
    extractPointsFromText, 
    getFiguresForPoints, 
    getHighlightedPointsForFigure 
  } = usePointFigureMapping();

  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
  const [activeFigureIndex, setActiveFigureIndex] = useState(0);
  const [celebrationQueue, setCelebrationQueue] = useState<string[]>([]);

  // Extract points from AI text or use provided point codes
  const extractedPoints = useMemo(() => {
    if (pointCodes.length > 0) return pointCodes;
    if (aiResponseText) return extractPointsFromText(aiResponseText);
    return [];
  }, [aiResponseText, pointCodes, extractPointsFromText]);

  // Find matching figures for the points
  const matchingFigures = useMemo(() => {
    return getFiguresForPoints(extractedPoints);
  }, [extractedPoints, getFiguresForPoints]);

  // Reset active figure when figures change
  useEffect(() => {
    setActiveFigureIndex(0);
  }, [matchingFigures.length]);

  // Handle celebration animation when a point is clicked
  useEffect(() => {
    if (celebratingPoint) {
      setCelebrationQueue(prev => [...prev, celebratingPoint]);
      
      // Auto-switch to the figure containing this point
      const figureWithPoint = matchingFigures.findIndex(fig => {
        const pointsOnFig = getHighlightedPointsForFigure(fig.filename, extractedPoints);
        return pointsOnFig.some(p => p.toUpperCase() === celebratingPoint.toUpperCase());
      });
      
      if (figureWithPoint !== -1 && figureWithPoint !== activeFigureIndex) {
        setActiveFigureIndex(figureWithPoint);
      }
      
      // Clear celebration after animation
      const timer = setTimeout(() => {
        setCelebrationQueue(prev => prev.filter(p => p !== celebratingPoint));
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [celebratingPoint, matchingFigures, extractedPoints, getHighlightedPointsForFigure, activeFigureIndex]);

  const handlePointSelect = useCallback((code: string) => {
    if (allowSelection) {
      setSelectedPoints(prev => {
        if (prev.includes(code)) {
          return prev.filter(p => p !== code);
        }
        return [...prev, code];
      });
    }
    onPointSelect?.(code);
  }, [allowSelection, onPointSelect]);

  const handleGenerateProtocol = useCallback(() => {
    if (selectedPoints.length > 0 && onGenerateProtocol) {
      onGenerateProtocol(selectedPoints);
    }
  }, [selectedPoints, onGenerateProtocol]);

  if (extractedPoints.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            No acupuncture points detected. Ask about specific points or conditions to see relevant body figures.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (matchingFigures.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-2">
            Points detected but no matching body figure found.
          </p>
          <div className="flex flex-wrap justify-center gap-1">
            {extractedPoints.map(code => (
              <Badge key={code} variant="outline">{code}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeFigure = matchingFigures[activeFigureIndex];
  const highlightedOnFigure = getHighlightedPointsForFigure(activeFigure.filename, extractedPoints);

  if (compact) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-jade">{extractedPoints.length} points</Badge>
          <span className="text-xs text-muted-foreground">on {matchingFigures.length} figure(s)</span>
        </div>
        <BodyFigureWithPoints
          filename={activeFigure.filename}
          highlightedPoints={highlightedOnFigure}
          selectedPoints={selectedPoints}
          onPointSelect={handlePointSelect}
          showAllPoints={false}
          compact
        />
        {matchingFigures.length > 1 && (
          <div className="flex gap-1 mt-2">
            {matchingFigures.map((fig, idx) => (
              <Button
                key={fig.filename}
                variant={idx === activeFigureIndex ? 'default' : 'outline'}
                size="sm"
                className="h-6 text-xs"
                onClick={() => setActiveFigureIndex(idx)}
              >
                {fig.bodyPart}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="py-3 border-b bg-gradient-to-r from-jade/10 to-transparent">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4 text-jade" />
            AI Suggested Body Regions
            <Badge className="bg-jade">{extractedPoints.length} points</Badge>
          </CardTitle>
          {allowSelection && selectedPoints.length > 0 && (
            <Button
              size="sm"
              onClick={handleGenerateProtocol}
              className="gap-1 bg-jade hover:bg-jade/90"
              disabled={!onGenerateProtocol}
            >
              <Sparkles className="h-3 w-3" />
              Protocol ({selectedPoints.length})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {matchingFigures.length === 1 ? (
          <div className="p-3">
            <BodyFigureWithPoints
              filename={activeFigure.filename}
              highlightedPoints={highlightedOnFigure}
              selectedPoints={selectedPoints}
              onPointSelect={handlePointSelect}
              showAllPoints={false}
            />
          </div>
        ) : (
          <Tabs 
            value={activeFigure.filename} 
            onValueChange={(v) => {
              const idx = matchingFigures.findIndex(f => f.filename === v);
              if (idx >= 0) setActiveFigureIndex(idx);
            }}
          >
            <div className="border-b px-3 pt-2">
              <TabsList className="h-8">
                {matchingFigures.slice(0, 5).map((fig) => (
                  <TabsTrigger 
                    key={fig.filename} 
                    value={fig.filename}
                    className="text-xs"
                  >
                    {fig.bodyPart}
                  </TabsTrigger>
                ))}
                {matchingFigures.length > 5 && (
                  <TabsTrigger value="more" className="text-xs" disabled>
                    +{matchingFigures.length - 5}
                  </TabsTrigger>
                )}
              </TabsList>
            </div>
            {matchingFigures.map((fig) => (
              <TabsContent key={fig.filename} value={fig.filename} className="m-0 p-3">
                <BodyFigureWithPoints
                  filename={fig.filename}
                  highlightedPoints={getHighlightedPointsForFigure(fig.filename, extractedPoints)}
                  selectedPoints={selectedPoints}
                  onPointSelect={handlePointSelect}
                  showAllPoints={false}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}

        {/* All detected points summary with celebration animation */}
        <div className="p-3 border-t bg-muted/30 relative overflow-hidden">
          {/* Celebration overlay */}
          <AnimatePresence>
            {celebrationQueue.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-jade/20 via-jade/40 to-jade/20"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 1,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium">All Detected Points:</span>
            {celebrationQueue.length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 text-jade"
              >
                <Zap className="h-3 w-3 animate-pulse" />
                <span className="text-xs font-medium">{celebrationQueue[celebrationQueue.length - 1]}</span>
              </motion.div>
            )}
          </div>
          <ScrollArea className="max-h-20">
            <div className="flex flex-wrap gap-1">
              {extractedPoints.map(code => {
                const isCelebrating = celebrationQueue.includes(code);
                return (
                  <motion.div
                    key={code}
                    animate={isCelebrating ? {
                      scale: [1, 1.3, 1],
                      rotate: [0, 5, -5, 0],
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <Badge
                      variant={selectedPoints.includes(code) ? 'default' : 'outline'}
                      className={`cursor-pointer text-xs transition-all ${
                        isCelebrating
                          ? 'bg-jade text-white shadow-lg shadow-jade/50 ring-2 ring-jade ring-offset-1'
                          : selectedPoints.includes(code) 
                          ? 'bg-jade hover:bg-jade/80' 
                          : 'hover:bg-jade/20'
                      }`}
                      onClick={() => handlePointSelect(code)}
                    >
                      {isCelebrating && <Zap className="h-2 w-2 mr-1" />}
                      {code}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

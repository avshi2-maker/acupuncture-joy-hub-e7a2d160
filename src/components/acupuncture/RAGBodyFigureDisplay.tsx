import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BodyFigureWithPoints } from './BodyFigureWithPoints';
import { SequentialPointTourController } from './SequentialPointTourController';
import { NarrationControls } from './NarrationControls';
import { usePointFigureMapping } from '@/hooks/usePointFigureMapping';
import { useSequentialPointTour } from '@/hooks/useSequentialPointTour';
import { useTourNarration } from '@/hooks/useTourNarration';
import { MapPin, Sparkles, ChevronRight, ImageIcon, Zap } from 'lucide-react';
import { FigureMapping } from '@/data/point-figure-mapping';
import { motion, AnimatePresence } from 'framer-motion';

import { GenderFilter, AgeGroupFilter } from '@/data/point-figure-mapping';

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
  /** Enable sequential tour mode */
  enableTour?: boolean;
  /** Auto-start tour when points are loaded */
  autoStartTour?: boolean;
  /** Enable audio narration during tour */
  enableNarration?: boolean;
  /** Language for labels */
  language?: 'en' | 'he';
  /** Patient gender for gender-aware figure selection */
  patientGender?: GenderFilter;
  /** Patient age group for age-aware figure selection */
  patientAgeGroup?: AgeGroupFilter;
  /** Camera angle from AI command - determines which figure view to show first */
  cameraAngle?: 'anterior' | 'posterior' | 'lateral_left' | 'lateral_right' | 'superior' | 'auto';
  /** Primary focused point from AI command */
  focusedPoint?: string | null;
  /** Whether tour is externally triggered */
  externalTourActive?: boolean;
  className?: string;
}

/**
 * RAG-aware body figure display component
 * Automatically shows the correct body figures based on AI response or point codes
 * With 3D-like celebration animations and audio narration
 */
export function RAGBodyFigureDisplay({
  aiResponseText = '',
  pointCodes = [],
  onPointSelect,
  onGenerateProtocol,
  allowSelection = true,
  compact = false,
  celebratingPoint = null,
  enableTour = true,
  autoStartTour = false,
  enableNarration = true,
  language = 'en',
  patientGender = null,
  patientAgeGroup = null,
  cameraAngle = 'auto',
  focusedPoint = null,
  externalTourActive = false,
  className = ''
}: RAGBodyFigureDisplayProps) {
  const { 
    extractPointsFromText, 
    getFiguresForPoints, 
    getHighlightedPointsForFigure,
    getDemographicFigure
  } = usePointFigureMapping({ gender: patientGender, ageGroup: patientAgeGroup });

  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
  const [activeFigureIndex, setActiveFigureIndex] = useState(0);
  const [celebrationQueue, setCelebrationQueue] = useState<string[]>([]);
  const [tourActivePoint, setTourActivePoint] = useState<string | null>(null);

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

  // Effect to handle camera angle changes from AI command
  useEffect(() => {
    if (cameraAngle !== 'auto' && matchingFigures.length > 0) {
      // Find figure matching the camera angle
      const angleToKeyword: Record<string, string[]> = {
        'anterior': ['front', 'anterior', 'abdomen', 'chest', 'face'],
        'posterior': ['back', 'posterior', 'spine', 'lumbar'],
        'lateral_left': ['lateral', 'left', 'side'],
        'lateral_right': ['lateral', 'right', 'side'],
        'superior': ['head', 'top', 'scalp'],
      };
      
      const keywords = angleToKeyword[cameraAngle] || [];
      const matchIndex = matchingFigures.findIndex(fig => 
        keywords.some(kw => fig.filename.toLowerCase().includes(kw))
      );
      
      if (matchIndex >= 0) {
        setActiveFigureIndex(matchIndex);
        console.log(`Camera angle ${cameraAngle} matched figure: ${matchingFigures[matchIndex].filename}`);
      }
    }
  }, [cameraAngle, matchingFigures]);

  // Effect to handle focused point from AI command
  useEffect(() => {
    if (focusedPoint && matchingFigures.length > 0) {
      // Find figure containing the focused point and switch to it
      const figureWithPoint = matchingFigures.findIndex(fig => {
        const pointsOnFig = getHighlightedPointsForFigure(fig.filename, [focusedPoint]);
        return pointsOnFig.length > 0;
      });
      
      if (figureWithPoint >= 0 && figureWithPoint !== activeFigureIndex) {
        setActiveFigureIndex(figureWithPoint);
        console.log(`Focused point ${focusedPoint} found on figure: ${matchingFigures[figureWithPoint].filename}`);
      }
    }
  }, [focusedPoint, matchingFigures, activeFigureIndex, getHighlightedPointsForFigure]);

  // Audio Narration hook
  const narration = useTourNarration({
    language,
    onNarrationStart: (point) => {
      console.log('Narration started for:', point);
    },
    onNarrationEnd: (point) => {
      console.log('Narration ended for:', point);
    },
    onReadyForNext: () => {
      // Signal tour to move to next point
      tour.signalNarrationComplete();
    },
  });

  // Sequential Point Tour hook - wait for narration when enabled
  const tour = useSequentialPointTour({
    dwellTime: enableNarration && !narration.isMuted ? 1000 : 2500, // Shorter dwell when narration handles timing
    waitForNarration: enableNarration && !narration.isMuted,
    onPointChange: (point, index) => {
      setTourActivePoint(point);
      setCelebrationQueue(prev => [...prev, point]);
      
      // Auto-switch to the figure containing this point
      const figureWithPoint = matchingFigures.findIndex(fig => {
        const pointsOnFig = getHighlightedPointsForFigure(fig.filename, extractedPoints);
        return pointsOnFig.some(p => p.toUpperCase() === point.toUpperCase());
      });
      
      if (figureWithPoint !== -1 && figureWithPoint !== activeFigureIndex) {
        setActiveFigureIndex(figureWithPoint);
      }
      
      // Play narration for this point
      if (enableNarration) {
        narration.playNarration(point);
      }
      
      // Clear celebration after animation
      setTimeout(() => {
        setCelebrationQueue(prev => prev.filter(p => p !== point));
      }, 2000);
    },
    onTourComplete: () => {
      setTourActivePoint(null);
      narration.stopAudio();
    },
    onTourStart: () => {
      // Preload point data for narration
      narration.preloadPointData(extractedPoints);
    },
  });

  // Auto-start tour when enabled and points are loaded
  useEffect(() => {
    if (autoStartTour && extractedPoints.length > 0 && !tour.isRunning) {
      const timer = setTimeout(() => {
        tour.startTour(extractedPoints);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoStartTour, extractedPoints, tour.isRunning]);

  // Reset active figure when figures change
  useEffect(() => {
    setActiveFigureIndex(0);
  }, [matchingFigures.length]);

  // Handle celebration animation when a point is clicked externally
  useEffect(() => {
    if (celebratingPoint && !tour.isRunning) {
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
  }, [celebratingPoint, matchingFigures, extractedPoints, getHighlightedPointsForFigure, activeFigureIndex, tour.isRunning]);

  const handlePointSelect = useCallback((code: string) => {
    if (allowSelection) {
      setSelectedPoints(prev => {
        if (prev.includes(code)) {
          return prev.filter(p => p !== code);
        }
        return [...prev, code];
      });
    }
    
    // If tour is running, jump to the clicked point
    if (tour.isRunning) {
      tour.jumpToPoint(code);
    } else {
      // Trigger celebration for clicked point
      setCelebrationQueue(prev => [...prev, code]);
      setTimeout(() => {
        setCelebrationQueue(prev => prev.filter(p => p !== code));
      }, 2000);
    }
    
    onPointSelect?.(code);
  }, [allowSelection, onPointSelect, tour]);

  const handleGenerateProtocol = useCallback(() => {
    if (selectedPoints.length > 0 && onGenerateProtocol) {
      onGenerateProtocol(selectedPoints);
    }
  }, [selectedPoints, onGenerateProtocol]);

  // Start tour handler
  const handleStartTour = useCallback(() => {
    tour.startTour(extractedPoints);
  }, [tour, extractedPoints]);

  // Determine the current celebrating point (from tour or external)
  const currentCelebratingPoint = tourActivePoint || celebratingPoint;

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
          patientGender={patientGender}
          patientAgeGroup={patientAgeGroup}
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
    <div className={`space-y-4 ${className}`}>
      {/* Main Figure Card */}
      <Card className="overflow-hidden relative">
        {/* Narration Controls Overlay */}
        {enableNarration && tour.isRunning && (
          <NarrationControls
            isMuted={narration.isMuted}
            isPlaying={narration.isPlaying}
            isLoading={narration.isLoading}
            currentPoint={narration.currentPoint}
            playbackSpeed={narration.playbackSpeed}
            onToggleMute={narration.toggleMute}
            onSpeedChange={narration.setPlaybackSpeed}
            language={language}
          />
        )}
        
        <CardHeader className="py-3 border-b bg-gradient-to-r from-jade/10 to-transparent">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4 text-jade" />
              {language === 'he' ? 'אזורי גוף מומלצי AI' : 'AI Suggested Body Regions'}
              <Badge className="bg-jade">{extractedPoints.length} {language === 'he' ? 'נקודות' : 'points'}</Badge>
              {patientGender && (
                <Badge variant="outline" className={patientGender === 'female' ? 'border-pink-500 text-pink-600' : 'border-blue-500 text-blue-600'}>
                  {patientGender === 'female' ? '♀' : '♂'}
                </Badge>
              )}
              {patientAgeGroup && patientAgeGroup !== 'adult' && (
                <Badge variant="outline" className={patientAgeGroup === 'pediatric' ? 'border-amber-500 text-amber-600' : 'border-slate-500 text-slate-600'}>
                  {patientAgeGroup === 'pediatric' ? '👶' : '👴'}
                </Badge>
              )}
            </CardTitle>
            {allowSelection && selectedPoints.length > 0 && (
              <Button
                size="sm"
                onClick={handleGenerateProtocol}
                className="gap-1 bg-jade hover:bg-jade/90"
                disabled={!onGenerateProtocol}
              >
                <Sparkles className="h-3 w-3" />
                {language === 'he' ? 'פרוטוקול' : 'Protocol'} ({selectedPoints.length})
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
                patientGender={patientGender}
                patientAgeGroup={patientAgeGroup}
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
                    patientGender={patientGender}
                    patientAgeGroup={patientAgeGroup}
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
              <span className="text-xs font-medium">
                {language === 'he' ? 'כל הנקודות שזוהו:' : 'All Detected Points:'}
              </span>
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
                  const isTourActive = tourActivePoint?.toUpperCase() === code.toUpperCase();
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
                          isCelebrating || isTourActive
                            ? 'bg-jade text-white shadow-lg shadow-jade/50 ring-2 ring-jade ring-offset-1'
                            : selectedPoints.includes(code) 
                            ? 'bg-jade hover:bg-jade/80' 
                            : 'hover:bg-jade/20'
                        }`}
                        onClick={() => handlePointSelect(code)}
                      >
                        {(isCelebrating || isTourActive) && <Zap className="h-2 w-2 mr-1" />}
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

      {/* Sequential Point Tour Controller */}
      {enableTour && extractedPoints.length > 1 && (
        <SequentialPointTourController
          points={extractedPoints}
          currentPoint={tour.currentPoint}
          currentIndex={tour.currentIndex}
          isRunning={tour.isRunning}
          isPaused={tour.isPaused}
          progress={tour.progress}
          onStart={handleStartTour}
          onPause={tour.pauseTour}
          onResume={tour.resumeTour}
          onStop={tour.stopTour}
          onPointClick={handlePointSelect}
          onNext={tour.nextPoint}
          onPrevious={tour.previousPoint}
          language={language}
        />
      )}
    </div>
  );
}

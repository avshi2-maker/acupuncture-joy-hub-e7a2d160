import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Square,
  MapPin,
  Sparkles,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SequentialPointTourControllerProps {
  /** List of point codes to tour through */
  points: string[];
  /** Current active point in the tour */
  currentPoint: string | null;
  /** Current index in the tour */
  currentIndex: number;
  /** Whether the tour is currently running */
  isRunning: boolean;
  /** Whether the tour is paused */
  isPaused: boolean;
  /** Progress percentage (0-100) */
  progress: number;
  /** Called when user clicks start */
  onStart: () => void;
  /** Called when user clicks pause */
  onPause: () => void;
  /** Called when user clicks resume */
  onResume: () => void;
  /** Called when user clicks stop */
  onStop: () => void;
  /** Called when user clicks on a specific point in the list */
  onPointClick: (pointCode: string) => void;
  /** Called when user clicks next */
  onNext: () => void;
  /** Called when user clicks previous */
  onPrevious: () => void;
  /** Optional class name */
  className?: string;
  /** Language for labels */
  language?: 'en' | 'he';
}

/**
 * Controller UI for the Sequential Point Tour
 * Provides play/pause controls and synchronized point list
 */
export function SequentialPointTourController({
  points,
  currentPoint,
  currentIndex,
  isRunning,
  isPaused,
  progress,
  onStart,
  onPause,
  onResume,
  onStop,
  onPointClick,
  onNext,
  onPrevious,
  className,
  language = 'en',
}: SequentialPointTourControllerProps) {
  const activeItemRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active point
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentIndex]);

  if (points.length === 0) {
    return null;
  }

  const labels = {
    title: language === 'he' ? 'סיור נקודות 3D' : '3D Point Tour',
    startTour: language === 'he' ? 'התחל סיור' : 'Start Tour',
    pauseTour: language === 'he' ? 'השהה' : 'Pause',
    resumeTour: language === 'he' ? 'המשך' : 'Resume',
    stopTour: language === 'he' ? 'עצור' : 'Stop',
    points: language === 'he' ? 'נקודות' : 'points',
    clickToJump: language === 'he' ? 'לחץ לקפיצה' : 'Click to jump',
    touring: language === 'he' ? 'סיור פעיל' : 'Touring',
    paused: language === 'he' ? 'מושהה' : 'Paused',
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="py-3 border-b bg-gradient-to-r from-jade/10 via-jade/5 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="h-4 w-4 text-jade" />
            {labels.title}
            <Badge variant="outline" className="text-xs">
              {points.length} {labels.points}
            </Badge>
          </CardTitle>
          
          {isRunning && (
            <Badge 
              variant={isPaused ? 'secondary' : 'default'} 
              className={cn(
                'text-xs animate-pulse',
                !isPaused && 'bg-jade'
              )}
            >
              {isPaused ? labels.paused : labels.touring}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-3">
        {/* Progress bar */}
        {isRunning && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{currentIndex + 1} / {points.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Control buttons */}
        <div className="flex items-center justify-center gap-2">
          {!isRunning ? (
            <Button
              onClick={onStart}
              className="bg-jade hover:bg-jade/90 gap-2"
              size="sm"
            >
              <Play className="h-4 w-4" />
              {labels.startTour}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={onPrevious}
                disabled={currentIndex <= 0}
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              {isPaused ? (
                <Button
                  size="icon"
                  className="h-10 w-10 rounded-full bg-jade hover:bg-jade/90"
                  onClick={onResume}
                >
                  <Play className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  className="h-10 w-10 rounded-full bg-jade hover:bg-jade/90"
                  onClick={onPause}
                >
                  <Pause className="h-5 w-5" />
                </Button>
              )}

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={onNext}
                disabled={currentIndex >= points.length - 1}
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8 ml-2"
                onClick={onStop}
              >
                <Square className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Point list with synchronized highlighting */}
        <ScrollArea className="h-[200px] pr-2">
          <div className="space-y-1">
            <AnimatePresence mode="sync">
              {points.map((point, index) => {
                const isActive = currentPoint?.toUpperCase() === point.toUpperCase();
                const isPast = currentIndex > index;
                const isFuture = currentIndex < index;

                return (
                  <motion.div
                    key={point}
                    ref={isActive ? activeItemRef : null}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      scale: isActive ? 1.02 : 1,
                    }}
                    transition={{ 
                      duration: 0.2,
                      delay: index * 0.02,
                    }}
                  >
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      size="sm"
                      className={cn(
                        'w-full justify-start gap-2 h-9 transition-all duration-300',
                        isActive && 'bg-jade text-white shadow-lg shadow-jade/30 ring-2 ring-jade ring-offset-1',
                        isPast && !isActive && 'text-muted-foreground',
                        isFuture && !isActive && 'opacity-60',
                      )}
                      onClick={() => onPointClick(point)}
                    >
                      <div className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all',
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : isPast 
                            ? 'bg-jade/20 text-jade' 
                            : 'bg-muted text-muted-foreground'
                      )}>
                        {isPast && !isActive ? (
                          <Sparkles className="h-3 w-3" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      
                      <span className="flex-1 text-left font-mono">
                        {point}
                      </span>

                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-1"
                        >
                          <MapPin className="h-3 w-3 animate-pulse" />
                        </motion.div>
                      )}
                    </Button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Hint */}
        {!isRunning && (
          <p className="text-xs text-center text-muted-foreground">
            {labels.clickToJump}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

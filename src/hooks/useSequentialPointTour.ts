import { useState, useCallback, useRef, useEffect } from 'react';

interface TourState {
  isRunning: boolean;
  isPaused: boolean;
  currentIndex: number;
  currentPoint: string | null;
  totalPoints: number;
}

interface UseSequentialPointTourOptions {
  /** Dwell time on each point in milliseconds (default: 2500ms) */
  dwellTime?: number;
  /** Called when the tour moves to a new point */
  onPointChange?: (point: string, index: number) => void;
  /** Called when the tour completes */
  onTourComplete?: () => void;
  /** Called when tour starts */
  onTourStart?: () => void;
}

/**
 * Hook for managing sequential point celebration tours
 * Provides smooth camera transitions with pause/resume and manual navigation
 */
export function useSequentialPointTour(options: UseSequentialPointTourOptions = {}) {
  const { 
    dwellTime = 2500, 
    onPointChange, 
    onTourComplete,
    onTourStart 
  } = options;

  const [tourState, setTourState] = useState<TourState>({
    isRunning: false,
    isPaused: false,
    currentIndex: -1,
    currentPoint: null,
    totalPoints: 0,
  });

  const pointsRef = useRef<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isTransitioningRef = useRef(false);

  // Clear any running timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Move to a specific point
  const goToPoint = useCallback((index: number) => {
    if (index < 0 || index >= pointsRef.current.length) return;

    const point = pointsRef.current[index];
    
    setTourState(prev => ({
      ...prev,
      currentIndex: index,
      currentPoint: point,
    }));

    onPointChange?.(point, index);
  }, [onPointChange]);

  // Schedule next point
  const scheduleNextPoint = useCallback(() => {
    clearTimer();
    
    timerRef.current = setTimeout(() => {
      setTourState(prev => {
        const nextIndex = prev.currentIndex + 1;
        
        if (nextIndex >= pointsRef.current.length) {
          // Tour complete
          onTourComplete?.();
          return {
            ...prev,
            isRunning: false,
            isPaused: false,
            currentIndex: -1,
            currentPoint: null,
          };
        }

        // Move to next point
        if (!prev.isPaused) {
          const point = pointsRef.current[nextIndex];
          onPointChange?.(point, nextIndex);
          
          // Schedule the next one
          setTimeout(() => scheduleNextPoint(), 100);
          
          return {
            ...prev,
            currentIndex: nextIndex,
            currentPoint: point,
          };
        }

        return prev;
      });
    }, dwellTime);
  }, [dwellTime, onPointChange, onTourComplete, clearTimer]);

  // Start the tour
  const startTour = useCallback((points: string[]) => {
    if (points.length === 0) return;

    clearTimer();
    pointsRef.current = points;

    setTourState({
      isRunning: true,
      isPaused: false,
      currentIndex: 0,
      currentPoint: points[0],
      totalPoints: points.length,
    });

    onTourStart?.();
    onPointChange?.(points[0], 0);

    // Schedule the transition to the next point
    timerRef.current = setTimeout(() => {
      scheduleNextPoint();
    }, dwellTime);
  }, [dwellTime, onPointChange, onTourStart, scheduleNextPoint, clearTimer]);

  // Pause the tour
  const pauseTour = useCallback(() => {
    clearTimer();
    setTourState(prev => ({
      ...prev,
      isPaused: true,
    }));
  }, [clearTimer]);

  // Resume the tour
  const resumeTour = useCallback(() => {
    setTourState(prev => ({
      ...prev,
      isPaused: false,
    }));
    
    // Continue from current point
    scheduleNextPoint();
  }, [scheduleNextPoint]);

  // Stop the tour
  const stopTour = useCallback(() => {
    clearTimer();
    setTourState({
      isRunning: false,
      isPaused: false,
      currentIndex: -1,
      currentPoint: null,
      totalPoints: 0,
    });
  }, [clearTimer]);

  // Jump to a specific point (manual navigation)
  const jumpToPoint = useCallback((pointCode: string) => {
    const index = pointsRef.current.findIndex(
      p => p.toUpperCase() === pointCode.toUpperCase()
    );
    
    if (index !== -1) {
      clearTimer();
      goToPoint(index);
      
      // If tour is running and not paused, resume scheduling
      if (tourState.isRunning && !tourState.isPaused) {
        timerRef.current = setTimeout(() => {
          scheduleNextPoint();
        }, dwellTime);
      }
    }
  }, [tourState.isRunning, tourState.isPaused, dwellTime, goToPoint, scheduleNextPoint, clearTimer]);

  // Navigate to next point manually
  const nextPoint = useCallback(() => {
    const nextIndex = tourState.currentIndex + 1;
    if (nextIndex < pointsRef.current.length) {
      clearTimer();
      goToPoint(nextIndex);
      
      if (tourState.isRunning && !tourState.isPaused) {
        timerRef.current = setTimeout(() => {
          scheduleNextPoint();
        }, dwellTime);
      }
    }
  }, [tourState, dwellTime, goToPoint, scheduleNextPoint, clearTimer]);

  // Navigate to previous point manually
  const previousPoint = useCallback(() => {
    const prevIndex = tourState.currentIndex - 1;
    if (prevIndex >= 0) {
      clearTimer();
      goToPoint(prevIndex);
      
      if (tourState.isRunning && !tourState.isPaused) {
        timerRef.current = setTimeout(() => {
          scheduleNextPoint();
        }, dwellTime);
      }
    }
  }, [tourState, dwellTime, goToPoint, scheduleNextPoint, clearTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    // State
    isRunning: tourState.isRunning,
    isPaused: tourState.isPaused,
    currentPoint: tourState.currentPoint,
    currentIndex: tourState.currentIndex,
    totalPoints: tourState.totalPoints,
    progress: tourState.totalPoints > 0 
      ? ((tourState.currentIndex + 1) / tourState.totalPoints) * 100 
      : 0,
    
    // Actions
    startTour,
    pauseTour,
    resumeTour,
    stopTour,
    jumpToPoint,
    nextPoint,
    previousPoint,
  };
}

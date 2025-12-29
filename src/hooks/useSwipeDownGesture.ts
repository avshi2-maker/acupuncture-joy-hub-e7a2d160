import { useRef, useCallback, useEffect } from 'react';

interface SwipeDownGestureOptions {
  onSwipeDown: () => void;
  threshold?: number; // minimum distance to trigger swipe
  timeLimit?: number; // max time for swipe gesture (ms)
}

export function useSwipeDownGesture({
  onSwipeDown,
  threshold = 80,
  timeLimit = 500,
}: SwipeDownGestureOptions) {
  const startY = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    startY.current = e.touches[0].clientY;
    startTime.current = Date.now();
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (startY.current === null || startTime.current === null) return;

    const endY = e.changedTouches[0].clientY;
    const deltaY = endY - startY.current;
    const deltaTime = Date.now() - startTime.current;

    // Check if it's a valid swipe down
    if (deltaY > threshold && deltaTime < timeLimit) {
      onSwipeDown();
    }

    startY.current = null;
    startTime.current = null;
  }, [onSwipeDown, threshold, timeLimit]);

  const bindRef = useCallback((element: HTMLElement | null) => {
    // Cleanup previous listeners
    if (elementRef.current) {
      elementRef.current.removeEventListener('touchstart', handleTouchStart);
      elementRef.current.removeEventListener('touchend', handleTouchEnd);
    }

    elementRef.current = element;

    // Add new listeners
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
  }, [handleTouchStart, handleTouchEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (elementRef.current) {
        elementRef.current.removeEventListener('touchstart', handleTouchStart);
        elementRef.current.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleTouchStart, handleTouchEnd]);

  return { bindRef };
}

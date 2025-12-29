import { useRef, useCallback } from 'react';

interface UseDoubleTapOptions {
  onDoubleTap: () => void;
  delay?: number; // Max time between taps in ms
}

export const useDoubleTapGesture = ({ onDoubleTap, delay = 300 }: UseDoubleTapOptions) => {
  const lastTapRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTap = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < delay && timeSinceLastTap > 0) {
      // Double tap detected
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      onDoubleTap();
      lastTapRef.current = 0;
    } else {
      // First tap - wait for potential second tap
      lastTapRef.current = now;
      timeoutRef.current = setTimeout(() => {
        lastTapRef.current = 0;
      }, delay);
    }
  }, [onDoubleTap, delay]);

  return {
    onTouchEnd: handleTap,
    onClick: handleTap,
  };
};

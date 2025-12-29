import { useCallback, useRef, useState } from 'react';

interface UseLongPressTimerOptions {
  onLongPress: (position: { x: number; y: number }) => void;
  delay?: number;
}

export function useLongPressTimer({ onLongPress, delay = 500 }: UseLongPressTimerOptions) {
  const [isPressing, setIsPressing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const positionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const start = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    setIsPressing(true);
    
    // Get position
    if ('touches' in e) {
      positionRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else {
      positionRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    }

    timeoutRef.current = setTimeout(() => {
      onLongPress(positionRef.current);
      setIsPressing(false);
    }, delay);
  }, [onLongPress, delay]);

  const cancel = useCallback(() => {
    setIsPressing(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    isPressing,
    handlers: {
      onTouchStart: start,
      onTouchEnd: cancel,
      onTouchCancel: cancel,
      onMouseDown: start,
      onMouseUp: cancel,
      onMouseLeave: cancel,
    },
  };
}

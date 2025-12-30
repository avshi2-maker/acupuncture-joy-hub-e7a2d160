import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInactivityTimeoutOptions {
  timeoutMinutes?: number;
  onTimeout: () => void;
  enabled?: boolean;
}

export function useInactivityTimeout({
  timeoutMinutes = 15,
  onTimeout,
  enabled = true
}: UseInactivityTimeoutOptions) {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeoutRef = useRef(onTimeout);

  // Keep callback ref updated
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const resetTimer = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // Set up activity listeners
  useEffect(() => {
    if (!enabled) return;

    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'touchmove',
      'click',
      'focus'
    ];

    const handleActivity = () => {
      resetTimer();
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [enabled, resetTimer]);

  // Check for timeout
  useEffect(() => {
    if (!enabled) return;

    const checkTimeout = () => {
      const now = Date.now();
      const elapsed = now - lastActivity;
      const timeoutMs = timeoutMinutes * 60 * 1000;

      if (elapsed >= timeoutMs) {
        onTimeoutRef.current();
      }
    };

    // Check every 30 seconds
    timeoutRef.current = setInterval(checkTimeout, 30000);

    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    };
  }, [enabled, lastActivity, timeoutMinutes]);

  return {
    resetTimer,
    lastActivity,
    timeoutMinutes
  };
}

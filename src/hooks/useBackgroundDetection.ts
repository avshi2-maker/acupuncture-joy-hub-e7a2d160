import { useEffect, useRef, useCallback } from 'react';

interface UseBackgroundDetectionOptions {
  onBackground?: () => void;
  onForeground?: () => void;
  pauseOnBackground?: boolean;
}

export const useBackgroundDetection = ({
  onBackground,
  onForeground,
  pauseOnBackground = true,
}: UseBackgroundDetectionOptions = {}) => {
  const wasBackgroundedRef = useRef(false);
  const backgroundTimeRef = useRef<number | null>(null);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // App went to background
      wasBackgroundedRef.current = true;
      backgroundTimeRef.current = Date.now();
      if (pauseOnBackground) {
        onBackground?.();
      }
    } else {
      // App came to foreground
      if (wasBackgroundedRef.current) {
        const backgroundDuration = backgroundTimeRef.current 
          ? Math.floor((Date.now() - backgroundTimeRef.current) / 1000)
          : 0;
        onForeground?.();
        wasBackgroundedRef.current = false;
        backgroundTimeRef.current = null;
      }
    }
  }, [onBackground, onForeground, pauseOnBackground]);

  // Also detect page blur/focus for additional coverage
  const handlePageHide = useCallback(() => {
    wasBackgroundedRef.current = true;
    backgroundTimeRef.current = Date.now();
    if (pauseOnBackground) {
      onBackground?.();
    }
  }, [onBackground, pauseOnBackground]);

  const handlePageShow = useCallback(() => {
    if (wasBackgroundedRef.current) {
      onForeground?.();
      wasBackgroundedRef.current = false;
      backgroundTimeRef.current = null;
    }
  }, [onForeground]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('blur', handlePageHide);
    window.addEventListener('focus', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('blur', handlePageHide);
      window.removeEventListener('focus', handlePageShow);
    };
  }, [handleVisibilityChange, handlePageHide, handlePageShow]);

  return {
    isBackgrounded: wasBackgroundedRef.current,
  };
};

import { useCallback } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * Custom hook for haptic feedback on mobile devices
 * Uses the Vibration API which is supported on Android and partially on iOS
 */
export function useHapticFeedback() {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const vibrate = useCallback((pattern: number | number[]) => {
    if (isSupported) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Silently fail if vibration is not allowed
        console.debug('Haptic feedback not available:', e);
      }
    }
  }, [isSupported]);

  const trigger = useCallback((type: HapticType = 'light') => {
    switch (type) {
      case 'light':
        vibrate(10);
        break;
      case 'medium':
        vibrate(25);
        break;
      case 'heavy':
        vibrate(50);
        break;
      case 'success':
        vibrate([10, 50, 10]); // Quick double tap
        break;
      case 'warning':
        vibrate([30, 50, 30]); // Two medium pulses
        break;
      case 'error':
        vibrate([50, 100, 50, 100, 50]); // Three pulses
        break;
    }
  }, [vibrate]);

  // Convenience methods
  const light = useCallback(() => trigger('light'), [trigger]);
  const medium = useCallback(() => trigger('medium'), [trigger]);
  const heavy = useCallback(() => trigger('heavy'), [trigger]);
  const success = useCallback(() => trigger('success'), [trigger]);
  const warning = useCallback(() => trigger('warning'), [trigger]);
  const error = useCallback(() => trigger('error'), [trigger]);

  return {
    isSupported,
    trigger,
    light,
    medium,
    heavy,
    success,
    warning,
    error,
  };
}

/**
 * Wrapper function to add haptic feedback to any click handler
 */
export function withHaptic<T extends (...args: any[]) => any>(
  handler: T,
  type: HapticType = 'light'
): T {
  return ((...args: Parameters<T>) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        const patterns: Record<HapticType, number | number[]> = {
          light: 10,
          medium: 25,
          heavy: 50,
          success: [10, 50, 10],
          warning: [30, 50, 30],
          error: [50, 100, 50, 100, 50],
        };
        navigator.vibrate(patterns[type]);
      } catch (e) {
        // Silently fail
      }
    }
    return handler(...args);
  }) as T;
}

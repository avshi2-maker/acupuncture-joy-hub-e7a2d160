import { useCallback } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error';

const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,      // Quick tap - for tab switches, point selection
  medium: 25,     // Standard feedback
  heavy: 50,      // Strong feedback
  success: [10, 50, 10], // Double tap pattern
  error: [50, 100, 50],  // Error pattern
};

/**
 * Custom hook for haptic feedback (vibration) on mobile devices.
 * Falls back gracefully on devices that don't support vibration.
 */
export function useHaptic() {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const vibrate = useCallback((pattern: HapticPattern = 'light') => {
    if (!isSupported) return false;

    try {
      const vibrationPattern = HAPTIC_PATTERNS[pattern];
      return navigator.vibrate(vibrationPattern);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
      return false;
    }
  }, [isSupported]);

  const lightTap = useCallback(() => vibrate('light'), [vibrate]);
  const mediumTap = useCallback(() => vibrate('medium'), [vibrate]);
  const heavyTap = useCallback(() => vibrate('heavy'), [vibrate]);
  const successTap = useCallback(() => vibrate('success'), [vibrate]);
  const errorTap = useCallback(() => vibrate('error'), [vibrate]);

  return {
    isSupported,
    vibrate,
    lightTap,
    mediumTap,
    heavyTap,
    successTap,
    errorTap,
  };
}
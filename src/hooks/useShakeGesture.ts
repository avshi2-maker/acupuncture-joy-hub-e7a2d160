import { useEffect, useRef, useCallback } from 'react';

interface ShakeGestureOptions {
  onShake: () => void;
  threshold?: number; // acceleration threshold to detect shake
  timeout?: number; // time window to count shakes (ms)
  shakeCount?: number; // number of shakes required to trigger
}

export function useShakeGesture({
  onShake,
  threshold = 15,
  timeout = 1000,
  shakeCount = 3,
}: ShakeGestureOptions) {
  const lastX = useRef<number | null>(null);
  const lastY = useRef<number | null>(null);
  const lastZ = useRef<number | null>(null);
  const shakeTimestamps = useRef<number[]>([]);
  const lastShakeTime = useRef<number>(0);

  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    const { x, y, z } = acceleration;
    if (x === null || y === null || z === null) return;

    if (lastX.current !== null && lastY.current !== null && lastZ.current !== null) {
      const deltaX = Math.abs(x - lastX.current);
      const deltaY = Math.abs(y - lastY.current);
      const deltaZ = Math.abs(z - lastZ.current);

      const totalDelta = deltaX + deltaY + deltaZ;
      const now = Date.now();

      if (totalDelta > threshold) {
        // Debounce individual shakes (at least 100ms apart)
        if (now - lastShakeTime.current > 100) {
          lastShakeTime.current = now;
          shakeTimestamps.current.push(now);

          // Filter out old shakes outside the timeout window
          shakeTimestamps.current = shakeTimestamps.current.filter(
            (timestamp) => now - timestamp < timeout
          );

          // Check if we have enough shakes to trigger
          if (shakeTimestamps.current.length >= shakeCount) {
            onShake();
            shakeTimestamps.current = []; // Reset after triggering
          }
        }
      }
    }

    lastX.current = x;
    lastY.current = y;
    lastZ.current = z;
  }, [onShake, threshold, timeout, shakeCount]);

  useEffect(() => {
    // Check if DeviceMotionEvent is supported
    if (typeof DeviceMotionEvent === 'undefined') {
      console.log('DeviceMotionEvent not supported');
      return;
    }

    // Request permission for iOS 13+
    const requestPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission !== 'granted') {
            console.log('Motion permission denied');
            return false;
          }
        } catch (err) {
          console.error('Error requesting motion permission:', err);
          return false;
        }
      }
      return true;
    };

    const setupListener = async () => {
      const hasPermission = await requestPermission();
      if (hasPermission) {
        window.addEventListener('devicemotion', handleMotion);
      }
    };

    setupListener();

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [handleMotion]);
}

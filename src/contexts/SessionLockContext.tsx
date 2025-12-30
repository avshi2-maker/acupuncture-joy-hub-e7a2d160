import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { usePinAuth } from '@/hooks/usePinAuth';
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';
import { PinUnlockScreen } from '@/components/auth/PinUnlockScreen';

interface SessionLockContextType {
  isLocked: boolean;
  lock: () => void;
  unlock: () => void;
  timeoutMinutes: number;
  setTimeoutMinutes: (minutes: number) => void;
}

const SessionLockContext = createContext<SessionLockContextType | undefined>(undefined);

const TIMEOUT_KEY = 'session_timeout_minutes';
const LOCK_STATE_KEY = 'session_locked';

export function SessionLockProvider({ children }: { children: React.ReactNode }) {
  const { hasPin, isLoading: isPinLoading } = usePinAuth();
  const [isLocked, setIsLocked] = useState(() => {
    // Check if was locked before page refresh
    return localStorage.getItem(LOCK_STATE_KEY) === 'true';
  });
  const [timeoutMinutes, setTimeoutMinutesState] = useState(() => {
    const saved = localStorage.getItem(TIMEOUT_KEY);
    return saved ? parseInt(saved, 10) : 15;
  });

  const lock = useCallback(() => {
    setIsLocked(true);
    localStorage.setItem(LOCK_STATE_KEY, 'true');
  }, []);

  const unlock = useCallback(() => {
    setIsLocked(false);
    localStorage.removeItem(LOCK_STATE_KEY);
  }, []);

  const setTimeoutMinutes = useCallback((minutes: number) => {
    setTimeoutMinutesState(minutes);
    localStorage.setItem(TIMEOUT_KEY, minutes.toString());
  }, []);

  // Auto-lock on inactivity if PIN is set
  useInactivityTimeout({
    timeoutMinutes,
    onTimeout: lock,
    enabled: hasPin && !isLocked
  });

  // Clear lock state if user removes PIN
  useEffect(() => {
    if (!isPinLoading && !hasPin) {
      unlock();
    }
  }, [hasPin, isPinLoading, unlock]);

  const handleUnlock = useCallback(() => {
    unlock();
  }, [unlock]);

  const handleLogout = useCallback(() => {
    unlock();
    window.location.href = '/';
  }, [unlock]);

  // Show unlock screen if locked and has PIN
  if (!isPinLoading && hasPin && isLocked) {
    return (
      <PinUnlockScreen 
        onUnlock={handleUnlock}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <SessionLockContext.Provider value={{ 
      isLocked, 
      lock, 
      unlock, 
      timeoutMinutes, 
      setTimeoutMinutes 
    }}>
      {children}
    </SessionLockContext.Provider>
  );
}

export function useSessionLock() {
  const context = useContext(SessionLockContext);
  if (context === undefined) {
    throw new Error('useSessionLock must be used within a SessionLockProvider');
  }
  return context;
}

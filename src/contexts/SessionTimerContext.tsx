import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'warning' | 'ended';

interface SessionInfo {
  patientId?: string;
  patientName?: string;
  appointmentId?: string;
  appointmentTitle?: string;
}

interface SessionTimerContextType {
  status: TimerStatus;
  remainingSeconds: number;
  totalSeconds: number;
  selectedDuration: number;
  soundEnabled: boolean;
  isExpanded: boolean;
  sessionInfo: SessionInfo | null;
  currentTime: Date;
  
  // Actions
  startTimer: (durationMinutes: number, sessionInfo?: SessionInfo) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  setSelectedDuration: (minutes: number) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setIsExpanded: (expanded: boolean) => void;
  
  // Derived
  getProgress: () => number;
  formatTime: (seconds: number) => string;
}

const SessionTimerContext = createContext<SessionTimerContextType | null>(null);

const WARNING_BEFORE_END = 5 * 60; // 5 minutes

export function SessionTimerProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [selectedDuration, setSelectedDurationState] = useState<number>(40);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(40 * 60);
  const [totalSeconds, setTotalSeconds] = useState<number>(40 * 60);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef(false);
  const endAlertShownRef = useRef(false);

  // Update current time every second
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Play sound effect
  const playSound = useCallback((type: 'warning' | 'end') => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playBeep = (startTime: number, frequency: number, duration: number = 0.3) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type === 'end' ? 'square' : 'sine';
        
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      const now = audioContext.currentTime;
      
      if (type === 'warning') {
        playBeep(now, 660);
        playBeep(now + 0.4, 660);
        playBeep(now + 0.8, 880);
      } else {
        playBeep(now, 880, 0.2);
        playBeep(now + 0.25, 880, 0.2);
        playBeep(now + 0.5, 1100, 0.2);
        playBeep(now + 0.75, 1100, 0.2);
        playBeep(now + 1.0, 1320, 0.4);
      }
    } catch (err) {
      console.error('Could not play audio:', err);
    }
  }, [soundEnabled]);

  // Timer countdown logic
  useEffect(() => {
    if (status === 'running' || status === 'warning') {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          const newValue = prev - 1;
          
          // Check for warning (5 minutes left)
          if (newValue === WARNING_BEFORE_END && !warningShownRef.current) {
            warningShownRef.current = true;
            setStatus('warning');
            playSound('warning');
            toast.warning('⏰ 5 minutes remaining!', {
              description: sessionInfo?.patientName 
                ? `Wrap up session with ${sessionInfo.patientName}`
                : 'Start wrapping up your session.',
              duration: 10000,
            });
          }
          
          // Check for end
          if (newValue <= 0 && !endAlertShownRef.current) {
            endAlertShownRef.current = true;
            setStatus('ended');
            playSound('end');
            toast.error('🔔 Session time is up!', {
              description: sessionInfo?.patientName 
                ? `Time to conclude with ${sessionInfo.patientName}`
                : 'Please conclude your session.',
              duration: 15000,
            });
            return 0;
          }
          
          return Math.max(0, newValue);
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, playSound, sessionInfo]);

  const startTimer = useCallback((durationMinutes: number, info?: SessionInfo) => {
    const seconds = durationMinutes * 60;
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    setSelectedDurationState(durationMinutes);
    warningShownRef.current = false;
    endAlertShownRef.current = false;
    setSessionInfo(info || null);
    setStatus('running');
    setIsExpanded(true);
    
    const patientMsg = info?.patientName ? ` for ${info.patientName}` : '';
    toast.success(`Timer started: ${durationMinutes} min${patientMsg}`, {
      description: `You'll get a warning at 5 minutes remaining.`,
    });
  }, []);

  const pauseTimer = useCallback(() => {
    setStatus('paused');
  }, []);

  const resumeTimer = useCallback(() => {
    if (remainingSeconds > WARNING_BEFORE_END) {
      setStatus('running');
    } else if (remainingSeconds > 0) {
      setStatus('warning');
    }
  }, [remainingSeconds]);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    const seconds = selectedDuration * 60;
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    warningShownRef.current = false;
    endAlertShownRef.current = false;
    setSessionInfo(null);
    setStatus('idle');
  }, [selectedDuration]);

  const setSelectedDuration = useCallback((minutes: number) => {
    setSelectedDurationState(minutes);
    if (status === 'idle') {
      setTotalSeconds(minutes * 60);
      setRemainingSeconds(minutes * 60);
    }
  }, [status]);

  const getProgress = useCallback(() => {
    return ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  }, [totalSeconds, remainingSeconds]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return (
    <SessionTimerContext.Provider value={{
      status,
      remainingSeconds,
      totalSeconds,
      selectedDuration,
      soundEnabled,
      isExpanded,
      sessionInfo,
      currentTime,
      startTimer,
      pauseTimer,
      resumeTimer,
      resetTimer,
      setSelectedDuration,
      setSoundEnabled,
      setIsExpanded,
      getProgress,
      formatTime,
    }}>
      {children}
    </SessionTimerContext.Provider>
  );
}

export function useSessionTimer() {
  const context = useContext(SessionTimerContext);
  if (!context) {
    throw new Error('useSessionTimer must be used within a SessionTimerProvider');
  }
  return context;
}

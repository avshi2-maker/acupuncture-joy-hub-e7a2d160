import { useState, useEffect, useRef, useCallback } from 'react';

export type SessionStatus = 'idle' | 'running' | 'paused' | 'ended';

interface SessionState {
  status: SessionStatus;
  duration: number;
  startTime: number | null;
  sessionStartTime: number | null; // When the session originally started
  notes: string;
  patientId: string | null;
  patientName: string | null;
  patientPhone: string | null;
  anxietyConversation: string[];
}

const SESSION_STORAGE_KEY = 'video_session_state';

const getInitialState = (): SessionState => {
  try {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as SessionState;
      // If session was running, calculate elapsed time
      if (parsed.status === 'running' && parsed.startTime) {
        const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000);
        return { ...parsed, duration: parsed.duration + elapsed, startTime: Date.now() };
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load session state:', e);
  }
  return {
    status: 'idle',
    duration: 0,
    startTime: null,
    sessionStartTime: null,
    notes: '',
    patientId: null,
    patientName: null,
    patientPhone: null,
    anxietyConversation: [],
  };
};

export function useSessionPersistence() {
  const [state, setState] = useState<SessionState>(getInitialState);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Timer logic - runs when status is 'running'
  useEffect(() => {
    if (state.status === 'running') {
      timerRef.current = setInterval(() => {
        setState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.status]);

  const startSession = useCallback(() => {
    const now = Date.now();
    setState(prev => ({
      ...prev,
      status: 'running',
      startTime: now,
      sessionStartTime: now,
    }));
  }, []);

  const pauseSession = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'paused',
      startTime: null,
    }));
  }, []);

  const resumeSession = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'running',
      startTime: Date.now(),
    }));
  }, []);

  const endSession = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'ended',
      startTime: null,
    }));
  }, []);

  const resetSession = useCallback(() => {
    setState({
      status: 'idle',
      duration: 0,
      startTime: null,
      sessionStartTime: null,
      notes: '',
      patientId: null,
      patientName: null,
      patientPhone: null,
      anxietyConversation: [],
    });
  }, []);

  // Reset only the duration (for extending Zoom sessions)
  const resetDuration = useCallback(() => {
    setState(prev => ({
      ...prev,
      duration: 0,
      startTime: prev.status === 'running' ? Date.now() : null,
    }));
  }, []);

  const setNotes = useCallback((notes: string) => {
    setState(prev => ({ ...prev, notes }));
  }, []);

  const setPatient = useCallback((patient: { id: string; name: string; phone?: string } | null) => {
    setState(prev => ({
      ...prev,
      patientId: patient?.id || null,
      patientName: patient?.name || null,
      patientPhone: patient?.phone || null,
    }));
  }, []);

  const setAnxietyConversation = useCallback((conversation: string[]) => {
    setState(prev => ({ ...prev, anxietyConversation: conversation }));
  }, []);

  return {
    status: state.status,
    duration: state.duration,
    notes: state.notes,
    patientId: state.patientId,
    patientName: state.patientName,
    patientPhone: state.patientPhone,
    anxietyConversation: state.anxietyConversation,
    sessionStartTime: state.sessionStartTime,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    resetSession,
    resetDuration,
    setNotes,
    setPatient,
    setAnxietyConversation,
  };
}

import { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useSessionSummary, SessionSummaryData, FinalReport, ProtocolPoint, SelectedPulse, PulseChangeRequest } from '@/hooks/useSessionSummary';

/**
 * Global Session Context - Phase 7: Global State Persistence
 * Ensures session data persists across Dashboard, VideoSession, and TcmBrain views
 * 
 * Key feature: If user selects a pulse in VideoSession and returns to Dashboard,
 * the Body Map reflects the same active points.
 */

interface GlobalSessionContextValue {
  // Session Data
  sessionData: SessionSummaryData;
  counts: { pulseCount: number; pointCount: number; contradictionCount: number };
  hasData: boolean;
  canGenerateReport: boolean;
  hasPendingPulseChange: boolean;
  pendingPulseChange: PulseChangeRequest | null;
  
  // Point Actions
  addProtocolPoint: (code: string, source?: 'manual' | 'ai-sparkle' | 'ai-suggestion') => void;
  addSparklePoints: (codes: string[]) => void;
  removeProtocolPoint: (code: string) => void;
  
  // Pulse Actions
  addPulse: (pulseId: string, pulseName: string, chineseName: string, aiReasoning?: string, source?: 'manual' | 'ai-suggestion') => void;
  removePulse: (pulseId: string) => void;
  requestPulseChange: (newPulseId: string, newPulseName: string, newChineseName: string, aiReasoning?: string) => boolean;
  confirmPulseChange: (updateProtocol: boolean) => void;
  cancelPulseChange: () => void;
  
  // Clinical Actions
  addContradiction: (warning: string) => void;
  addNote: (note: string) => void;
  
  // Report Generation
  generateFinalReport: () => FinalReport;
  validateAndGenerateReport: () => FinalReport | null;
  resetSession: () => void;
  
  // UI State
  isSessionActive: boolean;
  activePointCodes: string[];
  activePulseIds: string[];
}

const GlobalSessionContext = createContext<GlobalSessionContextValue | null>(null);

interface GlobalSessionProviderProps {
  children: ReactNode;
}

export function GlobalSessionProvider({ children }: GlobalSessionProviderProps) {
  const sessionSummary = useSessionSummary();
  
  // Derive active point codes for Body Map highlighting
  const activePointCodes = useMemo(() => 
    sessionSummary.sessionData.protocolPoints.map(p => p.code),
    [sessionSummary.sessionData.protocolPoints]
  );
  
  // Derive active pulse IDs
  const activePulseIds = useMemo(() => 
    sessionSummary.sessionData.pulses.map(p => p.pulseId),
    [sessionSummary.sessionData.pulses]
  );
  
  // Check if session is active
  const isSessionActive = useMemo(() => 
    sessionSummary.hasData,
    [sessionSummary.hasData]
  );
  
  const value: GlobalSessionContextValue = {
    ...sessionSummary,
    isSessionActive,
    activePointCodes,
    activePulseIds,
  };
  
  return (
    <GlobalSessionContext.Provider value={value}>
      {children}
    </GlobalSessionContext.Provider>
  );
}

export function useGlobalSession() {
  const context = useContext(GlobalSessionContext);
  if (!context) {
    throw new Error('useGlobalSession must be used within a GlobalSessionProvider');
  }
  return context;
}

// Optional hook that returns null if not in provider (for optional usage)
export function useGlobalSessionOptional() {
  return useContext(GlobalSessionContext);
}

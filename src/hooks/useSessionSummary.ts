import { useState, useCallback, useMemo } from 'react';
import { getPointTechnicalInfo, PointTechnicalInfo } from '@/data/point-technical-data';
import { pulseDiagnosisData, PulseFinding } from '@/data/pulse-diagnosis-data';
import { toast } from 'sonner';

/**
 * Session Summary Hook - Phase 6: Protocol Buffer
 * Tracks all active highlights, pulse selections, and AI suggestions
 * for generating the final clinical report
 * 
 * Phase 6 Edge Cases:
 * - "Change of Heart" Test: Pulse change confirmation
 * - "Empty Data" Safety: Validation before report generation
 * - RTL/LTR handling for Hebrew/English mix
 */

export interface ProtocolPoint {
  code: string;
  source: 'manual' | 'ai-sparkle' | 'ai-suggestion';
  technicalInfo: PointTechnicalInfo | null;
  addedAt: number;
  associatedPulseId?: string; // Track which pulse suggested this point
}

export interface SelectedPulse {
  pulseId: string;
  pulseName: string;
  chineseName: string;
  finding: PulseFinding | null;
  aiReasoning?: string;
  source: 'manual' | 'ai-suggestion';
  addedAt: number;
}

export interface ClinicalContradiction {
  warning: string;
  detectedAt: number;
}

export interface PulseChangeRequest {
  oldPulse: SelectedPulse;
  newPulseId: string;
  newPulseName: string;
  newChineseName: string;
  affectedPoints: string[];
}

export interface SessionSummaryData {
  pulses: SelectedPulse[];
  protocolPoints: ProtocolPoint[];
  contradictions: ClinicalContradiction[];
  sessionStartedAt: number;
  notes: string[];
  pendingPulseChange: PulseChangeRequest | null;
}

export interface FinalReport {
  pulseAnalysis: {
    finding: string;
    chineseName: string;
    tcmPattern: string;
    aiReasoning?: string;
  }[];
  acupunctureProtocol: {
    code: string;
    hebrewName: string;
    depth: string;
    angle: string;
    clinicalAction: string;
  }[];
  clinicalPrecautions: string[];
  hebrewSummary: string;
  generatedAt: string;
}

export function useSessionSummary() {
  const [sessionData, setSessionData] = useState<SessionSummaryData>({
    pulses: [],
    protocolPoints: [],
    contradictions: [],
    sessionStartedAt: Date.now(),
    notes: [],
    pendingPulseChange: null,
  });

  // Add a point to the protocol (from manual selection or AI)
  const addProtocolPoint = useCallback((
    code: string,
    source: 'manual' | 'ai-sparkle' | 'ai-suggestion' = 'manual'
  ) => {
    setSessionData(prev => {
      // Check if point already exists
      if (prev.protocolPoints.some(p => p.code === code)) {
        return prev;
      }

      const technicalInfo = getPointTechnicalInfo(code);
      const newPoint: ProtocolPoint = {
        code,
        source,
        technicalInfo,
        addedAt: Date.now(),
      };

      return {
        ...prev,
        protocolPoints: [...prev.protocolPoints, newPoint],
      };
    });
  }, []);

  // Add multiple points from AI sparkle
  const addSparklePoints = useCallback((codes: string[]) => {
    codes.forEach(code => {
      addProtocolPoint(code, 'ai-sparkle');
    });
  }, [addProtocolPoint]);

  // Remove a point from the protocol
  const removeProtocolPoint = useCallback((code: string) => {
    setSessionData(prev => ({
      ...prev,
      protocolPoints: prev.protocolPoints.filter(p => p.code !== code),
    }));
  }, []);

  // Check if changing pulse would affect existing points
  const checkPulseChange = useCallback((
    newPulseId: string,
    newPulseName: string,
    newChineseName: string
  ): PulseChangeRequest | null => {
    const { pulses, protocolPoints } = sessionData;
    
    if (pulses.length === 0) return null;
    
    const oldPulse = pulses[0]; // Primary pulse
    if (oldPulse.pulseId === newPulseId) return null;
    
    // Find points associated with the old pulse
    const affectedPoints = protocolPoints
      .filter(p => p.associatedPulseId === oldPulse.pulseId || p.source === 'ai-suggestion')
      .map(p => p.code);
    
    if (affectedPoints.length === 0) return null;
    
    return {
      oldPulse,
      newPulseId,
      newPulseName,
      newChineseName,
      affectedPoints,
    };
  }, [sessionData]);

  // Request pulse change (triggers confirmation if needed)
  const requestPulseChange = useCallback((
    newPulseId: string,
    newPulseName: string,
    newChineseName: string,
    aiReasoning?: string
  ): boolean => {
    const changeRequest = checkPulseChange(newPulseId, newPulseName, newChineseName);
    
    if (changeRequest) {
      // Store pending change for confirmation
      setSessionData(prev => ({
        ...prev,
        pendingPulseChange: changeRequest,
      }));
      return false; // Needs confirmation
    }
    
    // No conflict, add directly
    addPulseDirectly(newPulseId, newPulseName, newChineseName, aiReasoning, 'manual');
    return true;
  }, [checkPulseChange]);

  // Confirm pulse change and update protocol
  const confirmPulseChange = useCallback((updateProtocol: boolean) => {
    setSessionData(prev => {
      if (!prev.pendingPulseChange) return prev;
      
      const { oldPulse, newPulseId, newPulseName, newChineseName, affectedPoints } = prev.pendingPulseChange;
      
      let newProtocolPoints = prev.protocolPoints;
      
      if (updateProtocol) {
        // Remove points associated with old pulse
        newProtocolPoints = prev.protocolPoints.filter(
          p => !affectedPoints.includes(p.code)
        );
      }
      
      // Find the new pulse finding
      let finding: PulseFinding | null = null;
      for (const category of pulseDiagnosisData) {
        const found = category.findings.find(f => 
          f.finding.toLowerCase().includes(newPulseName.toLowerCase()) ||
          f.chineseName.includes(newChineseName)
        );
        if (found) {
          finding = found;
          break;
        }
      }
      
      const newPulse: SelectedPulse = {
        pulseId: newPulseId,
        pulseName: newPulseName,
        chineseName: newChineseName,
        finding,
        source: 'manual',
        addedAt: Date.now(),
      };
      
      return {
        ...prev,
        pulses: [newPulse], // Replace with new pulse
        protocolPoints: newProtocolPoints,
        pendingPulseChange: null,
      };
    });
  }, []);

  // Cancel pulse change
  const cancelPulseChange = useCallback(() => {
    setSessionData(prev => ({
      ...prev,
      pendingPulseChange: null,
    }));
  }, []);

  // Add a pulse finding directly (internal use)
  const addPulseDirectly = useCallback((
    pulseId: string,
    pulseName: string,
    chineseName: string,
    aiReasoning?: string,
    source: 'manual' | 'ai-suggestion' = 'manual'
  ) => {
    setSessionData(prev => {
      // Check if pulse already exists
      if (prev.pulses.some(p => p.pulseId === pulseId)) {
        return prev;
      }

      // Find the pulse finding from data
      let finding: PulseFinding | null = null;
      for (const category of pulseDiagnosisData) {
        const found = category.findings.find(f => 
          f.finding.toLowerCase().includes(pulseName.toLowerCase()) ||
          f.chineseName.includes(chineseName)
        );
        if (found) {
          finding = found;
          break;
        }
      }

      const newPulse: SelectedPulse = {
        pulseId,
        pulseName,
        chineseName,
        finding,
        aiReasoning,
        source,
        addedAt: Date.now(),
      };

      return {
        ...prev,
        pulses: [...prev.pulses, newPulse],
      };
    });
  }, []);

  // Public addPulse that checks for conflicts
  const addPulse = useCallback((
    pulseId: string,
    pulseName: string,
    chineseName: string,
    aiReasoning?: string,
    source: 'manual' | 'ai-suggestion' = 'manual'
  ) => {
    // For AI suggestions, add directly without confirmation
    if (source === 'ai-suggestion') {
      addPulseDirectly(pulseId, pulseName, chineseName, aiReasoning, source);
      return;
    }
    
    // For manual selection, check if we need confirmation
    requestPulseChange(pulseId, pulseName, chineseName, aiReasoning);
  }, [addPulseDirectly, requestPulseChange]);

  // Remove a pulse
  const removePulse = useCallback((pulseId: string) => {
    setSessionData(prev => ({
      ...prev,
      pulses: prev.pulses.filter(p => p.pulseId !== pulseId),
    }));
  }, []);

  // Add a contradiction warning
  const addContradiction = useCallback((warning: string) => {
    setSessionData(prev => {
      // Avoid duplicates
      if (prev.contradictions.some(c => c.warning === warning)) {
        return prev;
      }

      return {
        ...prev,
        contradictions: [...prev.contradictions, { warning, detectedAt: Date.now() }],
      };
    });
  }, []);

  // Add a clinical note
  const addNote = useCallback((note: string) => {
    setSessionData(prev => ({
      ...prev,
      notes: [...prev.notes, note],
    }));
  }, []);

  // Generate the final report
  const generateFinalReport = useCallback((): FinalReport => {
    const { pulses, protocolPoints, contradictions, sessionStartedAt } = sessionData;

    // Build pulse analysis
    const pulseAnalysis = pulses.map(pulse => ({
      finding: pulse.finding?.finding || pulse.pulseName,
      chineseName: pulse.chineseName,
      tcmPattern: pulse.finding?.tcmPattern || 'לא זוהה דפוס',
      aiReasoning: pulse.aiReasoning,
    }));

    // Build acupuncture protocol
    const acupunctureProtocol = protocolPoints.map(point => ({
      code: point.code,
      hebrewName: point.technicalInfo?.hebrewName || point.code,
      depth: point.technicalInfo 
        ? `${point.technicalInfo.depth.min}-${point.technicalInfo.depth.max} ${point.technicalInfo.depth.unit}`
        : 'N/A',
      angle: point.technicalInfo?.angleHebrew || 'N/A',
      clinicalAction: point.technicalInfo?.clinicalActionHebrew || '',
    }));

    // Clinical precautions
    const clinicalPrecautions = contradictions.map(c => c.warning);

    // Add contraindications from points
    protocolPoints.forEach(point => {
      if (point.technicalInfo?.contraindications) {
        point.technicalInfo.contraindications.forEach(ci => {
          if (!clinicalPrecautions.includes(ci)) {
            clinicalPrecautions.push(`⚠️ ${point.code}: ${ci}`);
          }
        });
      }
    });

    // Generate Hebrew summary
    const hebrewSummary = generateHebrewSummary(pulseAnalysis, acupunctureProtocol, clinicalPrecautions);

    return {
      pulseAnalysis,
      acupunctureProtocol,
      clinicalPrecautions,
      hebrewSummary,
      generatedAt: new Date().toISOString(),
    };
  }, [sessionData]);

  // Get counts for UI display
  const counts = useMemo(() => ({
    pulseCount: sessionData.pulses.length,
    pointCount: sessionData.protocolPoints.length,
    contradictionCount: sessionData.contradictions.length,
  }), [sessionData]);

  // Check if session has data
  const hasData = useMemo(() => 
    sessionData.pulses.length > 0 || sessionData.protocolPoints.length > 0,
    [sessionData]
  );

  // Validate before report generation (Phase 6: Empty Data Safety)
  const canGenerateReport = useMemo(() => {
    return sessionData.pulses.length > 0 || sessionData.protocolPoints.length > 0;
  }, [sessionData]);

  // Show validation error if trying to generate empty report
  const validateAndGenerateReport = useCallback((): FinalReport | null => {
    if (!canGenerateReport) {
      toast.error('נא להזין אבחנת דופק כדי להפיק סיכום טיפול', {
        description: 'יש לבחור לפחות דופק אחד או נקודת דיקור אחת',
      });
      return null;
    }
    return generateFinalReport();
  }, [canGenerateReport, generateFinalReport]);

  // Check if there's a pending pulse change
  const hasPendingPulseChange = useMemo(() => 
    sessionData.pendingPulseChange !== null,
    [sessionData]
  );

  // Reset session
  const resetSession = useCallback(() => {
    setSessionData({
      pulses: [],
      protocolPoints: [],
      contradictions: [],
      sessionStartedAt: Date.now(),
      notes: [],
      pendingPulseChange: null,
    });
  }, []);

  return {
    sessionData,
    counts,
    hasData,
    canGenerateReport,
    hasPendingPulseChange,
    pendingPulseChange: sessionData.pendingPulseChange,
    addProtocolPoint,
    addSparklePoints,
    removeProtocolPoint,
    addPulse,
    removePulse,
    requestPulseChange,
    confirmPulseChange,
    cancelPulseChange,
    addContradiction,
    addNote,
    generateFinalReport,
    validateAndGenerateReport,
    resetSession,
  };
}

// Helper function to generate Hebrew clinical summary
function generateHebrewSummary(
  pulseAnalysis: { finding: string; chineseName: string; tcmPattern: string; aiReasoning?: string }[],
  acupunctureProtocol: { code: string; hebrewName: string; depth: string; angle: string; clinicalAction: string }[],
  clinicalPrecautions: string[]
): string {
  const lines: string[] = [];
  
  lines.push('📋 סיכום טיפול קליני');
  lines.push('═══════════════════════');
  lines.push('');

  // Pulse section
  if (pulseAnalysis.length > 0) {
    lines.push('🩺 ממצאי דופק:');
    pulseAnalysis.forEach(pulse => {
      lines.push(`• ${pulse.finding} (${pulse.chineseName})`);
      lines.push(`  דפוס: ${pulse.tcmPattern}`);
      if (pulse.aiReasoning) {
        lines.push(`  נימוק: ${pulse.aiReasoning}`);
      }
    });
    lines.push('');
  }

  // Protocol section
  if (acupunctureProtocol.length > 0) {
    lines.push('📍 פרוטוקול דיקור:');
    acupunctureProtocol.forEach(point => {
      lines.push(`• ${point.code} - ${point.hebrewName}`);
      lines.push(`  עומק: ${point.depth} | זווית: ${point.angle}`);
      if (point.clinicalAction) {
        lines.push(`  פעולה: ${point.clinicalAction}`);
      }
    });
    lines.push('');
  }

  // Precautions section
  if (clinicalPrecautions.length > 0) {
    lines.push('⚠️ אזהרות קליניות:');
    clinicalPrecautions.forEach(warning => {
      lines.push(`• ${warning}`);
    });
    lines.push('');
  }

  lines.push('═══════════════════════');
  lines.push(`נוצר: ${new Date().toLocaleDateString('he-IL')} ${new Date().toLocaleTimeString('he-IL')}`);

  return lines.join('\n');
}

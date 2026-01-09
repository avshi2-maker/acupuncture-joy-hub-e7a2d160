import { useState, useCallback, useRef, useEffect } from 'react';
import { SessionPhase } from '@/components/session/SessionPhaseIndicator';
import { toast } from 'sonner';

interface UseAIContextEngineOptions {
  enabled?: boolean;
  phase: SessionPhase;
  patientName?: string | null;
  keywords?: string[];
  intervalMs?: number; // How often to call AI (default 30s)
  onSummaryUpdate?: (summary: string) => void;
  onFinalReport?: (report: string) => void;
}

const SUMMARIZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/session-ai-summarize`;

// TCM Report structure for closing phase
const CLOSING_REPORT_PROMPT = `
בהתבסס על כל התמלול המצטבר, צור דוח TCM מובנה בעברית:

## דוח סיום טיפול

### תלונה עיקרית
[תמצית התלונה]

### ממצאי אבחון
- דופק: [תיאור]
- לשון: [תיאור]
- תסמונת TCM: [זיהוי]

### פרוטוקול טיפול
- נקודות שנבחרו: [רשימה]
- טכניקות: [דיקור/מוקסה/כוסות]

### המלצות להמשך
- [המלצה 1]
- [המלצה 2]
- תאריך מעקב מומלץ: [המלצה]
`;

export function useAIContextEngine(
  getRollingWindowText: () => string,
  getFullTranscript?: () => string,
  options?: UseAIContextEngineOptions
) {
  const {
    enabled = false,
    phase = 'opening',
    patientName,
    keywords = [],
    intervalMs = 30000, // 30 seconds default
    onSummaryUpdate,
    onFinalReport,
  } = options || {};

  const [summary, setSummary] = useState('');
  const [finalReport, setFinalReport] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef<string>('');
  const lastPhaseRef = useRef<SessionPhase>(phase);
  const hasGeneratedClosingReportRef = useRef(false);

  // Stream AI summary with token-by-token rendering
  const streamSummary = useCallback(async (isClosingReport = false) => {
    const transcript = isClosingReport && getFullTranscript 
      ? getFullTranscript() 
      : getRollingWindowText();
    
    // Skip if no new content or same as last (unless closing report)
    if (!isClosingReport && (!transcript.trim() || transcript === lastTranscriptRef.current)) {
      return;
    }
    
    if (!isClosingReport) {
      lastTranscriptRef.current = transcript;
    }
    
    if (isClosingReport) {
      setIsGeneratingReport(true);
    } else {
      setIsProcessing(true);
    }
    setError(null);

    try {
      const response = await fetch(SUMMARIZE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          transcript: isClosingReport 
            ? `${CLOSING_REPORT_PROMPT}\n\n--- תמלול מלא ---\n${transcript}`
            : transcript,
          phase: isClosingReport ? 'closing' : phase,
          patientName,
          keywords,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Will retry later.');
        }
        if (response.status === 402) {
          throw new Error('Credits exhausted. Please add funds.');
        }
        throw new Error(`AI request failed: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let currentContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        // Process line-by-line for SSE
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              currentContent += content;
              if (isClosingReport) {
                setFinalReport(currentContent);
                onFinalReport?.(currentContent);
              } else {
                setSummary(currentContent);
                onSummaryUpdate?.(currentContent);
              }
            }
          } catch {
            // Incomplete JSON, put back and wait for more
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw || raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              currentContent += content;
              if (isClosingReport) {
                setFinalReport(currentContent);
                onFinalReport?.(currentContent);
              } else {
                setSummary(currentContent);
                onSummaryUpdate?.(currentContent);
              }
            }
          } catch { /* ignore */ }
        }
      }

      if (isClosingReport) {
        console.log('[AI Context Engine] Final report generated:', currentContent.slice(0, 100));
        toast.success('📋 דוח סיום הטיפול נוצר בהצלחה');
      } else {
        console.log('[AI Context Engine] Summary updated:', currentContent.slice(0, 100));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI summarization failed';
      setError(message);
      console.error('[AI Context Engine] Error:', err);
      toast.error(`שגיאת AI: ${message}`);
    } finally {
      if (isClosingReport) {
        setIsGeneratingReport(false);
      } else {
        setIsProcessing(false);
      }
    }
  }, [getRollingWindowText, getFullTranscript, phase, patientName, keywords, onSummaryUpdate, onFinalReport]);

  // Handle phase change to "closing" - generate final report
  useEffect(() => {
    if (phase === 'closing' && lastPhaseRef.current !== 'closing' && !hasGeneratedClosingReportRef.current && enabled) {
      hasGeneratedClosingReportRef.current = true;
      console.log('[AI Context Engine] Closing phase detected - generating final report');
      toast.info('🧠 מכין דוח סיום טיפול...', { duration: 3000 });
      streamSummary(true); // Generate closing report with full transcript
    }
    lastPhaseRef.current = phase;
  }, [phase, enabled, streamSummary]);

  // Start/stop interval based on enabled state
  useEffect(() => {
    if (enabled && phase !== 'closing') {
      // Initial call after a short delay
      const initialTimeout = setTimeout(() => {
        streamSummary(false);
      }, 5000);

      // Set up interval
      intervalRef.current = setInterval(() => {
        streamSummary(false);
      }, intervalMs);

      return () => {
        clearTimeout(initialTimeout);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [enabled, intervalMs, streamSummary, phase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Manual trigger
  const triggerSummary = useCallback(() => {
    streamSummary(false);
  }, [streamSummary]);

  // Generate final report manually
  const generateFinalReport = useCallback(() => {
    streamSummary(true);
  }, [streamSummary]);

  // Clear summary
  const clearSummary = useCallback(() => {
    setSummary('');
    setFinalReport('');
    lastTranscriptRef.current = '';
    hasGeneratedClosingReportRef.current = false;
  }, []);

  return {
    summary,
    finalReport,
    isProcessing,
    isGeneratingReport,
    error,
    triggerSummary,
    generateFinalReport,
    clearSummary,
  };
}

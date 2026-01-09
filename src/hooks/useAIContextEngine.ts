import { useState, useCallback, useRef, useEffect } from 'react';
import { SessionPhase } from '@/components/session/SessionPhaseIndicator';

interface UseAIContextEngineOptions {
  enabled?: boolean;
  phase: SessionPhase;
  patientName?: string | null;
  keywords?: string[];
  intervalMs?: number; // How often to call AI (default 30s)
  onSummaryUpdate?: (summary: string) => void;
}

const SUMMARIZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/session-ai-summarize`;

export function useAIContextEngine(
  getRollingWindowText: () => string,
  options: UseAIContextEngineOptions
) {
  const {
    enabled = false,
    phase,
    patientName,
    keywords = [],
    intervalMs = 30000, // 30 seconds default
    onSummaryUpdate,
  } = options;

  const [summary, setSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef<string>('');

  // Stream AI summary with token-by-token rendering
  const streamSummary = useCallback(async () => {
    const transcript = getRollingWindowText();
    
    // Skip if no new content or same as last
    if (!transcript.trim() || transcript === lastTranscriptRef.current) {
      return;
    }
    
    lastTranscriptRef.current = transcript;
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(SUMMARIZE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          transcript,
          phase,
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
      let currentSummary = '';

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
              currentSummary += content;
              setSummary(currentSummary);
              onSummaryUpdate?.(currentSummary);
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
              currentSummary += content;
              setSummary(currentSummary);
              onSummaryUpdate?.(currentSummary);
            }
          } catch { /* ignore */ }
        }
      }

      console.log('[AI Context Engine] Summary updated:', currentSummary.slice(0, 100));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI summarization failed';
      setError(message);
      console.error('[AI Context Engine] Error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [getRollingWindowText, phase, patientName, keywords, onSummaryUpdate]);

  // Start/stop interval based on enabled state
  useEffect(() => {
    if (enabled) {
      // Initial call after a short delay
      const initialTimeout = setTimeout(() => {
        streamSummary();
      }, 5000);

      // Set up interval
      intervalRef.current = setInterval(() => {
        streamSummary();
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
  }, [enabled, intervalMs, streamSummary]);

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
    streamSummary();
  }, [streamSummary]);

  // Clear summary
  const clearSummary = useCallback(() => {
    setSummary('');
    lastTranscriptRef.current = '';
  }, []);

  return {
    summary,
    isProcessing,
    error,
    triggerSummary,
    clearSummary,
  };
}

import { useState, useCallback } from 'react';
import { PromptMapping } from '@/data/tcm-prompt-mapping';

export interface SessionMetrics {
  tokensUsed: number;
  timeMs: number;
  totalCost: number;
}

const COST_PER_1K_TOKENS = 0.0001; // Gemini Flash 1.5 rate

export const useClinicalSession = () => {
  const [stackedQueries, setStackedQueries] = useState<PromptMapping[]>([]);
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics>({
    tokensUsed: 0,
    timeMs: 0,
    totalCost: 0
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const addToStack = useCallback((mapping: PromptMapping) => {
    setStackedQueries(prev => {
      // Prevent duplicates
      if (prev.find(m => m.id === mapping.id)) {
        return prev;
      }
      return [...prev, mapping];
    });
  }, []);

  const removeFromStack = useCallback((mappingId: string) => {
    setStackedQueries(prev => prev.filter(m => m.id !== mappingId));
  }, []);

  const isInStack = useCallback((mappingId: string) => {
    return stackedQueries.some(m => m.id === mappingId);
  }, [stackedQueries]);

  const clearStack = useCallback(() => {
    setStackedQueries([]);
  }, []);

  const buildCombinedPrompt = useCallback((): string => {
    if (stackedQueries.length === 0) return '';

    // Use fullAiPrompt for direct context injection - NO RAG search needed
    const directContexts = stackedQueries
      .map((q, i) => `[${i + 1}] ${q.hebrewLabel}\n${q.fullAiPrompt}`)
      .join('\n\n---\n\n');

    // Build optimized single-call prompt
    return `SYSTEM: You are a TCM Clinical Assistant. IMPORTANT: Use ONLY the provided clinical context below. Do NOT search or scan external data.

=== DIRECT CLINICAL CONTEXT (Pre-indexed) ===
${directContexts}

=== OUTPUT INSTRUCTIONS ===
Provide a UNIFIED Treatment Plan:
1. Combined Diagnosis (synthesize all patterns)
2. Primary Points (deduplicated, max 8-10)
3. Herbal Formula (single integrated prescription)
4. Clinical Notes (brief, actionable)

Format: Concise bullet points. No lengthy explanations.`;
  }, [stackedQueries]);

  const updateMetrics = useCallback((tokensUsed: number, timeMs: number) => {
    setSessionMetrics(prev => {
      const newTotalTokens = prev.tokensUsed + tokensUsed;
      return {
        tokensUsed: newTotalTokens,
        timeMs: timeMs,
        totalCost: (newTotalTokens / 1000) * COST_PER_1K_TOKENS
      };
    });
  }, []);

  const resetMetrics = useCallback(() => {
    setSessionMetrics({
      tokensUsed: 0,
      timeMs: 0,
      totalCost: 0
    });
  }, []);

  return {
    stackedQueries,
    addToStack,
    removeFromStack,
    isInStack,
    clearStack,
    buildCombinedPrompt,
    sessionMetrics,
    updateMetrics,
    resetMetrics,
    isAnalyzing,
    setIsAnalyzing,
    stackCount: stackedQueries.length
  };
};

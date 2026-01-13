import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Synonym dictionary for acupuncture point name resolution
const POINT_SYNONYMS: Record<string, string> = {
  'hegu': 'LI4', 'li 4': 'LI4', 'union valley': 'LI4', 'he gu': 'LI4',
  'zusanli': 'ST36', 'st 36': 'ST36', 'zu san li': 'ST36', 'leg three miles': 'ST36',
  'sanyinjiao': 'SP6', 'sp 6': 'SP6', 'san yin jiao': 'SP6', 'three yin intersection': 'SP6',
  'taichong': 'LR3', 'liv 3': 'LR3', 'lr 3': 'LR3', 'tai chong': 'LR3', 'great surge': 'LR3',
  'quchi': 'LI11', 'li 11': 'LI11', 'qu chi': 'LI11', 'pool at the bend': 'LI11',
  'neiguan': 'PC6', 'pc 6': 'PC6', 'nei guan': 'PC6', 'inner gate': 'PC6',
  'baihui': 'GV20', 'gv 20': 'GV20', 'bai hui': 'GV20', 'hundred meetings': 'GV20',
  'yintang': 'EX-HN3', 'ex-hn3': 'EX-HN3', 'yin tang': 'EX-HN3', 'hall of impression': 'EX-HN3',
  'fengchi': 'GB20', 'gb 20': 'GB20', 'feng chi': 'GB20', 'wind pool': 'GB20',
  'hegu point': 'LI4', 'large intestine 4': 'LI4', 'stomach 36': 'ST36', 'spleen 6': 'SP6',
  'liver 3': 'LR3', 'pericardium 6': 'PC6', 'governing vessel 20': 'GV20', 'gallbladder 20': 'GB20'
};

/**
 * Enhanced point reference parser with synonym support
 * Matches standard codes (LI4, ST36) AND common names (Hegu, Zusanli)
 */
function parsePointReferences(text: string): string[] {
  const foundPoints: string[] = [];
  const lowerText = text.toLowerCase();
  
  // First: Check synonyms for common names
  for (const [synonym, code] of Object.entries(POINT_SYNONYMS)) {
    if (lowerText.includes(synonym) && !foundPoints.includes(code)) {
      foundPoints.push(code);
    }
  }
  
  // Second: Regex for standard point codes (LI4, ST36, GB20, etc.)
  const codePattern = /\b(L[IU]|ST|SP|HT|SI|BL|KI|PC|TE|GB|LR|GV|CV|EX-[A-Z]{2})\s*-?\s*(\d{1,2})\b/gi;
  let match: RegExpExecArray | null;
  
  while ((match = codePattern.exec(text)) !== null) {
    const meridian = match[1].toUpperCase().replace(/\s+/g, '');
    const number = match[2];
    const normalizedCode = `${meridian}${number}`;
    
    if (!foundPoints.includes(normalizedCode)) {
      foundPoints.push(normalizedCode);
    }
  }
  
  console.log('[parsePointReferences] Input text sample:', text.substring(0, 200));
  console.log('[parsePointReferences] Final Highlighted Points:', foundPoints);
  
  return foundPoints;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChunkDebugInfo {
  index: number;
  sourceName: string;
  ferrariScore: number;
  keywordScore: number;
  questionBoost: boolean;
  included: boolean;
  reason: string;
}

export interface DebugMetadata {
  tokenBudget: {
    used: number;
    max: number;
    percentage: number;
  };
  chunks: {
    found: number;
    included: number;
    dropped: number;
    budgetReached: boolean;
  };
  topChunks: ChunkDebugInfo[];
  thresholds: {
    clinicalStandard: number;
    minHighConfidence: number;
  };
}

export interface RagChatOptions {
  patientId?: string;
  patientName?: string;
  sessionNotes?: string;
  includePatientHistory?: boolean;
}

export interface UseRagChatReturn {
  messages: Message[];
  isLoading: boolean;
  debugData: DebugMetadata | null;
  searchMethod: string;
  highlightedPoints: string[];
  lastAIResponse: string;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

/**
 * Unified RAG Chat Hook
 * Both TcmBrainPanel (Video) and TcmBrain (Standard) MUST use this hook
 * to ensure algorithm parity (Token Budget + Ferrari Score + Question Boost)
 */
export function useRagChat(options: RagChatOptions = {}): UseRagChatReturn {
  const { patientId, patientName, sessionNotes, includePatientHistory } = options;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debugData, setDebugData] = useState<DebugMetadata | null>(null);
  const [searchMethod, setSearchMethod] = useState<string>('');

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    const trimmedMessage = userMessage.trim();
    setMessages(prev => [...prev, { role: 'user', content: trimmedMessage }]);
    setIsLoading(true);

    try {
      // Build context prefix for patient context
      let contextPrefix = '';
      if (patientName) {
        contextPrefix = `Patient: ${patientName}. `;
      }
      if (sessionNotes) {
        contextPrefix += `Session notes: ${sessionNotes.slice(0, 500)}... `;
      }

      const { data, error } = await supabase.functions.invoke('tcm-rag-chat', {
        body: { 
          message: contextPrefix + trimmedMessage,
          patientId,
          includePatientHistory: includePatientHistory ?? !!patientId
        }
      });

      if (error) throw error;

      const assistantMessage = data?.response || data?.message || 'No response received';
      
      // Extract debug metadata if available (from unified algorithm)
      if (data?.debug) {
        setDebugData(data.debug);
        setSearchMethod(data.searchMethod || 'hybrid');
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error: any) {
      console.error('[useRagChat] Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, patientId, patientName, sessionNotes, includePatientHistory]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setDebugData(null);
    setSearchMethod('');
  }, []);

  // Extract highlighted points from the last assistant message
  const { highlightedPoints, lastAIResponse } = useMemo(() => {
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
    if (lastAssistantMsg) {
      const points = parsePointReferences(lastAssistantMsg.content);
      return { highlightedPoints: points, lastAIResponse: lastAssistantMsg.content };
    }
    return { highlightedPoints: [], lastAIResponse: '' };
  }, [messages]);

  return {
    messages,
    isLoading,
    debugData,
    searchMethod,
    highlightedPoints,
    lastAIResponse,
    sendMessage,
    clearMessages,
    setMessages,
  };
}

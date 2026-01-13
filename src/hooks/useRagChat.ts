import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * HARDCODED DICTIONARY - "The Rulebook"
 * Maps keywords (symptoms, pinyin names, partial codes) to standardized point codes.
 */
const POINT_RULES: Record<string, string> = {
  // Pinyin Names
  'hegu': 'LI4',
  'union valley': 'LI4',
  'zusanli': 'ST36',
  'zu san li': 'ST36',
  'leg three miles': 'ST36',
  'sanyinjiao': 'SP6',
  'san yin jiao': 'SP6',
  'three yin intersection': 'SP6',
  'taichong': 'LR3',
  'tai chong': 'LR3',
  'great surge': 'LR3',
  'quchi': 'LI11',
  'qu chi': 'LI11',
  'pool at the bend': 'LI11',
  'neiguan': 'PC6',
  'nei guan': 'PC6',
  'inner gate': 'PC6',
  'baihui': 'GV20',
  'bai hui': 'GV20',
  'hundred meetings': 'GV20',
  'yintang': 'EX-HN3',
  'yin tang': 'EX-HN3',
  'hall of impression': 'EX-HN3',
  'fengchi': 'GB20',
  'feng chi': 'GB20',
  'wind pool': 'GB20',
  
  // Symptom-based mappings
  'tongue': 'HT7',
  'migraine': 'GB20',
  'headache': 'LI4',
  'insomnia': 'HT7',
  'anxiety': 'PC6',
  'nausea': 'PC6',
  'back pain': 'BL40',
  'lower back': 'BL23',
  'knee pain': 'ST35',
  'shoulder pain': 'LI15',
  'neck pain': 'GB20',
  'stress': 'LR3',
  'fatigue': 'ST36',
  'digestion': 'ST36',
  'menstrual': 'SP6',
  
  // Partial code matches
  'li 4': 'LI4',
  'st 36': 'ST36',
  'sp 6': 'SP6',
  'pc 6': 'PC6',
  'gb 20': 'GB20',
  'lr 3': 'LR3',
  'ht 7': 'HT7',
  'gv 20': 'GV20',
  'bl 40': 'BL40',
  'bl 23': 'BL23',
};

/**
 * HARDCODED parsePointReferences
 * 1. Check dictionary first (symptoms + pinyin names)
 * 2. Run regex for standard codes (LI4, ST-36, etc.)
 * 3. Return deduplicated array
 */
function parsePointReferences(text: string): string[] {
  const foundPoints: string[] = [];
  const lowerText = text.toLowerCase();

  // 1. Check Dictionary First (The "Rulebook")
  Object.keys(POINT_RULES).forEach((key) => {
    if (lowerText.includes(key) && !foundPoints.includes(POINT_RULES[key])) {
      foundPoints.push(POINT_RULES[key]);
    }
  });

  // 2. Run Regex for Standard Codes (e.g., "LI-4", "ST 36", "GB20")
  const regex = /\b(LI|ST|SP|HT|SI|BL|KI|PC|TE|GB|LR|GV|CV|EX-[A-Z]{2})\s?-?\s?(\d{1,3})\b/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const normalizedCode = `${match[1].toUpperCase()}${match[2]}`;
    if (!foundPoints.includes(normalizedCode)) {
      foundPoints.push(normalizedCode);
    }
  }

  console.log('🔮 VISUAL DEBUG:', { text: lowerText.substring(0, 100), found: foundPoints });
  
  // Return deduplicated array
  return Array.from(new Set(foundPoints));
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

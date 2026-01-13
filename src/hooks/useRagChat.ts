import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  return {
    messages,
    isLoading,
    debugData,
    searchMethod,
    sendMessage,
    clearMessages,
    setMessages,
  };
}

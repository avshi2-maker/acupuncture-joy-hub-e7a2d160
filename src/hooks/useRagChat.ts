import { useState, useCallback } from "react";

// Message type for chat interface
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Chunk debug info matching DebugMetricsPanel expectations
interface ChunkDebugInfo {
  index: number;
  sourceName: string;
  sourceId?: string;
  ferrariScore: number;
  keywordScore: number;
  questionBoost: boolean;
  included: boolean;
  reason: string;
}

// Debug data for metrics panel - matches DebugMetadata in DebugMetricsPanel
export interface RagDebugData {
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

// Hook options
interface UseRagChatOptions {
  patientId?: string;
  patientName?: string;
  sessionNotes?: string;
  includePatientHistory?: boolean;
}

// 1. THE HARDCODED RULEBOOK
// This maps loose terms to specific Acupuncture Point Codes
const POINT_RULES: Record<string, string> = {
  // English Names & Pinyin
  'hegu': 'LI4', 'union valley': 'LI4', 'li 4': 'LI4', 'li-4': 'LI4',
  'zusanli': 'ST36', 'st 36': 'ST36', 'leg three miles': 'ST36',
  'sanyinjiao': 'SP6', 'sp 6': 'SP6',
  'neiguan': 'PC6', 'pc 6': 'PC6', 'inner pass': 'PC6',
  'taichong': 'LR3', 'lr 3': 'LR3', 'great surge': 'LR3',
  'baihui': 'GV20', 'gv 20': 'GV20',
  'shenmen': 'HT7', 'ht 7': 'HT7', 'spirit gate': 'HT7',

  // Symptoms -> Primary Point Mapping
  'tongue': 'HT7',      // Heart opens to tongue
  'pulse': 'LU9',       // Pulse gathering point
  'headache': 'LI4',    // Face/Head command point
  'migraine': 'GB20',   // Wind pool (Shaoyang)
  'nausea': 'PC6',      // Vomiting/Stomach
  'back pain': 'BL40',  // Command point for back
  'sciatica': 'GB30',   // Hip/Sciatica
  'insomnia': 'HT7',    // Calm Spirit
  'anxiety': 'Yintang', // Calm Mind
  'fever': 'GV14',      // Clear Heat
  'cough': 'LU7'        // Command point for neck/lungs
};

export const useRagChat = (options?: UseRagChatOptions) => {
  const [highlightedPoints, setHighlightedPoints] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAIResponse, setLastAIResponse] = useState<string>('');
  const [debugData, setDebugData] = useState<RagDebugData | null>(null);
  const [searchMethod, setSearchMethod] = useState<string>('hybrid');

  // 2. THE PARSER FUNCTION
  const parsePointReferences = useCallback((text: string) => {
    if (!text) return [];
    
    const lowerText = text.toLowerCase();
    const found = new Set<string>();

    // A. Check Dictionary Rules First
    Object.entries(POINT_RULES).forEach(([keyword, code]) => {
      if (lowerText.includes(keyword)) {
        found.add(code);
      }
    });

    // B. Check Regex for Standard Codes (LI 4, ST-36)
    const regex = /\b(LI|ST|SP|HT|SI|BL|KI|PC|TE|GB|LR|GV|CV|LU)\s?-?\s?(\d{1,3})\b/gi;
    let match;
    while ((match = regex.exec(text)) !== null) {
      // Normalize to 'LI4' format (Uppercase + Number)
      found.add(`${match[1].toUpperCase()}${match[2]}`);
    }

    const resultArray = Array.from(found);
    console.log("🔮 TCM BRAIN PARSE:", { text: lowerText.substring(0, 50), found: resultArray });
    
    setHighlightedPoints(resultArray);
    return resultArray;
  }, []);

  // 3. SEND MESSAGE FUNCTION
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: ChatMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Parse points from user query
      parsePointReferences(message);

      // TODO: Integrate with actual RAG backend
      // For now, simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResponse = `Based on your query about "${message.substring(0, 50)}...", here are some relevant TCM insights:

For this condition, consider the following acupuncture points:
- **LI4 (Hegu)** - Command point for face and head
- **ST36 (Zusanli)** - Tonifies Qi and Blood
- **SP6 (Sanyinjiao)** - Nourishes Yin, calms the mind

These points can be combined for a synergistic effect.`;

      const assistantMessage: ChatMessage = { role: 'assistant', content: mockResponse };
      setMessages(prev => [...prev, assistantMessage]);
      setLastAIResponse(mockResponse);

      // Parse points from AI response
      parsePointReferences(mockResponse);

      // Update debug data - matches DebugMetadata interface
      setDebugData({
        tokenBudget: {
          used: 150,
          max: 4000,
          percentage: 3.75
        },
        chunks: {
          found: 5,
          included: 3,
          dropped: 2,
          budgetReached: false
        },
        topChunks: [
          { index: 0, sourceName: 'TCM Points DB', ferrariScore: 0.92, keywordScore: 0.85, questionBoost: true, included: true, reason: 'High relevance' },
          { index: 1, sourceName: 'Clinical Patterns', ferrariScore: 0.88, keywordScore: 0.72, questionBoost: false, included: true, reason: 'Pattern match' },
          { index: 2, sourceName: 'Herbs Reference', ferrariScore: 0.75, keywordScore: 0.68, questionBoost: false, included: true, reason: 'Keyword match' }
        ],
        thresholds: {
          clinicalStandard: 0.7,
          minHighConfidence: 0.85
        }
      });

    } catch (error) {
      console.error('RAG Chat Error:', error);
      const errorMessage: ChatMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request. Please try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [parsePointReferences]);

  // 4. CLEAR MESSAGES
  const clearMessages = useCallback(() => {
    setMessages([]);
    setHighlightedPoints([]);
    setLastAIResponse('');
    setDebugData(null);
  }, []);

  return {
    // Core chat functionality
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    
    // Body map integration
    highlightedPoints,
    parsePointReferences,
    
    // AI response tracking
    lastAIResponse,
    
    // Debug/metrics
    debugData,
    searchMethod,
  };
};

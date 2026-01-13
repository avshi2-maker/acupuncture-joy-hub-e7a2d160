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

// 1. THE EXPANDED SYMPTOM DICTIONARY (50+ clinical keywords)
const POINT_RULES: Record<string, string> = {
  // --- 1. CORE COMMAND POINTS (The Big Shots) ---
  'hegu': 'LI4', 'union valley': 'LI4', 'li 4': 'LI4', 'li4': 'LI4',
  'zusanli': 'ST36', 'leg three miles': 'ST36', 'st 36': 'ST36', 'st36': 'ST36',
  'sanyinjiao': 'SP6', 'sp 6': 'SP6', 'sp6': 'SP6',
  'taichong': 'LR3', 'great surge': 'LR3', 'lr 3': 'LR3', 'lr3': 'LR3',
  'neiguan': 'PC6', 'inner pass': 'PC6', 'pc 6': 'PC6', 'pc6': 'PC6',
  'shenmen': 'HT7', 'spirit gate': 'HT7', 'ht 7': 'HT7', 'ht7': 'HT7',
  'baihui': 'GV20', 'hundred meetings': 'GV20', 'gv 20': 'GV20',
  'yintang': 'Yintang', 'hall of impression': 'Yintang',

  // --- 2. PAIN & ORTHOPEDICS ---
  'headache': 'LI4', 'migraine': 'GB20', 'neck pain': 'GB20', 'stiff neck': 'LU7',
  'back pain': 'BL40', 'lower back': 'BL23', 'lumbar': 'BL23', 'sciatica': 'GB30',
  'knee pain': 'ST35', 'knee': 'GB34', 'leg pain': 'GB31',
  'shoulder pain': 'LI15', 'frozen shoulder': 'ST38',
  'elbow pain': 'LI11', 'tennis elbow': 'LI11',
  'wrist pain': 'SJ4', 'carpal tunnel': 'PC7',
  'hip pain': 'GB30',
  'toothache': 'ST44', 'jaw pain': 'ST6',

  // --- 3. DIGESTION & METABOLISM ---
  'stomach pain': 'ST36', 'gastritis': 'PC6', 'bloating': 'ST25',
  'nausea': 'PC6', 'vomiting': 'PC6', 'acid reflux': 'CV12',
  'constipation': 'ST25', 'diarrhea': 'ST36',
  'weight loss': 'SP6', 'obesity': 'ST40', 'phlegm': 'ST40',

  // --- 4. EMOTIONAL & MENTAL ---
  'anxiety': 'Yintang', 'stress': 'LR3', 'depression': 'LR3',
  'insomnia': 'HT7', 'sleep': 'Anmian', 'dream disturbed': 'BL15',
  'anger': 'LR2', 'grief': 'LU7', 'fear': 'KI3', 'panic': 'HT7',
  'memory': 'GV20', 'foggy mind': 'ST40',

  // --- 5. RESPIRATORY & IMMUNE ---
  'cold': 'GB20', 'flu': 'LI4', 'fever': 'GV14', 'sore throat': 'LU11',
  'cough': 'LU7', 'asthma': 'LU9', 'short breath': 'CV17',
  'immunity': 'ST36', 'allergies': 'LI20', 'sinus': 'LI20',

  // --- 6. WOMEN'S HEALTH & HORMONES ---
  'menstrual': 'SP6', 'cramps': 'SP6', 'pms': 'LR3',
  'fertility': 'CV4', 'hot flash': 'KI6', 'menopause': 'SP6',

  // --- 7. SPECIAL AREAS ---
  'tongue': 'Tongue_Tip', 'pulse': 'LU9', 'ear': 'Ear_Shenmen',
  'face': 'LI4', 'eye': 'BL1', 'vision': 'GB37',
  'tinnitus': 'SJ3', 'dizziness': 'GV20', 'vertigo': 'PC6'
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

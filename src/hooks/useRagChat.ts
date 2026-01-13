import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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

// 1. THE EXPANDED SYMPTOM DICTIONARY (70+ clinical keywords + Hebrew)
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
  'tinnitus': 'SJ3', 'dizziness': 'GV20', 'vertigo': 'PC6',

  // --- 🇮🇱 HEBREW / RTL MAPPINGS ---
  // Pain & General
  'כאב': 'LI4', 'כאבים': 'LI4',
  'כאב ראש': 'LI4', 'מיגרנה': 'GB20',
  'כאב גב': 'BL40', 'גב תחתון': 'BL23', 'סיאטיקה': 'GB30',
  'כאב בטן': 'ST36', 'קיבה': 'ST36',
  'כאב ברכיים': 'ST35', 'ברך': 'ST35',
  'צוואר': 'GB20', 'כתף': 'LI15',

  // Digestive
  'בחילה': 'PC6', 'הקאות': 'PC6',
  'עצירות': 'ST25', 'שלשול': 'ST36',
  'נפיחות': 'ST25', 'גזים': 'ST25',

  // Mental & Emotional
  'חרדה': 'Yintang', 'לחץ': 'LR3', 'סטרס': 'LR3',
  'דיכאון': 'LR3', 'עצב': 'LU7',
  'נדודי שינה': 'HT7', 'שינה': 'HT7', 'אינסומניה': 'HT7',

  // Respiratory & Immune
  'שיעול': 'LU7', 'צינון': 'GB20', 'שפעת': 'LI4',
  'חום': 'GV14', 'מערכת חיסון': 'ST36',
  'אלרגיה': 'LI20', 'סינוסים': 'LI20',

  // Women's Health
  'מחזור': 'SP6', 'כאבי מחזור': 'SP6', 'פוריות': 'CV4',
  'גיל המעבר': 'KI6', 'גלי חום': 'KI6',

  // Organ Names
  'לשון': 'Tongue_Tip', 'דופק': 'LU9',
  'לב': 'HT7', 'כבד': 'LR3', 'טחול': 'SP6', 'כליות': 'KI3'
};

// Helper: Detect if text is primarily Hebrew
const isHebrew = (text: string): boolean => {
  const hebrewPattern = /[\u0590-\u05FF]/;
  const hebrewChars = (text.match(/[\u0590-\u05FF]/g) || []).length;
  return hebrewPattern.test(text) && hebrewChars > text.length * 0.3;
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

  // 3. SEND MESSAGE FUNCTION - Now calls the real ask-tcm-brain edge function
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: ChatMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // IMMEDIATE visual feedback: Parse points from user query
    parsePointReferences(message);

    try {
      console.log('[useRagChat] Sending query to ask-tcm-brain:', message.slice(0, 50));
      
      // Call the actual edge function with streaming
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-tcm-brain`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            query: message,
            language: isHebrew(message) ? 'he' : 'en',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullResponse = '';
      let metadataReceived = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const data = JSON.parse(jsonStr);
            
            // First event contains metadata (sources, debug info)
            if (!metadataReceived && data.sources) {
              metadataReceived = true;
              console.log('[useRagChat] Received metadata:', data);
              
              // Update search method and debug data
              if (data.searchMethod) setSearchMethod(data.searchMethod);
              if (data.debug) setDebugData(data.debug);
              continue;
            }

            // Subsequent events contain response content
            if (data.choices?.[0]?.delta?.content) {
              fullResponse += data.choices[0].delta.content;
              
              // Update message in real-time
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => 
                    i === prev.length - 1 ? { ...m, content: fullResponse } : m
                  );
                }
                return [...prev, { role: 'assistant', content: fullResponse }];
              });
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }

      // Final update
      setLastAIResponse(fullResponse);
      
      // Parse points from AI response for Body Map
      parsePointReferences(fullResponse);
      
      console.log('[useRagChat] Response complete:', fullResponse.slice(0, 100));

    } catch (error) {
      console.error('[useRagChat] Error:', error);
      const errorMessage: ChatMessage = { 
        role: 'assistant', 
        content: error instanceof Error 
          ? `שגיאה: ${error.message}` 
          : 'מצטער, אירעה שגיאה בעיבוד הבקשה. נסה שוב.'
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

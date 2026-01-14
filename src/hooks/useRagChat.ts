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

// THE MASTER DICTIONARY (English + Hebrew)
const POINT_RULES: Record<string, string> = {
  // --- 🇬🇧 CORE ENGLISH MAPPINGS ---
  'hegu': 'LI4', 'li4': 'LI4', 'headache': 'LI4',
  'zusanli': 'ST36', 'st36': 'ST36', 'energy': 'ST36',
  'shenmen': 'HT7', 'ht7': 'HT7', 'insomnia': 'HT7',
  'sanyinjiao': 'SP6', 'sp6': 'SP6',
  'taichong': 'LR3', 'lr3': 'LR3', 'stress': 'LR3',
  'neiguan': 'PC6', 'pc6': 'PC6', 'nausea': 'PC6',
  'baihui': 'GV20', 'gv20': 'GV20', 'dizziness': 'GV20',

  // --- 🇮🇱 HEBREW / RTL MAPPINGS ---

  // 🔴 PAIN (Ke'ev)
  'כאב': 'LI4',
  'כאבים': 'LI4',
  'כאב ראש': 'LI4',         // Headache
  'מיגרנה': 'GB20',         // Migraine
  'כאב גב': 'BL40',         // Back Pain
  'גב תחתון': 'BL23',       // Lower Back
  'סיאטיקה': 'GB30',        // Sciatica
  'צוואר': 'GB20',          // Neck
  'כתף': 'LI15',            // Shoulder
  'ברך': 'ST35',            // Knee
  'כאב ברכיים': 'ST35',     // Knee pain
  'שיניים': 'ST44',         // Toothache

  // 🤢 DIGESTION (Ikul)
  'בטן': 'ST36',            // Stomach
  'כאב בטן': 'ST36',        // Stomach ache
  'בחילה': 'PC6',           // Nausea
  'הקאות': 'PC6',           // Vomiting
  'עצירות': 'ST25',         // Constipation
  'שלשול': 'ST36',          // Diarrhea
  'נפיחות': 'ST25',         // Bloating
  'גזים': 'ST25',           // Gas
  'צרבת': 'CV12',           // Reflux/Heartburn

  // 🧠 MENTAL (Nefesh)
  'חרדה': 'Yintang',        // Anxiety
  'לחץ': 'LR3',             // Stress
  'סטרס': 'LR3',            // Stress
  'דיכאון': 'LR3',          // Depression
  'עצב': 'LU7',             // Grief
  'כעס': 'LR2',             // Anger
  'שינה': 'HT7',            // Sleep
  'נדודי שינה': 'HT7',      // Insomnia
  'עייפות': 'ST36',         // Fatigue (New!)
  'תשישות': 'ST36',         // Exhaustion

  // 🌬️ RESPIRATORY & IMMUNE (Neshima)
  'שיעול': 'LU7',           // Cough
  'צינון': 'GB20',          // Cold
  'שפעת': 'LI4',            // Flu
  'חום': 'GV14',            // Fever
  'מערכת חיסון': 'ST36',    // Immune System
  'אלרגיה': 'LI20',         // Allergy
  'סינוסים': 'LI20',        // Sinus
  'גרון': 'LU11',           // Throat

  // 🌸 WOMEN (Nashim)
  'מחזור': 'SP6',           // Menstruation
  'כאבי מחזור': 'SP6',      // Cramps
  'פוריות': 'CV4',          // Fertility
  'גיל המעבר': 'KI6',       // Menopause
  'גלי חום': 'KI6',         // Hot flashes

  // 🧴 SKIN & GENERAL (Or)
  'פריחה': 'LI11',          // Rash (New!)
  'גרד': 'LI11',            // Itch
  'אקנה': 'LI4',            // Acne
  'סחרחורת': 'GV20',        // Dizziness (New!)
  'ורטיגו': 'PC6',          // Vertigo
  
  // 🫀 ORGANS (Eivarim)
  'לשון': 'Tongue_Tip',     // Tongue
  'דופק': 'LU9',            // Pulse
  'אוזן': 'Ear_Shenmen'     // Ear
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
  const [isSubmitting, setIsSubmitting] = useState(false); // LOCK to prevent duplicate requests
  const [lastAIResponse, setLastAIResponse] = useState<string>('');
  const [debugData, setDebugData] = useState<RagDebugData | null>(null);
  const [searchMethod, setSearchMethod] = useState<string>('vector');
  const [translatedQuery, setTranslatedQuery] = useState<string | null>(null);

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
    
    // 🔒 SUBMISSION LOCK - Prevent duplicate requests
    if (isSubmitting) {
      console.log('[useRagChat] Request blocked - already submitting');
      return;
    }
    setIsSubmitting(true);

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
            
            // First event contains metadata (sources, debug info, translation)
            if (!metadataReceived && data.sources) {
              metadataReceived = true;
              console.log('[useRagChat] Received metadata:', data);
              
              // Update search method and debug data
              if (data.searchMethod) setSearchMethod(data.searchMethod);
              if (data.debug) setDebugData(data.debug);
              
              // 🇮🇱 TRANSLATION DEBUG: Log and store translated query
              if (data.translatedQuery) {
                setTranslatedQuery(data.translatedQuery);
                console.log(`🌐 STEALTH TRANSLATION ACTIVE:`);
                console.log(`   Original (Hebrew): "${data.originalQuery}"`);
                console.log(`   Searched (English): "${data.translatedQuery}"`);
              } else {
                setTranslatedQuery(null);
              }
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
      setIsSubmitting(false); // 🔓 RELEASE LOCK
    }
  }, [parsePointReferences, isSubmitting]);

  // 4. CLEAR MESSAGES
  const clearMessages = useCallback(() => {
    setMessages([]);
    setHighlightedPoints([]);
    setLastAIResponse('');
    setDebugData(null);
    setTranslatedQuery(null);
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
    
    // Translation info
    translatedQuery,
  };
};

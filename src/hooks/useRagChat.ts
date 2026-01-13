import { useState, useCallback } from "react";
// Add other imports as needed (e.g., useToast, api calls)

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

export const useRagChat = () => {
  const [highlightedPoints, setHighlightedPoints] = useState<string[]>([]);
  // ... existing state for messages, loading, etc.

  // 2. THE PARSER FUNCTION
  const parsePointReferences = useCallback((text: string) => {
    if (!text) return;
    
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
  }, []);

  // ... rest of your useRagChat logic (sendMessage, etc.)
  // Ensure parsePointReferences is called when AI response arrives!

  return {
    highlightedPoints,
    parsePointReferences,
    // ... other exports
  };
};

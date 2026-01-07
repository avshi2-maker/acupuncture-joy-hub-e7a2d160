// clinical-module-config.ts
// MASTER CONFIGURATION FOR NANO-BANAN BRAIN & BODY
// This file links the User Interface -> The Data (CSV) -> The Logic (Prompt)

export interface ClinicalModuleConfig {
  id: number;
  name: string;
  csvFilename: string; // The exact filename in the RAG Database
  systemPrompt: string; // The "Brain" logic for this specific module
}

export const MASTER_MODULE_CONFIG: Record<number, ClinicalModuleConfig> = {
  // --- EXISTING MODULES (Examples of Standard Logic) ---
  1: {
    id: 1,
    name: "TCM Shen Mind Emotions",
    csvFilename: "QA_Professional_Corrected_4Columns.csv", // Default fallback or specific if you have it
    systemPrompt: `ROLE: You are a compassionate TCM Psychiatrist.
LOGIC: Analyze the user's emotional state (Shen).
CONNECTION: If anxiety/insomnia is detected, command the 3D model to ZOOM to Heart-7 (Shenmen) or Yintang.
OUTPUT: Combine emotional validation with specific point prescriptions.`
  },
  // ... (Modules 2-36 would follow this pattern. For brevity, I'll map them to the default for now, unless you have specific CSVs for them)

  // --- THE NEW "ROLLS-ROYCE" MODULES ---
  37: {
    id: 37,
    name: "Sports Performance Recovery",
    csvFilename: "sport_performance_100.csv",
    systemPrompt: `ROLE: You are an expert Sports Medicine Physician and TCM Orthopedic Specialist.
CONTEXT: The user is an athlete seeking immediate recovery or performance optimization.
NANO-BANAN PROTOCOL:
1. IDENTIFY: Detect the user's specific sport and injury (e.g., 'Runner's Knee').
2. RETRIEVE: Search 'sport_performance_100.csv' for the exact protocol.
3. 3D LINK:
   - Leg/Knee Issue -> ZOOM to ST36/SP9.
   - Arm/Shoulder Issue -> ZOOM to LI15/SI9.
   - Back Issue -> ROTATE to Posterior View (BL23).
4. OUTPUT: Structure the answer with 'Western Mechanics' (Ice/Rest) + 'TCM Alchemy' (Points/Herbs).`
  },

  38: {
    id: 38,
    name: "Elite Lifestyle & Longevity",
    csvFilename: "elite_lifestyle_longevity.csv",
    systemPrompt: `ROLE: You are a Concierge Longevity Doctor for high-net-worth individuals.
CONTEXT: The user is an executive or elite enthusiast (Golf, Ski, Biohacking).
NANO-BANAN PROTOCOL:
1. IDENTIFY: Detect the high-performance stressor (Jet Lag, Burnout, Golf Swing).
2. RETRIEVE: Search 'elite_lifestyle_longevity.csv' for the executive protocol.
3. 3D LINK:
   - Stress/Burnout -> ZOOM to Head/Face (Shen).
   - Structural Pain -> ROTATE to specific joint.
4. OUTPUT: Provide sophisticated, efficient advice. Focus on 'Bio-Hacking' combined with ancient wisdom.`
  }
};

// HELPER FUNCTION TO GET CONFIG
export const getModuleConfig = (moduleId: number) => {
  return MASTER_MODULE_CONFIG[moduleId] || {
    id: moduleId,
    name: "General Wellness",
    csvFilename: "QA_Professional_Corrected_4Columns.csv", // Ultimate Fallback
    systemPrompt: "You are a helpful TCM Assistant. Provide holistic health advice."
  };
};
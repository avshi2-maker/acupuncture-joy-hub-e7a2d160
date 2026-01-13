import React from "react";
import { RagSearchPanel } from "./RagSearchPanel";
import { QuickPromptDropdown } from "./QuickPromptDropdown";
import { BodyMap } from "./BodyMap";
import { useRagChat } from "@/hooks/useRagChat";
import { AiStatus } from "./AiStatus"; 
// Note: If you have a 'ClinicalPatterns' component, uncomment the import below
// import { ClinicalPatterns } from "./ClinicalPatterns";

export const IntelligenceHub = () => {
  // 1. Hook into the Brain (get the highlighting data)
  const { highlightedPoints } = useRagChat();

  return (
    // MAIN CONTAINER: Flexbox layout handling RTL automatically
    // h-[calc(100vh-6rem)] subtracts header height to fit screen perfectly
    <div className="flex flex-row h-[calc(100vh-6rem)] w-full bg-[#FDFCF8] overflow-hidden" dir="rtl">

      {/* ---------------------------------------------------------------------------
         COLUMN 1 (RIGHT SIDE in RTL): CLINICAL LIBRARY
         Fixed Width: 320px. 
         Contains: Dropdown (Questions) & Patterns
         --------------------------------------------------------------------------- */}
      <div className="w-[320px] min-w-[320px] shrink-0 flex flex-col gap-4 p-4 bg-white border-l border-slate-200 shadow-sm overflow-y-auto z-20">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-2 text-slate-800">
           <span className="text-xl">📚</span>
           <h2 className="text-lg font-bold">הספרייה הקלינית</h2>
        </div>
        
        {/* The Dropdown (Your 195 Questions) */}
        <div className="w-full">
            <QuickPromptDropdown />
        </div>

        <div className="my-2 border-t border-slate-100"></div>

        {/* Clinical Patterns Area */}
        <div className="flex-1 overflow-y-auto">
             {/* <ClinicalPatterns />  <-- Uncomment if you have this component */}
             <div className="p-4 bg-slate-50 rounded text-center text-sm text-slate-400">
                בחר דפוסים קליניים מהרשימה
             </div>
        </div>

        {/* Status Footer */}
        <div className="mt-auto pt-4">
             <AiStatus />
        </div>
      </div>

      {/* ---------------------------------------------------------------------------
         COLUMN 2 (CENTER): MAIN SEARCH STAGE
         Elastic Width (flex-1).
         Contains: The Big Search Box
         --------------------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col p-6 min-w-[500px] bg-slate-50/50 relative">
        <div className="h-full w-full max-w-5xl mx-auto flex flex-col justify-center">
           
           {/* The Search Panel Container */}
           <div className="w-full bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden relative min-h-[400px] flex flex-col">
              {/* Ensure RagSearchPanel takes full height */}
              <div className="flex-1">
                  <RagSearchPanel />
              </div>
           </div>

        </div>
      </div>

      {/* ---------------------------------------------------------------------------
         COLUMN 3 (LEFT SIDE in RTL): BODY MAP
         Fixed Width: 380px.
         Contains: The Interactive SVG
         --------------------------------------------------------------------------- */}
      <div className="w-[380px] min-w-[380px] shrink-0 flex flex-col p-4 bg-white border-r border-slate-200 shadow-sm z-10">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-2 text-slate-800">
           <span className="text-xl">📍</span>
           <h2 className="text-lg font-bold">מפת גוף אינטראקטיבית</h2>
        </div>

        {/* The Map Container - Forces SVG to fit */}
        <div className="flex-1 relative bg-white rounded-xl border border-slate-100 flex items-center justify-center p-2 overflow-hidden">
           
           {/* THE CRITICAL CONNECTION: Passing highlightedPoints */}
           <BodyMap 
             highlightedPoints={highlightedPoints} 
             className="w-full h-full object-contain" 
           />

        </div>
        
        {/* Legend / Debug */}
        <div className="h-10 mt-2 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded">
           TCM Brain Active • {highlightedPoints.length > 0 ? `${highlightedPoints.length} Points Found` : 'Ready'}
        </div>
      </div>

    </div>
  );
};

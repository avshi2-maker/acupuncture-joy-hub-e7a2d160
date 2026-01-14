import React from "react";
import { RagSearchPanel } from "@/components/session/RagSearchPanel";
import { QuickPromptDropdown } from "@/components/tcm-brain/QuickPromptDropdown";
import { BodyMap } from "@/components/BodyMap";
import { useRagChat } from "@/hooks/useRagChat";
import { AiStatus } from "@/components/ui/AiStatus";

export const IntelligenceHub = () => {
  const { highlightedPoints } = useRagChat();
  const [selectedQuestion, setSelectedQuestion] = React.useState<string>('');

  const handleQuestionSelect = (question: string) => {
    setSelectedQuestion(question);
    // Could trigger search or pass to RagSearchPanel
  };

  return (
    // MAIN CONTAINER: Flexbox (Row). Fixed height. RTL Direction.
    <div className="flex flex-row h-[calc(100vh-6rem)] w-full bg-[#FDFCF8] overflow-hidden" dir="rtl">

      {/* =================================================================
         COLUMN 1 (RIGHT SIDE): THE UNIFIED LIBRARY
         Contains: Questions Dropdown
         Fixed Width: 320px. 
         ================================================================= */}
      <div className="w-[320px] min-w-[320px] shrink-0 flex flex-col gap-4 p-4 bg-white border-l border-slate-200 shadow-sm overflow-y-auto z-20">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-2 text-slate-800">
           <span className="text-xl">📚</span>
           <h2 className="text-lg font-bold">הספרייה הקלינית</h2>
        </div>
        
        {/* 1. The Questions Dropdown */}
        <div className="w-full flex-1">
            <QuickPromptDropdown onSelectQuestion={handleQuestionSelect} />
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4">
             <AiStatus />
        </div>
      </div>

      {/* =================================================================
         COLUMN 2 (CENTER): MAIN SEARCH STAGE
         Elastic Width (flex-1).
         ================================================================= */}
      <div className="flex-1 flex flex-col p-6 min-w-[500px] bg-slate-50/50 relative">
        <div className="h-full w-full max-w-5xl mx-auto flex flex-col justify-center">
           <div className="w-full bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden relative min-h-[400px] flex flex-col">
              <div className="flex-1">
                  <RagSearchPanel />
              </div>
           </div>
        </div>
      </div>

      {/* =================================================================
         COLUMN 3 (LEFT SIDE): BODY MAP
         Fixed Width: 380px.
         ================================================================= */}
      <div className="w-[380px] min-w-[380px] shrink-0 flex flex-col p-4 bg-white border-r border-slate-200 shadow-sm z-10">
        <div className="flex items-center gap-2 mb-2 text-slate-800">
           <span className="text-xl">📍</span>
           <h2 className="text-lg font-bold">מפת גוף</h2>
        </div>
        <div className="flex-1 relative bg-white rounded-xl border border-slate-100 flex items-center justify-center p-2 overflow-hidden">
           <BodyMap 
             highlightedPoints={highlightedPoints} 
             className="w-full h-full object-contain" 
           />
        </div>
      </div>

    </div>
  );
};

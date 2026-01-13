import React, { useEffect, useState } from "react";
// Ensure you are importing your CSV parser or SVG component here
// import { InteractiveBodyMap } from "./InteractiveBodyMap"; 

interface BodyMapProps {
  highlightedPoints: string[];
  className?: string;
}

export const BodyMap: React.FC<BodyMapProps> = ({ highlightedPoints, className }) => {
  
  // 1. Log to console to prove connection works
  useEffect(() => {
    if (highlightedPoints.length > 0) {
      console.log("📍 BodyMap received signal:", highlightedPoints);
    }
  }, [highlightedPoints]);

  return (
    <div className={`relative bg-white ${className}`}>
      
      {/* THIS IS WHERE THE SVG GOES.
          WE REMOVED THE <IMG> TAGS FOR "MANNEQUIN.PNG" 
      */}
      
      {/* Fallback Visual (The "Target" Box) */}
      <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl">
        
        {/* Replace this block with your actual <InteractiveBodyMap /> or SVG logic */}
        <div className="text-center">
            {highlightedPoints.length === 0 ? (
               <p className="text-slate-400 text-sm">Waiting for Brain Signal...</p>
            ) : (
               <div className="animate-pulse">
                  <span className="text-4xl">✨</span>
                  <p className="font-bold text-slate-800 mt-2">Active Points:</p>
                  <div className="flex gap-2 justify-center mt-1">
                    {highlightedPoints.map(p => (
                      <span key={p} className="bg-red-500 text-white px-2 py-1 rounded text-xs">{p}</span>
                    ))}
                  </div>
               </div>
            )}
        </div>

      </div>

    </div>
  );
};

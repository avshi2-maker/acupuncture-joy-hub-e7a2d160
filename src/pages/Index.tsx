// FILE: src/pages/Index.tsx (or TcmBrain.tsx)
// PURPOSE: A simple wrapper. No Grids. No Columns.

import React from "react";
import { IntelligenceHub } from "@/components/IntelligenceHub";
// Keep your existing Header import. 
// If it was 'import { Header } ...', keep it. 
// If it was a custom header code, keep that component.
import Header from "@/components/layout/Header"; 

const Index = () => {
  return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col">
      
      {/* 1. THE HEADER */}
      <Header />

      {/* 2. THE MAIN ENGINE
          No <div> wrapper with 'grid' or 'flex-row'. 
          No <BodyMapSidebar>. 
          No <ClinicalQuerySelector>.
          IntelligenceHub handles ALL columns internally. 
      */}
      <main className="flex-1 w-full relative">
        <IntelligenceHub />
      </main>

    </div>
  );
};

export default Index;

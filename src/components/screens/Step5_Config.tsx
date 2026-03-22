"use client";

import React, { useState } from "react";
import { QuestionScreen } from "@/components/ui/QuestionScreen";
import { OptionCard } from "@/components/ui/OptionCard";

export const Step5_Config: React.FC<{ onContinue: (id: string) => void }> = ({ onContinue }) => {
  const [selected, setSelected] = useState("");

  const options = [
    { id: "none", name: "Tent only", hint: "Open structure", badge: "Base" },
    { id: "walls", name: "With side walls", hint: "Added enclosure", badge: "Popular" },
    { id: "canopy", name: "With canopy", hint: "Extended coverage" },
    { id: "full", name: "Fully enclosed", hint: "Maximum setup" }
  ];

  return (
    <QuestionScreen
      phase="Phase 2 — Your Setup"
      title={<>Add walls <em>or a canopy?</em></>}
      subtitle="Each addition extends your branding surface and visual impact."
      canContinue={!!selected}
      onContinue={() => onContinue(selected)}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5 w-full max-w-[540px]">
        {options.map((opt) => (
          <OptionCard
            key={opt.id}
            option={opt}
            isSelected={selected === opt.id}
            onSelect={setSelected}
          />
        ))}
      </div>

      {/* Visual Examples */}
      <div className="mt-6 w-full max-w-[540px]">
         <div className="text-[9px] tracking-[0.2em] text-gray2 uppercase mb-[10px] text-center">Configuration examples</div>
         <div className="grid grid-cols-3 gap-1 mb-2">
            <div className="flex flex-col gap-1.5">
               <div className="h-[100px] rounded-[10px] border border-line flex items-center justify-center bg-[linear-gradient(135deg,#E8E4DC,#D8D0C4)]">
                 <span className="font-syne font-bold text-[10px] text-black/30 tracking-widest uppercase">Open</span>
               </div>
               <div className="text-[10px] text-gray2 text-center tracking-tight">Open tent</div>
            </div>
            <div className="flex flex-col gap-1.5">
               <div className="h-[100px] rounded-[10px] border border-line flex items-center justify-center bg-[linear-gradient(135deg,#D8D4CC,#C8C0B4)]">
                 <span className="font-syne font-bold text-[10px] text-black/30 tracking-widest uppercase">Walls</span>
               </div>
               <div className="text-[10px] text-gray2 text-center tracking-tight">With side walls</div>
            </div>
            <div className="flex flex-col gap-1.5">
               <div className="h-[100px] rounded-[10px] border border-line flex items-center justify-center bg-[linear-gradient(135deg,#C8C4BC,#B8B0A4)]">
                 <span className="font-syne font-bold text-[10px] text-black/30 tracking-widest uppercase">Full</span>
               </div>
               <div className="text-[10px] text-gray2 text-center tracking-tight">Fully enclosed</div>
            </div>
         </div>
      </div>
    </QuestionScreen>
  );
};

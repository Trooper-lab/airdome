"use client";

import React, { useState } from "react";
import { QuestionScreen } from "@/components/ui/QuestionScreen";
import { OptionCard } from "@/components/ui/OptionCard";

export const Step3_Vibe: React.FC<{ onContinue: (id: string) => void }> = ({ onContinue }) => {
  const [selected, setSelected] = useState("");

  const options = [
    { id: "v1", name: "Electric & High-Energy", hint: "Neon lighting, fast-paced music", badge: "Popular" },
    { id: "v2", name: "Zen & Relaxed", hint: "Ambient lighting, natural textures" },
    { id: "v3", name: "Industrial & Raw", hint: "Exposed structure, concrete look" },
    { id: "v4", name: "Future & Tech", hint: "Digital screens, holographic effects" }
  ];

  return (
    <QuestionScreen
      phase="Phase 1 — Style"
      title={<>What's the <em>vibe</em> inside?</>}
      subtitle="The internal atmosphere dictates the lighting and material selection."
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
      
      {/* Proof Nudge Mock */}
      <div className="mt-7 flex flex-col items-center gap-1.5 opacity-80">
         <div className="w-10 h-10 rounded-full bg-black text-white font-syne font-bold text-[13px] flex items-center justify-center">
            JS
         </div>
         <div className="text-center">
            <p className="text-[12px] italic text-ink leading-relaxed max-w-[300px]">
               "The Zen atmosphere completely changed how our guests interacted with the brand."
            </p>
            <p className="text-[9px] tracking-widest text-gray2 uppercase mt-1">
               <strong>Jonas Schmidt</strong> — Event Director
            </p>
         </div>
      </div>
    </QuestionScreen>
  );
};

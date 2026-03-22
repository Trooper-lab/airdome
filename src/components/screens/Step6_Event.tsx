"use client";

import React, { useState } from "react";
import { QuestionScreen } from "@/components/ui/QuestionScreen";
import { OptionCard } from "@/components/ui/OptionCard";

export const Step6_Event: React.FC<{ onContinue: (id: string) => void }> = ({ onContinue }) => {
  const [selected, setSelected] = useState("");

  const options = [
    { id: "racing", name: "Racing & Automotive", hint: "Motorsport · Car shows" },
    { id: "trade", name: "Trade Shows & Fairs", hint: "B2B · Exhibitions" },
    { id: "festival", name: "Festivals & Sport", hint: "Outdoor · Mass events" },
    { id: "sampling", name: "Sampling & Promotions", hint: "Retail · Pop-up" },
    { id: "brand", name: "Brand Activation", hint: "Experiential · Launch" },
    { id: "other", name: "Something Else", hint: "We'll discuss" }
  ];

  return (
    <QuestionScreen
      phase="Phase 2 — Your Setup"
      title={<>Where will your <em>tent be seen?</em></>}
      subtitle="This determines the render environment we create for you."
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

      {/* Sector References */}
      <div className="mt-6 w-full max-w-[540px]">
         <div className="text-[9px] tracking-[0.2em] text-gray2 uppercase mb-[10px] text-center">Brands that trust Airdome</div>
         <div className="grid grid-cols-2 gap-0.5">
            {[
              { brand: "Yamaha Racing", sector: "Racing & Automotive" },
              { brand: "Oakley", sector: "Festivals & Sport" },
              { brand: "Adidas", sector: "Brand Activation" },
              { brand: "McDonald's", sector: "Sampling & Promotions" }
            ].map((ref, idx) => (
               <div key={idx} className="p-[12px_16px] bg-off border border-line rounded-[10px]">
                  <div className="font-syne font-bold text-[12px] text-black mb-[2px]">{ref.brand}</div>
                  <div className="text-[10px] text-gray2 tracking-[0.04em]">{ref.sector}</div>
               </div>
            ))}
         </div>
      </div>
    </QuestionScreen>
  );
};

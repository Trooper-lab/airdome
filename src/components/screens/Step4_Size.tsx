"use client";

import React, { useState } from "react";
import { QuestionScreen } from "@/components/ui/QuestionScreen";

interface SizeCardProps {
  id: string;
  label: string;
  sub: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  visBars: { w: number, h: number }[];
}

const SizeCard: React.FC<SizeCardProps> = ({ id, label, sub, isSelected, onSelect, visBars }) => {
  return (
    <div 
      onClick={() => onSelect(id)}
      className={`p-[16px_12px_12px] text-center cursor-pointer transition-all duration-180 rounded-[14px] border-[1.5px]
        ${isSelected ? "bg-white border-black" : "bg-off border-transparent hover:bg-off2 hover:border-[rgba(17,17,16,0.1)]"}
      `}
    >
      <div className="flex items-end justify-center h-9 mb-2 gap-0.5">
        {visBars.map((bar, i) => (
          <div 
            key={i} 
            className={`bg-line border-t border-gray2 transition-all duration-180
              ${isSelected ? "bg-black border-t-black" : ""}
            `}
            style={{ width: `${bar.w}px`, height: `${bar.h}px` }}
          />
        ))}
      </div>
      <div className="font-syne font-bold text-[12px] text-black mb-[1px]">{label}</div>
      <div className="text-[9px] tracking-[0.06em] text-gray2 uppercase">{sub}</div>
    </div>
  );
};

export const Step4_Size: React.FC<{ onContinue: (id: string) => void }> = ({ onContinue }) => {
  const [selected, setSelected] = useState("");

  const sizes = [
    { id: "3x3", label: "3 × 3 m", sub: "Compact", visBars: [{ w: 15, h: 20 }, { w: 15, h: 20 }] },
    { id: "4x4", label: "4 × 4 m", sub: "Standard", visBars: [{ w: 17, h: 26 }, { w: 17, h: 26 }] },
    { id: "5x5", label: "5 × 5 m", sub: "Large", visBars: [{ w: 19, h: 30 }, { w: 19, h: 30 }] },
    { id: "6x6", label: "6 × 6 m", sub: "XL", visBars: [{ w: 21, h: 34 }, { w: 21, h: 34 }] },
    { id: "multi", label: "Multiple", sub: "Connected", visBars: [{ w: 11, h: 24 }, { w: 11, h: 24 }, { w: 11, h: 24 }] },
    { id: "unsure", label: "Not sure", sub: "Advise me", visBars: [] } // Empty bars handled by CSS logic if needed or "?"
  ];

  return (
    <QuestionScreen
      phase="Phase 2 — Your Setup"
      title={<>Which size fits <em>your event?</em></>}
      subtitle="Not sure? Our team will advise during the design review."
      canContinue={!!selected}
      onContinue={() => onContinue(selected)}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-0.5 w-full max-w-[540px]">
        {sizes.map((s) => (
          <SizeCard
            key={s.id}
            {...s}
            isSelected={selected === s.id}
            onSelect={setSelected}
          />
        ))}
      </div>

      {/* ROI Block Mock */}
      <div className="mt-6 w-full max-w-[540px] p-[20px_24px] bg-black rounded-2xl text-white">
        <div className="text-[9px] tracking-[0.25em] text-white/40 uppercase mb-4">Investment Case — 4×4m (Popular)</div>
        <div className="flex items-center mb-4">
           <div className="flex-1 text-center">
              <span className="block font-syne font-extrabold text-[28px] tracking-tight text-white">€211</span>
              <span className="text-[10px] text-white/45 leading-tight">Per event<br/><span className="text-[9px] opacity-60">at 8 events/yr</span></span>
           </div>
           <div className="w-px h-10 bg-white/10" />
           <div className="flex-1 text-center">
              <span className="block font-syne font-extrabold text-[28px] tracking-tight text-white">1–2</span>
              <span className="text-[10px] text-white/45 leading-tight">New clients<br/><span className="text-[9px] opacity-60">to break even</span></span>
           </div>
           <div className="w-px h-10 bg-white/10" />
           <div className="flex-1 text-center">
              <span className="block font-syne font-extrabold text-[28px] tracking-tight text-white">5yr</span>
              <span className="text-[10px] text-white/45 leading-tight">Full<br/><span className="text-[9px] opacity-60">warranty</span></span>
           </div>
        </div>
        <div className="text-[11px] leading-[1.7] text-white/50 border-t border-white/10 pt-3.5">
           One new client per event and it pays for itself in full.
        </div>
      </div>
    </QuestionScreen>
  );
};

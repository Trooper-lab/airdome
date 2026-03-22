"use client";

import React from "react";
import { QuestionScreen } from "@/components/ui/QuestionScreen";

interface ConfigSummaryProps {
  onContinue: () => void;
  selections: {
    size: string;
    config: string;
    event: string;
  };
}

export const Step7_FinalConfig: React.FC<ConfigSummaryProps> = ({ onContinue, selections }) => {
  return (
    <QuestionScreen
      phase="Phase 2 — Your Setup"
      title={<>Your <em>perfect setup.</em></>}
      subtitle="We've curated this configuration based on your needs."
      canContinue={true}
      onContinue={onContinue}
      buttonLabel="Create My Design"
    >
      <div className="w-full max-w-[540px] space-y-4">
        {/* Visual Preview Slot */}
        <div className="relative aspect-video bg-off border border-line rounded-2xl overflow-hidden flex items-center justify-center group">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.05)_0%,transparent_70%)]" />
           <div className="text-center z-10">
              <div className="font-syne font-extrabold text-[40px] text-black/10 uppercase tracking-tighter scale-110">AIRDOME</div>
              <div className="text-[10px] text-gray2 uppercase tracking-widest mt-[-10px]">Render Preview</div>
           </div>
           
           {/* Floating specs */}
           <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div className="bg-white/80 backdrop-blur-md p-3 rounded-xl border border-white shadow-sm transition-transform group-hover:translate-y-[-4px]">
                 <div className="text-[8px] uppercase tracking-wider text-gray2 mb-1">Configuration</div>
                 <div className="font-syne font-bold text-[13px] text-black lowercase">{selections.size} {selections.config}</div>
              </div>
              <div className="bg-black text-white p-3 rounded-xl shadow-lg transition-transform group-hover:translate-y-[-4px]">
                 <div className="text-[8px] uppercase tracking-wider text-white/40 mb-1">Durability</div>
                 <div className="font-syne font-bold text-[13px]">B1 Fire Rated</div>
              </div>
           </div>
        </div>

        {/* Feature List */}
        <div className="grid grid-cols-1 gap-2">
           {[
             { label: "Fully Branded", desc: "Sublimation print on all surfaces.", icon: "✦" },
             { label: "Wind Resistant", desc: "Tested up to 60km/h with standard weights.", icon: "◈" },
             { label: "B1 Certified", desc: "Flame retardant materials for indoor use.", icon: "⬗" }
           ].map((item, i) => (
             <div key={i} className="flex items-center gap-4 p-4 bg-white border border-line rounded-xl transition-all hover:border-black/10">
                <div className="w-8 h-8 rounded-lg bg-off flex items-center justify-center font-bold text-black border border-line">{item.icon}</div>
                <div>
                   <div className="font-syne font-bold text-[13px] text-black">{item.label}</div>
                   <div className="text-[11px] text-gray2">{item.desc}</div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </QuestionScreen>
  );
};

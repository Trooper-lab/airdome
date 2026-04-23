"use client";

import React, { useState } from "react";
import { QuestionScreen } from "@/components/ui/QuestionScreen";
import { useLanguage } from "@/i18n/LanguageContext";

// Unique SVG icon per urgency option
const UrgencyIcons: Record<string, React.ReactNode> = {
  asap: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  month: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <polyline points="9 16 11 18 15 14"/>
    </svg>
  ),
  quarter: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <circle cx="8" cy="16" r="1" fill="currentColor"/>
      <circle cx="12" cy="16" r="1" fill="currentColor"/>
      <circle cx="16" cy="16" r="1" fill="currentColor"/>
    </svg>
  ),
  planning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 22h14"/>
      <path d="M5 2h14"/>
      <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/>
      <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>
    </svg>
  ),
  exploring: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  ),
};

const URGENCY_OPTIONS = [
  { id: "asap", labelKey: "design.s7.asap", hintKey: "design.s7.asap.hint", tagKey: "design.s7.asap.tag" },
  { id: "month", labelKey: "design.s7.month", hintKey: "design.s7.month.hint", tagKey: "design.s7.month.tag" },
  { id: "quarter", labelKey: "design.s7.quarter", hintKey: "design.s7.quarter.hint", tagKey: "design.s7.quarter.tag" },
  { id: "planning", labelKey: "design.s7.planning", hintKey: "design.s7.planning.hint", tagKey: "design.s7.planning.tag" },
  { id: "exploring", labelKey: "design.s7.exploring", hintKey: "design.s7.exploring.hint", tagKey: "design.s7.exploring.tag" },
];

const UrgencyCard: React.FC<{
  id: string; label: string; hint: string; tag?: string;
  isSelected: boolean; onSelect: (id: string) => void;
}> = ({ id, label, hint, tag, isSelected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(id)}
      className={`group flex items-center gap-4 p-5 rounded-[20px] border-[1.5px] cursor-pointer transition-all duration-300 backdrop-blur-md
        ${isSelected
          ? "border-white/30 bg-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)] -translate-y-[2px]"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
        }
      `}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300
        ${isSelected ? "bg-white text-black" : "bg-white/10 text-gray-400 group-hover:text-white"}`}
      >
        {UrgencyIcons[id]}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="font-syne font-bold text-[15px] text-white tracking-tight">{label}</div>
          {tag && (
            <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-[9px] font-bold text-gray-400 uppercase tracking-tight">
              {tag}
            </span>
          )}
        </div>
        <div className="text-[11px] text-gray-400 leading-relaxed">{hint}</div>
      </div>

      <div className={`shrink-0 w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-300
        ${isSelected ? "border-white bg-white" : "border-white/10 bg-transparent"}`}
      >
        {isSelected && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </div>
    </div>
  );
};

interface Step7Props {
  selections: any;
  onContinue: (urgency: string) => void;
  onBack: () => void;
}

export const Step7_FinalConfig: React.FC<Step7Props> = ({ onContinue, onBack }) => {
  const [selected, setSelected] = useState("");
  const { t } = useLanguage();

  const options = URGENCY_OPTIONS.map(opt => ({
    ...opt,
    label: t(opt.labelKey) as string,
    hint: t(opt.hintKey) as string,
    tag: opt.tagKey ? t(opt.tagKey) as string : undefined,
  }));

  return (
    <QuestionScreen
      phase={t("airgate.design.s7.phase") as string}
      title={t("airgate.design.s7.title") as string}
      subtitle={t("airgate.design.s7.subtitle") as string}
      onBack={onBack}
      onContinue={() => onContinue(selected)}
      canContinue={!!selected}
    >
      <div className="flex flex-col gap-4 w-full max-w-[580px]">
        {options.map((opt) => (
          <UrgencyCard
            key={opt.id}
            {...opt}
            isSelected={selected === opt.id}
            onSelect={setSelected}
          />
        ))}
      </div>
    </QuestionScreen>
  );
};

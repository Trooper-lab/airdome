"use client";

import React, { useState } from "react";
import { QuestionScreen } from "@/components/ui/QuestionScreen";
import { useLanguage } from "@/i18n/LanguageContext";

// Color accent per sector — background + icon color for identity
const SECTOR_THEME: Record<string, { bg: string; icon: string; selectedBg: string }> = {
  racing:   { bg: "bg-red-50",     icon: "text-red-500",     selectedBg: "bg-red-500" },
  trade:    { bg: "bg-blue-50",    icon: "text-blue-500",    selectedBg: "bg-blue-500" },
  festival: { bg: "bg-amber-50",   icon: "text-amber-500",   selectedBg: "bg-amber-500" },
  sampling: { bg: "bg-purple-50",  icon: "text-purple-500",  selectedBg: "bg-purple-500" },
  brand:    { bg: "bg-emerald-50", icon: "text-emerald-600", selectedBg: "bg-emerald-600" },
  other:    { bg: "bg-gray-100",   icon: "text-gray-500",    selectedBg: "bg-gray-700" },
};

const SECTOR_ICONS: Record<string, React.ReactNode> = {
  racing: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {/* Checkered flag */}
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  ),
  trade: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {/* Building/booth */}
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      <path d="M2 10h20"/>
    </svg>
  ),
  festival: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {/* Music note */}
      <path d="M9 18V5l12-2v13"/>
      <circle cx="6" cy="18" r="3"/>
      <circle cx="18" cy="16" r="3"/>
    </svg>
  ),
  sampling: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {/* Gift box */}
      <polyline points="20 12 20 22 4 22 4 12"/>
      <rect x="2" y="7" width="20" height="5"/>
      <line x1="12" y1="22" x2="12" y2="7"/>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
    </svg>
  ),
  brand: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {/* Megaphone */}
      <path d="M3 11l19-9-9 19-2-8-8-2z"/>
    </svg>
  ),
  other: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {/* Sparkles */}
      <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z"/>
      <path d="M5 16l.75 2.25L8 19l-2.25.75L5 22l-.75-2.25L2 19l2.25-.75L5 16z"/>
      <path d="M19 14l.75 2.25L22 17l-2.25.75L19 20l-.75-2.25L16 17l2.25-.75L19 14z"/>
    </svg>
  ),
};

const SectorCard: React.FC<{
  id: string; name: string; hint: string;
  isSelected: boolean; onSelect: (id: string) => void;
}> = ({ id, name, hint, isSelected, onSelect }) => {
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
        {SECTOR_ICONS[id] || SECTOR_ICONS.other}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-syne font-bold text-[15px] text-white">{name}</div>
        <div className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{hint}</div>
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

export const Step6_Event: React.FC<{
  onContinue: (id: string) => void;
  onBack?: () => void;
}> = ({ onContinue, onBack }) => {
  const [selected, setSelected] = useState("");
  const { t } = useLanguage();

  const handleNext = () => {
    if (selected) onContinue(selected);
  };

  const options = [
    { id: "racing",   name: t("design.s6.racing") as string,   hint: t("design.s6.racing.hint") as string },
    { id: "trade",    name: t("design.s6.trade") as string,    hint: t("design.s6.trade.hint") as string },
    { id: "festival", name: t("design.s6.festival") as string, hint: t("design.s6.festival.hint") as string },
    { id: "sampling", name: t("design.s6.sampling") as string, hint: t("design.s6.sampling.hint") as string },
    { id: "brand",    name: t("design.s6.brand") as string,    hint: t("design.s6.brand.hint") as string },
    { id: "other",    name: t("design.s6.other") as string,    hint: t("design.s6.other.hint") as string },
  ];

  return (
    <QuestionScreen
      phase={t("design.s6.phase") as string}
      title={<>{t("design.s6.title")}</>}
      subtitle={t("design.s6.subtitle") as string}
      onBack={onBack}
      onContinue={handleNext}
      canContinue={!!selected}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {options.map((opt) => (
          <SectorCard
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

"use client";

import React, { useState } from "react";
import { QuestionScreen } from "@/components/ui/QuestionScreen";
import { useLanguage } from "@/i18n/LanguageContext";

// Each archetype card has its own distinct visual style
const ARCHETYPE_STYLES: Record<string, {
  card: string;
  bar: string;
  num: string;
  name: string;
  ref: string;
  dot: string;
  accent?: string; // optional decorative element classnames
}> = {
  rebel: {
    // Dark, raw, aggressive — like a brand that disrupts
    card: "bg-[#111111] border-[#2a2a2a] hover:border-[#444]",
    bar: "bg-[#e02020]",
    num: "text-white/5",
    name: "text-white",
    ref: "text-white/35",
    dot: "border-white/20 group-hover:border-white/50",
  },
  bold: {
    // Deep navy, corporate-strong, confident
    card: "bg-[#0d1b2a] border-[#1a2d42] hover:border-[#2a4060]",
    bar: "bg-[#2563eb]",
    num: "text-white/5",
    name: "text-white",
    ref: "text-blue-300/50",
    dot: "border-blue-400/30",
  },
  clean: {
    // Pure dark, ultra-minimal — the void
    card: "bg-white/5 border-white/10 hover:border-white/20 shadow-sm backdrop-blur-md",
    bar: "bg-white",
    num: "text-white/5",
    name: "text-white",
    ref: "text-white/40",
    dot: "border-white/30",
  },
  premium: {
    // Dark champagne with gold — elevated luxury
    card: "bg-[#1a1814] border-[#3a3324] hover:border-[#c9a84c]",
    bar: "bg-[#c9a84c]",
    num: "text-[#c9a84c]/10",
    name: "text-[#c9a84c]",
    ref: "text-[#c9a84c]/60",
    dot: "border-[#c9a84c]/40",
  },
  friendly: {
    // Dark terracotta — approachable, human
    card: "bg-[#2a1b16] border-[#4a3026] hover:border-[#d4856a]",
    bar: "bg-[#d4856a]",
    num: "text-[#d4856a]/10",
    name: "text-[#d4856a]",
    ref: "text-[#d4856a]/60",
    dot: "border-[#d4856a]/40",
  },
  other: {
    // Iridescent / experimental — gradient shimmer
    card: "bg-[linear-gradient(135deg,#1a1525,#251520,#152025)] border-[#3a2d50] hover:border-[#a090d0]",
    bar: "bg-[linear-gradient(90deg,#9333ea,#ec4899,#06b6d4)]",
    num: "text-purple-200/20",
    name: "text-[#1a0a2a]",
    ref: "text-purple-400/50",
    dot: "border-purple-300/50",
  },
};

const PersonalityCard: React.FC<{
  id: string; name: string; ref: string; num: string;
  isSelected: boolean; onSelect: (id: string) => void;
}> = ({ id, name, ref, num, isSelected, onSelect }) => {
  const styles = ARCHETYPE_STYLES[id] || ARCHETYPE_STYLES.other;

  return (
    <div
      onClick={() => onSelect(id)}
      className={`group relative h-[120px] overflow-hidden rounded-[16px] border-[1.5px] cursor-pointer transition-all duration-200
        ${styles.card}
        ${isSelected ? "ring-2 ring-white/60 ring-inset scale-[1.01] shadow-lg" : ""}
      `}
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${styles.bar} transition-opacity duration-200 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`} />

      {/* Ghost number */}
      <div className={`absolute top-2 right-3 font-syne font-extrabold text-[32px] leading-none ${styles.num}`}>
        {num}
      </div>

      {/* Selection dot */}
      <div className={`absolute top-3 left-3 w-2.5 h-2.5 rounded-full border-[1.5px] transition-all duration-200 ${styles.dot}
        ${isSelected ? "bg-current border-current scale-110" : ""}
      `} />

      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className={`font-syne font-bold text-[13px] mb-0.5 ${styles.name}`}>{name}</div>
        <div className={`text-[9px] tracking-[0.1em] uppercase ${styles.ref}`}>{ref}</div>
      </div>

      {/* Experimental shimmer overlay */}
      {id === "other" && (
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.15)_50%,transparent_75%)] bg-[length:200%_200%] animate-[shimmer_3s_ease-in-out_infinite] pointer-events-none" />
      )}
    </div>
  );
};

export const Step2_Personality: React.FC<{
  onContinue: (id: string) => void;
  onBack?: () => void;
}> = ({ onContinue, onBack }) => {
  const [selected, setSelected] = useState("");
  const { t } = useLanguage();

  const options = [
    { id: "rebel",    name: t("design.s2.rebel")    as string, ref: t("design.s2.rebel.ref")    as string, num: "01" },
    { id: "bold",     name: t("design.s2.bold")     as string, ref: t("design.s2.bold.ref")     as string, num: "02" },
    { id: "clean",    name: t("design.s2.clean")    as string, ref: t("design.s2.clean.ref")    as string, num: "03" },
    { id: "premium",  name: t("design.s2.premium")  as string, ref: t("design.s2.premium.ref")  as string, num: "04" },
    { id: "friendly", name: t("design.s2.friendly") as string, ref: t("design.s2.friendly.ref") as string, num: "05" },
    { id: "other",    name: t("design.s2.other")    as string, ref: t("design.s2.other.ref")    as string, num: "06" },
  ];

  return (
    <QuestionScreen
      phase={t("design.s2.phase") as string}
      title={<>{t("design.s2.title")}</>}
      subtitle={t("design.s2.subtitle") as string}
      canContinue={!!selected}
      onContinue={() => onContinue(selected)}
      onBack={onBack}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full max-w-[540px]">
        {options.map((opt) => (
          <PersonalityCard
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

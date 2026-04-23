"use client";

import React, { useState } from "react";
import { QuestionScreen } from "@/components/ui/QuestionScreen";
import { useLanguage } from "@/i18n/LanguageContext";

const VIBE_STYLES: Record<string, {
  card: string;
  selectedBorder: string;
  badge?: string;
  badgeText?: string;
  name: string;
  hint: string;
  glow?: string;
}> = {
  v1: {
    // Electric & High-Energy — dark with neon accents
    card: "bg-[#080c14] border-[#1a2a3a]",
    selectedBorder: "border-[#00f0ff] shadow-[0_0_24px_rgba(0,240,255,0.2)]",
    badge: "bg-[#00f0ff]/10 border-[#00f0ff]/30 text-[#00f0ff]",
    name: "text-white",
    hint: "text-white/40",
    glow: "after:absolute after:top-0 after:left-0 after:right-0 after:h-[2px] after:bg-[linear-gradient(90deg,#00f0ff,#ff00c8)] after:opacity-0 group-hover:after:opacity-100 after:transition-opacity",
  },
  v2: {
    // Zen & Natural — dark sage, soft and calm
    card: "bg-[#141a12] border-[#2a3824]",
    selectedBorder: "border-[#6b9e5e] shadow-[0_4px_20px_rgba(107,158,94,0.12)]",
    badge: "bg-[#6b9e5e]/10 border-[#6b9e5e]/25 text-[#8bce7e]",
    name: "text-white",
    hint: "text-[#8bce7e]/60",
  },
  v3: {
    // Industrial & Raw — dark concrete gray, exposed, mono
    card: "bg-[#181818] border-[#333333]",
    selectedBorder: "border-[#888] shadow-[0_4px_20px_rgba(255,255,255,0.05)]",
    badge: "bg-white/5 border-white/10 text-white/70",
    name: "text-white",
    hint: "text-white/45",
  },
  v4: {
    // Future & Tech — deep dark, electric blue scanlines
    card: "bg-[#0c0f16] border-[#1a2035]",
    selectedBorder: "border-[#3b82f6] shadow-[0_0_24px_rgba(59,130,246,0.15)]",
    badge: "bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#60a5fa]",
    name: "text-white",
    hint: "text-white/35",
  },
};

const VibeCard: React.FC<{
  id: string; name: string; hint: string; badge?: string;
  isSelected: boolean; onSelect: (id: string) => void;
}> = ({ id, name, hint, badge, isSelected, onSelect }) => {
  const styles = VIBE_STYLES[id] || VIBE_STYLES.v1;
  const isDark = id === "v1" || id === "v4";

  return (
    <div
      onClick={() => onSelect(id)}
      className={`group relative overflow-hidden rounded-[18px] border-[1.5px] cursor-pointer transition-all duration-250 p-5
        ${styles.card}
        ${isSelected ? styles.selectedBorder : "hover:scale-[1.01]"}
        ${styles.glow || ""}
      `}
    >
      {/* Scanline overlay for tech/electric vibes */}
      {(id === "v4") && (
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.015)_2px,rgba(255,255,255,0.015)_4px)] pointer-events-none" />
      )}

      {/* Industrial texture overlay */}
      {id === "v3" && (
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1' height='1' fill='%23000'/%3E%3C/svg%3E\")" }} />
      )}

      {/* Selection indicator */}
      <div className={`absolute top-3 right-3 w-3 h-3 rounded-full border-[1.5px] transition-all duration-200
        ${isSelected
          ? isDark ? "border-white bg-white" : "border-black bg-black"
          : isDark ? "border-white/25" : "border-black/20"
        }
      `} />

      {/* Badge */}
      {badge && (
        <span className={`inline-block text-[8px] tracking-[0.15em] uppercase font-semibold px-2 py-0.5 rounded-full border mb-3 ${styles.badge}`}>
          {badge}
        </span>
      )}

      <div className={`font-syne font-bold text-[15px] mb-1.5 ${styles.name}`}>{name}</div>
      <div className={`text-[11px] leading-relaxed ${styles.hint}`}>{hint}</div>
    </div>
  );
};

export const Step3_Vibe: React.FC<{
  onContinue: (id: string) => void;
  onBack?: () => void;
}> = ({ onContinue, onBack }) => {
  const [selected, setSelected] = useState("");
  const { t } = useLanguage();

  const options = [
    { id: "v1", name: t("airgate.design.s3.v1") as string, hint: t("airgate.design.s3.v1.hint") as string, badge: t("airgate.design.s3.v1.badge") as string },
    { id: "v2", name: t("airgate.design.s3.v2") as string, hint: t("airgate.design.s3.v2.hint") as string },
    { id: "v3", name: t("airgate.design.s3.v3") as string, hint: t("airgate.design.s3.v3.hint") as string },
    { id: "v4", name: t("airgate.design.s3.v4") as string, hint: t("airgate.design.s3.v4.hint") as string },
  ];

  return (
    <QuestionScreen
      phase={t("airgate.design.s3.phase") as string}
      title={<>{t("airgate.design.s3.title")}</>}
      subtitle={t("airgate.design.s3.subtitle") as string}
      canContinue={!!selected}
      onContinue={() => onContinue(selected)}
      onBack={onBack}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-[540px]">
        {options.map((opt) => (
          <VibeCard
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

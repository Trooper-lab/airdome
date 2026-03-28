"use client";

import React, { useState } from "react";
import { QuestionScreen } from "@/components/ui/QuestionScreen";
import { useLanguage } from "@/i18n/LanguageContext";

// ─── SVG Square Dome Floor Plan (top-view, square footprint) ──────────────────
// s = square edge length in SVG units, cx/cy = center
const SquareFloorPlan: React.FC<{
  s: number;          // square size
  multi?: boolean;    // show two overlapping squares for "Multiple"
  isSelected: boolean;
}> = ({ s, multi = false, isSelected }) => {
  const stroke = isSelected ? "#111111" : "#C8C4BC";
  const fill   = isSelected ? "rgba(17,17,17,0.05)" : "rgba(200,196,188,0.18)";
  const dot    = isSelected ? "#111111" : "#C8C4BC";
  const half   = s / 2;

  // Single dome centred at (40, 31)
  const cx1 = multi ? 33 : 40;
  const cy1 = 31;
  const cx2 = 47; // second dome offset right+down for overlap feel
  const cy2 = 31;

  const Square = ({ cx, cy }: { cx: number; cy: number }) => (
    <g>
      <rect
        x={cx - half} y={cy - half}
        width={s} height={s}
        rx="2"
        stroke={stroke} strokeWidth="1.5"
        fill={fill}
      />
      {/* Corner leg dots at 4 corners */}
      {[
        [cx - half, cy - half],
        [cx + half, cy - half],
        [cx - half, cy + half],
        [cx + half, cy + half],
      ].map(([lx, ly], j) => (
        <circle key={j} cx={lx} cy={ly} r="2.2" fill={dot} />
      ))}
      {/* Centre pump dot */}
      <circle cx={cx} cy={cy} r="1.5" fill={stroke} opacity="0.4" />
    </g>
  );

  return (
    <svg width="80" height="60" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <Square cx={cx1} cy={cy1} />
      {multi && <Square cx={cx2} cy={cy2} />}
    </svg>
  );
};

const sizes = (t: Function) => [
  {
    id: "3x3",   label: "3 × 3 m",    sub: t("design.s4.compact")   as string,
    s: 18, multi: false, dim: "3m", sqm: "9 m²"
  },
  {
    id: "4x4",   label: "4 × 4 m",    sub: t("design.s4.standard")  as string,
    s: 22, multi: false, dim: "4m", sqm: "16 m²"
  },
  {
    id: "5x5",   label: "5 × 5 m",    sub: t("design.s4.large")     as string,
    s: 27, multi: false, dim: "5m", sqm: "25 m²"
  },
  {
    id: "6x6",   label: "6 × 6 m",    sub: t("design.s4.xl")        as string,
    s: 32, multi: false, dim: "6m", sqm: "36 m²"
  },
  {
    id: "multi", label: "Multiple",    sub: t("design.s4.connected") as string,
    s: 22, multi: true,  dim: "×2+", sqm: "50+ m²"
  },
  {
    id: "unsure", label: t("design.s4.notSure") as string, sub: t("design.s4.advise") as string,
    s: 0, multi: false, dim: "?", sqm: ""
  },
];

const SizeCard: React.FC<{
  id: string; label: string; sub: string; s: number; multi: boolean; dim: string; sqm: string;
  isSelected: boolean; onSelect: (id: string) => void;
}> = ({ id, label, sub, s, multi, sqm, isSelected, onSelect }) => (
  <div
    onClick={() => onSelect(id)}
    className={`relative p-4 pb-3 text-center cursor-pointer transition-all duration-200 rounded-[16px] border-[1.5px] flex flex-col items-center gap-2
      ${isSelected ? "bg-white border-black shadow-[0_4px_20px_rgba(17,17,16,0.08)]" : "bg-off border-transparent hover:bg-off2 hover:border-[rgba(17,17,16,0.12)]"}
    `}
  >
    {isSelected && <div className="absolute top-0 left-6 right-6 h-0.5 bg-black rounded-b" />}

    {/* Floor plan graphic or question mark */}
    <div className="h-[60px] flex items-center justify-center">
      {s > 0 ? (
        <SquareFloorPlan s={s} multi={multi} isSelected={isSelected} />
      ) : (
        <div className={`w-12 h-12 rounded-full border-[2px] flex items-center justify-center text-[22px] font-syne font-bold
          ${isSelected ? "border-black text-black" : "border-line text-gray2"}`}>
          ?
        </div>
      )}
    </div>

    <div>
      <div className="font-syne font-bold text-[13px] text-black">{label}</div>
      {sqm && <div className="text-[10px] font-mono text-gray2 mt-px">{sqm}</div>}
      <div className="text-[9px] tracking-[0.08em] text-gray2 uppercase mt-1">{sub}</div>
    </div>
  </div>
);

export const Step4_Size: React.FC<{
  onContinue: (id: string) => void;
  onBack?: () => void;
}> = ({ onContinue, onBack }) => {
  const [selected, setSelected] = useState("");
  const { t } = useLanguage();
  const sizeOptions = sizes(t);

  return (
    <QuestionScreen
      phase={t("design.s4.phase") as string}
      title={<>{t("design.s4.title")}</>}
      subtitle={t("design.s4.subtitle") as string}
      canContinue={!!selected}
      onContinue={() => onContinue(selected)}
      onBack={onBack}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full max-w-[540px]">
        {sizeOptions.map((s) => (
          <SizeCard
            key={s.id}
            {...s}
            isSelected={selected === s.id}
            onSelect={setSelected}
          />
        ))}
      </div>

      {/* Dimension note */}
      <div className="mt-5 flex items-center gap-2 px-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray2 shrink-0">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p className="text-[10px] text-gray2">{t("design.s4.note") as string}</p>
      </div>
    </QuestionScreen>
  );
};

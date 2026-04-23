"use client";

import React, { useState } from "react";
import { QuestionScreen } from "@/components/ui/QuestionScreen";
import { useLanguage } from "@/i18n/LanguageContext";
import Image from "next/image";

// 0 walls → 5.png (fully enclosed), images 0–5 + luifel
const TENT_IMAGES = [
  "/tenttypes/1.png",  // Index 0: 0 walls (Image 1 in user list)
  "/tenttypes/2.png",  // Index 1: 1 wall  (Image 2 in user list)
  "/tenttypes/3.png",  // Index 2: 2 walls
  "/tenttypes/4.png",  // Index 3: 4 walls (Image 3 in user list)
  "/tenttypes/5.png",  // Index 4: Fully closed (Image 5 in user list)
];

const LUIFEL_IMAGE = "/tenttypes/luifel.png";

const ConfigCard: React.FC<{
  id: string;
  name: string;
  hint: string;
  image: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}> = ({ id, name, hint, image, isSelected, onSelect }) => (
  <div
    onClick={() => onSelect(id)}
    className={`group relative overflow-hidden rounded-[16px] border-[1.5px] cursor-pointer transition-all duration-200 backdrop-blur-md
      ${isSelected
        ? "border-white/30 bg-white/10 shadow-[0_6px_24px_rgba(0,0,0,0.3)] scale-[1.01]"
        : "border-transparent bg-white/5 hover:border-white/20 hover:bg-white/10"
      }
    `}
  >
    {isSelected && <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-white z-10" />}

    {/* Tent image */}
    <div className="relative h-[140px] w-full flex items-center justify-center p-3 bg-white/5">
      <Image
        src={image}
        alt={name}
        width={180}
        height={130}
        className={`object-contain max-h-full transition-transform duration-300 invert brightness-0 ${isSelected ? "scale-105" : "group-hover:scale-[1.03]"}`}
      />
    </div>

    <div className="p-3 pt-2.5">
      <div className="font-syne font-bold text-[12px] text-white mb-0.5">{name}</div>
      <div className="text-[10px] text-gray-400 leading-relaxed">{hint}</div>
    </div>

    <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200
      ${isSelected ? "border-white bg-white" : "border-white/10 bg-white/5"}`}
    >
      {isSelected && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  </div>
);

export const Step5_Config: React.FC<{
  onContinue: (id: string) => void;
  onBack?: () => void;
}> = ({ onContinue, onBack }) => {
  const [selected, setSelected] = useState("");
  const [withExtension, setWithExtension] = useState(false);
  const { t } = useLanguage();

  // 5 options: 0 walls → 4 walls (fully enclosed)
  const options = [
    { id: "w0", name: t("design.s5.w0") as string, hint: t("design.s5.w0.hint") as string, image: TENT_IMAGES[0] },
    { id: "w1", name: t("design.s5.w1") as string, hint: t("design.s5.w1.hint") as string, image: TENT_IMAGES[1] },
    { id: "w2", name: t("design.s5.w2") as string, hint: t("design.s5.w2.hint") as string, image: TENT_IMAGES[2] },
    { id: "w3", name: t("design.s5.w3") as string, hint: t("design.s5.w3.hint") as string, image: TENT_IMAGES[3] },
    { id: "w4", name: t("design.s5.w4") as string, hint: t("design.s5.w4.hint") as string, image: TENT_IMAGES[4] },
  ];

  const handleContinue = () => {
    onContinue(withExtension ? `${selected}+extension` : selected);
  };

  return (
    <QuestionScreen
      phase={t("design.s5.phase") as string}
      title={<>{t("design.s5.title")}</>}
      subtitle={t("design.s5.subtitle") as string}
      canContinue={!!selected}
      onContinue={handleContinue}
      onBack={onBack}
    >
      {/* 5 options in a 3+2 grid */}
      <div className="w-full max-w-[540px]">
        <div className="grid grid-cols-3 gap-2 mb-2">
          {options.slice(0, 3).map((opt) => (
            <ConfigCard key={opt.id} {...opt} isSelected={selected === opt.id} onSelect={setSelected} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {options.slice(3).map((opt) => (
            <ConfigCard key={opt.id} {...opt} isSelected={selected === opt.id} onSelect={setSelected} />
          ))}
        </div>
      </div>

      {/* Extension Toggle */}
      <div
        onClick={() => setWithExtension(v => !v)}
        className={`mt-3 w-full max-w-[540px] flex items-center gap-4 p-4 rounded-[16px] border-[1.5px] cursor-pointer transition-all duration-200 backdrop-blur-md
          ${withExtension
            ? "border-white/30 bg-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
            : "border-transparent bg-white/5 hover:border-white/20 hover:bg-white/10"
          }
        `}
      >
        <div className="w-[100px] h-[68px] rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 p-2">
          <Image src={LUIFEL_IMAGE} alt="Canopy extension" width={92} height={60} className="object-contain invert brightness-0" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-syne font-bold text-[13px] text-white">{t("design.s5.extension.title") as string}</div>
          <div className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{t("design.s5.extension.hint") as string}</div>
        </div>

        {/* Toggle */}
        <div
          className={`shrink-0 w-11 rounded-full border-[1.5px] relative transition-all duration-200 flex items-center ${withExtension ? "bg-white border-white" : "bg-white/5 border-white/20"}`}
          style={{ height: 24 }}
        >
          <div className={`absolute top-[2.5px] w-[16px] h-[16px] rounded-full shadow transition-all duration-200 ${withExtension ? "left-[20px] bg-black" : "left-[3px] bg-gray-400"}`} />
        </div>
      </div>
    </QuestionScreen>
  );
};

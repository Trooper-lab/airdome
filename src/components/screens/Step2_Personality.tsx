"use client";

import React, { useState, useRef } from "react";
import { QuestionScreen } from "@/components/ui/QuestionScreen";
import gsap from "gsap";

interface PersonalityCardProps {
  id: string;
  name: string;
  ref: string;
  num: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  variant: string;
}

const PersonalityCard: React.FC<PersonalityCardProps> = ({ id, name, ref, num, isSelected, onSelect, variant }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleEnter = () => {
    if (!isSelected) gsap.to(cardRef.current, { scale: 1.02, duration: 0.2, ease: "power2.out" });
  };
  
  const handleLeave = () => {
    if (!isSelected) gsap.to(cardRef.current, { scale: 1, duration: 0.2, ease: "power2.out" });
  };

  const handleClick = () => {
    gsap.fromTo(cardRef.current, { scale: 0.95 }, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.4)" });
    onSelect(id);
  };

  const gradientMap: Record<string, string> = {
    rebel: "bg-[linear-gradient(135deg,#F0EDE8,#E8E2D8)]",
    bold: "bg-[linear-gradient(135deg,#EAEAF0,#E0E3EE)]",
    clean: "bg-[linear-gradient(135deg,#EAF0EA,#E0EEE0)]",
    premium: "bg-[linear-gradient(135deg,#F0EDE4,#EEE8D8)]",
    friendly: "bg-[linear-gradient(135deg,#F2EDEA,#EEE4E0)]",
    other: "bg-[linear-gradient(135deg,#EDEDF0,#E8E8EE)]"
  };

  return (
    <div 
      ref={cardRef}
      onClick={handleClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={`relative h-24 overflow-hidden border-[1.5px] rounded-[14px] cursor-pointer transition-colors duration-180
        ${isSelected ? "border-black" : "border-line hover:border-[rgba(17,17,16,0.3)]"}
        ${gradientMap[variant] || gradientMap.other}
      `}
    >
      {isSelected && <div className="absolute top-0 left-0 right-0 h-0.5 bg-black" />}
      <div className="absolute top-2 right-2.5 font-syne font-extrabold text-[22px] text-black/5 leading-none">
        {num}
      </div>
      <div className={`absolute top-2.5 left-2.5 w-2 h-2 rounded-full border-[1.5px] border-line transition-all
        ${isSelected ? "bg-black border-black" : ""}
      `} />
      <div className="absolute bottom-0 left-0 right-0 p-[10px_12px]">
        <div className="font-syne font-bold text-[11px] text-black mb-[1px]">{name}</div>
        <div className="text-[8px] tracking-[0.06em] text-gray2 uppercase">{ref}</div>
      </div>
    </div>
  );
};

export const Step2_Personality: React.FC<{ onContinue: (id: string) => void }> = ({ onContinue }) => {
  const [selected, setSelected] = useState("");

  const options = [
    { id: "rebel", name: "The Rebel", ref: "Edge / Bold / Raw", num: "01", variant: "rebel" },
    { id: "bold", name: "The Bold", ref: "Strong / Direct", num: "02", variant: "bold" },
    { id: "clean", name: "The Minimalist", ref: "Pure / Simple", num: "03", variant: "clean" },
    { id: "premium", name: "The Elite", ref: "Luxury / High-End", num: "04", variant: "premium" },
    { id: "friendly", name: "The Ally", ref: "Warm / Approachable", num: "05", variant: "friendly" },
    { id: "other", name: "Experimental", ref: "Unique / Avant-Garde", num: "06", variant: "other" }
  ];

  return (
    <QuestionScreen
      phase="Phase 1 — Style"
      title={<>Define your brand's <em>personality</em>.</>}
      subtitle="This helps us determine the shape and structure of your dome."
      canContinue={!!selected}
      onContinue={() => onContinue(selected)}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-0.5 w-full max-w-[540px]">
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

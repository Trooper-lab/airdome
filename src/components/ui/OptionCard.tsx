"use client";

import React, { useRef } from "react";
import gsap from "gsap";

interface Option {
  id: string;
  name: string;
  hint?: string;
  badge?: string;
}

interface OptionCardProps {
  option: Option;
  isSelected: boolean;
  onSelect: (id: string) => void;
  columns?: 1 | 2 | 3;
}

export const OptionCard: React.FC<OptionCardProps> = ({ option, isSelected, onSelect, columns = 1 }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleEnter = () => {
    if (!isSelected) gsap.to(cardRef.current, { scale: 1.02, duration: 0.2, ease: "power2.out" });
  };
  
  const handleLeave = () => {
    if (!isSelected) gsap.to(cardRef.current, { scale: 1, duration: 0.2, ease: "power2.out" });
  };

  const handleClick = () => {
    gsap.fromTo(cardRef.current, { scale: 0.95 }, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.4)" });
    onSelect(option.id);
  };

  return (
    <div 
      ref={cardRef}
      onClick={handleClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={`relative flex items-center gap-[14px] p-[15px_18px] cursor-pointer transition-colors duration-180 select-none rounded-[14px] border-[1.5px]
        ${isSelected 
          ? "bg-white border-black" 
          : "bg-off border-transparent hover:bg-off2 hover:border-[rgba(17,17,16,0.12)]"
        }
      `}
    >
      <div className={`w-5 h-5 rounded-full border-[1.5px] border-line flex-shrink-0 flex items-center justify-center transition-all duration-180
        ${isSelected ? "border-black bg-black shadow-[inset_0_0_0_4px_white]" : ""}
      `} />
      
      <div className="flex-1">
        <div className="font-syne font-semibold text-[13px] text-black leading-tight mb-[1px]">
          {option.name}
        </div>
        {option.hint && (
          <div className="text-[10px] text-gray2 leading-tight">
            {option.hint}
          </div>
        )}
      </div>

      {option.badge && (
        <div className="ml-auto text-[9px] tracking-[0.08em] text-gray2 uppercase flex-shrink-0">
          {option.badge}
        </div>
      )}
    </div>
  );
};

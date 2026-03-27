"use client";

import React from "react";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

interface ToolNavProps {
  currentStep: number;
}

const stepsKeys = [
  "step.brand", "step.style", "step.size", "step.config", "step.events", "step.usage", "step.budget", "step.contact"
];

export const ToolNav: React.FC<ToolNavProps> = ({ currentStep }) => {
  const { t } = useLanguage();
  const totalSteps = 8;
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  // Determine Phase logic based on matching prototype text
  let phase = "1 OF 3";
  if (currentStep > 3) phase = "2 OF 3";
  if (currentStep > 6) phase = "3 OF 3";

  return (
    <nav className="fixed top-0 left-0 right-0 z-[200] bg-white border-b border-line">
      {/* Top Header */}
      <div className="h-[60px] px-6 md:px-12 flex items-center justify-between border-b border-line">
        <Link 
          href="/" 
          className="hover:opacity-70 transition-opacity"
        >
          <img 
            src="/airdome-logo-black-320x163.png" 
            alt="Airdome Logo" 
            className="h-6 md:h-7 w-auto object-contain"
          />
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <span className="font-spline font-bold text-[9px] tracking-[0.15em] text-black uppercase px-[14px] py-[6px] border-[1.5px] border-line rounded-full bg-off">
            {t("toolnav.phase")} {phase}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="w-full relative px-6 md:px-12 pb-3 pt-[14px]">
        {/* Lines Container (absolute to align exactly with dots' centers) */}
        <div className="absolute top-[18px] left-6 right-6 md:left-12 md:right-12 px-[5px]">
          <div className="w-full h-px bg-line relative rounded-full">
            <div 
              className="absolute top-0 left-0 h-full bg-black transition-all duration-700 ease-out rounded-full"
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
        
        {/* Dots */}
        <div className="flex justify-between relative z-10">
          {stepsKeys.map((stepKey, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === currentStep;
            const isDone = stepNum < currentStep;

            return (
              <div key={stepKey} className="flex flex-col items-center gap-[6px]">
                <div 
                  className={`transition-all duration-300 rounded-full
                    ${isDone ? "w-2 h-2 bg-black" : "w-2 h-2 bg-off border-[1.5px] border-line"} 
                    ${isActive ? "w-[9px] h-[9px] bg-black shadow-[0_0_0_2px_white,0_0_0_3.5px_black]" : ""}
                  `}
                />
                <span className={`text-[7px] sm:text-[8px] tracking-[0.08em] uppercase whitespace-nowrap
                  ${isActive ? "text-black font-bold" : "text-gray2"}
                `}>
                  {t(stepKey)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

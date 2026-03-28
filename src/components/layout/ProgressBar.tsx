"use client";

import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  const { t } = useLanguage();
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  const steps = [
    t("step.1"), 
    t("step.2"), 
    t("step.3"), 
    t("step.4"), 
    t("step.5"), 
    t("step.6"), 
    t("step.7"), 
    t("step.8")
  ];

  return (
    <div className="w-full">
      {/* Progress Bar Line */}
      <div className="h-[5px] bg-off2 relative">
        <div 
          className="h-full bg-gradient-to-r from-black to-[#555] transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) relative"
          style={{ width: `${progress}%` }}
        >
          {/* Active Dot on Fill */}
          {progress > 0 && (
            <div className="absolute -right-[1px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-black shadow-[0_0_0_3px_rgba(17,17,16,0.12)] transition-opacity duration-300" />
          )}
        </div>
      </div>

      {/* Step Dots & Labels */}
      <div className="flex justify-between px-12 pt-[7px]">
        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === currentStep;
          const isDone = stepNum < currentStep;

          return (
            <div key={index} className="flex flex-col items-center gap-[3px] relative">
              <div 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 
                  ${isDone ? "bg-black border-black" : "bg-line border-line"} 
                  ${isActive ? "bg-black border-black shadow-[0_0_0_3px_rgba(17,17,16,0.1)] w-2 h-2" : "border-[1.5px]"}
                `}
              />
              <span className={`hidden sm:block text-[8px] sm:text-[9px] tracking-[0.08em] uppercase whitespace-nowrap mt-1
                ${isActive ? "text-black font-semibold" : "text-gray2"}
              `}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface QuestionScreenProps {
  phase: string;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  onContinue: () => void;
  canContinue: boolean;
  buttonLabel?: string;
  hideButton?: boolean;
}

export const QuestionScreen: React.FC<QuestionScreenProps> = ({
  phase,
  title,
  subtitle,
  children,
  onContinue,
  canContinue,
  buttonLabel = "Continue",
  hideButton = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Initial hidden state for the container to prevent FOUC is handled by setting opacity 0 below
    gsap.fromTo(
      ".gsap-reveal",
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="w-full max-w-[640px] px-6 py-[88px] pb-24 flex flex-col items-center text-center">
      <div className="gsap-reveal text-[9px] tracking-[0.4em] text-gray2 uppercase mb-[10px] flex items-center justify-center gap-[10px] opacity-0">
        <span className="w-4 h-px bg-gray2" />
        {phase}
        <span className="w-4 h-px bg-gray2" />
      </div>

      <h1 className="gsap-reveal font-syne font-extrabold text-[32px] md:text-[52px] leading-[1.08] tracking-tight text-black mb-4 max-w-[580px] opacity-0">
        {title}
      </h1>

      {subtitle && (
        <p className="gsap-reveal text-sm leading-[1.7] text-gray mb-8 max-w-[400px] opacity-0">
          {subtitle}
        </p>
      )}

      <div className="gsap-reveal w-full max-w-[540px] text-left opacity-0">
        {children}
      </div>

      {!hideButton && (
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className="gsap-reveal inline-flex items-center gap-[10px] px-9 py-[15px] bg-black text-white font-syne font-bold text-[11px] tracking-widest uppercase border-none rounded-full cursor-pointer shadow-[0_2px_8px_rgba(17,17,16,0.15)] mt-8 hover:translate-y-[-1px] hover:shadow-[0_4px_16px_rgba(17,17,16,0.2)] disabled:opacity-25 disabled:cursor-default disabled:transform-none transition-all opacity-0"
        >
          {buttonLabel}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      )}
    </div>
  );
};

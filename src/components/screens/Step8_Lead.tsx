"use client";

import React, { useState, useRef } from "react";
import { QuestionScreen } from "@/components/ui/QuestionScreen";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLanguage } from "@/i18n/LanguageContext";

// ─── Success Screen ────────────────────────────────────────────────────────────
const SuccessScreen: React.FC<{ brandName: string }> = ({ brandName }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useGSAP(() => {
    gsap.fromTo(".s8-success",
      { opacity: 0, y: 20, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.12, ease: "back.out(1.7)" }
    );
  }, { scope: ref });

  return (
    <div ref={ref} className="flex flex-col items-center justify-center min-h-[420px] text-center px-4">
      {/* Animated check */}
      <div className="s8-success opacity-0 w-20 h-20 bg-white rounded-full flex items-center justify-center mb-7 shadow-[0_8px_32px_rgba(255,255,255,0.1)]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <div className="s8-success opacity-0 text-[10px] tracking-[0.3em] text-gray-400 uppercase mb-3">
        {t("design.s8.success.eyebrow")}
      </div>
      <h2 className="s8-success opacity-0 font-syne font-extrabold text-[36px] md:text-[44px] text-white tracking-tight leading-[1.05] mb-4 max-w-[420px]">
        {brandName
          ? (t("design.s8.success.title.brand") as string).replace("{brand}", brandName)
          : t("design.s8.success.title")}
      </h2>
      <p className="s8-success opacity-0 text-gray-400 text-[15px] leading-relaxed max-w-[320px] mb-8">
        {t("design.s8.success.subtitle")}
      </p>
      {/* Timeline */}
      <div className="s8-success opacity-0 flex items-center gap-5 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl">
        {([
          {
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            ),
            label: t("design.s8.success.t1")
          },
          {
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4"/><path d="M12 16h.01"/>
              </svg>
            ),
            label: t("design.s8.success.t2")
          },
          {
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            ),
            label: t("design.s8.success.t3")
          },
        ] as any[]).map((item, i) => (
          <React.Fragment key={i}>
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center mx-auto mb-1.5">{item.icon}</div>
              <div className="text-[10px] text-gray-400 leading-tight">{item.label}</div>
            </div>
            {i < 2 && <div className="w-6 h-px bg-white/10" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ─── Selections Summary Pill Row ───────────────────────────────────────────────
const SummaryPills: React.FC<{ selections: any }> = ({ selections }) => {
  const { t } = useLanguage();
  const pills = [
    selections?.size && { label: selections.size.replace("x", "×"), key: "size" },
    selections?.config && { label: selections.config.split("+")[0], key: "config" },
    selections?.event && { label: t(`design.s6.${selections.event}`) as string, key: "event" },
    selections?.urgency && { label: t(`design.s7.${selections.urgency}`) as string, key: "urgency" },
  ].filter(Boolean) as { label: string; key: string }[];

  if (!pills.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mb-6 justify-center">
      {pills.map((p) => (
        <span key={p.key} className="text-[10px] tracking-wide text-gray-300 bg-white/5 border border-white/10 rounded-full px-3 py-1 uppercase">
          {p.label}
        </span>
      ))}
    </div>
  );
};

// ─── Step 8 ────────────────────────────────────────────────────────────────────
export const Step8_Lead: React.FC<{
  selections: any;
  onComplete: () => void;
  onBack?: () => void;
}> = ({ selections, onComplete, onBack }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t, locale } = useLanguage();

  const brandName = selections?.brand?.name || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...selections, language: locale }),
      });
    } catch {}
    setSubmitted(true);
    setTimeout(onComplete, 2000);
  };

  if (submitted) return <SuccessScreen brandName={brandName} />;

  const headline = brandName
    ? (t("design.s8.title.brand") as string).replace("{brand}", brandName)
    : t("design.s8.title") as string;

  return (
    <QuestionScreen
      phase={t("design.s8.phase") as string}
      title={<>{headline}</>}
      subtitle={t("design.s8.subtitle") as string}
      canContinue={true}
      hideButton={true}
      onContinue={() => {}}
      onBack={onBack}
    >
      {/* Summary pills */}
      <SummaryPills selections={selections} />

      {/* Email form */}
      <form onSubmit={handleSubmit} className="w-full max-w-[420px] space-y-3 mx-auto">
        {/* Email + CTA inline */}
        <div className="relative">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("design.s8.placeholder") as string}
            className="w-full h-[60px] pl-5 pr-[130px] bg-white/5 border-[1.5px] border-white/10 rounded-2xl font-jakarta text-[15px] text-white outline-none transition-all focus:border-white/30 focus:bg-white/10 placeholder:text-gray-500"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="absolute right-2 top-2 bottom-2 px-5 bg-white text-black rounded-xl font-syne font-bold text-[12px] tracking-widest uppercase hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
          >
            {isSubmitting ? "..." : t("design.s8.button")}
          </button>
        </div>

        {/* Social proof micro-stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              ),
              stat: t("design.s8.stat1")
            },
            {
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              ),
              stat: t("design.s8.stat2")
            },
            {
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              ),
              stat: t("design.s8.stat3")
            },
          ].map((item: any, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 p-3 bg-white/5 border border-white/10 rounded-xl">
              <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center">{item.icon}</div>
              <span className="text-[10px] text-gray-400 text-center leading-tight">{item.stat}</span>
            </div>
          ))}
        </div>

        {/* Legal line */}
        <p className="text-[10px] text-gray-500 text-center leading-relaxed">
          {t("design.s8.terms")}
        </p>
      </form>
    </QuestionScreen>
  );
};

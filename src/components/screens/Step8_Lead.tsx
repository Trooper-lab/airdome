"use client";

import React, { useState } from "react";
import { QuestionScreen } from "@/components/ui/QuestionScreen";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const SuccessScreen: React.FC = () => {
  const ref = React.useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.fromTo(
      ".gsap-success", 
      { opacity: 0, y: 15, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.15, ease: "back.out(1.7)" }
    );
  }, { scope: ref });

  return (
    <div ref={ref} className="flex flex-col items-center justify-center min-h-[400px]">
       <div className="gsap-success w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6 opacity-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
       </div>
       <h2 className="gsap-success font-syne font-extrabold text-[32px] text-black text-center mb-2 tracking-tight opacity-0">Design <em>Initiated.</em></h2>
       <p className="gsap-success text-gray2 text-center text-[15px] opacity-0">Check your inbox. Our designers are on it.</p>
    </div>
  );
};

export const Step8_Lead: React.FC<{ 
  selections: any; 
  onComplete: () => void 
}> = ({ selections, onComplete }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
             email,
             brandUrl: selections.brand?.url || null,
             personality: selections.personality,
             vibe: selections.vibe,
             size: selections.size,
             config: selections.config,
             event: selections.event
          }),
        });
      } catch (error) {
        console.error("Failed to submit lead", error);
      } finally {
        setSubmitted(true);
        setTimeout(() => onComplete(), 1500);
      }
    }
  };

  if (submitted) {
    return <SuccessScreen />;
  }

  return (
    <QuestionScreen
      phase="Final Step"
      title={<>Where should we send <em>your design?</em></>}
      subtitle="Our team will create a custom 3D render based on your specs."
      canContinue={false} // We use the form submit
      onContinue={() => {}} 
      hideButton={true}
    >
      <form onSubmit={handleSubmit} className="w-full max-w-[400px] space-y-4">
        <div className="relative group">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full h-[64px] px-6 bg-white border-[1.5px] border-line rounded-2xl font-jakarta text-[16px] text-black outline-none transition-all focus:border-black placeholder:text-gray2/40"
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 bottom-2 px-6 bg-black text-white rounded-xl font-syne font-bold text-[14px] hover:bg-black/90 transition-all active:scale-95"
          >
            Get Design
          </button>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-off border border-line rounded-xl">
           <div className="text-[18px]">⚡️</div>
           <div className="text-[11px] text-gray2 leading-relaxed">
              <strong>Zero commitment.</strong> Receive your custom 3D render and personal quote within 24 hours.
           </div>
        </div>

        <p className="text-[10px] text-gray2/60 text-center px-4">
          By continuing, you agree to our Terms and that we may contact you regarding your design request.
        </p>
      </form>
    </QuestionScreen>
  );
};

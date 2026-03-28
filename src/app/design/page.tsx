"use client";

import React, { useState } from "react";
import { ToolNav } from "@/components/layout/ToolNav";
import { ProgressBar } from "@/components/layout/ProgressBar";
import { Step1_Search } from "@/components/screens/Step1_Search";
import { Step2_Personality } from "@/components/screens/Step2_Personality";
import { Step3_Vibe } from "@/components/screens/Step3_Vibe";
import { Step4_Size } from "@/components/screens/Step4_Size";
import { Step5_Config } from "@/components/screens/Step5_Config";
import { Step6_Event } from "@/components/screens/Step6_Event";
import { Step7_FinalConfig } from "@/components/screens/Step7_FinalConfig";
import { Step8_Lead } from "@/components/screens/Step8_Lead";

export default function Home() {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({
    brand: null as any,
    personality: "",
    vibe: "",
    size: "",
    config: "",
    event: "",
    urgency: "",
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const updateSelection = (key: string, value: any) => {
    setSelections(prev => ({ ...prev, [key]: value }));
    nextStep();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1_Search onComplete={(brand) => updateSelection("brand", brand)} />;
      case 2:
        return <Step2_Personality onContinue={(val) => updateSelection("personality", val)} onBack={prevStep} />;
      case 3:
        return <Step3_Vibe onContinue={(val) => updateSelection("vibe", val)} onBack={prevStep} />;
      case 4:
        return <Step4_Size onContinue={(val) => updateSelection("size", val)} onBack={prevStep} />;
      case 5:
        return <Step5_Config onContinue={(val) => updateSelection("config", val)} onBack={prevStep} />;
      case 6:
        return <Step6_Event onContinue={(val) => updateSelection("event", val)} onBack={prevStep} />;
      case 7:
        return <Step7_FinalConfig selections={selections} onContinue={(urgency) => updateSelection("urgency", urgency)} onBack={prevStep} />;
      case 8:
        return <Step8_Lead selections={selections} onComplete={() => {}} onBack={prevStep} />;
      default:
        return <div>All steps completed</div>;
    }
  };

  return (
    <main className="min-h-screen bg-white pt-[115px]">
      <ToolNav currentStep={step} onStepClick={setStep} />
      
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div key={step} className="flex flex-col items-center w-full">
          {renderStep()}
        </div>
      </div>
    </main>
  );
}

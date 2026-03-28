"use client";

import React from "react";
import { SalesProvider } from "@/context/SalesContext";
import SalesSidebar from "@/components/sales/SalesSidebar";
import { Toaster } from "sonner";
import ErrorBoundary from "@/components/sales/ErrorBoundary";

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <SalesProvider>
      <Toaster theme="dark" position="bottom-right" className="font-syne" />
      <div className="flex h-screen bg-[#060608] text-white font-spline overflow-hidden selection:bg-accent/30 selection:text-white">
        {/* Dynamic Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[140px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[130px] rounded-full mix-blend-screen" />
        </div>

        {/* Sidebar */}
        <SalesSidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto z-10 p-12">
          <div className="max-w-6xl mx-auto">
            <ErrorBoundary name="Main Dashboard View">
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
      
      {/* Global Inspector Modal */}
      <ErrorBoundary name="Lead Inspector Modal">
        <GlobalLeadInspector />
      </ErrorBoundary>
    </SalesProvider>
  );
}

function GlobalLeadInspector() {
  const { selectedLead, setSelectedLead, updateLeadInState } = require("@/context/SalesContext").useSales();
  const LeadInspector = require("@/components/sales/LeadInspector").default;
  
  if (!selectedLead) return null;
  return (
    <LeadInspector 
       lead={selectedLead} 
       onClose={() => setSelectedLead(null)} 
       onUpdateLead={updateLeadInState} 
    />
  );
}

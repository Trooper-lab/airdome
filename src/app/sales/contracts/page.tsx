"use client";

import React, { useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useSales, calculateLeadScore } from "@/context/SalesContext";

export default function ClosedLeadsPage() {
  const { leads, loading, setSelectedLead, scoringWeights } = useSales();

  useGSAP(() => {
    gsap.fromTo(".view-title", 
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" }
    );
    gsap.fromTo(".card-anim", 
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        stagger: 0.1, 
        duration: 1, 
        delay: 0.2,
        ease: "power4.out" 
      }
    );
  }, []);

  const closedLeads = useMemo(() => {
    return leads
      .filter(l => l.pipeline_stage === 'closed')
      .sort((a, b) => {
        const dateA = a.approvedAt ? new Date(a.approvedAt).getTime() : 0;
        const dateB = b.approvedAt ? new Date(b.approvedAt).getTime() : 0;
        return dateB - dateA; // Sort by newest approved first
      });
  }, [leads]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="view-title font-syne font-extrabold text-[48px] tracking-tight leading-none mb-4 text-white uppercase italic">
            Closed Leads
          </h1>
          <p className="text-gray2 text-lg max-w-xl">
            Successfully closed deals and approved presentations ready for CRM hand-off.
          </p>
        </div>
        <button 
           className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center gap-2"
           onClick={() => alert("CRM Batch Integration placeholder")}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export All to CRM
        </button>
      </div>

      <div className="card-anim w-full bg-black/40 border border-white/5 rounded-[40px] p-2 md:p-8 backdrop-blur-md">
        {closedLeads.length === 0 ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-6 border border-accent/30">
              <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-syne font-extrabold text-3xl mb-4 italic uppercase">No Closed Deals Yet</h2>
            <p className="text-gray2 max-w-lg">When a client approves a presentation or you move a lead to "Closed/Won" on the Pipeline, they will appear here for CRM processing.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="p-4 font-syne font-bold text-[10px] uppercase tracking-widest text-gray border-b border-white/5 whitespace-nowrap">Brand / Client</th>
                  <th className="p-4 font-syne font-bold text-[10px] uppercase tracking-widest text-gray border-b border-white/5 whitespace-nowrap">Approved Date</th>
                  <th className="p-4 font-syne font-bold text-[10px] uppercase tracking-widest text-gray border-b border-white/5 whitespace-nowrap">Project Scope</th>
                  <th className="p-4 font-syne font-bold text-[10px] uppercase tracking-widest text-gray border-b border-white/5 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {closedLeads.map((lead) => {
                  const score = calculateLeadScore(lead, scoringWeights);
                  const approvalDate = lead.approvedAt ? new Date(lead.approvedAt).toLocaleDateString() : 'Manual Transition';
                  
                  return (
                    <tr key={lead.id} className="group border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setSelectedLead(lead)}>
                          {lead.brand?.logo ? (
                            <img src={lead.brand.logo} className="w-10 h-10 rounded-xl bg-white object-contain p-1" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-syne font-bold">
                              {lead.brand?.name?.[0] || lead.email?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-syne font-bold text-white group-hover:text-accent transition-colors">{lead.brand?.name || lead.email.split('@')[0]}</div>
                            <div className="text-xs text-gray2">{lead.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray2">
                        <div className="inline-flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                           {approvalDate}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-bold text-white uppercase tracking-widest">
                            {lead.size}
                          </span>
                          <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-bold text-gray uppercase tracking-widest">
                            {lead.config}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                           className="px-4 py-2 bg-accent text-black rounded-lg font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-transform"
                           onClick={(e) => { e.stopPropagation(); alert(`CRM Integration hook for ${lead.email}`); }}
                        >
                          Send to CRM
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

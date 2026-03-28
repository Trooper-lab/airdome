"use client";

import React, { useState, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useSales } from "@/context/SalesContext";

export default function PresentationsPage() {
  const { leads, loading, setSelectedLead } = useSales();
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  useGSAP(() => {
    gsap.from(".view-title", { opacity: 0, x: -20, duration: 0.8, ease: "power3.out" });
    gsap.from(".tab-anim", { opacity: 0, scale: 0.95, duration: 0.6, delay: 0.1 });
  }, []);

  useGSAP(() => {
    // Re-trigger card animation when tab changes
    gsap.fromTo(".card-anim", 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, stagger: 0.05, duration: 0.6, ease: "power4.out" }
    );
  }, [activeTab]);

  const presentationLeads = useMemo(() => {
    // Filter the raw leads: only show presentations that actually have renders uploaded
    const filtered = leads.filter(l => l.renders && l.renders.length > 0);

    if (activeTab === 'active') {
      return filtered.filter(l => l.pipeline_stage !== 'lost' && l.pipeline_stage !== 'closed');
    } else {
      return filtered.filter(l => l.pipeline_stage === 'lost' || l.pipeline_stage === 'closed');
    }
  }, [leads, activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="view-title font-syne font-extrabold text-[48px] tracking-tight leading-none mb-4 text-white uppercase italic">
            Presentations
          </h1>
          <p className="text-gray2 text-lg max-w-xl">
            Deploy custom-branded landing pages for any lead. AI-optimized content for premium brand experiences.
          </p>
        </div>
        
        {/* Tab Controls */}
        <div className="tab-anim flex bg-black/40 border border-white/10 p-1.5 rounded-2xl backdrop-blur-sm self-end">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${
              activeTab === 'active' 
                ? 'bg-accent text-black shadow-[0_0_20px_rgba(0,242,255,0.2)]' 
                : 'text-gray hover:text-white hover:bg-white/5'
            }`}
          >
            Active Pipeline
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${
              activeTab === 'archived' 
                ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                : 'text-gray hover:text-white hover:bg-white/5'
            }`}
          >
            Closed / Lost
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {presentationLeads.length === 0 && (
          <div className="col-span-full py-20 text-center card-anim opacity-0">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border ${activeTab === 'active' ? 'bg-white/5 border-white/10 text-gray2' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {activeTab === 'active' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                )}
              </svg>
            </div>
            <h3 className="text-xl font-syne font-extrabold text-white mb-2 italic uppercase">
              {activeTab === 'active' ? 'No Presentations Yet' : 'No Archived Presentations'}
            </h3>
            <p className="text-gray2">
              {activeTab === 'active' ? 'Upload renders to a lead to automatically generate their custom presentation view.' : 'Leads explicitly dropped into the Lost / Archive portal will appear here.'}
            </p>
          </div>
        )}
        
        {presentationLeads.map(lead => {
          // Robust fallback: if they don't have a 'slug', their id is legally their slug on the dynamic route page.
          const finalSlug = lead.slug || lead.id;
          const host = typeof window !== 'undefined' ? window.location.host : '';
          
          return (
            <div key={lead.id} className={`card-anim bg-white/5 border border-white/5 rounded-3xl p-6 transition-all flex flex-col group ${
              activeTab === 'archived' ? 'opacity-70 hover:opacity-100 hover:border-red-500/30' : 'hover:bg-white/10'
            }`}>
              <div 
                 className="aspect-video bg-black/40 rounded-xl mb-6 overflow-hidden border border-white/10 relative cursor-pointer"
                 onClick={() => setSelectedLead(lead)}
              >
                 {lead.renders?.[0] ? (
                   <img src={lead.renders[0]} alt="Render" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center">
                     <span className="text-white/20 font-syne font-extrabold text-2xl italic">AIRDOME</span>
                   </div>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 
                 <div className={`absolute bottom-3 right-3 px-2.5 py-1 border rounded-md backdrop-blur-md text-[9px] font-bold uppercase tracking-widest ${
                   activeTab === 'archived' 
                     ? 'bg-red-500/20 border-red-500/50 text-red-500' 
                     : 'bg-accent/20 border-accent/20 text-accent'
                 }`}>
                   {activeTab === 'archived' ? 'Archived' : 'Live'}
                 </div>
              </div>
              
              <h4 className="text-lg font-syne font-extrabold text-white mb-3 truncate">{lead.brand?.name || lead.email.split('@')[0]}</h4>
              
              <div 
                 className={`flex items-center gap-2 mb-6 p-2 rounded-xl border cursor-pointer transition-colors ${
                   activeTab === 'archived' 
                     ? 'bg-red-500/5 border-red-500/10 hover:bg-red-500/10' 
                     : 'bg-black/40 border-white/5 hover:bg-black/60'
                 }`}
                 onClick={() => {navigator.clipboard.writeText(`${host}/p/${finalSlug}`); alert("Link copied!");}}
              >
                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 'archived' ? 'bg-red-500/10' : 'bg-white/5'}`}>
                   <svg className={`w-4 h-4 ${activeTab === 'archived' ? 'text-red-500' : 'text-gray'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                 </div>
                 <p className={`text-[10px] truncate font-bold tracking-widest ${activeTab === 'archived' ? 'text-red-400' : 'text-accent'}`}>{host}/p/{finalSlug}</p>
              </div>
              
              <div className="flex gap-2 mt-auto">
                <button 
                  onClick={() => window.open(`/p/${finalSlug}`, '_blank')}
                  className={`flex-[2] px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-transform ${
                    activeTab === 'archived' 
                      ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                      : 'bg-accent text-black shadow-[0_0_20px_rgba(0,242,255,0.2)]'
                  }`}
                >
                  View Page
                </button>
                <button 
                   onClick={() => setSelectedLead(lead)}
                   className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

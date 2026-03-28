"use client";

import React, { useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useSales, calculateLeadScore, getTemperatureStatus } from "@/context/SalesContext";
import { toast } from "sonner";
import { doc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function SalesOverviewPage() {
  const { leads, loading, setSelectedLead, scoringWeights, teamAgents, updateLeadData } = useSales();
  const [selectedLeadIds, setSelectedLeadIds] = React.useState<string[]>([]);
  const [filterAgent, setFilterAgent] = React.useState<string>("all");
  const [filterSearch, setFilterSearch] = React.useState("");

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

  const { 
    visibleLeads, 
    activePresentations, 
    totalLeadsCount, 
    closedWonCount, 
    hotLeadCount,
    avgClosingTimeDays,
    urgentLeadsCount
  } = useMemo(() => {
    // 1. Filter out Archvied/Closed leads from the main list
    let activePipeline = leads.filter(l => l.pipeline_stage !== 'lost' && l.pipeline_stage !== 'closed');
    const closedWon = leads.filter(l => l.pipeline_stage === 'closed');
    
    // 2. Apply dynamic filters
    if (filterAgent !== "all") {
      activePipeline = activePipeline.filter(l => (l.assignedTo || "") === (filterAgent === "unassigned" ? "" : filterAgent));
    }
    
    if (filterSearch) {
      const search = filterSearch.toLowerCase();
      activePipeline = activePipeline.filter(l => 
        l.email?.toLowerCase().includes(search) || 
        l.brand?.name?.toLowerCase().includes(search)
      );
    }

    // 3. Sort active pipeline by highest temperature score
    const sortedActive = [...activePipeline].sort((a, b) => {
      // Priority 1: Mandatory Urgent flag
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      // Priority 2: Score
      return calculateLeadScore(b, scoringWeights) - calculateLeadScore(a, scoringWeights);
    });

    // 4. Calculate functional KPIs
    const hotLeads = sortedActive.filter(l => calculateLeadScore(l, scoringWeights) >= 80).length;
    const pendingPresentations = sortedActive.filter(l => l.pipeline_stage === 'presentation' || l.renders?.length > 0).length;
    const urgentCount = sortedActive.filter(l => l.isUrgent).length;
    
    // Calculate Average Closing Time
    let totalClosingDays = 0;
    let closedWithDatesCount = 0;
    
    closedWon.forEach(l => {
      if (l.createdAt && l.approvedAt) {
        const start = new Date(l.createdAt).getTime();
        const end = new Date(l.approvedAt).getTime();
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0) {
          totalClosingDays += diffDays;
          closedWithDatesCount++;
        }
      }
    });
    
    const avgTime = closedWithDatesCount > 0 ? Math.round(totalClosingDays / closedWithDatesCount) : 0;

    return {
      visibleLeads: sortedActive,
      activePresentations: pendingPresentations,
      totalLeadsCount: leads.length,
      closedWonCount: closedWon.length,
      hotLeadCount: hotLeads,
      avgClosingTimeDays: avgTime,
      urgentLeadsCount: urgentCount
    };
  }, [leads, scoringWeights, filterAgent, filterSearch]);

  const handleBulkAssign = async (agentId: string) => {
    if (selectedLeadIds.length === 0) return;
    const batch = writeBatch(db);
    selectedLeadIds.forEach(id => {
      batch.update(doc(db, "leads", id), { assignedTo: agentId });
    });
    
    try {
      await batch.commit();
      toast.success(`Assigned ${selectedLeadIds.length} leads successfully`);
      setSelectedLeadIds([]);
    } catch (err) {
      toast.error("Bulk assignment failed");
    }
  };

  const toggleUrgency = async (leadId: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, "leads", leadId), { isUrgent: !currentStatus });
      toast.success(currentStatus ? "Urgent flag removed" : "Lead marked as URGENT");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const getLanguageFlag = (langCode: string) => {
    const code = (langCode || 'en').toLowerCase();
    const map: Record<string, string> = {
      'en': '🇬🇧',
      'nl': '🇳🇱',
      'de': '🇩🇪',
      'fr': '🇫🇷',
      'es': '🇪🇸'
    };
    return map[code] || '🌍';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="view-title font-syne font-extrabold text-[48px] tracking-tight leading-none mb-4 text-white uppercase italic">
            Lead Queue
          </h1>
          <p className="text-gray2 text-lg max-w-xl">
             Production-ready lead management. Optimized for 20-40 leads daily throughput.
          </p>
        </div>
        <div className="flex gap-4 items-center mb-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white font-syne focus:border-accent outline-none w-64 transition-all"
            />
            {filterSearch && (
              <button 
                onClick={() => setFilterSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray hover:text-white"
              >✕</button>
            )}
          </div>
          <select 
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-gray uppercase font-bold tracking-widest outline-none focus:border-accent appearance-none cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='gray'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em', paddingRight: '2.5rem' }}
          >
            <option value="all">Every Agent</option>
            <option value="unassigned">Unassigned Only</option>
            {teamAgents?.map((agent: any) => (
              <option key={agent.id} value={agent.id}>{agent.name || agent.email}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
          {[
            { label: "Active Deals", value: visibleLeads.length },
            { label: "Hot Leads (>80 Pts)", value: hotLeadCount },
            { label: "Urgent Action Required", value: urgentLeadsCount, isAlert: urgentLeadsCount > 0 },
            { label: "Overall Win Rate", value: totalLeadsCount ? `${Math.round((closedWonCount / totalLeadsCount) * 100)}%` : "0%" }
          ].map((stat, i) => (
            <div key={i} className={`card-anim p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group overflow-hidden relative ${stat.isAlert ? 'ring-2 ring-red-500/50 bg-red-500/5' : ''}`}>
              <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 transition-all ${stat.isAlert ? 'bg-red-500/20' : 'bg-accent/5 group-hover:bg-accent/10'}`} />
              <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 ${stat.isAlert ? 'text-red-400' : 'text-gray'}`}>{stat.label}</h3>
              <div className={`text-3xl font-syne font-extrabold ${stat.isAlert ? 'text-red-500' : 'text-white'}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Leads Table */}
        <div className="col-span-3 card-anim rounded-3xl bg-white/5 border border-white/5 overflow-hidden backdrop-blur-sm">
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <h2 className="font-syne font-extrabold text-xl tracking-tight text-white uppercase italic">Active Pipeline</h2>
              {selectedLeadIds.length > 0 && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{selectedLeadIds.length} Selected</span>
                  <select 
                    onChange={(e) => handleBulkAssign(e.target.value)}
                    className="bg-accent text-black text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg outline-none cursor-pointer"
                  >
                    <option value="">Bulk Assign To...</option>
                    {teamAgents?.map((agent: any) => (
                      <option key={agent.id} value={agent.id}>{agent.name || agent.email}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => setSelectedLeadIds([])}
                    className="text-[10px] font-bold text-gray2 hover:text-white uppercase tracking-widest"
                  >Cancel</button>
                </div>
              )}
            </div>
            <button className="text-sm font-bold text-accent hover:underline uppercase tracking-widest cursor-pointer" onClick={() => window.location.href='/sales/contracts'}>View Closed</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-gray uppercase tracking-widest font-bold">
                  <th className="p-8 pb-4 w-12">
                    <input 
                      type="checkbox" 
                      className="accent-accent" 
                      checked={selectedLeadIds.length === visibleLeads.length && visibleLeads.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedLeadIds(visibleLeads.map(l => l.id));
                        else setSelectedLeadIds([]);
                      }}
                    />
                  </th>
                  <th className="pb-4">Lead Information</th>
                  <th className="pb-4">Agent</th>
                  <th className="pb-4">Score</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Age</th>
                  <th className="pb-4 text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleLeads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray">
                      No active leads in your pipeline.
                    </td>
                  </tr>
                )}
                {visibleLeads.map((lead, i) => {
                  const score = calculateLeadScore(lead, scoringWeights);
                  const temp = getTemperatureStatus(score, scoringWeights?.thresholds);
                  return (
                    <tr 
                      key={lead.id} 
                      onClick={() => setSelectedLead(lead)}
                      className={`group hover:bg-white/5 transition-colors border-b border-white/5 cursor-pointer ${lead.isUrgent ? 'bg-red-500/[0.03]' : ''}`}
                    >
                      <td className="p-8 py-6" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          className="accent-accent" 
                          checked={selectedLeadIds.includes(lead.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedLeadIds([...selectedLeadIds, lead.id]);
                            else setSelectedLeadIds(selectedLeadIds.filter(id => id !== lead.id));
                          }}
                        />
                      </td>
                      <td className="py-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center font-syne font-extrabold text-accent transition-transform group-hover:scale-110">
                              {lead.email?.[0].toUpperCase()}
                            </div>
                            <div className="absolute -bottom-1 -right-1 text-[10px]" title={lead.language?.toUpperCase()}>
                              {getLanguageFlag(lead.language)}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-syne font-bold text-white group-hover:text-accent transition-colors truncate max-w-[180px]">{lead.brand?.name || lead.email.split('@')[0]}</div>
                              {lead.isUrgent && <span className="text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-tighter animate-pulse">Urgent</span>}
                            </div>
                            <div className="text-xs text-gray2 truncate max-w-[200px]">{lead.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="pr-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <select 
                            value={lead.assignedTo || ""}
                            onChange={(e) => updateLeadData(lead.id, { assignedTo: e.target.value })}
                            className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-gray uppercase font-bold tracking-widest outline-none focus:border-accent transition-colors appearance-none cursor-pointer hover:bg-white/5 disabled:opacity-50"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='gray'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.25rem center', backgroundSize: '0.75em', paddingRight: '1.5rem' }}
                          >
                            <option value="">Unassigned</option>
                            {teamAgents?.map((agent: any) => (
                              <option key={agent.id} value={agent.id}>
                                {agent.name?.split(' ')[0] || agent.email?.split('@')[0] || agent.id.slice(0,6)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td>
                        <div className={`px-2 py-1 rounded border inline-flex items-center gap-1.5 ${temp.bg} ${temp.border}`}>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${temp.color}`}>{score}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border ${
                          lead.pipeline_stage === 'presentation' || lead.renders?.length > 0 
                            ? "bg-accent/10 text-accent border-accent/20" 
                            : "bg-white/5 text-white border-white/10"
                        }`}>
                          {lead.pipeline_stage === 'presentation' || lead.renders?.length > 0 ? "Presentation" : "Discovery"}
                        </span>
                      </td>
                      <td className="text-gray2 text-[11px] font-medium tracking-wide">
                        {lead.createdAt 
                          ? `${Math.max(0, Math.floor((new Date().getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)))}d` 
                          : 'New'}
                      </td>
                      <td className="text-right pr-8">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => toggleUrgency(lead.id, !!lead.isUrgent, e)}
                            className={`p-2 rounded-lg border transition-all ${lead.isUrgent ? 'bg-red-500/20 border-red-500/30 text-red-500' : 'bg-white/5 border-white/10 text-gray hover:text-white'}`}
                            title={lead.isUrgent ? "Remove Urgent Flag" : "Mark as Urgent"}
                          >
                            <svg className="w-3.5 h-3.5" fill={lead.isUrgent ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </button>
                          <button className="px-4 py-2 rounded-lg bg-accent text-black text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all">
                            Open
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

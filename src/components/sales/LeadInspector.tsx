"use client";

import React, { useState } from "react";
import { db, storage } from "@/lib/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useSales, calculateLeadScore, getTemperatureStatus } from "@/context/SalesContext";

export default function LeadInspector({ lead, onClose, onUpdateLead }: { lead: any, onClose: () => void, onUpdateLead: (updatedLead: any) => void }) {
  const [renders, setRenders] = useState<string[]>(lead.renders || []);
  const [uploading, setUploading] = useState(false);
  const { scoringWeights, teamAgents } = useSales();

  useGSAP(() => {
    gsap.from(".modal-bg", { opacity: 0, duration: 0.4 });
    gsap.from(".modal-content", { x: "100%", duration: 0.6, ease: "power4.out" });
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileRef = ref(storage, `leads/${lead.id}/renders/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        newUrls.push(url);
      }
      
      const updatedRenders = [...renders, ...newUrls];
      await updateDoc(doc(db, "leads", lead.id), { renders: updatedRenders });
      setRenders(updatedRenders);
      onUpdateLead({ ...lead, renders: updatedRenders });
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Failed to upload renders: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeRender = async (index: number) => {
    if (!confirm("Remove this render?")) return;
    
    const newRenders = [...renders];
    newRenders.splice(index, 1);
    setRenders(newRenders);
    
    try {
      await updateDoc(doc(db, "leads", lead.id), { renders: newRenders });
      onUpdateLead({ ...lead, renders: newRenders });
    } catch(err) {
      console.error(err);
      alert("Failed to remove");
    }
  };

  const hasPresentation = !!lead.slug;

  const score = calculateLeadScore(lead, scoringWeights);
  const temp = getTemperatureStatus(score, scoringWeights?.thresholds);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div 
        className="modal-bg absolute inset-0 bg-black/60 backdrop-blur-md" 
        onClick={onClose}
      />
      <div className="modal-content relative w-full max-w-xl h-full bg-[#0B0B0C] border-l border-white/10 shadow-2xl overflow-hidden glassmorphism flex flex-col">
        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-black/50 z-10 relative">
          <span className="text-[10px] text-gray uppercase font-bold tracking-[0.3em]">Lead Inspector</span>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-32">
          {/* Header */}
          <div className="p-8 pb-0">
            <div className="flex items-center gap-6 mb-10">
              {lead.brand?.logo ? (
                <img src={lead.brand.logo} alt="Logo" className="w-24 h-24 rounded-[32px] bg-white object-contain p-2 shadow-[0_0_40px_rgba(255,255,255,0.1)]" />
              ) : (
                <div className="w-24 h-24 rounded-[32px] bg-accent/20 border border-accent/30 flex items-center justify-center font-syne font-extrabold text-4xl text-accent shadow-[0_0_40px_rgba(0,242,255,0.15)]">
                  {lead.email?.[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-syne font-extrabold text-white truncate">{lead.brand?.name || lead.email.split('@')[0]}</h2>
                  <div className={`px-2 py-1 rounded-md border inline-flex items-center gap-1.5 ${temp.bg} ${temp.border}`}>
                    <span className="text-sm leading-none">{temp.icon}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${temp.color}`}>{score} Pts</span>
                  </div>
                </div>
                <div className="text-sm text-gray2 truncate mb-3">{lead.email}</div>
                {lead.brand?.colors && lead.brand.colors.length > 0 && (
                  <div className="flex items-center gap-2">
                    {lead.brand.colors.map((color: string, i: number) => (
                      <div 
                        key={i}
                        className="w-5 h-5 rounded-full border border-white/20 shadow-lg"
                        style={{ backgroundColor: color }}
                        title={`Brand Color: ${color}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Pipeline Stage Selector */}
            <div className="mb-4">
              <label className="text-[10px] text-gray uppercase font-bold tracking-[0.2em] mb-2 block">Pipeline Status</label>
              <select 
                value={lead.pipeline_stage || (lead.renders?.length > 0 ? 'presentation' : 'active')}
                onChange={async (e) => {
                  const newStage = e.target.value;
                  try {
                    await updateDoc(doc(db, "leads", lead.id), { pipeline_stage: newStage });
                    onUpdateLead({ ...lead, pipeline_stage: newStage });
                  } catch (error) {
                    console.error("Failed to update status", error);
                  }
                }}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-syne font-bold outline-none focus:border-accent/50 transition-colors appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
              >
                <option value="active">New / Active Lead</option>
                <option value="presentation">Renders Uploaded</option>
                <option value="closed">Closed / Won</option>
                <option value="lost">Lost / Archived</option>
              </select>
            </div>

            {/* Urgent Status Toggle */}
            <div className="mb-6">
              <button 
                onClick={async () => {
                  try {
                    const newStatus = !lead.isUrgent;
                    await updateDoc(doc(db, "leads", lead.id), { isUrgent: newStatus });
                    onUpdateLead({ ...lead, isUrgent: newStatus });
                  } catch (err) {
                    console.error("Urgent toggle failed", err);
                  }
                }}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-all ${lead.isUrgent ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-white/5 border-white/10 text-gray2 hover:text-white'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${lead.isUrgent ? 'bg-red-500 animate-pulse' : 'bg-gray'}`} />
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] font-syne">Priority Status</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">{lead.isUrgent ? 'URGENT' : 'NORMAL'}</span>
              </button>
            </div>

            {/* Assigned Agent Selector */}
            <div className="mb-8">
              <label className="text-[10px] text-accent uppercase font-bold tracking-[0.2em] mb-2 block">Assigned Agent</label>
              <select 
                value={lead.assignedTo || ""}
                onChange={async (e) => {
                  const agentId = e.target.value;
                  try {
                    await updateDoc(doc(db, "leads", lead.id), { assignedTo: agentId });
                    onUpdateLead({ ...lead, assignedTo: agentId });
                  } catch (error) {
                    console.error("Failed to reassign", error);
                  }
                }}
                className="w-full bg-accent/5 border border-accent/20 rounded-xl px-4 py-3 text-accent font-syne font-bold outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300F2FF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
              >
                <option value="">-- Unassigned --</option>
                {teamAgents?.map((agent: any) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name || agent.email || agent.id}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Lead Details Grid */}
            <div className="grid grid-cols-2 gap-6 mb-12">
              {[
                { label: "Design Vibe", value: lead.vibe },
                { label: "Project Size", value: lead.size },
                { label: "Config", value: lead.config },
                { label: "Event Type", value: lead.event },
                { label: "Urgency", value: lead.urgency },
                { label: "Language", value: lead.language?.toUpperCase() },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-1.5 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray uppercase font-bold tracking-[0.2em]">{item.label}</span>
                  <span className="text-white font-medium text-lg font-syne truncate">{item.value || "Not specified"}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="h-px bg-white/5 my-2 mx-8" />

          {/* Renders Section */}
          <div className="p-8 pt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-syne font-extrabold text-xl text-white italic uppercase tracking-tight">Renders</h3>
              
              <label className={`cursor-pointer px-4 py-2 rounded-xl border border-white/10 text-[10px] uppercase font-bold tracking-wider transition-all ${uploading ? 'bg-white/5 text-gray' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                {uploading ? 'Uploading...' : '+ Upload'}
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>
            
            {renders.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center text-gray2 text-sm bg-white/[0.02]">
                No renders uploaded yet. Upload images to generate the presentation.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {renders.map((url, i) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/10 group relative">
                    <img src={url} alt={`Render ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                      <span className="text-[10px] text-white font-bold uppercase tracking-widest mb-4">Render {i+1}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeRender(i); }}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0B0B0C] via-[#0B0B0C] to-transparent pt-20">
          <div className="flex gap-4">
            {hasPresentation && renders.length > 0 ? (
              <button 
                onClick={() => window.open(`/p/${lead.slug}`, '_blank')}
                className="flex-[2] px-8 py-4 bg-accent text-black rounded-xl font-bold uppercase tracking-widest hover:scale-[1.03] transition-transform shadow-[0_0_30px_rgba(0,242,255,0.3)] flex items-center justify-center gap-3"
              >
                View Presentation
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            ) : (
              <button 
                disabled={renders.length === 0}
                className={`flex-[2] px-8 py-4 rounded-xl font-bold uppercase tracking-widest transition-transform flex items-center justify-center gap-2 ${renders.length > 0 ? 'bg-accent text-black hover:scale-[1.03] shadow-[0_0_30px_rgba(0,242,255,0.3)]' : 'bg-white/10 text-white/40 cursor-not-allowed'}`}
                title="Upload renders first to view presentation"
              >
                Presentation Blocked
              </button>
            )}
            <button className="flex-1 px-4 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center">
              Mail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

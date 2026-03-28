"use client";

import React, { useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useSales, calculateLeadScore, getTemperatureStatus } from "@/context/SalesContext";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

export default function PipelinePage() {
  const { leads, loading, setSelectedLead, scoringWeights, teamAgents, updateLeadData } = useSales();
  const [mounted, setMounted] = useState(false);
  const [filterAgent, setFilterAgent] = React.useState<string>("all");
  const [filterSearch, setFilterSearch] = React.useState("");
  const [columns, setColumns] = useState<any>({
    active: { id: "active", title: "New Leads", items: [] },
    presentation: { id: "presentation", title: "Renders Uploaded", items: [] },
    lost: { id: "lost", title: "Archive / Lost", items: [], dropZoneOnly: true }
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!leads.length) {
      setColumns({
        active: { id: "active", title: "New Leads", items: [] },
        presentation: { id: "presentation", title: "Renders Uploaded", items: [] },
        lost: { id: "lost", title: "Archive / Lost", items: [], dropZoneOnly: true }
      });
      return;
    }

    // 1. Filter out logically closed/lost leads per user request
    let visibleLeads = leads.filter(l => l.pipeline_stage !== 'lost' && l.pipeline_stage !== 'closed');
    
    // 2. Apply dynamic filters
    if (filterAgent !== "all") {
      visibleLeads = visibleLeads.filter(l => (l.assignedTo || "") === (filterAgent === "unassigned" ? "" : filterAgent));
    }
    
    if (filterSearch) {
      const search = filterSearch.toLowerCase();
      visibleLeads = visibleLeads.filter(l => 
        l.email?.toLowerCase().includes(search) || 
        l.brand?.name?.toLowerCase().includes(search)
      );
    }

    const sorted = [...visibleLeads].sort((a, b) => {
      // Priority 1: Urgent flag
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      // Priority 2: Score
      return calculateLeadScore(b, scoringWeights) - calculateLeadScore(a, scoringWeights);
    });

    // Distribution
    const presentationLeads = sorted.filter(l => l.pipeline_stage === 'presentation' || (l.renders && l.renders.length > 0));
    const activeLeads = sorted.filter(l => !presentationLeads.includes(l));
    
    setColumns({
      active: { id: "active", title: "New Leads", items: activeLeads },
      presentation: { id: "presentation", title: "Renders Uploaded", items: presentationLeads },
      lost: { id: "lost", title: "Archive / Lost", items: [], dropZoneOnly: true }
    });
  }, [leads, scoringWeights, filterAgent, filterSearch]);

  useGSAP(() => {
    gsap.from(".view-title", { opacity: 0, x: -20, duration: 0.8, ease: "power3.out" });
    gsap.from(".col-anim", { opacity: 0, y: 20, stagger: 0.1, duration: 0.8, ease: "power4.out" });
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    // Grab logical object
    const colSource = columns[source.droppableId];
    const draggedLead = colSource.items.find((l: any) => l.id === draggableId);
    if (!draggedLead) return;

    const newSourceItems = colSource.items.filter((l: any) => l.id !== draggableId);
    
    // Manual movement out of standard columns to Archive Dropzone
    if (destination.droppableId === 'lost') {
      setColumns({ ...columns, [source.droppableId]: { ...colSource, items: newSourceItems } });
      await updateLeadData(draggableId, { pipeline_stage: 'lost' });
    } else {
      // Validation Check: Render Constraint
      if (destination.droppableId === 'presentation' && (!draggedLead.renders || draggedLead.renders.length === 0)) {
         // Snaps back immediately and forces the Lead Inspector modal to open
         setSelectedLead(draggedLead);
         return;
      }

      // Manual movement between standard columns
      const colDest = columns[destination.droppableId];
      const newDestItems = [...colDest.items, draggedLead];
      newDestItems.sort((a,b) => calculateLeadScore(b, scoringWeights) - calculateLeadScore(a, scoringWeights));
      
      setColumns({
        ...columns,
        [source.droppableId]: { ...colSource, items: newSourceItems },
        [destination.droppableId]: { ...colDest, items: newDestItems }
      });
      await updateLeadData(draggableId, { pipeline_stage: destination.droppableId });
    }
  };

  const handleToggleSent = async (e: React.MouseEvent, lead: any) => {
    e.stopPropagation();
    await updateLeadData(lead.id, { presentationSent: !lead.presentationSent });
  };

  if (loading || !mounted) {
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
            Pipeline
          </h1>
          <p className="text-gray2 text-lg max-w-xl">
             Visual Kanban workflow for high-volume lead throughput.
          </p>
        </div>
        <div className="flex gap-4 items-center mb-4">
          <input 
            type="text" 
            placeholder="Filter pipeline..." 
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white font-syne focus:border-accent outline-none w-48 transition-all"
          />
          <select 
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-gray uppercase font-bold tracking-widest outline-none focus:border-accent appearance-none cursor-pointer pr-10"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='gray'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
          >
            <option value="all">Every Agent</option>
            <option value="unassigned">Unassigned</option>
            {teamAgents?.map((agent: any) => (
              <option key={agent.id} value={agent.id}>{agent.name || agent.email}</option>
            ))}
          </select>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[700px]">
          {Object.values(columns).map((col: any) => (
            <div key={col.id} className="col-anim flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <h3 className={`font-syne font-extrabold text-[14px] uppercase tracking-widest ${col.dropZoneOnly ? 'text-red-500' : 'text-gray'}`}>{col.title}</h3>
                <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold ${col.dropZoneOnly ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/5 border-white/10 text-gray'}`}>
                  {col.items.length}
                </span>
              </div>
              
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 rounded-3xl border p-4 space-y-4 overflow-y-auto transition-colors ${
                      col.dropZoneOnly 
                        ? (snapshot.isDraggingOver ? 'bg-red-500/20 border-red-500 border-dashed border-2' : 'bg-red-500/5 border-red-500/10 border-dashed items-center justify-center flex') 
                        : (snapshot.isDraggingOver ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/5')
                    }`}
                  >
                    {!col.dropZoneOnly && col.items.map((lead: any, index: number) => {
                      const score = calculateLeadScore(lead, scoringWeights);
                      const temp = getTemperatureStatus(score, scoringWeights?.thresholds);
                      const isPresentationCol = col.id === 'presentation';

                      return (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided, dragSnapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setSelectedLead(lead)}
                              className={`p-4 rounded-xl border transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden
                                ${dragSnapshot.isDragging ? 'bg-black border-accent/60 shadow-[0_0_30px_rgba(0,242,255,0.2)] scale-[1.02] z-50' : 'bg-black/40 border-white/5 hover:border-accent/40'}
                                ${lead.isUrgent ? 'ring-2 ring-red-500/30 border-red-500/40 bg-red-500/[0.03]' : ''}
                              `}
                            >
                              {lead.isUrgent && <div className="absolute top-0 left-0 w-1 h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />}
                              <div className="absolute top-0 right-0 w-16 h-16 bg-accent/5 blur-2xl group-hover:bg-accent/10 transition-colors pointer-events-none" />
                              
                              <div className="flex justify-between items-start mb-2 relative z-10">
                                <div className="flex flex-col gap-1">
                                  <span className={`text-[8px] font-black uppercase tracking-tighter ${lead.isUrgent ? 'text-red-500 animate-pulse' : 'text-accent'}`}>
                                    {lead.isUrgent ? 'Urgent Action' : (lead.urgency === 'asap' ? 'ASAP' : 'Review')}
                                  </span>
                                  <span className="text-[10px] text-gray">{lead.language?.toUpperCase() || 'EN'}</span>
                                </div>
                                <div className={`px-2 py-1 rounded inline-flex items-center gap-1.5 ${temp.bg} ${temp.border} border`}>
                                  <span className={`text-[8px] font-bold uppercase tracking-widest ${temp.color}`}>{score} Pts</span>
                                </div>
                              </div>
                              
                              <h4 className="text-sm font-bold text-white mb-1 truncate pr-4">{lead.brand?.name || lead.email.split('@')[0]}</h4>
                              <p className="text-[10px] text-gray2 line-clamp-1 italic mb-4">Vibe: {lead.vibe}</p>
                              
                              <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                {isPresentationCol ? (
                                  <button
                                    onClick={(e) => handleToggleSent(e, lead)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${
                                      lead.presentationSent 
                                        ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20' 
                                        : 'bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20'
                                    }`}
                                  >
                                    {lead.presentationSent ? 'Sent to Client ✓' : 'Send Pending'}
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-bold text-gray">{lead.language?.toUpperCase() || 'EN'}</span>
                                )}
                                <span className="text-[10px] text-gray opacity-50">
                                  {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'New'}
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}

                    {col.dropZoneOnly && !snapshot.isDraggingOver && (
                      <div className="text-center opacity-50 flex flex-col items-center pointer-events-none">
                        <svg className="w-12 h-12 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="text-xs uppercase tracking-widest font-bold text-red-500">Drop leads here to Archive</span>
                      </div>
                    )}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

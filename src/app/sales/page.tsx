"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase/config";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, orderBy, query, doc, getDoc } from "firebase/firestore";
import DashboardLayout from "@/components/layout/DashboardLayout";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function SalesDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login"); // Redirect to login if not authenticated
      } else {
        setUser(currentUser);
        
        // Check if the user has completed onboarding
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
           router.push("/onboarding");
        } else {
           await fetchLeads();
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchLeads = async () => {
    try {
      const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedLeads = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeads(fetchedLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-plus">
        <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <DashboardLayout user={user} activeTab={activeTab} setActiveTab={setActiveTab}>
        <SalesContent activeTab={activeTab} leads={leads} onSelectLead={setSelectedLead} />
      </DashboardLayout>
      {selectedLead && (
        <LeadInspector lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </>
  );
}

function SalesContent({ activeTab, leads, onSelectLead }: { activeTab?: string, leads: any[], onSelectLead: (lead: any) => void }) {
  useGSAP(() => {
    gsap.from(".view-title", { opacity: 0, x: -20, duration: 0.8, ease: "power3.out" });
    gsap.from(".card-anim", { 
      opacity: 0, 
      y: 20, 
      stagger: 0.1, 
      duration: 1, 
      delay: 0.2,
      ease: "power4.out" 
    });
  }, [activeTab]);

  const renderView = () => {
    switch (activeTab) {
      case "overview":
        return <Overview leads={leads} onSelectLead={onSelectLead} />;
      case "pipeline":
        return <Pipeline leads={leads} onSelectLead={onSelectLead} />;
      case "landings":
        return <Landings leads={leads} />;
      case "deals":
        return <Deals leads={leads} />;
      default:
        return <Overview leads={leads} onSelectLead={onSelectLead} />;
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="view-title font-syne font-extrabold text-[48px] tracking-tight leading-none mb-4 text-white uppercase italic">
            {activeTab === 'overview' ? 'Overview' : 
             activeTab === 'pipeline' ? 'Pipeline' : 
             activeTab === 'landings' ? 'Landing Pages' : 
             activeTab === 'deals' ? 'Contracts' : activeTab}
          </h1>
          <p className="text-gray2 text-lg max-w-xl">
            Manage leads and projects with our high-end sales toolkit.
          </p>
        </div>
        <div className="flex gap-4 mb-4">
           <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-end">
              <span className="text-xs text-gray uppercase font-bold tracking-widest leading-none">Active Leads</span>
              <span className="text-2xl font-syne font-extrabold text-accent">{leads.length}</span>
           </div>
           <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-end">
              <span className="text-xs text-gray uppercase font-bold tracking-widest leading-none">Waitlist Capacity</span>
              <span className="text-2xl font-syne font-extrabold text-white">42%</span>
           </div>
        </div>
      </div>
      
      {renderView()}
    </div>
  );
}

function Overview({ leads, onSelectLead }: { leads: any[], onSelectLead: (lead: any) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Quick Stats */}
      <div className="col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
        {["In Progress", "Avg. Deal", "Conversion", "Lead Velocity"].map((stat, i) => (
          <div key={i} className="card-anim p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-accent/10 transition-all" />
            <h3 className="text-gray uppercase text-[10px] font-bold tracking-[0.2em] mb-2">{stat}</h3>
            <div className="text-3xl font-syne font-extrabold text-white">
              {i === 0 ? "14" : i === 1 ? "€12.5k" : i === 2 ? "12%" : "3.4d"}
            </div>
          </div>
        ))}
      </div>

      {/* Leads Table */}
      <div className="col-span-3 card-anim rounded-3xl bg-white/5 border border-white/5 overflow-hidden backdrop-blur-sm">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h2 className="font-syne font-extrabold text-xl tracking-tight text-white uppercase italic">Recent Leads</h2>
          <button className="text-sm font-bold text-accent hover:underline uppercase tracking-widest">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[12px] text-gray uppercase tracking-widest font-bold">
                <th className="p-8 pb-4">Lead</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Vibe</th>
                <th className="pb-4">Created</th>
                <th className="pb-4 text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, i) => (
                <tr 
                  key={lead.id} 
                  onClick={() => onSelectLead(lead)}
                  className="group hover:bg-white/5 transition-colors border-b border-white/5 cursor-pointer"
                >
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center font-syne font-extrabold text-accent transition-transform group-hover:scale-110">
                        {lead.email?.[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{lead.email}</div>
                        <div className="text-xs text-gray2">{lead.brandUrl || "No brand link"}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider border border-accent/20">
                      New Request
                    </span>
                  </td>
                  <td className="text-gray2 text-sm italic">
                    {lead.vibe || "Organic Noir"}
                  </td>
                  <td className="text-gray2 text-sm">
                    {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Mar 22, 2026'}
                  </td>
                  <td className="text-right pr-8">
                    <button className="px-4 py-2 rounded-lg bg-white/5 text-xs font-bold hover:bg-accent hover:text-black transition-all border border-white/10">
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Pipeline({ leads, onSelectLead }: { leads: any[], onSelectLead: (lead: any) => void }) {
  const columns = ["Discovery", "Engaged", "Proposal", "Negotiation", "Closing"];
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 h-[600px]">
      {columns.map((col, i) => (
        <div key={i} className="card-anim flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-syne font-extrabold text-[14px] uppercase tracking-widest text-gray">{col}</h3>
            <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-gray font-bold">{i % 2 === 0 ? 3 : 2}</span>
          </div>
          <div className="flex-1 bg-white/5 rounded-3xl border border-white/5 p-4 space-y-4">
            <div 
              onClick={() => onSelectLead({ email: "elon@tesla.com", vibe: "Cyberpunk", size: "XL", config: "High" })}
              className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-accent/40 transition-colors cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-accent uppercase tracking-tighter">High Priority</span>
                <div className="w-6 h-6 rounded-full bg-white/5 overflow-hidden border border-white/10" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Tesla Motors Inc.</h4>
              <p className="text-[10px] text-gray2 line-clamp-2 italic mb-3">"We need a custom VIP tent for the Cybertruck rally in Berlin..."</p>
              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <span className="text-[10px] font-bold text-white">€45,000</span>
                <span className="text-[10px] text-gray opacity-50">2d ago</span>
              </div>
            </div>
            {/* ... other items ... */}
          </div>
        </div>
      ))}
    </div>
  );
}

function Landings({ leads }: { leads: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="card-anim p-12 rounded-[40px] bg-white/5 border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(0,242,255,0.4)]">
             <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
             </svg>
          </div>
          <h2 className="font-syne font-extrabold text-3xl mb-4 italic uppercase">Landing Pages</h2>
          <p className="text-gray2 text-lg mb-8">Deploy custom-branded landing pages for any lead. AI-optimized content for premium brand experiences.</p>
          <button className="px-8 py-4 bg-accent text-black rounded-2xl font-bold uppercase tracking-widest hover:scale-105 transition-transform">
            Create New Page
          </button>
        </div>
      </div>
      
      <div className="card-anim grid grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:bg-white/10 transition-all cursor-pointer">
            <div className="aspect-video bg-black/40 rounded-xl mb-4 overflow-hidden border border-white/10 relative">
               <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="absolute bottom-2 right-2 px-2 py-1 bg-accent/20 rounded text-[8px] font-bold text-accent uppercase">Live</div>
            </div>
            <h4 className="text-xs font-bold text-white mb-1">Proposal-{i === 1 ? 'Nike' : i === 2 ? 'BMW' : 'Generic'}</h4>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray2">24 views</span>
              <span className="text-[10px] text-green-400 font-bold">94% Score</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Deals({ leads }: { leads: any[] }) {
  return (
    <div className="card-anim w-full min-h-[500px] rounded-[50px] bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center p-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
      <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mb-10 border border-accent/30 animate-pulse">
        <svg className="w-12 h-12 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="font-syne font-extrabold text-5xl mb-6 italic uppercase">Project Contracts</h2>
      <p className="text-gray2 text-xl max-w-2xl mb-12">Finalize details with smart digital contracts, automated payment milestones, and secure verification.</p>
      <div className="flex gap-6">
        <button className="px-10 py-5 bg-white text-black rounded-2xl font-bold uppercase tracking-widest hover:bg-accent transition-colors">
          New Contract
        </button>
        <button className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
          View Clauses
        </button>
      </div>
    </div>
  );
}

function LeadInspector({ lead, onClose }: { lead: any, onClose: () => void }) {
  useGSAP(() => {
    gsap.from(".modal-bg", { opacity: 0, duration: 0.4 });
    gsap.from(".modal-content", { x: "100%", duration: 0.6, ease: "power4.out" });
  }, []);

  const detailItems = [
    { label: "Design Vibe", value: lead.vibe },
    { label: "Project Size", value: lead.size },
    { label: "Configuration", value: lead.config },
    { label: "Event Type", value: lead.event },
    { label: "Brand URL", value: lead.brandUrl, isLink: true },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div 
        className="modal-bg absolute inset-0 bg-black/60 backdrop-blur-md" 
        onClick={onClose}
      />
      <div className="modal-content relative w-full max-w-xl h-full bg-[#0B0B0C] border-l border-white/10 shadow-2xl overflow-hidden glassmorphism flex flex-col">
        <div className="p-8 pb-0 flex justify-between items-center">
          <span className="text-[10px] text-gray uppercase font-bold tracking-[0.3em]">Lead Inspector</span>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-12 flex-1 overflow-y-auto">
          <div className="flex items-center gap-6 mb-12">
            <div className="w-24 h-24 rounded-[32px] bg-accent/20 border border-accent/30 flex items-center justify-center font-syne font-extrabold text-4xl text-accent shadow-[0_0_40px_rgba(0,242,255,0.15)]">
              {lead.email?.[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-3xl font-syne font-extrabold text-white mb-2 truncate max-w-[280px]">{lead.email}</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-accent text-[10px] font-bold uppercase tracking-widest">Qualified Lead</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 mb-12">
            {detailItems.map((item, i) => (
              <div key={i} className="flex flex-col gap-2">
                <span className="text-[10px] text-gray uppercase font-bold tracking-[0.2em]">{item.label}</span>
                {item.isLink && item.value ? (
                  <a href={item.value} target="_blank" rel="noreferrer" className="text-white hover:text-accent transition-colors font-medium text-xl truncate">
                    {item.value}
                  </a>
                ) : (
                  <span className="text-white font-medium text-2xl font-syne">{item.value || "Not specified"}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-10 bg-white/5 border-t border-white/10 flex gap-4">
          <button className="flex-1 px-8 py-5 bg-accent text-black rounded-2xl font-bold uppercase tracking-widest hover:scale-[1.05] transition-transform shadow-[0_0_30px_rgba(0,242,255,0.3)]">
            Generate Experience
          </button>
          <button className="flex-1 px-8 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
            Schedule Call
          </button>
        </div>
      </div>
    </div>
  );
}

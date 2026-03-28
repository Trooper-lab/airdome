"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc } from "firebase/firestore";

export default function PresentationView({ lead }: { lead: any }) {
  const container = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'pending' | 'approved' | 'revising'>(lead.clientStatus || 'pending');
  const [loading, setLoading] = useState(false);
  
  useGSAP(() => {
    gsap.from(".anim-elem", {
      y: 40,
      opacity: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: "power4.out",
      delay: 0.2
    });
    
    gsap.from(".render-img", {
      scale: 1.05,
      y: 60,
      opacity: 0,
      duration: 1.5,
      stagger: 0.2,
      ease: "power3.out",
      delay: 0.5
    });
  }, { scope: container });

  const brandName = lead.brand?.name || lead.email.split('@')[0];
  const renders = lead.renders || [];

  const handleClientAction = async (action: 'approved' | 'revising') => {
    setLoading(true);
    try {
      const updates: any = { 
        clientStatus: action,
        [`${action}At`]: new Date().toISOString()
      };
      
      // If approved, automatically move to Closed/Won in pipeline
      if (action === 'approved') {
        updates.pipeline_stage = 'closed';
      }
      
      await updateDoc(doc(db, "leads", lead.id), updates);
      setStatus(action);
    } catch (error) {
      console.error(error);
      alert("Something went wrong connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={container} className="min-h-screen bg-[#060608] text-white font-spline selection:bg-accent/30 selection:text-white">
      {/* Navbar Minimalist */}
      <nav className="fixed top-0 left-0 right-0 p-8 flex justify-between items-center z-50 mix-blend-difference">
        <div className="flex items-center gap-3 anim-elem">
          <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-syne font-extrabold text-lg rounded-sm">A</div>
          <span className="font-syne font-extrabold text-xl tracking-tight">AIRDOME</span>
        </div>
        
        {lead.brand?.logo ? (
          <img src={lead.brand.logo} alt={brandName} className="h-8 max-w-[120px] object-contain anim-elem" />
        ) : (
          <div className="font-syne font-extrabold text-lg uppercase tracking-widest text-white/50 anim-elem">{brandName}</div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center p-8 pt-32 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-accent/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="anim-elem px-5 py-2 rounded-full border border-white/10 bg-white/[0.03] text-[10px] uppercase font-bold tracking-[0.3em] text-white/60 mb-8 backdrop-blur-md">
            Custom Event Architecture
          </div>
          
          <h1 className="anim-elem font-syne font-extrabold text-6xl md:text-8xl tracking-tighter leading-[0.9] uppercase italic mb-8 drop-shadow-2xl">
            The Future of <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-blue-400 py-1">
              {brandName}
            </span>
          </h1>
          
          <p className="anim-elem text-lg md:text-2xl text-gray-400 font-light max-w-2xl leading-relaxed mb-12">
            A bespoke Airdome experience designed to perfectly match your brand's {lead.vibe.toLowerCase() || "aesthetic"} feeling and amplify your upcoming event.
          </p>
        </div>
      </section>

      {/* Specifications */}
      <section className="py-20 px-8 bg-black/40">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Design Vibe", value: lead.vibe },
            { label: "Footprint Size", value: lead.size },
            { label: "Configuration", value: lead.config },
            { label: "Event Type", value: lead.event },
          ].map((item, i) => (
            <div key={i} className="anim-elem p-8 rounded-[32px] bg-white/[0.02] border border-white/5 backdrop-blur-sm group hover:border-accent/20 hover:bg-white/[0.04] transition-colors">
              <span className="text-[10px] text-gray uppercase font-bold tracking-[0.2em]">{item.label}</span>
              <p className="font-syne font-bold text-2xl text-white mt-2 group-hover:text-accent transition-colors">
                {item.value || "-"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Renders Section */}
      {renders.length > 0 && (
        <section className="py-32 px-4 md:px-12 bg-[#060608]">
          <div className="max-w-7xl mx-auto space-y-32">
            {renders.map((url: string, i: number) => (
              <div key={i} className="render-img w-full flex flex-col items-center">
                <div className="w-full relative rounded-[40px] md:rounded-[60px] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] bg-black/50 aspect-video md:aspect-[21/9]">
                  <img src={url} alt={`Render ${i + 1}`} className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-700 hover:scale-105 transform" />
                  
                  {/* Subtle HUD UI overlay */}
                  <div className="absolute top-8 left-8 flex gap-2">
                    <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded border border-white/10 text-[9px] font-bold text-white uppercase tracking-widest">
                      Preview {i + 1}
                    </div>
                  </div>
                  <div className="absolute bottom-8 right-8">
                    <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded border border-white/10 text-[9px] font-bold text-accent uppercase tracking-widest flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      Live Architecture
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative min-h-[60vh] flex flex-col justify-center items-center text-center p-8 overflow-hidden bg-black/60">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
         
         <div className="relative z-10 anim-elem">
           {status === 'approved' ? (
             <div className="bg-accent/10 border border-accent/20 rounded-[32px] p-12 backdrop-blur-md shadow-[0_0_80px_rgba(0,242,255,0.15)] flex flex-col items-center max-w-2xl mx-auto">
               <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center text-black mb-8">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                 </svg>
               </div>
               <h2 className="font-syne font-extrabold text-4xl mb-4 italic uppercase tracking-tight text-white">Design Approved</h2>
               <p className="text-accent text-lg max-w-md">
                 Your custom Airdome configuration has been locked in. Our team will contact you shortly to complete the production paperwork.
               </p>
             </div>
           ) : status === 'revising' ? (
             <div className="bg-orange-500/10 border border-orange-500/20 rounded-[32px] p-12 backdrop-blur-md shadow-[0_0_80px_rgba(249,115,22,0.1)] flex flex-col items-center max-w-2xl mx-auto">
               <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-500 mb-8 border border-orange-500/40">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                 </svg>
               </div>
               <h2 className="font-syne font-extrabold text-4xl mb-4 italic uppercase tracking-tight text-white">Revisions Requested</h2>
               <p className="text-orange-400 text-lg max-w-md">
                 Our design team receives your feedback. We'll update your renders and notify you when the new iteration is ready.
               </p>
             </div>
           ) : (
             <>
               <h2 className="font-syne font-extrabold text-5xl md:text-7xl mb-6 italic uppercase tracking-tight">Ready to launch?</h2>
               <p className="text-gray-400 text-xl max-w-xl mx-auto mb-12">
                 Lock in your production slot and let's bring the {brandName} Airdome to reality.
               </p>
               
               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <button 
                   onClick={() => handleClientAction('approved')}
                   disabled={loading}
                   className="px-10 py-5 bg-accent text-black rounded-2xl font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_40px_rgba(0,242,255,0.4)] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
                 >
                   {loading ? 'Processing...' : 'Approve Design'}
                   <svg className="w-5 h-5 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                   </svg>
                 </button>
                 <button 
                   onClick={() => handleClientAction('revising')}
                   disabled={loading}
                   className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-colors disabled:opacity-50"
                 >
                   Request Revisions
                 </button>
               </div>
             </>
           )}
         </div>
      </section>
    </div>
  );
}

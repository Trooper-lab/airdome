"use client";

import React, { useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useSales } from "@/context/SalesContext";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";

const AVAILABLE_LANGUAGES = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'nl', flag: '🇳🇱', label: 'Dutch' },
  { code: 'de', flag: '🇩🇪', label: 'German' },
  { code: 'fr', flag: '🇫🇷', label: 'French' },
  { code: 'es', flag: '🇪🇸', label: 'Spanish' }
];

export default function ProfilePage() {
  const { user, agentProfile } = useSales();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    if (agentProfile) {
      if (agentProfile.name) setName(agentProfile.name);
      if (agentProfile.phone) setPhone(agentProfile.phone);
      if (agentProfile.languages) setSelectedLanguages(agentProfile.languages);
    }
  }, [agentProfile]);

  useGSAP(() => {
    gsap.from(".view-title", { opacity: 0, x: -20, duration: 0.8, ease: "power3.out" });
    gsap.from(".anim-elem", { opacity: 0, y: 20, stagger: 0.1, duration: 0.8, delay: 0.2, ease: "power4.out" });
  }, []);

  const toggleLanguage = (code: string) => {
    setSelectedLanguages(prev => {
      // Don't allow deselecting EN (as per fallback safety logic)
      if (code === 'en') return prev; 
      
      if (prev.includes(code)) return prev.filter(l => l !== code);
      return [...prev, code];
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        name,
        phone,
        languages: selectedLanguages
      });
      toast.success("Profile fully synced!", {
        description: "Dashboard filters have been applied instantly."
      });
    } catch (error) {
      console.error(error);
      toast.error("Error saving profile", {
        description: "Please check your network permissions."
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-12 max-w-4xl pb-20">
      <div className="mb-12">
        <h1 className="view-title font-syne font-extrabold text-[48px] tracking-tight leading-none mb-4 text-white uppercase italic">
          Sales Profile
        </h1>
        <p className="text-gray2 text-lg">
          Configure your personal contact info and define your dedicated territories. Global leads will be filtered automatically based on your language selection.
        </p>
      </div>

      <div className="anim-elem bg-white/5 border border-white/10 rounded-[32px] p-8 md:p-12 backdrop-blur-md relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
        
        <h2 className="font-syne font-extrabold text-2xl mb-8 uppercase italic text-white tracking-widest border-b border-white/10 pb-6">Agent Contact Data</h2>
        
        <div className="space-y-6 max-w-lg mb-12">
          <div>
             <label className="block text-[10px] font-bold text-gray uppercase tracking-[0.2em] mb-3">Email (Unchangeable)</label>
             <div className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 text-gray2 font-medium">
               {user?.email || "Loading..."}
             </div>
          </div>
          <div>
             <label className="block text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-3">Agent Full Name</label>
             <input 
               type="text" 
               value={name}
               onChange={(e) => setName(e.target.value)}
               placeholder="John Doe"
               className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-white font-medium focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all font-syne"
             />
          </div>
          <div>
             <label className="block text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-3">Direct Phone Number</label>
             <input 
               type="text" 
               value={phone}
               onChange={(e) => setPhone(e.target.value)}
               placeholder="+1 (555) 000-0000"
               className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-white font-medium focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all font-syne"
             />
          </div>
        </div>

        <h2 className="font-syne font-extrabold text-2xl mb-8 uppercase italic text-white tracking-widest border-b border-white/10 pb-6">Territory Configuration</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
           {AVAILABLE_LANGUAGES.map(lang => {
             const isSelected = selectedLanguages.includes(lang.code);
             return (
               <div 
                 key={lang.code}
                 onClick={() => toggleLanguage(lang.code)}
                 className={`flex items-center gap-4 px-5 py-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                   isSelected 
                     ? 'bg-accent/10 border-accent text-accent shadow-[0_0_20px_rgba(0,242,255,0.1)]' 
                     : 'bg-black/40 border-white/10 text-gray hover:bg-white/5 hover:border-white/30'
                 }`}
               >
                 <span className="text-2xl">{lang.flag}</span>
                 <span className="font-bold uppercase tracking-widest text-xs">{lang.label}</span>
                 {isSelected && (
                   <svg className="w-5 h-5 ml-auto text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                   </svg>
                 )}
               </div>
             )
           })}
        </div>
        
        <p className="text-xs text-gray2 mb-10 max-w-xl">
          Note: English (EN) serves as the baseline global default to catch any leads who do not explicitly specify a regional requirement. You cannot unselect it.
        </p>

        <div className="flex justify-end pt-8 border-t border-white/10">
          <button 
             onClick={handleSave}
             disabled={saving}
             className="px-10 py-5 bg-accent text-black rounded-2xl font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_40px_rgba(0,242,255,0.4)] disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-3"
          >
             {saving ? 'Syncing...' : 'Save Profile Config'}
             {!saving && (
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
               </svg>
             )}
          </button>
        </div>
      </div>
    </div>
  );
}

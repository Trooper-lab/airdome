"use client";
import React, { useState, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useSales, DEFAULT_WEIGHTS } from "@/context/SalesContext";
import { toast } from "sonner";

const CATEGORY_LABELS: Record<string, string> = {
  personality: "Brand Personality",
  vibe: "Tent Vibe",
  size: "Project Size",
  config: "Configuration",
  event: "Event Type",
  urgency: "Urgency"
};

const CATEGORY_COLORS: Record<string, string> = {
  personality: "bg-blue-500",
  vibe: "bg-purple-500",
  size: "bg-emerald-500",
  config: "bg-orange-500",
  event: "bg-pink-500",
  urgency: "bg-red-500"
};

export default function SettingsPage() {
  const { scoringWeights, updateWeights, loading } = useSales();
  // Ensure the state matches the new structure even if it previously held the old
  const [weights, setWeights] = useState<any>(
    (scoringWeights && scoringWeights.categories && scoringWeights.options) 
      ? scoringWeights 
      : DEFAULT_WEIGHTS
  );
  const [saving, setSaving] = useState(false);

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
  }, []);

  const totalCapacity = useMemo(() => {
    return Object.values(weights.categories || {}).reduce((sum: number, val: any) => sum + (val as number), 0) as number;
  }, [weights]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const handleCategoryMaxChange = (category: string, value: number) => {
    const updatedOptions = { ...weights.options[category] };
    
    // Automatically clamp existing options if the new max is lower than their current value
    Object.keys(updatedOptions).forEach(key => {
      if (updatedOptions[key] > value) {
         updatedOptions[key] = value;
      }
    });

    setWeights({
      ...weights,
      categories: {
        ...weights.categories,
        [category]: value
      },
      options: {
        ...weights.options,
        [category]: updatedOptions
      }
    });
  };

  const handleOptionChange = (category: string, key: string, value: number) => {
    const categoryMax = weights.categories[category] || 0;
    const clampedValue = Math.min(value, categoryMax); // Restrict to category cap
    
    setWeights({
      ...weights,
      options: {
        ...weights.options,
        [category]: {
          ...weights.options[category],
          [key]: clampedValue
        }
      }
    });
  };

  const handleThresholdChange = (key: 'hot' | 'warm', value: number) => {
    setWeights({
      ...weights,
      thresholds: {
        ...weights.thresholds,
        [key]: value
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateWeights(weights);
      toast.success("Scoring protocols synced!", {
        description: "Temperature thresholds and weights are now live."
      });
    } catch (error) {
      toast.error("Sync failed");
    } finally {
      setSaving(false);
    }
  };

  const isOverBudget = totalCapacity > 100;

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="view-title font-syne font-extrabold text-[48px] tracking-tight leading-none mb-4 text-white uppercase italic">
            Lead Scoring
          </h1>
          <p className="text-gray2 text-lg max-w-xl">
            Configure how points are budgeted across design choices. A lead's maximum possible score is 100.
          </p>
        </div>
        <button 
           onClick={handleSave} 
           disabled={saving}
           className="px-8 py-4 bg-accent text-black rounded-xl font-bold uppercase tracking-widest hover:scale-[1.03] transition-transform shadow-[0_0_30px_rgba(0,242,255,0.3)] disabled:opacity-50 disabled:hover:scale-100"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {/* Dynamic Thresholds Controller */}
      <div className="card-anim bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12 backdrop-blur-md relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h2 className="font-syne font-extrabold text-3xl mb-2 uppercase italic text-white tracking-tight">Temperature Thresholds</h2>
            <p className="text-gray2 text-sm">Define the point requirements for Hot and Warm lead classifications.</p>
          </div>
          <div className="flex gap-4">
             <div className="px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center min-w-[120px]">
                <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-1">🔥 Hot Min</div>
                <div className="text-2xl font-syne font-extrabold text-white">{weights.thresholds?.hot || 80}</div>
             </div>
             <div className="px-6 py-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-center min-w-[120px]">
                <div className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mb-1">☀️ Warm Min</div>
                <div className="text-2xl font-syne font-extrabold text-white">{weights.thresholds?.warm || 50}</div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] text-gray uppercase font-bold tracking-[0.2em]">🔥 Hot Lead Threshold</label>
              <span className="text-white font-bold">{weights.thresholds?.hot || 80} Pts</span>
            </div>
            <input 
              type="range"
              min={weights.thresholds?.warm || 51}
              max="100"
              value={weights.thresholds?.hot || 80}
              onChange={(e) => handleThresholdChange('hot', parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <p className="text-[10px] text-gray2 italic">Leads with scores at or above this value will be marked as "Hot".</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] text-gray uppercase font-bold tracking-[0.2em]">☀️ Warm Lead Threshold</label>
              <span className="text-white font-bold">{weights.thresholds?.warm || 50} Pts</span>
            </div>
            <input 
              type="range"
              min="0"
              max={(weights.thresholds?.hot || 80) - 1}
              value={weights.thresholds?.warm || 50}
              onChange={(e) => handleThresholdChange('warm', parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <p className="text-[10px] text-gray2 italic">Leads below "Hot" but at or above this value will be marked as "Warm". Anything below is "Cold".</p>
          </div>
        </div>
      </div>

      {/* Point Budget Bar */}
      <div className="card-anim bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-sm sticky top-0 z-20 shadow-2xl">
        <div className="flex justify-between items-end mb-4">
           <div>
              <h3 className="font-syne font-extrabold text-white text-3xl uppercase italic tracking-tight">
                Capacity Budget
              </h3>
              <p className="text-gray text-sm">The sum of all Maximum Category limits.</p>
           </div>
           <div className={`text-4xl font-syne font-extrabold ${isOverBudget ? 'text-red-500' : 'text-accent'}`}>
             {totalCapacity} <span className="text-lg text-gray uppercase tracking-widest">/ 100 PTS</span>
           </div>
        </div>
        
        <div className="h-6 w-full bg-white/5 rounded-full overflow-hidden flex ring-1 ring-white/10">
          {Object.entries(weights.categories as Record<string, number>).map(([cat, val]) => {
             if (val <= 0) return null;
             const percentage = (val / Math.max(100, totalCapacity)) * 100;
             return (
               <div 
                 key={cat} 
                 className={`h-full transition-all duration-300 ${isOverBudget ? 'bg-red-500 opacity-80' : CATEGORY_COLORS[cat] || 'bg-accent'}`}
                 style={{ width: `${percentage}%` }}
                 title={`${CATEGORY_LABELS[cat]}: ${val} pts`}
               />
             );
          })}
        </div>
        
        {isOverBudget && (
          <div className="mt-4 flex items-center gap-2 text-red-400 text-sm font-bold uppercase tracking-widest bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Warning: The maximum possible score exceeds 100 points. Reduce category maximums to normalize the scale.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        {Object.entries(weights.categories as Record<string, number>).map(([catId, catMax]) => {
          const catColor = CATEGORY_COLORS[catId] || 'bg-accent';
          
          return (
            <div key={catId} className="card-anim bg-white/5 border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-32 h-32 ${catColor} opacity-5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:opacity-10 transition-all pointer-events-none`} />
              
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="font-syne font-extrabold text-2xl text-white italic uppercase tracking-tight">
                      {CATEGORY_LABELS[catId] || catId}
                    </h3>
                    <div className="text-[10px] text-gray uppercase font-bold tracking-[0.2em] mt-1">
                       Category Maximum Map
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className={`w-3 h-3 rounded-full ${catColor}`} />
                   <span className="text-2xl font-syne font-extrabold text-white">{catMax}</span>
                 </div>
              </div>

              {/* Master Category Slider */}
              <div className="mb-8 bg-black/50 p-6 rounded-2xl border border-white/10 relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${catColor}`} />
                <div className="flex justify-between text-xs font-bold text-gray uppercase tracking-widest mb-4">
                  <span>Category Cap</span>
                  <span className="text-white">{catMax} Pts</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={catMax}
                  onChange={(e) => handleCategoryMaxChange(catId, parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>
              
              {/* Option Sub-Sliders */}
              <div className="space-y-4">
                 <h4 className="text-[10px] text-gray uppercase font-bold tracking-[0.2em] border-b border-white/5 pb-2">
                   Variable Scoring limits
                 </h4>
                 {Object.entries(weights.options[catId] as Record<string, number>).map(([optKey, optVal]) => (
                   <div key={optKey} className="group/opt">
                     <div className="flex justify-between text-xs font-bold text-gray2 uppercase tracking-wide mb-2 transition-colors group-hover/opt:text-white">
                       <span>{optKey}</span>
                       <span>{optVal} / {catMax}</span>
                     </div>
                     <input 
                       type="range"
                       min="0"
                       max={catMax}
                       value={optVal}
                       onChange={(e) => handleOptionChange(catId, optKey, parseInt(e.target.value))}
                       className={`w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer transition-all hover:h-2 ${catColor.replace('bg-', 'accent-')}`}
                       style={{ accentColor: 'currentColor' }}
                     />
                   </div>
                 ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

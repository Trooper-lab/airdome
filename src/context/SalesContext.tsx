"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth, db } from "@/lib/firebase/config";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, orderBy, query, doc, getDoc, onSnapshot, runTransaction } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const DEFAULT_WEIGHTS = {
  categories: {
    personality: 10,
    vibe: 15,
    size: 25,
    config: 10,
    event: 20,
    urgency: 20
  },
  options: {
    personality: { rebel: 10, bold: 8, clean: 6, premium: 10, friendly: 5, other: 2 },
    vibe: { v1: 15, v2: 10, v3: 15, v4: 8 },
    size: { '3x3': 5, '4x4': 10, '5x5': 15, '6x6': 20, multi: 25, unsure: 5 },
    config: { w0: 0, w1: 2, w2: 5, w3: 8, w4: 10 },
    event: { racing: 20, trade: 15, festival: 10, sampling: 5, brand: 10, other: 5 },
    urgency: { asap: 20, month: 15, quarter: 10, planning: 5, exploring: 2 }
  },
  thresholds: {
    hot: 80,
    warm: 50
  }
};

export const validateLead = (lead: any) => {
  // Ensure we have fallback values for all render critical fields
  return {
    ...lead,
    email: lead.email || "unknown@lead.ext",
    brand: lead.brand || { name: "New Lead", logo: null, colors: [] },
    pipeline_stage: lead.pipeline_stage || (lead.renders?.length > 0 ? "presentation" : "active"),
    language: (lead.language || "en").toLowerCase(),
    isUrgent: !!lead.isUrgent,
    renders: lead.renders || [],
    vibe: lead.vibe || "Not specified",
    size: lead.size || "Unknown",
    config: lead.config || "w0",
    event: lead.event || "Standard",
    urgency: lead.urgency || "exploring"
  };
};

export const calculateLeadScore = (lead: any, weights: any = DEFAULT_WEIGHTS) => {
  const validated = validateLead(lead);
  let score = 0;
  
  const getWeight = (category: string, value: string) => {
    if (!weights?.options?.[category] || !weights?.categories?.[category]) return 0;
    
    // Safety clamp: the option score can never exceed its category maximum cap
    const maxCapacity = weights.categories[category] || 0;
    const rawVal = weights.options[category][value] || 0;
    return Math.min(rawVal, maxCapacity);
  };

  score += getWeight('personality', validated.personality);
  score += getWeight('vibe', validated.vibe);
  score += getWeight('size', validated.size);
  score += getWeight('config', validated.config);
  score += getWeight('event', validated.event);
  score += getWeight('urgency', validated.urgency);
  
  return score;
};

export const getTemperatureStatus = (score: number, thresholds: { hot: number, warm: number } = { hot: 80, warm: 50 }) => {
  if (score >= thresholds.hot) return { label: 'Hot', icon: '🔥', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' };
  if (score >= thresholds.warm) return { label: 'Warm', icon: '☀️', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
  return { label: 'Cold', icon: '❄️', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
};

interface SalesContextType {
  user: User | null;
  agentProfile: any | null;
  teamAgents: any[];
  leads: any[];
  loading: boolean;
  selectedLead: any | null;
  scoringWeights: any;
  setSelectedLead: (lead: any | null) => void;
  updateLeadInState: (updatedLead: any) => void;
  updateLeadData: (leadId: string, data: any) => Promise<void>;
  refreshLeads: () => Promise<void>;
  updateWeights: (newWeights: any) => Promise<void>;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export function SalesProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [agentProfile, setAgentProfile] = useState<any | null>(null);
  const [teamAgents, setTeamAgents] = useState<any[]>([]);
  const [rawLeads, setRawLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [scoringWeights, setScoringWeights] = useState<any>(DEFAULT_WEIGHTS);

  // Derive filtered leads based on the agent's language settings
  const leads = React.useMemo(() => {
    if (!agentProfile?.languages || agentProfile.languages.length === 0) {
      // Fallback: If no languages are configured, default to EN so they see at least something
      return rawLeads.filter(l => (l.language || 'en').toLowerCase() === 'en');
    }
    
    return rawLeads.filter(l => {
      const leadLang = (l.language || 'en').toLowerCase();
      return agentProfile.languages.includes(leadLang);
    });
  }, [rawLeads, agentProfile]);

  useEffect(() => {
    let unsubscribeLeads: () => void;
    let unsubscribeProfile: () => void;
    let unsubscribeTeam: () => void;
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        if (unsubscribeLeads) unsubscribeLeads();
        if (unsubscribeProfile) unsubscribeProfile();
        if (unsubscribeTeam) unsubscribeTeam();
        router.push("/login");
      } else {
        setUser(currentUser);
        
        // Ensure user has passed onboarding
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
           router.push("/onboarding");
        } else {
           // Setup Realtime Sync
           setLoading(true);

           // 1. Setup User Profile Live Snapshot
           unsubscribeProfile = onSnapshot(docRef, (snapshot) => {
             if (snapshot.exists()) {
               setAgentProfile(snapshot.data());
             }
           }, (error) => console.error("Permission error on User Profile:", error));

           // 1b. Setup Team Agents Roster
           unsubscribeTeam = onSnapshot(collection(db, "users"), (snapshot) => {
             const agents = snapshot.docs.map(doc => ({
               id: doc.id,
               ...doc.data()
             }));
             setTeamAgents(agents);
           }, (error) => console.error("Permission error on Team Agents Roster:", error));
           
           // 2. Fetch Scoring Weights
           const scoringRef = doc(db, "settings", "scoring_weights");
           const scoringSnap = await getDoc(scoringRef).catch(e => console.error("Permission error on Settings:", e));
           if (scoringSnap && scoringSnap.exists()) {
              setScoringWeights(scoringSnap.data());
           }
           
           // 3. Setup Live Leads Snapshot
           const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
           unsubscribeLeads = onSnapshot(q, (snapshot) => {
             const fetchedLeads = snapshot.docs.map(doc => validateLead({
               id: doc.id,
               ...doc.data()
             }));
             setRawLeads(fetchedLeads);
             
             // Update selectedLead dynamically if it's currently being viewed
             setSelectedLead((prev: any) => {
               if (!prev) return prev;
               const updated = fetchedLeads.find(l => l.id === prev.id);
               return updated || prev;
             });
             
             setLoading(false);
           }, (error) => {
             console.error("Permission error on Leads Sync:", error);
             setLoading(false);
           });
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeLeads) unsubscribeLeads();
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeTeam) unsubscribeTeam();
    };
  }, [router]);

  // Deprecated explicitly in favor of realtime sync, kept for interface compliance
  const fetchLeads = async () => {};

  const updateWeights = async (newWeights: any) => {
    try {
      const { setDoc } = await import("firebase/firestore");
      const scoringRef = doc(db, "settings", "scoring_weights");
      await setDoc(scoringRef, newWeights);
      setScoringWeights(newWeights);
    } catch (error) {
      console.error("Error updating weights:", error);
      throw error;
    }
  };

   const updateLeadData = async (leadId: string, data: any) => {
    // 1. Snapshot previous state for rollback
    const previousRawLeads = [...rawLeads];
    const previousSelected = selectedLead ? { ...selectedLead } : null;

    // 2. Optimistic Update (UI reacts instantly)
    setRawLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...data } : l));
    if (selectedLead?.id === leadId) {
      setSelectedLead({ ...selectedLead, ...data });
    }

    try {
      // 3. Execute Database Transaction for Concurrency Safety
      await runTransaction(db, async (transaction) => {
        const leadRef = doc(db, "leads", leadId);
        const leadDoc = await transaction.get(leadRef);
        
        if (!leadDoc.exists()) {
          throw new Error("Lead record not found for transaction.");
        }

        const currentData = leadDoc.data();
        
        // Safety: If someone else changed a locked field, you might want logic here.
        // For now, we perform a safe merge.
        transaction.update(leadRef, data);
      });
      
      // Transaction complete - existing onSnapshot will handle further sync
    } catch (error) {
      console.error("Transaction failed, rolling back UI:", error);
      
      // 4. Rollback local state on failure
      setRawLeads(previousRawLeads);
      setSelectedLead(previousSelected);
      
      toast.error("Cloud Sync Failed", {
        description: "The lead status couldn't be synchronized. Please try again."
      });
      throw error;
    }
  };

  const updateLeadInState = (updatedLead: any) => {
    const validated = validateLead(updatedLead);
    setRawLeads(prev => prev.map(l => l.id === validated.id ? validated : l));
    if (selectedLead?.id === validated.id) {
      setSelectedLead(validated);
    }
  };

  return (
    <SalesContext.Provider value={{ 
      user, 
      agentProfile,
      teamAgents,
      leads, 
      loading, 
      selectedLead, 
      setSelectedLead, 
      updateLeadInState,
      scoringWeights,
      updateWeights,
      updateLeadData,
      refreshLeads: fetchLeads 
    }}>
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error("useSales must be used within a SalesProvider");
  }
  return context;
}

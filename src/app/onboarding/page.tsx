"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase/config";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        // Check if they already exist, if so bounce them back to /sales
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
           router.push("/sales");
        } else {
           setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setError("");
    setSaving(true);

    try {
      await setDoc(doc(db, "users", user.uid), {
        name,
        role,
        email: user.email,
        createdAt: new Date().toISOString()
      });
      router.push("/sales");
    } catch (err: any) {
      console.error(err);
      setError("Failed to save profile. Please try again.");
      setSaving(false);
    }
  };

  if (loading) {
     return <div className="min-h-screen bg-off flex items-center justify-center font-jakarta">Checking account...</div>;
  }

  return (
    <div className="min-h-screen bg-off flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-line shadow-sm">
        <h1 className="font-syne font-extrabold text-[28px] mb-2 text-black">Welcome aboard!</h1>
        <p className="text-gray2 text-sm mb-6 font-jakarta">Let's get your Airdome sales profile set up before you jump in.</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-jakarta text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Jane Doe"
              className="w-full h-12 px-4 rounded-xl border border-line bg-off text-black font-jakarta outline-none focus:border-black transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-jakarta text-gray-700 mb-1">Role / Title</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              placeholder="e.g. Sales Director"
              className="w-full h-12 px-4 rounded-xl border border-line bg-off text-black font-jakarta outline-none focus:border-black transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 bg-black text-white font-syne font-bold rounded-xl mt-4 hover:bg-black/90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}

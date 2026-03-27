"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface DashboardLayoutProps {
  children: ReactNode;
  user: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function DashboardLayout({ children, user, activeTab, setActiveTab }: DashboardLayoutProps) {
  const router = useRouter();
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  useGSAP(() => {
    gsap.from(".sidebar-item", {
      x: -20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: "power3.out"
    });
    
    gsap.from(".main-content", {
      opacity: 0,
      y: 20,
      duration: 1,
      delay: 0.3,
      ease: "power3.out"
    });
  }, []);

  const navItems = [
    { id: "overview", label: "Overview", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { id: "pipeline", label: "Lead Pipeline", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { id: "landings", label: "Landing Pages", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )},
    { id: "deals", label: "Contracts", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
  ];

  return (
    <div className="flex min-h-screen bg-black text-white font-spline overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-black/40 backdrop-blur-xl z-10 flex flex-col">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.3)]">
              <span className="text-black font-spline font-extrabold text-xl">A</span>
            </div>
            <span className="font-spline font-extrabold text-2xl tracking-tight">AIRDOME</span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`sidebar-item w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === item.id 
                    ? "bg-white/10 text-accent border border-white/10" 
                    : "text-gray2 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
                {activeTab === item.id && (
                  <div className="ml-auto w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_8px_rgba(0,242,255,1)]" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray uppercase tracking-widest font-bold">Sales Mode</span>
            </div>
            <p className="text-sm font-medium truncate">{user?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full px-4 py-3 rounded-xl border border-white/10 text-gray2 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content flex-1 overflow-y-auto z-10 p-12">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

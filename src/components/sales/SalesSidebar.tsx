"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useSales } from "@/context/SalesContext";
import Link from "next/link";

export default function SalesSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, agentProfile } = useSales();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  
  const sidebarRef = React.useRef(null);
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  useGSAP(() => {
    const tl = gsap.timeline();

    if (isCollapsed) {
      // 1. COLLAPSE SEQUENCE (Fast & Smooth)
      tl.to([".nav-label", ".brand-text", ".profile-text"], {
        autoAlpha: 0,
        x: -15,
        duration: 0.2,
        ease: "power2.in",
        display: "none"
      });
      tl.to(sidebarRef.current, {
        width: 100,
        duration: 0.5,
        ease: "power4.inOut"
      }, "-=0.1");
      // Reveal minimal profile dot
      tl.fromTo(".minimal-dot", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }, "-=0.2");
    } else {
      // 2. EXPAND SEQUENCE
      // Hide minimal dot first
      tl.to(".minimal-dot", { scale: 0, opacity: 0, duration: 0.2 });
      // Expand bar
      tl.to(sidebarRef.current, {
        width: 280,
        duration: 0.6,
        ease: "power4.inOut"
      }, "-=0.2");
      // Reveal text
      tl.fromTo([".nav-label", ".brand-text", ".profile-text"], 
        { display: "none", autoAlpha: 0, x: -15 },
        { 
          display: "block", 
          autoAlpha: 1, 
          x: 0, 
          duration: 0.4,
          stagger: 0.05,
          ease: "back.out(1.2)"
        }, "-=0.2");
    }
  }, [isCollapsed]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // Removed useGSAP sidebar-item animation to prevent opacity from getting stuck during Next.js client-side route transitions

  const navItems = [
    { path: "/sales", label: "Overview", icon: (
      <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { path: "/sales/pipeline", label: "Pipeline", icon: (
      <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { path: "/sales/presentations", label: "Presentations", icon: (
      <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )},
    { path: "/sales/contracts", label: "Closed Leads", icon: (
      <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    )},
    { path: "/sales/settings", label: "Scoring Settings", icon: (
      <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )},
  ];

  return (
    <aside 
      ref={sidebarRef}
      className={`h-screen border-r border-white/5 bg-black/40 backdrop-blur-2xl z-10 flex flex-col relative shadow-[4px_0_24px_rgba(0,0,0,0.2)] transition-all ${isCollapsed ? 'p-4' : 'p-8'}`}
    >
      <div className={`pb-4 flex-1 flex flex-col items-center ${isCollapsed ? 'px-0' : ''}`}>
        <div 
          className="flex items-center gap-3 mb-16 group cursor-pointer w-full justify-center" 
          onClick={toggleCollapse}
        >
          <img 
            src="/airdome-logo-black-320x163.png" 
            alt="Airdome Logo" 
            className={`h-7 w-auto object-contain invert brightness-200 transition-all ${isCollapsed ? 'scale-125' : ''}`}
          />
          <div className="h-6 w-px bg-white/20 mx-1 brand-text" />
          <span className="font-syne font-black text-xs tracking-[0.3em] text-accent/80 mt-1 brand-text">LMS</span>
        </div>

        <nav className="space-y-3 flex flex-col w-full">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`sidebar-item group relative w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-medium ${
                  isActive 
                    ? "bg-gradient-to-r from-white/10 to-transparent border border-white/10 text-white shadow-lg overflow-hidden" 
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-r-full shadow-[0_0_12px_rgba(0,242,255,1)]" />}
                <div className={`relative z-10 flex items-center gap-4 ${isActive ? 'text-accent' : ''} ${isCollapsed ? 'scale-110' : ''}`}>
                  {item.icon}
                  <span className="tracking-wide text-[15px] nav-label whitespace-nowrap">{item.label}</span>
                </div>
                {isActive && (
                  <div className="absolute right-4 w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_10px_rgba(0,242,255,1)] animate-pulse nav-label" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={`mt-auto flex flex-col items-center w-full ${isCollapsed ? 'pb-4' : 'p-8'}`}>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 mb-6 group hover:bg-white/10 transition-colors cursor-pointer w-full relative min-h-[80px] flex flex-col justify-center overflow-hidden" onClick={() => router.push('/sales/profile')}>
          <div className="flex items-center justify-between mb-1 profile-text">
            <span className="text-[10px] text-gray uppercase tracking-widest font-bold whitespace-nowrap">Agent Profile</span>
            <span className="text-[10px] text-accent font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Edit &rsaquo;</span>
          </div>
          <p className="text-sm font-bold text-white profile-text whitespace-nowrap truncate">
            {agentProfile?.name || 'Anonymous Agent'}
          </p>
          <p className="text-[11px] text-gray2 profile-text whitespace-nowrap truncate">
            {user?.email}
          </p>
          
          <div className="minimal-dot absolute inset-0 m-auto w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center opacity-0 scale-0 pointer-events-none shadow-[0_0_20px_rgba(0,242,255,0.1)]">
            <span className="text-accent font-syne font-black text-lg">
              {(agentProfile?.name || user?.email || "A")[0].toUpperCase()}
            </span>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className={`w-full px-4 py-3 rounded-xl border border-white/10 text-gray2 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold flex items-center justify-center gap-2 ${isCollapsed ? 'w-10 h-10 px-0' : ''}`}
          title={isCollapsed ? "Log out" : ""}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="profile-text whitespace-nowrap">Log out</span>
        </button>
      </div>
    </aside>
  );
}

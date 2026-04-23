"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { usePathname } from "next/navigation";

export const MainNavigation = () => {
  const { t } = useLanguage();
  const pathname = usePathname();
  
  const isSalesPath = pathname?.startsWith("/sales");
  if (isSalesPath) return null;
  
  const isDarkPage = pathname === "/";
  
  const navClasses = isDarkPage 
    ? "bg-white/5 backdrop-blur-xl border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.2)]" 
    : "bg-[#0A0A0A] backdrop-blur-xl border-[#222] shadow-[0_8px_30px_rgba(0,0,0,0.15)]";

  return (
    <div className="fixed top-6 left-0 right-0 z-[500] flex justify-center px-6 pointer-events-none">
      <nav className={`pointer-events-auto flex items-center border rounded-full px-6 py-2 gap-8 md:gap-12 transition-all duration-300 ${navClasses}`}>
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l-10 18h20L12 2z" />
            </svg>
          </div>
          <span className="text-white font-bold tracking-tight text-lg">Airshape</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <LanguageSwitcher theme="dark" />
          
          <Link 
            href={pathname === "/airdome" ? "/airdome/design" : "/airdome"}
            className="px-6 py-2.5 bg-white text-black text-[14px] font-bold rounded-full hover:bg-gray-200 transition-all active:scale-95 shadow-lg shadow-white/10"
          >
            {pathname === "/airdome" ? t("nav.cta") : t("airshape.nav.products")}
          </Link>
        </div>
      </nav>
    </div>
  );
};

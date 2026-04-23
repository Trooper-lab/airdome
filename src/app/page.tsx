"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function AirshapeHomePage() {
  const { t } = useLanguage();

  useGSAP(() => {
    const tl = gsap.timeline();

    // 1. Initial State
    gsap.set(".hero-title, .hero-subtitle, .product-card, .hero-brands", { opacity: 0, y: 40 });
    gsap.set(".hero-glow", { scale: 0.8, opacity: 0 });

    // 2. Massive Text Loading Sequence
    // Start centered and prominent, then shrink to top background
    tl.fromTo(".hero-massive-text", 
      { top: "50%", yPercent: -50 },
      { top: "12%", yPercent: 0, duration: 1.8, ease: "expo.inOut", delay: 0.5 }
    );
    
    tl.fromTo(".hero-massive-text h2",
      { opacity: 1, scale: 1.15, letterSpacing: "0.05em" },
      { opacity: 0.04, scale: 1, letterSpacing: "-0.04em", duration: 1.8, ease: "expo.inOut" },
      "<" // Start at the same time as the top position tween
    );

    // 3. Page Entrance
    tl.to(".hero-glow", {
      scale: 1,
      opacity: 1,
      duration: 2,
      ease: "power2.out"
    }, "-=1.0");

    tl.to(".hero-title", {
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: "expo.out"
    }, "-=1.0");

    tl.to(".hero-subtitle", {
      y: 0,
      opacity: 1,
      duration: 1.0,
      ease: "power3.out"
    }, "-=0.8");

    tl.to(".product-card", {
      y: 0,
      opacity: 1,
      duration: 1.2,
      stagger: 0.15,
      ease: "expo.out"
    }, "-=0.8");

    tl.to(".hero-brands", {
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: "power3.out"
    }, "-=0.8");

  }, []);

  return (
    <div className="relative min-h-screen bg-[#060608] font-spline selection:bg-white selection:text-black overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="hero-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 blur-[140px] rounded-full" />
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Hero Section */}
      <div className="relative min-h-screen w-full flex flex-col items-center justify-start px-6 pt-[22vh] pb-20">
        
        {/* Background Massive Text / Loader */}
        <div className="hero-massive-text absolute left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none z-0 select-none">
          <h2 className="font-syne font-extrabold text-[12vw] sm:text-[15vw] leading-none text-white tracking-[-0.04em] uppercase">
            Airshape<span className="text-[0.3em] align-top ml-1 opacity-50">®</span>
          </h2>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">
          <h1 className="hero-title text-5xl sm:text-7xl md:text-[90px] font-bold leading-[1.0] mb-8 tracking-[-0.04em] text-white font-syne uppercase">
            {t("airshape.hero.title")}
          </h1>
          <p className="hero-subtitle text-lg md:text-[22px] text-gray-400 font-medium mb-16 max-w-2xl leading-relaxed">
            {t("airshape.hero.subtitle")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl px-4">
            {/* Airdome Product */}
            <Link 
              href="/airdome"
              className="product-card group relative overflow-hidden rounded-[32px] bg-white/[0.03] border border-white/10 p-8 hover:bg-white/[0.06] hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.05)] transition-all duration-500 text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-full h-32 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  {/* @ts-ignore */}
                  <model-viewer
                    src="/3d/model.glb"
                    poster="/3d/poster.png"
                    alt="Airdome 3D Model"
                    auto-rotate
                    shadow-intensity="1"
                    exposure="1"
                    interaction-prompt="none"
                    camera-orbit="45deg 75deg 105%"
                    style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
                    loading="lazy"
                    className="w-full h-full pointer-events-none"
                  />
                </div>
                
                <div>
                  <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">{t("airshape.product.airdome.name")}</h3>
                  <p className="text-gray-400 text-base font-medium leading-relaxed">
                    {t("airshape.product.airdome.desc")}
                  </p>
                </div>
              </div>
            </Link>

            {/* Airgate Product */}
            <Link 
              href="/airgate"
              className="product-card group relative overflow-hidden rounded-[32px] bg-white/[0.03] border border-white/10 p-8 hover:bg-white/[0.06] hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(0,120,255,0.1)] transition-all duration-500 text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-full h-32 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  {/* @ts-ignore */}
                  <model-viewer
                    src="/3d/model.glb"
                    poster="/3d/poster.png"
                    alt="Airgate 3D Model"
                    auto-rotate
                    shadow-intensity="1"
                    exposure="1"
                    interaction-prompt="none"
                    camera-orbit="45deg 75deg 105%"
                    style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
                    loading="lazy"
                    className="w-full h-full pointer-events-none"
                  />
                </div>
                
                <div>
                  <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">{t("airshape.product.airgate.name")}</h3>
                  <p className="text-gray-400 text-base font-medium leading-relaxed">
                    {t("airshape.product.airgate.desc")}
                  </p>
                </div>
              </div>
            </Link>

            {/* Custom Work Product */}
            <Link 
              href="/custom"
              className="product-card group relative overflow-hidden rounded-[32px] bg-white/[0.03] border border-white/10 p-8 hover:bg-white/[0.06] hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(150,0,255,0.1)] transition-all duration-500 text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-full h-32 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  {/* @ts-ignore */}
                  <model-viewer
                    src="/3d/model.glb"
                    poster="/3d/poster.png"
                    alt="Custom 3D Model"
                    auto-rotate
                    shadow-intensity="1"
                    exposure="1"
                    interaction-prompt="none"
                    camera-orbit="45deg 75deg 105%"
                    style={{ width: '100%', height: '100%', backgroundColor: 'transparent', filter: 'hue-rotate(90deg)' }}
                    loading="lazy"
                    className="w-full h-full pointer-events-none"
                  />
                </div>
                
                <div>
                  <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">{t("airshape.product.custom.name")}</h3>
                  <p className="text-gray-400 text-base font-medium leading-relaxed">
                    {t("airshape.product.custom.desc")}
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Trusted Brands */}
          <div className="hero-brands mt-16 w-full flex flex-col items-center overflow-hidden">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] mb-8">
              Trusted by industry leaders
            </p>
            <div className="flex flex-nowrap justify-start md:justify-center items-center gap-8 md:gap-16 overflow-x-auto w-full px-6 pb-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style dangerouslySetInnerHTML={{__html: `\n                .hero-brands div::-webkit-scrollbar { display: none; }\n              `}} />
              {['adidas', 'heineken', 'mclaren', 'oakley', 'volvo'].map((brand) => (
                <img 
                  key={brand}
                  src={`/logos/${brand}.svg`} 
                  alt={`${brand} logo`} 
                  className="h-5 md:h-6 object-contain brightness-0 invert opacity-30 hover:opacity-100 hover:scale-105 transition-all duration-500" 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="relative z-10 py-12 text-center">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em]">
          Pioneering Premium Inflatable Architecture
        </p>
      </div>
    </div>
  );
}

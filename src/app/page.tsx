"use client";

import React, { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useGSAP(() => {
    // CINEMATIC HERO-TO-SHOWCASE TRANSITION
    if (showcaseRef.current) {
      let mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        // Desktop Animation
        const mainTl = gsap.timeline({
          scrollTrigger: {
            trigger: showcaseRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          }
        });

        mainTl.to(".model-container", { opacity: 1, scale: 1, y: 0, duration: 2 })
              .to(".hero-content-layer", { opacity: 0, y: -50, duration: 1 }, "-=1")
              .to(".sticky-3d-model", { xPercent: -25, duration: 1.5 }, "-=0.2")
              .to(".step-1", { opacity: 1, y: 0, duration: 2 }, "+=0.5")
              .to(".step-1", { opacity: 0, y: -30, duration: 2, delay: 1 })
              .to(".step-2", { opacity: 1, y: 0, duration: 2 }, "-=0.5")
              .to(".step-2", { opacity: 0, y: -30, duration: 2, delay: 1 })
              .to(".step-3", { opacity: 1, y: 0, duration: 2 }, "-=0.5");
      });

      mm.add("(max-width: 767px)", () => {
        // Mobile Animation
        const mobTl = gsap.timeline({
          scrollTrigger: {
            trigger: showcaseRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          }
        });

        // Small screen: Rise, but stay centered horizontally. Shift UP slightly so text fits below.
        mobTl.to(".model-container", { opacity: 1, scale: 1, y: 0, duration: 2 })
             .to(".hero-content-layer", { opacity: 0, y: -50, duration: 1 }, "-=1")
             .to(".sticky-3d-model", { yPercent: -20, duration: 1.5 }, "-=0.2") 
             .to(".step-1", { opacity: 1, y: 0, duration: 2 }, "+=0.5")
             .to(".step-1", { opacity: 0, y: -30, duration: 2, delay: 1 })
             .to(".step-2", { opacity: 1, y: 0, duration: 2 }, "-=0.5")
             .to(".step-2", { opacity: 0, y: -30, duration: 2, delay: 1 })
             .to(".step-3", { opacity: 1, y: 0, duration: 2 }, "-=0.5");
      });
    }

    // Card Deck Animation for Logos
    const logos = gsap.utils.toArray(".logo-item");
    if (logos.length > 0) {
      const loop = gsap.timeline({ repeat: -1 });
      
      logos.forEach((logo: any) => {
        loop.fromTo(logo, 
          { opacity: 0, y: 15, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
        )
        .to(logo, { opacity: 0, y: -15, scale: 0.95, duration: 0.6, ease: "power3.in", delay: 2 });
      });
    }

    // ENTRANCE ANIMATIONS (Non-scroll)
    const entTl = gsap.timeline({ defaults: { ease: "power4.out" } });
    entTl.from(".nav-pill", { y: -20, opacity: 0, duration: 1, delay: 0.2 })
         .from(".hero-title", { y: 40, opacity: 0, duration: 1 }, "-=0.6")
         .from(".hero-sub", { y: 20, opacity: 0, duration: 1 }, "-=0.8")
         .from(".hero-ctas", { y: 20, opacity: 0, duration: 1 }, "-=0.8");

    // STAGGERED REVEAL FOR REVIEW CARDS
    const cards = gsap.utils.toArray(".review-card");
    cards.forEach((card: any) => {
      gsap.to(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          toggleActions: "play none none none"
        },
        y: 0,
        opacity: 1,
        duration: 1.5,
        ease: "power4.out"
      });
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-white font-spline selection:bg-black selection:text-white pb-0">
      {/* Navigation - Pill style */}
      <div className="fixed top-6 left-0 right-0 z-[100] flex justify-center px-6">
        <nav className="nav-pill flex items-center bg-white/90 backdrop-blur-xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-full px-6 py-2 gap-8 md:gap-12">
          <div className="flex items-center">
            <img 
              src="/airdome-logo-black-320x163.png" 
              alt="Airdome Logo" 
              className="h-7 md:h-9 w-auto object-contain"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link 
              href="/design"
              className="px-6 py-2.5 bg-black text-white text-[14px] font-bold rounded-full hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-black/10"
            >
              {t("nav.cta")}
            </Link>
          </div>
        </nav>
      </div>

      {/* Unified Cinematic Hero-to-Showcase Experience */}
      <div ref={showcaseRef} className="relative h-[600vh] bg-white">
        
        {/* Persistent Sticky Layer */}
        <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
          
          {/* 3D Model: Persistent across transition */}
          <div className="sticky-3d-model absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="model-container w-full h-full max-w-[800px] flex items-center justify-center transform-gpu opacity-0 scale-[0.85] translate-y-[80vh]">
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
                loading="eager"
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Hero Content Layer */}
          <div className="hero-content-layer relative z-30 w-full h-full flex flex-col items-center justify-center text-center px-6">
            <div className="trusted-by w-full max-w-5xl mb-12">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-6">
                {t("hero.trust")}
              </div>
              <div className="relative h-12 flex justify-center items-center">
                 {[
                   { src: "/logos/volvo.svg", alt: "Volvo", h: "h-5 md:h-6" },
                   { src: "/logos/heineken.svg", alt: "Heineken", h: "h-7 md:h-8" },
                   { src: "/logos/mclaren.svg", alt: "McLaren", h: "h-4 md:h-5" },
                   { src: "/logos/oakley.svg", alt: "Oakley", h: "h-7 md:h-8" },
                   { src: "/logos/adidas.svg", alt: "Adidas", h: "h-7 md:h-8" },
                   { type: "text", content: "+1,500 brands" }
                 ].map((logo, i) => (
                    <div key={i} className="logo-item absolute inset-0 flex items-center justify-center opacity-0 overflow-hidden">
                      {logo.type === "text" ? (
                        <div className="text-[12px] md:text-sm font-bold bg-gray-50 rounded-full px-5 py-2 text-black border border-gray-100/50">
                          {logo.content}
                        </div>
                      ) : (
                        <img src={logo.src} alt={logo.alt} className={`${logo.h} w-auto object-contain transition-transform duration-500`} />
                      )}
                    </div>
                 ))}
              </div>
            </div>

            <h1 className="hero-title text-4xl sm:text-5xl md:text-[76px] font-bold leading-[1.05] mb-6 font-spline tracking-[-0.03em] max-w-4xl text-black">
              {t("hero.headline")}
            </h1>

            <p className="hero-sub text-lg md:text-[21px] text-gray-500 font-medium mb-10 max-w-2xl leading-relaxed">
              {t("hero.subline")}
            </p>

            <div className="hero-ctas flex flex-col items-center gap-12 mt-4">
              <div className="flex flex-col items-center gap-6">
                <Link 
                  href="/design"
                  className="group px-10 py-5 bg-black text-white text-lg font-bold rounded-full hover:bg-gray-800 transition-all active:scale-95 shadow-2xl shadow-black/20 flex items-center gap-3"
                >
                  {t("hero.cta")}
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-[13px] font-bold text-gray-400">
                  <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> {t("hero.micro1")}</span>
                  <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> {t("hero.micro2")}</span>
                  <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> {t("hero.micro3")}</span>
                </div>
              </div>

              {/* Static Gray Logo Bar */}
              <div className="w-full pt-12 border-t border-gray-50 flex flex-col items-center">
                <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-10">
                  {t("hero.trust")}
                </div>
                <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 grayscale opacity-30">
                  <img src="/logos/volvo.svg" alt="Volvo" className="h-4 md:h-5 w-auto" />
                  <img src="/logos/heineken.svg" alt="Heineken" className="h-6 md:h-7 w-auto" />
                  <img src="/logos/mclaren.svg" alt="McLaren" className="h-3.5 md:h-4 w-auto" />
                  <img src="/logos/oakley.svg" alt="Oakley" className="h-6 md:h-7 w-auto" />
                  <img src="/logos/adidas.svg" alt="Adidas" className="h-6 md:h-7 w-auto" />
                </div>
              </div>
            </div>
          </div>

          {/* Showcase Steps Layer (Revealed on Right) */}
          <div className="showcase-steps-layer absolute inset-0 flex items-center px-6 md:px-24 pointer-events-none z-40">
            <div className="flex-1 hidden md:block" /> {/** Spacer for Left 3D side **/}
            <div className="flex-1 relative h-full flex flex-col justify-end pb-[15vh] md:justify-center md:pb-0 items-start lg:pl-24 pointer-events-auto">
              <div className="step-1 absolute inset-0 flex flex-col justify-end pb-[15vh] md:justify-center md:pb-0 opacity-0 translate-y-8">
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Step 01</div>
                <h2 className="text-4xl md:text-6xl font-bold text-black leading-tight mb-6">
                  {t("how.step1.title")}
                </h2>
                <p className="text-lg md:text-xl text-gray-500 font-medium max-w-md leading-relaxed">
                  {t("how.step1.desc")}
                </p>
              </div>

              <div className="step-2 absolute inset-0 flex flex-col justify-end pb-[15vh] md:justify-center md:pb-0 opacity-0 translate-y-8">
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Step 02</div>
                <h2 className="text-4xl md:text-6xl font-bold text-black leading-tight mb-6">
                  {t("how.step2.title")}
                </h2>
                <p className="text-lg md:text-xl text-gray-500 font-medium max-w-md leading-relaxed">
                  {t("how.step2.desc")}
                </p>
              </div>

              <div className="step-3 absolute inset-0 flex flex-col justify-end pb-[15vh] md:justify-center md:pb-0 opacity-0 translate-y-8">
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Step 03</div>
                <h2 className="text-4xl md:text-6xl font-bold text-black leading-tight mb-6">
                  {t("how.step3.title")}
                </h2>
                <p className="text-lg md:text-xl text-gray-500 font-medium max-w-md leading-relaxed">
                  {t("how.step3.desc")}
                </p>
                <Link 
                  href="/design"
                  className="mt-10 px-8 py-4 bg-black text-white font-bold rounded-full w-fit hover:bg-gray-800 transition-all active:scale-95"
                >
                  {t("hero.cta")}
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Scroll 1: ROI Framing */}
      <section className="py-24 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-16 lg:gap-24">
        <div className="flex-1 space-y-10">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-spline font-bold leading-tight text-black max-w-lg">
              {t("roi.headline")}
            </h2>
            <p className="text-lg text-gray-500 font-medium max-w-md leading-relaxed">
              {t("roi.subtext")}
            </p>
          </div>
          
          <div className="relative group overflow-hidden rounded-[40px] border border-gray-100 shadow-2xl">
            <img 
              src="/images/Volvo-Airdome-details.jpg" 
              alt="Volvo Airdome Details" 
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>
        </div>

        <div className="flex-1 w-full bg-gray-50 rounded-[40px] p-6 md:p-12 border border-gray-100 shadow-sm sticky top-24">
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200 mb-8">
            <div className="font-spline font-bold text-gray-400 uppercase tracking-wider text-xs">{t("roi.col1")}</div>
            <div className="font-spline font-bold text-black uppercase tracking-wider text-xs">{t("roi.col2")}</div>
          </div>
          <div className="space-y-8">
            {[
              { label: t("roi.cost"), val1: t("roi.cost1"), val2: t("roi.cost2"), highlight: true },
              { label: t("roi.setup"), val1: t("roi.setup1"), val2: t("roi.setup2") },
              { label: t("roi.crew"), val1: t("roi.crew1"), val2: t("roi.crew2") },
              { label: t("roi.branding"), val1: t("roi.branding1"), val2: t("roi.branding2") },
              { label: t("roi.transport"), val1: t("roi.transport1"), val2: t("roi.transport2") }
            ].map((row, i) => (
               <div key={i} className="grid grid-cols-2 gap-6 items-center">
                 <div className="text-gray-500 font-medium text-sm md:text-base pr-4">
                   <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{row.label}</div>
                   {row.val1}
                 </div>
                 <div className={`font-bold text-sm md:text-lg ${row.highlight ? "text-green-600" : "text-black"}`}>
                   {row.val2}
                 </div>
               </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scroll 4: Elite Minimalist Social Proof */}
      <section className="py-40 px-6 max-w-6xl mx-auto">
        <div className="mb-32">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-6">Social Proof</div>
          <h2 className="text-5xl md:text-7xl font-spline font-bold text-black tracking-tight leading-[1.05] max-w-4xl">
            Trusted by global leaders to <span className="text-gray-300">own the space.</span>
          </h2>
        </div>

        <div className="space-y-40">
          {[
            { 
              quote: t("testi.1.quote"), 
              name: t("testi.1.name"), 
              role: t("testi.1.role"), 
              brand: "Volvo",
              logo: "/logos/volvo.svg"
            },
            { 
              quote: t("testi.2.quote"), 
              name: t("testi.2.name"), 
              role: t("testi.2.role"), 
              brand: "Heineken",
              logo: "/logos/heineken.svg"
            },
            { 
              quote: "The only structure that matches our engineering standards.", 
              name: "Lewis Hamilton", 
              role: "Brand Ambassador, McLaren", 
              brand: "McLaren",
              logo: "/logos/mclaren.svg"
            }
          ].map((tLine, i) => (
             <div key={i} className="review-card flex flex-col md:flex-row gap-12 md:gap-24 opacity-0 scale-95 translate-y-20">
               <div className="md:w-1/3">
                 <img src={tLine.logo} alt={tLine.brand} className="h-10 md:h-12 w-auto mb-8 object-contain" />
                 <div className="h-px w-12 bg-gray-200 mb-8" />
                 <div className="font-bold text-sm tracking-tight text-black">{tLine.name}</div>
                 <div className="text-[12px] text-gray-400 font-medium mt-1 uppercase tracking-tight">{tLine.role}</div>
               </div>
               <div className="md:w-2/3">
                 <p className="text-3xl md:text-5xl font-spline font-light leading-[1.15] text-black tracking-tight">
                   "{tLine.quote}"
                 </p>
               </div>
             </div>
          ))}
        </div>
      </section>

      {/* Scroll 4: Final CTA */}
      <section className="relative py-32 md:py-48 px-6 bg-[#0A0A0A] flex flex-col items-center text-center overflow-hidden">
        {/* Subtle Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/Good-Year-1024x884.jpg" 
            alt="Goodyear Airdome" 
            className="w-full h-full object-cover opacity-[0.15] grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A]" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-8">
            {t("final.eyebrow")}
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-[64px] font-bold leading-[1.1] mb-8 font-spline tracking-[-0.03em] max-w-3xl text-white">
            {t("final.headline")}
          </h2>
          <p className="text-lg md:text-[21px] text-gray-400 font-medium mb-12 max-w-2xl leading-relaxed">
            {t("final.subline")}
          </p>
          <Link 
            href="/design"
            className="inline-flex items-center justify-center px-12 py-5 bg-white text-black text-[16px] md:text-[18px] font-bold rounded-2xl hover:bg-gray-100 transition-all active:scale-95 shadow-xl shadow-white/5"
          >
            {t("hero.cta")}
          </Link>
          <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-gray-500 font-semibold">
            <span className="flex items-center gap-2">✓ {t("hero.micro1")}</span>
            <span className="flex items-center gap-2">✓ {t("hero.micro2")}</span>
            <span className="flex items-center gap-2">✓ {t("hero.micro3")}</span>
          </div>
        </div>
      </section>

      {/* Ultra-Minimal Footer (No Links) */}
      <footer className="py-10 bg-[#0A0A0A] px-6 text-center text-[13px] text-gray-600 font-medium flex justify-center border-t border-white/5">
        {t("footer.copyright")}
      </footer>
    </div>
  );
}

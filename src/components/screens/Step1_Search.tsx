"use client";

import React, { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLanguage } from "@/i18n/LanguageContext";

interface Step1Props {
  onComplete: (brandData: any) => void;
}

interface BrandDetails {
  name: string;
  logoUrl?: string;
  colors?: string[];
  file?: File;
}

// ─── Editable Color Swatch ────────────────────────────────────────────────────
const ColorSwatch: React.FC<{
  color: string;
  index: number;
  canRemove: boolean;
  onChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}> = ({ color, index, canRemove, onChange, onRemove }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="group relative flex flex-col items-center gap-2">
      {/* Swatch — clicking opens native color picker */}
      <div
        className="relative w-12 h-12 rounded-xl border border-line shadow-sm cursor-pointer transition-transform hover:scale-110 active:scale-95"
        style={{ backgroundColor: color }}
        onClick={() => inputRef.current?.click()}
        title="Click to change color"
      >
        {/* Hidden native color picker */}
        <input
          ref={inputRef}
          type="color"
          value={color}
          onChange={(e) => onChange(index, e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          aria-label={`Color ${index + 1}`}
        />
        {/* Edit icon on hover */}
        <div className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 text-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </div>
      </div>

      {/* Hex label */}
      <span className="text-[9px] text-gray font-mono uppercase tracking-tight">{color}</span>

      {/* Remove button (only if can remove = more than min) */}
      {canRemove && (
        <button
          onClick={() => onRemove(index)}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white border border-line rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:border-red-400 hover:text-red-500 shadow-sm"
          aria-label="Remove color"
        >
          <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export const Step1_Search: React.FC<Step1Props> = ({ onComplete }) => {
  const [query, setQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [showLogoFound, setShowLogoFound] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [siteNotFound, setSiteNotFound] = useState(false);
  const [brandDetails, setBrandDetails] = useState<BrandDetails | null>(null);
  const [uploadError, setUploadError] = useState<string>("");

  // Editable color state (min 2, max 4)
  const [editColors, setEditColors] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  useGSAP(() => {
    gsap.fromTo(
      ".gsap-initial-reveal",
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }
    );
  }, { scope: containerRef });

  useGSAP(() => {
    if (showLogoFound || showFallback || isScanning) {
      gsap.fromTo(
        ".gsap-result-reveal",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, { dependencies: [showLogoFound, showFallback, isScanning], scope: containerRef });

  // Animate new swatch when added
  const animateNewSwatch = () => {
    gsap.fromTo(".swatch-new", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" });
  };

  const extractDomain = (input: string) => {
    try {
      let url = input.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
      const domain = new URL(url).hostname;
      return domain.replace(/^www\./, '');
    } catch {
      return input.toLowerCase().trim().replace(/\s+/g, '') + '.com';
    }
  };

  const handleScan = () => {
    if (!query.trim()) return;
    setIsScanning(true);
    setShowLogoFound(false);
    setShowFallback(false);
    setSiteNotFound(false);
    setBrandDetails(null);
    setEditColors([]);
    setUploadError("");

    const isLikelyUrl = query.includes('.') || query.startsWith('http');
    const domain = isLikelyUrl ? extractDomain(query) : `${query.toLowerCase().trim().replace(/\s+/g, '')}.com`;

    fetch(`/api/brand?domain=${encodeURIComponent(domain)}`)
      .then(async res => {
        const data = await res.json();
        // Even if not found, we show the card with the name and default colors
        const colors = data.colors && data.colors.length >= 2 ? data.colors : ['#111111', '#cccccc'];
        setBrandDetails({ 
          name: data.name || query || "Your Brand", 
          logoUrl: data.logoUrl, 
          colors 
        });
        setEditColors(colors);
        setShowLogoFound(true);
        setIsScanning(false);
      })
      .catch(() => {
        // Error fallback: still show the card so user can manual entry
        const colors = ['#111111', '#cccccc'];
        setBrandDetails({ name: query || "Your Brand", colors });
        setEditColors(colors);
        setShowLogoFound(true);
        setIsScanning(false);
      });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { setUploadError("File exceeds 5MB limit"); return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        const colors = ['#111111', '#f5f5f5', '#e8e4dc'];
        setBrandDetails({ name: file.name.split('.')[0] || 'Uploaded Brand', logoUrl: e.target?.result as string, file, colors });
        setEditColors(colors);
        setShowLogoFound(true);
        setShowFallback(false);
        setSiteNotFound(false);
        setUploadError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoReplace = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setBrandDetails(prev => prev ? { ...prev, logoUrl: e.target?.result as string } : prev);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleColorChange = (index: number, value: string) => {
    setEditColors(prev => prev.map((c, i) => i === index ? value : c));
  };

  const handleColorRemove = (index: number) => {
    if (editColors.length <= 2) return;
    setEditColors(prev => prev.filter((_, i) => i !== index));
  };

  const handleColorAdd = () => {
    if (editColors.length >= 4) return;
    setEditColors(prev => [...prev, '#cccccc']);
    setTimeout(animateNewSwatch, 50);
  };

  const handleContinue = () => {
    onComplete({
      ...brandDetails,
      colors: editColors.length > 0 ? editColors : brandDetails?.colors
    });
  };

  // Simplest check: show if we've surfaced a result card (found or manual placeholder)
  const isDataComplete = showLogoFound;

  return (
    <div ref={containerRef} className="flex-1 w-full flex flex-col items-center justify-start pt-[110px] px-6 pb-0 text-center">
      <div className="gsap-initial-reveal text-[9px] tracking-[0.4em] text-gray2 uppercase mb-[10px] flex items-center justify-center gap-[10px] opacity-0">
        <span className="w-4 h-px bg-gray2" />
        {t("design.s1.phase")}
        <span className="w-4 h-px bg-gray2" />
      </div>

      <h1 className="gsap-initial-reveal font-syne font-extrabold text-[32px] md:text-[52px] leading-[1.08] tracking-tight text-black mb-4 max-w-[580px] opacity-0">
        {t("design.s1.title")}
      </h1>

      <p className="gsap-initial-reveal text-sm leading-[1.7] text-gray mb-8 max-w-[400px] opacity-0">
        {t("design.s1.subtitle")}
      </p>

      {/* Search Bar */}
      <div className="gsap-initial-reveal w-full max-w-[580px] mb-8 opacity-0">
        <label htmlFor="brand-search" className="sr-only">Search Brand</label>
        <div className={`relative flex items-center group overflow-hidden rounded-[24px] bg-white border-[1.5px] border-line shadow-[0_4px_20px_rgba(17,17,16,0.04)] focus-within:border-black focus-within:shadow-[0_8px_30px_rgba(17,17,16,0.12)] transition-all ${isScanning ? 'animate-pulse pointer-events-none' : ''}`}>
          {isScanning && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.03] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          )}
          <div className="absolute left-[24px] z-10 text-gray2 group-focus-within:text-black transition-colors">
            {isScanning ? (
              <div className="w-5 h-5 border-[2.5px] border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            )}
          </div>
          <input
            id="brand-search"
            type="text"
            placeholder={t("design.s1.placeholder") as string}
            className="w-full pl-[64px] pr-[140px] py-[22px] bg-transparent outline-none font-syne text-[17px] font-medium text-black placeholder:text-gray2/60"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
          />
          <div className="absolute right-2 flex items-center gap-2">
            {query && !isScanning && (
              <button 
                onClick={() => setQuery("")}
                className="w-10 h-10 flex items-center justify-center text-gray2 hover:text-black transition-colors rounded-full hover:bg-off"
                title="Clear"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
            <button
              onClick={handleScan}
              disabled={!query.trim() || isScanning}
              className={`flex items-center justify-center transition-all ${showLogoFound ? 'w-12 h-12 bg-off text-gray hover:text-black hover:bg-line rounded-full' : 'px-6 py-3 bg-black text-white font-syne font-bold text-[11px] tracking-widest uppercase rounded-full hover:bg-zinc-800 disabled:opacity-30'}`}
              title={showLogoFound ? "Refresh / Rescan" : "Fetch"}
            >
              {showLogoFound ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={isScanning ? 'animate-spin' : ''}>
                  <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
              ) : (
                t("design.s1.scan") || "Fetch"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Scanning Indicator — High Fidelity */}
      {isScanning && (
        <div className="gsap-result-reveal flex flex-col items-center gap-4 opacity-0 mb-8">
          <div className="relative w-48 h-[2px] bg-off rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black to-transparent w-1/2 animate-[shimmer_1.5s_infinite]" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[11px] font-syne font-bold text-black uppercase tracking-[0.2em]">
              {t("design.s1.scanning") || "Analyzing"} <span className="text-gray2">{query}</span>
            </span>
          </div>
        </div>
      )}

      {/* ─── Result: Brand Identity Card ─────────────────────────────────── */}
      {showLogoFound && brandDetails && (
        <div className="gsap-result-reveal w-full max-w-[540px] bg-white border border-line rounded-[24px] p-8 mb-10 shadow-[0_12px_40px_rgba(17,17,16,0.08)] opacity-0 text-left relative overflow-hidden group/card">
          {/* Success Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-500/5 blur-[80px] rounded-full" />
          
          <div className="flex items-center gap-6 mb-8 relative">
            {/* Logo Wrapper */}
            <div className="relative group/logo shrink-0">
              <div className="w-[100px] h-[64px] bg-off border border-line rounded-[16px] flex items-center justify-center p-4 shadow-inner overflow-hidden transition-transform group-hover/logo:scale-[1.02]">
                {brandDetails.logoUrl ? (
                  <img
                    src={brandDetails.logoUrl}
                    alt={`${brandDetails.name} logo`}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `<span class="font-syne font-bold text-[24px] text-black">${brandDetails.name.charAt(0).toUpperCase()}</span>`;
                    }}
                  />
                ) : (
                  <span className="font-syne font-bold text-[24px] text-black">
                    {brandDetails.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <button
                onClick={() => logoInputRef.current?.click()}
                className="absolute inset-0 rounded-[16px] bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]"
                title="Replace logo"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span className="text-white text-[9px] mt-1.5 font-bold tracking-widest">REPLACE</span>
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.svg,.webp"
                className="hidden"
                onChange={handleLogoReplace}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="font-syne font-bold text-[22px] text-black truncate" title={brandDetails.name}>
                  {brandDetails.name}
                </h3>
                {brandDetails.logoUrl && !siteNotFound ? (
                  <div className="px-2 py-0.5 bg-green-500/10 rounded-full">
                    <span className="text-[9px] font-bold text-green-700 uppercase tracking-widest">Verified</span>
                  </div>
                ) : (
                  <div className="px-2 py-0.5 bg-zinc-100 rounded-full">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Manual Setup</span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-gray uppercase tracking-[0.15em] font-medium flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full animate-pulse ${brandDetails.logoUrl && !siteNotFound ? 'bg-green-500' : 'bg-zinc-400'}`} />
                {brandDetails.logoUrl && !siteNotFound ? t("design.s1.extracted") : "Upload logo to continue"}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-line mb-5" />

          {/* Color Palette — Editable */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-gray uppercase tracking-[0.2em] font-medium">
                {t("design.s1.palette")}
              </p>
              <p className="text-[9px] text-gray2">{t("design.s1.clickToEdit") as string || "Click to edit"}</p>
            </div>

            <div className="flex items-end gap-3 flex-wrap">
              {editColors.map((color, idx) => (
                <ColorSwatch
                  key={idx}
                  color={color}
                  index={idx}
                  canRemove={editColors.length > 2}
                  onChange={handleColorChange}
                  onRemove={handleColorRemove}
                />
              ))}

              {/* Add swatch button (max 4) */}
              {editColors.length < 4 && (
                <button
                  onClick={handleColorAdd}
                  className="swatch-new flex flex-col items-center gap-2 group"
                  title="Add color"
                >
                  <div className="w-12 h-12 rounded-xl border-[1.5px] border-dashed border-line flex items-center justify-center text-gray2 hover:border-black hover:text-black transition-all hover:scale-110">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </div>
                  <span className="text-[9px] text-gray2 group-hover:text-black transition-colors">Add</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input (for branding docs) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.png,.jpg,.jpeg,.svg"
        className="hidden"
      />

      {/* Final Step Action: Continue */}
      {isDataComplete && (
        <div className="gsap-result-reveal opacity-0 mb-12">
          <button
            onClick={handleContinue}
            className="inline-flex items-center gap-[12px] px-12 py-[20px] bg-black text-white font-syne font-bold text-[13px] tracking-widest uppercase rounded-full cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:bg-zinc-800 hover:translate-y-[-2px] active:scale-95 transition-all"
          >
            {t("design.s1.button")}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      )}

      {/* Trust Section */}
      {!isDataComplete && !isScanning && (
        <div className="gsap-initial-reveal w-full mt-[60px] border-t border-line opacity-0">
          <div className="flex flex-col items-center gap-3.5 py-7 px-6 border-b border-line">
            <span className="text-[9px] tracking-[0.25em] text-gray2 uppercase">{t("design.s1.trusted")}</span>
            <div className="flex gap-10 items-center flex-wrap justify-center opacity-40 grayscale">
              <span className="font-syne font-bold text-xs tracking-widest text-[#BEBAB2] uppercase">Red Bull</span>
              <span className="font-syne font-bold text-xs tracking-widest text-[#BEBAB2] uppercase">BMW Group</span>
              <span className="font-syne font-bold text-xs tracking-widest text-[#BEBAB2] uppercase">Spotify</span>
              <span className="font-syne font-bold text-xs tracking-widest text-[#BEBAB2] uppercase">Nike</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

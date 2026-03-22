"use client";

import React, { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface Step1Props {
  onComplete: (brandData: any) => void;
}

interface BrandDetails {
  name: string;
  logoUrl?: string;
  colors?: string[];
  file?: File;
}

export const Step1_Search: React.FC<Step1Props> = ({ onComplete }) => {
  const [query, setQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [showLogoFound, setShowLogoFound] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [brandDetails, setBrandDetails] = useState<BrandDetails | null>(null);
  const [uploadError, setUploadError] = useState<string>("");

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const extractDomain = (input: string) => {
    try {
      let url = input;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      const domain = new URL(url).hostname;
      return domain.replace(/^www\./, '');
    } catch {
      return input.toLowerCase().replace(/\s+/g, '') + '.com';
    }
  };

  const handleScan = () => {
    if (!query.trim()) return;

    setIsScanning(true);
    setShowLogoFound(false);
    setShowFallback(false);
    setBrandDetails(null);
    setUploadError("");

    // Make an API request to our backend scraper
    const isLikelyUrl = query.includes('.') || query.startsWith('http');
    const domain = isLikelyUrl ? extractDomain(query) : `${query.toLowerCase().replace(/\s+/g, '')}.com`;

    fetch(`/api/brand?domain=${encodeURIComponent(domain)}`)
      .then(res => {
        if (!res.ok) throw new Error('API Error');
        return res.json();
      })
      .then(data => {
        setIsScanning(false);
        setBrandDetails({
          name: data.name || query,
          logoUrl: data.logoUrl,
          colors: data.colors || ['#000000', '#FFFFFF']
        });
        setShowLogoFound(true);
      })
      .catch((error) => {
        console.error("Brand fetch failed:", error);
        setIsScanning(false);
        // If everything fails, show the fallback screen
        setShowFallback(true);
      });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("File exceeds 5MB limit");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setBrandDetails({
          name: file.name.split('.')[0] || 'Uploaded Brand',
          logoUrl: e.target?.result as string,
          file: file
        });
        setShowLogoFound(true);
        setShowFallback(false);
        setUploadError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleManualConfig = () => {
    onComplete({ isManual: true });
  };

  const handleContinue = () => {
    onComplete(brandDetails || { name: query });
  };

  return (
    <div ref={containerRef} className="flex-1 w-full flex flex-col items-center justify-start pt-[110px] px-6 pb-0 text-center">
      <div className="gsap-initial-reveal text-[9px] tracking-[0.4em] text-gray2 uppercase mb-[10px] flex items-center justify-center gap-[10px] opacity-0">
        <span className="w-4 h-px bg-gray2" />
        Discovery Phase
        <span className="w-4 h-px bg-gray2" />
      </div>

      <h1 className="gsap-initial-reveal font-syne font-extrabold text-[32px] md:text-[52px] leading-[1.08] tracking-tight text-black mb-4 max-w-[580px] opacity-0">
        Design a tent for your <em>unique</em> brand
      </h1>

      <p className="gsap-initial-reveal text-sm leading-[1.7] text-gray mb-8 max-w-[400px] opacity-0">
        Our AI will analyze your brand identity to suggest the perfect architecture, vibe, and personality for your dome.
      </p>

      {/* Search Bar */}
      <div className="gsap-initial-reveal w-full max-w-[480px] mb-4 opacity-0">
        <div className="flex items-center gap-2 pl-[22px] pr-2 py-1.5 bg-white border-[1.5px] border-line rounded-full shadow-[0_2px_20px_rgba(17,17,16,0.08)] focus-within:border-black focus-within:shadow-[0_2px_24px_rgba(17,17,16,0.1)] transition-all">
          <input
            type="text"
            placeholder="Type your company name or URL..."
            className="flex-1 border-none outline-none bg-transparent font-sans text-[15px] font-normal text-black py-3 min-w-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
          />
          <button 
            onClick={handleScan}
            disabled={isScanning}
            className="w-[38px] h-[38px] rounded-full bg-off border border-line flex items-center justify-center cursor-pointer flex-shrink-0 hover:bg-off2 transition-all disabled:opacity-50"
          >
            {isScanning ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Scanning Indicator */}
      {isScanning && (
        <div className="gsap-result-reveal text-sm text-gray flex items-center gap-2 opacity-0 mb-4">
          <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
          Extracting brand details from {query}...
        </div>
      )}

      {/* Result: Brand Verification Card */}
      {showLogoFound && brandDetails && (
        <div className="gsap-result-reveal w-full max-w-[480px] bg-white border border-line rounded-[20px] p-6 mb-4 shadow-[0_8px_30px_rgba(17,17,16,0.06)] opacity-0 text-left">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="font-syne font-bold text-[18px] text-black mb-1 truncate max-w-[280px]" title={brandDetails.name}>
                {brandDetails.name}
              </h3>
              <p className="text-[11px] text-gray uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Brand Data Extracted
              </p>
            </div>
            <div className="w-[60px] h-[60px] bg-off border border-line rounded-[14px] flex items-center justify-center p-2 shadow-inner">
              {brandDetails.logoUrl ? (
                <img 
                  src={brandDetails.logoUrl} 
                  alt={`${brandDetails.name} logo`} 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to text if image fails to load
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
          </div>
          
          <div>
            <p className="text-[11px] text-gray uppercase tracking-[0.2em] mb-3">Detected Palette</p>
            <div className="flex gap-4">
              {(brandDetails.colors || []).map((color, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div 
                    className="w-11 h-11 rounded-full border border-line shadow-sm transition-transform hover:scale-110"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[10px] text-gray font-mono uppercase">{color}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Result: Fallback */}
      {showFallback && (
        <div className="gsap-result-reveal w-full max-w-[460px] mb-[10px] text-left opacity-0">
          <p className="text-[11px] text-gray leading-[1.6] mb-[10px] text-center">
            We couldn't automatically find your brand data. Please select an option:
          </p>
          <div className="flex flex-col gap-0.5">
             <div 
               onClick={triggerFileInput}
               className="flex items-center gap-[14px] p-[13px_18px] bg-off border-[1.5px] border-transparent rounded-[14px] cursor-pointer hover:bg-off2 transition-all group"
             >
                <div className="w-5 h-5 rounded-full border-[1.5px] border-line flex items-center justify-center group-hover:border-black transition-all">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <div>
                   <span className="font-syne font-semibold text-[13px] text-black block">Upload Brand Guidelines</span>
                   <span className="text-[10px] text-gray2">PDF, PNG, or JPG (Max 5MB)</span>
                </div>
             </div>
             {uploadError && <p className="text-red-500 text-[10px] mt-1 text-center">{uploadError}</p>}
             
             <div 
               onClick={handleManualConfig}
               className="flex items-center gap-[14px] p-[13px_18px] bg-white border-[1.5px] border-black rounded-[14px] cursor-pointer"
             >
                <div className="w-5 h-5 rounded-full border-[1.5px] border-black bg-black flex items-center justify-center shadow-[inset_0_0_0_4px_white]" />
                <div>
                   <span className="font-syne font-semibold text-[13px] text-black block">Configure Manually</span>
                   <span className="text-[10px] text-gray2">Answer 5 quick questions</span>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".pdf,.png,.jpg,.jpeg,.svg"
        className="hidden"
      />

      <div className="gsap-initial-reveal text-[11px] text-gray max-w-[440px] text-center min-h-[18px] mb-2 opacity-0">
        {query.length > 0 && !showLogoFound && !showFallback && !isScanning && "Press enter to scan..."}
      </div>

      <button
        onClick={handleContinue}
        disabled={!showLogoFound && !showFallback}
        className="gsap-initial-reveal inline-flex items-center gap-[10px] px-9 py-[15px] bg-black text-white font-syne font-bold text-[11px] tracking-widest uppercase border-none rounded-full cursor-pointer shadow-[0_2px_8px_rgba(17,17,16,0.15)] mt-3 hover:translate-y-[-1px] hover:shadow-[0_4px_16px_rgba(17,17,16,0.2)] disabled:opacity-25 disabled:cursor-default disabled:transform-none transition-all opacity-0"
      >
        Continue
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>

      {/* Trust Section Mock */}
      {!showFallback && (
         <div className="gsap-initial-reveal w-full mt-[60px] border-t border-line opacity-0">
            <div className="flex flex-col items-center gap-3.5 py-7 px-6 border-b border-line">
               <span className="text-[9px] tracking-[0.25em] text-gray2 uppercase">Trusted by industry leaders</span>
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


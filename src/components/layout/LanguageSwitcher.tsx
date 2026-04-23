"use client";

import React from 'react';
import { useLanguage, Locale } from '@/i18n/LanguageContext';

interface LanguageSwitcherProps {
  theme?: "light" | "dark";
}

export function LanguageSwitcher({ theme = "light" }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocale(e.target.value as Locale);
    // Reload the page so the server components see the new cookie
    window.location.reload(); 
  };

  const textColors = theme === "dark" 
    ? "text-gray-300 hover:text-white" 
    : "text-gray-400 hover:text-black";

  return (
    <div className="relative inline-block">
      <select 
        value={locale} 
        onChange={handleLanguageChange}
        className={`appearance-none bg-transparent text-[13px] font-bold focus:outline-none cursor-pointer pr-4 uppercase tracking-widest pl-1 transition-colors ${textColors}`}
      >
        <option className="uppercase text-black" value="en">EN</option>
        <option className="uppercase text-black" value="nl">NL</option>
        <option className="uppercase text-black" value="de">DE</option>
      </select>
      <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 ${theme === "dark" ? "text-gray-300" : "text-gray-400"}`}>
        <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
  );
}

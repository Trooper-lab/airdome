"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from './locales/en.json';
import nl from './locales/nl.json';
import de from './locales/de.json';

const dictionaries = { en, nl, de };
export type Locale = keyof typeof dictionaries;

interface LanguageContextType {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: (key: string) => React.ReactNode;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ 
  children, 
  initialLocale = 'en' 
}: { 
  children: React.ReactNode, 
  initialLocale?: string 
}) {
  const [locale, setLocaleState] = useState<Locale>(
    (Object.keys(dictionaries).includes(initialLocale) ? initialLocale : 'en') as Locale
  );

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    // We could reload here, or let React rerender the client components.
    // Client components using useLanguage() will rerender automatically!
    // But Server components won't until navigating or a router.refresh()
  };

  const t = (key: string): React.ReactNode => {
    const dict = dictionaries[locale] as Record<string, string>;
    const text = dict[key] || key;
    
    // Simple basic HTML replacement for <br /> and <br className="hidden md:block" />
    if (typeof text === 'string' && text.includes('<br')) {
      return <span dangerouslySetInnerHTML={{ __html: text }} />;
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

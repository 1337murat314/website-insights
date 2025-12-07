import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "tr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (en: string, tr: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const detectBrowserLanguage = (): Language => {
  // Get browser language (e.g., "en-US", "tr-TR", "tr")
  const browserLang = navigator.language || (navigator as any).userLanguage || "en";
  const primaryLang = browserLang.split("-")[0].toLowerCase();
  
  // Check if Turkish
  if (primaryLang === "tr") {
    return "tr";
  }
  
  // Default to English for all other languages
  return "en";
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // First check localStorage for saved preference
    const saved = localStorage.getItem("language");
    if (saved === "en" || saved === "tr") {
      return saved;
    }
    // If no saved preference, auto-detect from browser
    return detectBrowserLanguage();
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = (en: string, tr: string) => (language === "en" ? en : tr);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
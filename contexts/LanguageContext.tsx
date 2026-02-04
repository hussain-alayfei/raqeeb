
import React, { createContext, useContext, useEffect } from 'react';
import { translations } from '../translations';

// Updated interface to allow both LTR and RTL directions for type safety during comparisons
interface LanguageContextType {
  language: 'ar';
  t: (key: string) => any;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const language = 'ar';
  // Explicitly typing dir as 'ltr' | 'rtl' to prevent type narrowing that causes comparison errors in components
  const dir: 'ltr' | 'rtl' = 'rtl';

  // Helpers to resolve nested keys like 'hero.title'
  const t = (path: string) => {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, (translations as any)[language]) || path;
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    
    // Always use Changa for Arabic as per system instructions
    document.body.classList.add('font-changa');
    document.body.classList.remove('font-sans');
  }, []);

  return (
    <LanguageContext.Provider value={{ language, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

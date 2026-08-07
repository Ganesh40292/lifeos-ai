import { createContext, useContext, useState } from 'react';
import { LANGUAGES, TRANSLATIONS } from '@/utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [langCode, setLangCode] = useState(() => {
    return localStorage.getItem('aetheria_lang') || 'en';
  });

  const changeLanguage = (code) => {
    setLangCode(code);
    localStorage.setItem('aetheria_lang', code);
  };

  const t = (key) => {
    return TRANSLATIONS[langCode]?.[key] || TRANSLATIONS.en[key] || key;
  };

  const currentLang = LANGUAGES.find((l) => l.code === langCode) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ langCode, changeLanguage, t, currentLang, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

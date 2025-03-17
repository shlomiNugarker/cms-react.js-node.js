import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type Language = 'en' | 'he';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('language');
    return (savedLang as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const updateLanguage = async (newLang: Language) => {
    setLanguage(newLang);
  };

  return { language, setLanguage: updateLanguage };
}; 
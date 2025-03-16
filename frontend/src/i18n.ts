import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./locales/en.json";
import heTranslation from "./locales/he.json";

const getUserLanguage = () => {
  const userLang = navigator.language || navigator.languages[0];
  return userLang.split("-")[0];
};

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: enTranslation,
    },
    he: {
      translation: heTranslation,
    },
  },
  lng: getUserLanguage(),
  fallbackLng: "he",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

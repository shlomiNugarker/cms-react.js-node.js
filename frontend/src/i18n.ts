import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import enCommon from "./locales/en/common.json";
import heCommon from "./locales/he/common.json";
import enAuth from "./locales/en/auth.json";
import heAuth from "./locales/he/auth.json";
import enDashboard from "./locales/en/dashboard.json";
import heDashboard from "./locales/he/dashboard.json";
import enForms from "./locales/en/forms.json";
import heForms from "./locales/he/forms.json";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        auth: enAuth,
        dashboard: enDashboard,
        forms: enForms
      },
      he: {
        common: heCommon,
        auth: heAuth,
        dashboard: heDashboard,
        forms: heForms
      }
    },
    fallbackLng: "he",
    supportedLngs: ["en", "he"],
    ns: ["common", "auth", "dashboard", "forms"],
    defaultNS: "common",
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng"
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

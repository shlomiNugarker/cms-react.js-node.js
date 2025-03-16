import Layout from "./components/Layout";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

const App = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const dir =
      i18n.language === "he" || i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
    
    // Add RTL-specific class for styling
    if (dir === "rtl") {
      document.documentElement.classList.add("rtl");
    } else {
      document.documentElement.classList.remove("rtl");
    }
  }, [i18n.language]);

  return <Layout />;
};

export default App;

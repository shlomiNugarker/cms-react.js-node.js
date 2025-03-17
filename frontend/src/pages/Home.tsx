import { useTranslation } from "react-i18next";

const Home = () => {
  const { t } = useTranslation("common");

  return <h1>{t("home_welcome")}</h1>;
};

export default Home;

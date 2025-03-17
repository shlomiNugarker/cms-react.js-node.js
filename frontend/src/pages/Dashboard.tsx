import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { t } = useTranslation("dashboard");

  return <h1>{t("dashboard")}</h1>;
};

export default Dashboard;

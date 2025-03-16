import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation("dashboard");

  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin/users");
    }
  }, [user, navigate]);

  return <h1>{t("dashboard")}</h1>;
};

export default Dashboard;

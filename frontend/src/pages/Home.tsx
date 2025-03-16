import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation("common");

  useEffect(() => {
    if (!user) return;

    if (user.role === "admin") {
      navigate("/admin/users");
    }
  }, [user, navigate]);

  return <h1>{t("home_welcome")}</h1>;
};

export default Home;

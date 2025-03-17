import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login: React.FC = () => {
  const [email, setEmail] = useState("shlomin1231@gmail.com");
  const [password, setPassword] = useState("854350");
  const [error, setError] = useState("");
  const { t } = useTranslation(["auth", "common"]);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      toast.success(t("login_success", { ns: "auth" }));
      navigate("/");
    } catch (err) {
      setError((err as Error)?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">{t("login_page", { ns: "auth" })}</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {t("email", { ns: "common" })}
            </label>
            <input
              dir="ltr"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 p-2 w-full border rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {t("password", { ns: "common" })}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 p-2 w-full border rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            {t("login", { ns: "auth" })}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

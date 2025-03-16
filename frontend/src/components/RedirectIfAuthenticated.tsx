import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const RedirectIfAuthenticated: React.FC = () => {
  const { token } = useAuth();
  return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default RedirectIfAuthenticated;

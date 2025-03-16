import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    if (user.role === "admin") {
      navigate("/admin/users");
    }
  }, [user, navigate]);

  return <h1>Welcome to Home Page</h1>;
};

export default Home;

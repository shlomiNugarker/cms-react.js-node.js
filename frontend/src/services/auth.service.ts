import axios from '@/config/axios';

export const authService = {
  login,
  register,
  logout,
  getUser,
};

async function login(email: string, password: string) {
  const response = await axios.post("/api/auth/login", { email, password });
  localStorage.setItem("token", response.data.token);
  return response.data;
}

async function register(name: string, email: string, password: string) {
  const response = await axios.post("/api/auth/register", {
    name,
    email,
    password,
  });
  return response.data;
}

async function logout() {
  localStorage.removeItem("token");
}

async function getUser() {
  const response = await axios.get("/api/auth/me");
  return response.data;
}

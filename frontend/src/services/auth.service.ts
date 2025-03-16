import { httpService } from "./http.service";

export const authService = {
  login,
  register,
  logout,
  getUser,
};

async function login(email: string, password: string) {
  const user = await httpService.post("/api/auth/login", { email, password });
  localStorage.setItem("token", user.token);
  return user;
}

async function register(name: string, email: string, password: string) {
  return httpService.post("/api/auth/register", {
    name,
    email,
    password,
  });
}

async function logout() {
  try {
    localStorage.removeItem("token");
  } catch (error) {
    console.error("Error removing token:", error);
  }
}

async function getUser() {
  return httpService.get("/api/auth/me", true);
}

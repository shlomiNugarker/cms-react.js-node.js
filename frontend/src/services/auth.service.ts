import { httpService } from './http.service';

export const authService = {
  login,
  register,
  logout,
  getUser,
};

async function login(email: string, password: string) {
  const response = await httpService.post("/api/auth/login", { email, password });
  return response;
}

async function register(name: string, email: string, password: string) {
  const response = await httpService.post("/api/auth/register", {
    name,
    email,
    password,
  });
  return response;
}

async function logout() {
  await httpService.post("/api/auth/logout");
}

async function getUser() {
  const response = await httpService.get("/api/auth/me", true);
  return response;
}

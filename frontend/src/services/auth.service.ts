import { httpService } from './http.service';

export const authService = {
  login,
  register,
  logout,
  getUser,
};

async function login(email: string, password: string) {
  const response = await httpService.post("/api/auth/login", { email, password });
  
  // Store the token if received from the server
  if (response && response.token) {
    localStorage.setItem('token', response.token);
  }
  
  return response;
}

async function register(name: string, email: string, password: string) {
  const response = await httpService.post("/api/auth/register", {
    name,
    email,
    password,
  });
  
  // Store the token if received from the server
  if (response && response.token) {
    localStorage.setItem('token', response.token);
  }
  
  return response;
}

async function logout() {
  await httpService.post("/api/auth/logout");
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
}

async function getUser() {
  const response = await httpService.get("/api/auth/me", true);
  return response;
}

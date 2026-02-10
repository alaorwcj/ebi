const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export async function login(email, password) {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form
  });

  if (!response.ok) {
    throw new Error("Invalid credentials");
  }

  return response.json();
}

export function setAuth(token, role, userId) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("userId", String(userId));
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
}

export function getRole() {
  return localStorage.getItem("role");
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem("token"));
}

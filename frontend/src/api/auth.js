import { mensagemErroAmigavel } from "../utils/apiErrors.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export async function login(email, password) {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);

  let response;
  try {
    response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão.");
  }

  if (!response.ok) {
    let payload = null;
    try {
      const text = await response.text();
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = null;
    }
    throw new Error(mensagemErroAmigavel(payload, response.status));
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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const headers = options.headers || {};
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let payload = null;
    try {
      payload = await response.json();
    } catch (err) {
      payload = { detail: "Unknown error" };
    }
    const message = payload.detail || payload.title || "Request failed";
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function get(path) {
  return request(path, { method: "GET" });
}

export function post(path, body) {
  return request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

export function put(path, body) {
  return request(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

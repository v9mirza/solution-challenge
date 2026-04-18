const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "token";

export function setAuthToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export async function api(path, options = {}) {
  const { body, headers: hdr, ...rest } = options;
  const headers = { ...hdr };

  let payload = body;
  if (body !== undefined && body !== null && typeof body === "object" && !(body instanceof FormData)) {
    payload = JSON.stringify(body);
    headers["Content-Type"] = "application/json";
  }

  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${base}${path}`, { ...rest, headers, body: payload });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const msg = data?.error || res.statusText;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return data;
}

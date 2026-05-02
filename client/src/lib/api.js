const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "token";

function storageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key, value) {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* ignore quota / privacy mode */
  }
}

export function setAuthToken(token) {
  storageSet(TOKEN_KEY, token || null);
}

export function getAuthToken() {
  return storageGet(TOKEN_KEY);
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

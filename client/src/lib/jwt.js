import { normalizeRole } from "./roles.js";

/** Decode JWT payload (no signature verify — server already validated). */
export function parseJwtPayload(token) {
  if (!token) return null;
  try {
    const part = token.split(".")[1];
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
    const payload = JSON.parse(atob(b64 + pad));
    return { ...payload, role: normalizeRole(payload?.role) };
  } catch {
    return null;
  }
}

import jwt from "jsonwebtoken";
import { normalizeRole } from "../utils/roles.js";

const bearer = /^Bearer\s+(.+)$/i;

export function requireAuth(req, res, next) {
  const raw = req.headers.authorization;
  const match = raw && bearer.exec(raw);
  if (!match) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "JWT_SECRET not configured" });
  }

  try {
    const payload = jwt.verify(match[1], secret);
    req.user = {
      id: payload.sub,
      role: normalizeRole(payload.role),
      hospitalId: payload.hospitalId ?? null,
    };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

import { Navigate, Outlet } from "react-router-dom";
import { getAuthToken, setAuthToken } from "../lib/api.js";
import { parseJwtPayload } from "../lib/jwt.js";

export function GuestRoute() {
  const token = getAuthToken();
  if (token) {
    const p = parseJwtPayload(token);
    if (!p?.role) {
      setAuthToken(null);
      return <Outlet />;
    }
    const to = p.role === "user" ? "/patient/status" : "/staff";
    return <Navigate to={to} replace />;
  }
  return <Outlet />;
}

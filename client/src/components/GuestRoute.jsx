import { Navigate, Outlet } from "react-router-dom";
import { getAuthToken } from "../lib/api.js";
import { parseJwtPayload } from "../lib/jwt.js";

export function GuestRoute() {
  const token = getAuthToken();
  if (token) {
    const p = parseJwtPayload(token);
    const to = p?.role === "patient" ? "/patient/status" : "/staff";
    return <Navigate to={to} replace />;
  }
  return <Outlet />;
}

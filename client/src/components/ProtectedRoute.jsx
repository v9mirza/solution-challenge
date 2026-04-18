import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAuthToken } from "../lib/api.js";
import { parseJwtPayload } from "../lib/jwt.js";

export function ProtectedRoute({ roles }) {
  const token = getAuthToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles?.length) {
    const p = parseJwtPayload(token);
    if (!p?.role || !roles.includes(p.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}

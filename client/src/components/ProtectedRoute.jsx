import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAuthToken, setAuthToken } from "../lib/api.js";
import { parseJwtPayload } from "../lib/jwt.js";

export function ProtectedRoute({ roles }) {
  const token = getAuthToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const payload = parseJwtPayload(token);
  if (!payload?.role) {
    setAuthToken(null);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles?.length && !roles.includes(payload.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

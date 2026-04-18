import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { getAuthToken, setAuthToken } from "../lib/api.js";
import { parseJwtPayload } from "../lib/jwt.js";

const linkStyle = ({ isActive }) => ({
  fontWeight: isActive ? 600 : 400,
  marginRight: "1rem",
  color: "inherit",
});

export function Layout() {
  const navigate = useNavigate();
  const token = getAuthToken();
  const role = token ? parseJwtPayload(token)?.role : null;

  function logout() {
    setAuthToken(null);
    navigate("/", { replace: true });
  }

  return (
    <div className="layout">
      <header className="layout-header">
        <NavLink to="/" style={linkStyle} end>
          <strong>Smart Hospital</strong>
        </NavLink>
        <nav>
          <NavLink to="/" end style={linkStyle}>
            Home
          </NavLink>
          {!token && (
            <>
              <NavLink to="/login" style={linkStyle}>
                Log in
              </NavLink>
              <NavLink to="/signup" style={linkStyle}>
                Sign up
              </NavLink>
            </>
          )}
          {role === "patient" && (
            <>
              <NavLink to="/patient" style={linkStyle}>
                Patient
              </NavLink>
              <NavLink to="/patient/intake" style={linkStyle}>
                Intake
              </NavLink>
              <NavLink to="/patient/status" style={linkStyle}>
                Status
              </NavLink>
            </>
          )}
          {(role === "staff" || role === "admin") && (
            <NavLink to="/staff" style={linkStyle}>
              Staff
            </NavLink>
          )}
          {token && (
            <button type="button" className="btn-link" onClick={logout}>
              Log out
            </button>
          )}
        </nav>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}

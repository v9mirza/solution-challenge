import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { getAuthToken, setAuthToken } from "../lib/api.js";
import { parseJwtPayload } from "../lib/jwt.js";

function navClass(isActive) {
  return `rounded-md px-3 py-2 text-sm transition ${
    isActive ? "bg-teal-900 text-white" : "text-slate-700 hover:bg-teal-50 hover:text-teal-900"
  }`;
}

export function Layout() {
  const navigate = useNavigate();
  const token = getAuthToken();
  const role = token ? parseJwtPayload(token)?.role : null;

  function logout() {
    setAuthToken(null);
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <NavLink to="/" className="mr-2 text-xl font-semibold tracking-tight" end>
            Smart Hospital
        </NavLink>
          <nav className="flex flex-wrap items-center gap-2">
            <NavLink to="/" end className={({ isActive }) => navClass(isActive)}>
            Home
          </NavLink>
          {!token && (
            <>
                <NavLink to="/login" className={({ isActive }) => navClass(isActive)}>
                Log in
              </NavLink>
                <NavLink to="/signup" className={({ isActive }) => navClass(isActive)}>
                Sign up
              </NavLink>
            </>
          )}
          {role === "patient" && (
            <>
                <NavLink to="/patient" className={({ isActive }) => navClass(isActive)}>
                Patient
              </NavLink>
                <NavLink to="/patient/intake" className={({ isActive }) => navClass(isActive)}>
                Intake
              </NavLink>
                <NavLink to="/patient/status" className={({ isActive }) => navClass(isActive)}>
                Status
              </NavLink>
            </>
          )}
          {(role === "staff" || role === "admin") && (
              <NavLink to="/staff" className={({ isActive }) => navClass(isActive)}>
              Staff
            </NavLink>
          )}
          {token && (
              <NavLink to="/profile" className={({ isActive }) => navClass(isActive)}>
              Profile
            </NavLink>
          )}
          {token && (
              <button
                type="button"
                className="rounded-md px-3 py-2 text-sm text-teal-700 transition hover:bg-teal-50"
                onClick={logout}
              >
              Log out
            </button>
          )}
        </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

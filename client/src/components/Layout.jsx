import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { getAuthToken, setAuthToken } from "../lib/api.js";
import { parseJwtPayload } from "../lib/jwt.js";

function navClass(isActive) {
  return `rounded-lg px-2.5 py-2 text-xs font-semibold transition-all sm:rounded-xl sm:px-4 sm:text-sm ${
    isActive 
      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20" 
      : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
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
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-slate-50 font-sans text-slate-900 selection:bg-cyan-200 selection:text-cyan-900">
      {/* Global Background Ambient Lights */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-cyan-400/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/40 bg-white/60 shadow-sm backdrop-blur-xl transition-all">
        <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col items-center gap-4 px-4 py-4 sm:flex-row sm:justify-between sm:gap-0 sm:px-6">
          <NavLink to="/" className="group flex min-w-0 max-w-full items-center gap-2 sm:gap-3" end>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 transition-transform group-hover:scale-105">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="truncate text-lg font-black tracking-tight text-slate-800 transition-colors group-hover:text-cyan-700 sm:text-xl">
              Smart<span className="text-cyan-600">Hospital</span>
            </span>
          </NavLink>

          <nav className="flex max-w-full flex-wrap justify-center gap-1 rounded-2xl border border-white/60 bg-white/40 p-1 shadow-sm backdrop-blur-md sm:gap-1.5 sm:p-1.5">
            <NavLink to="/" end className={({ isActive }) => navClass(isActive)}>
              Home
            </NavLink>
            {!token && (
              <>
                <NavLink to="/login" className={({ isActive }) => navClass(isActive)}>
                  Sign In
                </NavLink>
                <NavLink to="/signup" className={({ isActive }) => navClass(isActive)}>
                  Register
                </NavLink>
              </>
            )}
            {role === "user" && (
              <>
                <NavLink to="/patient" className={({ isActive }) => navClass(isActive)}>
                  Portal
                </NavLink>
                <NavLink to="/patient/intake" className={({ isActive }) => navClass(isActive)}>
                  Intake
                </NavLink>
                <NavLink to="/patient/status" className={({ isActive }) => navClass(isActive)}>
                  Status
                </NavLink>
              </>
            )}
            {role === "staff" && (
              <NavLink to="/staff" className={({ isActive }) => navClass(isActive)}>
                Dashboard
              </NavLink>
            )}
            {token && (
              <NavLink to="/profile" className={({ isActive }) => navClass(isActive)}>
                Profile
              </NavLink>
            )}
            {token && (
              <div className="ml-0 flex w-full justify-center border-t border-slate-200/60 pt-2 sm:ml-1 sm:w-auto sm:justify-start sm:border-l-2 sm:border-t-0 sm:pl-2.5 sm:pt-0">
                <button
                  type="button"
                  className="rounded-lg px-3 py-2 text-xs font-bold text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-700 sm:rounded-xl sm:px-4 sm:text-sm"
                  onClick={logout}
                >
                  Log out
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>
      
      <main className="relative z-10 mx-auto w-full min-w-0 max-w-7xl overflow-x-hidden px-4 py-6 sm:px-6 sm:py-10 md:py-12">
        <Outlet />
      </main>
    </div>
  );
}

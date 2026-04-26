import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { getAuthToken, setAuthToken } from "../lib/api.js";
import { parseJwtPayload } from "../lib/jwt.js";

function navClass(isActive) {
  return `rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
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
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-cyan-200 selection:text-cyan-900 font-sans">
      {/* Global Background Ambient Lights */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-cyan-400/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/40 bg-white/60 backdrop-blur-xl shadow-sm transition-all">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-6 py-4 sm:flex-row sm:justify-between sm:gap-0">
          <NavLink to="/" className="group flex items-center gap-3" end>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 transition-transform group-hover:scale-105">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800 transition-colors group-hover:text-cyan-700">
              Smart<span className="text-cyan-600">Hospital</span>
            </span>
          </NavLink>
          
          <nav className="flex flex-wrap justify-center items-center gap-1.5 rounded-2xl border border-white/60 bg-white/40 p-1.5 shadow-sm backdrop-blur-md">
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
              <div className="ml-1 pl-2.5 border-l-2 border-slate-200/60">
                <button
                  type="button"
                  className="rounded-xl px-4 py-2 text-sm font-bold text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
                  onClick={logout}
                >
                  Log Out
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>
      
      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <Outlet />
      </main>
    </div>
  );
}

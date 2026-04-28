import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { api, setAuthToken } from "../lib/api.js";
import { parseJwtPayload } from "../lib/jwt.js";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;
  const demoAccounts = [
    { role: "Patient", email: "patient1@test.com", password: "123456" },
    { role: "Staff", email: "staff1@test.com", password: "123456" },
  ];
  const roleButtonStyles = {
    Patient: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
    Staff: "border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100",
  };

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api("/auth/login", { method: "POST", body: { email, password } });
      setAuthToken(data.token);
      const role = parseJwtPayload(data.token)?.role;
      if (from && role === "user" && from.startsWith("/patient")) {
        navigate(from, { replace: true });
      } else if (role === "user") {
        navigate("/patient/status", { replace: true });
      } else {
        navigate("/staff", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6">
      <section className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/70 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
        
        <div className="relative z-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-500">Sign in to your hospital access portal.</p>
          </div>
          
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
              />
            </div>
            
            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 backdrop-blur-sm">
                {error}
              </div>
            ) : null}
            
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 px-4 py-3.5 font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all hover:-translate-y-0.5 hover:shadow-cyan-500/40 disabled:pointer-events-none disabled:opacity-70"
            >
              {loading ? "Authenticating…" : "Sign In"}
            </button>
          </form>

          <div className="mt-5 rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50/80 to-blue-50/70 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-900">Demo Accounts</p>
              <span className="rounded-full border border-cyan-200 bg-white px-2.5 py-1 text-[11px] font-medium text-cyan-700">
                Quick Access
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600">Choose a role to auto-fill login credentials.</p>
            <div className="mt-3 space-y-2">
              {demoAccounts.map((account) => (
                <div
                  key={account.role}
                  className="rounded-xl border border-cyan-100 bg-white/90 p-3"
                >
                  <div className="text-sm text-slate-700">
                    <div className="font-semibold text-slate-800">{account.role} Demo</div>
                    <div className="mt-0.5 text-xs sm:text-sm">{account.email} / {account.password}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(account.email);
                      setPassword(account.password);
                    }}
                    className={`mt-3 w-full rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      roleButtonStyles[account.role]
                    }`}
                  >
                    Login as {account.role}
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-slate-600">
            Don't have an account yet?{" "}
            <Link to="/signup" className="font-semibold text-cyan-600 transition-colors hover:text-cyan-800 hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

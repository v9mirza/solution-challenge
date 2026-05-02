import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { api, setAuthToken } from "../lib/api.js";
import { parseJwtPayload } from "../lib/jwt.js";
import { AuthPanel, fieldClass } from "../components/PageChrome.jsx";

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
    <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <AuthPanel>
          <div className="mb-8 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">SmartHospital</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">Welcome back</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">Sign in to the patient portal or staff workspace.</p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className={fieldClass}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className={fieldClass}
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-800">{error}</div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-600/25 transition hover:-translate-y-0.5 hover:shadow-cyan-500/35 disabled:pointer-events-none disabled:opacity-65"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 ring-1 ring-slate-100/90">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Demo accounts</p>
              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 shadow-sm ring-1 ring-slate-200">
                Sandbox
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">Tap to autofill credentials for quick testing.</p>
            <div className="mt-4 space-y-3">
              {demoAccounts.map((account) => (
                <div key={account.role} className="rounded-xl border border-white bg-white p-3 shadow-sm ring-1 ring-slate-100/80">
                  <div className="text-xs text-slate-600">
                    <div className="font-semibold text-slate-900">{account.role}</div>
                    <div className="mt-0.5 font-mono text-[11px] sm:text-xs">{account.email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(account.email);
                      setPassword(account.password);
                    }}
                    className={`mt-3 w-full rounded-lg border px-3 py-2 text-xs font-bold transition ${roleButtonStyles[account.role]}`}
                  >
                    Use {account.role} demo
                  </button>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-slate-600">
            Need an account?{" "}
            <Link to="/signup" className="font-semibold text-cyan-700 hover:text-cyan-900 hover:underline">
              Register
            </Link>
          </p>
        </AuthPanel>
      </div>
    </div>
  );
}

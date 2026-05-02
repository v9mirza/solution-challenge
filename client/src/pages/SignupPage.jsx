import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setAuthToken } from "../lib/api.js";
import { AuthPanel, fieldClass } from "../components/PageChrome.jsx";

export function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api("/auth/register", { method: "POST", body: { fullName, email, password } });
      setAuthToken(data.token);
      navigate("/patient/status", { replace: true });
    } catch (err) {
      setError(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <AuthPanel>
          <div className="mb-8 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">Patient access</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">Create account</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">Register once to submit intake and follow live queue status.</p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="signup-name">
                Full name
              </label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Jane Doe"
                className={fieldClass}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="signup-email">
                Email
              </label>
              <input
                id="signup-email"
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
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="signup-password">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
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
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-cyan-700 hover:text-cyan-900 hover:underline">
              Sign in
            </Link>
          </p>
        </AuthPanel>
      </div>
    </div>
  );
}

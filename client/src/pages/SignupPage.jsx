import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setAuthToken } from "../lib/api.js";

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
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8 sm:p-6">
      <section className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-6 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-10">
        <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
        
        <div className="relative z-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Create account</h1>
            <p className="mt-2 text-sm text-slate-500">Register to access your patient portal.</p>
          </div>
          
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Jane Doe"
                className="w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
              />
            </div>
            
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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
              {loading ? "Creating account…" : "Register"}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-cyan-600 transition-colors hover:text-cyan-800 hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

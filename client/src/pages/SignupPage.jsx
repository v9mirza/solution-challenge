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
    <section className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-bold tracking-tight">Sign up</h1>
      <p className="mt-1 text-sm text-slate-500">Creates a user account.</p>
      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Full name
          <input
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
          />
        </label>
        {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-teal-700 px-4 py-2 font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "…" : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </section>
  );
}

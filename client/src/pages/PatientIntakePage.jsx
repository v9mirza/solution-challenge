import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";

export function PatientIntakePage() {
  const [symptoms, setSymptoms] = useState("");
  const [severity, setSeverity] = useState(30);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const data = await api("/patients/me/intake", {
        method: "POST",
        body: { symptoms, severity: Number(severity) },
      });
      setMessage(`Saved. Token: ${data.tokenId?.slice(0, 8)}…`);
    } catch (err) {
      setError(err.message || "Could not save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-bold tracking-tight">Patient intake</h1>
      <p className="mt-1 text-sm text-slate-500">
        <Link to="/patient/status">View status</Link> · <Link to="/patient">Patient home</Link>
      </p>
      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Symptoms
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={4}
            placeholder="Describe symptoms"
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-indigo-200 transition focus:border-indigo-500 focus:ring"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Severity (0–100)
          <input
            type="number"
            min={0}
            max={100}
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-indigo-200 transition focus:border-indigo-500 focus:ring"
          />
        </label>
        {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
        {message ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-fit rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "…" : "Submit"}
        </button>
      </form>
    </section>
  );
}

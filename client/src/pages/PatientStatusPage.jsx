import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";

export function PatientStatusPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadStatus(cancelled = false) {
    setError("");
    try {
      const res = await api("/patients/me");
      if (!cancelled) setData(res);
    } catch (err) {
      if (!cancelled) setError(err.message || "Could not load");
    } finally {
      if (!cancelled) setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    loadStatus(cancelled);
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="text-slate-600">Loading…</p>;
  if (error) return <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>;

  const p = data?.patient;
  if (!p) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">Your status</h1>
        <p className="mt-2 text-slate-600">No intake yet.</p>
        <p className="mt-2">
          <Link to="/patient/intake">Submit intake</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Your status</h1>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            loadStatus(false);
          }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-teal-50 hover:text-teal-900"
        >
          Refresh
        </button>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        <Link to="/patient/intake">Update intake</Link> · <Link to="/patient">Patient home</Link>
      </p>
      <dl className="mt-5 grid gap-3 sm:grid-cols-[10rem_1fr]">
        <dt className="font-semibold text-slate-700">Token</dt>
        <dd className="rounded bg-slate-100 px-2 py-1 text-sm text-slate-800">
          <code>{p.tokenId}</code>
        </dd>
        <dt className="font-semibold text-slate-700">Urgency score</dt>
        <dd>{p.urgencyScore}</dd>
        <dt className="font-semibold text-slate-700">Severity</dt>
        <dd>{p.severity}</dd>
        <dt className="font-semibold text-slate-700">Bed</dt>
        <dd className="capitalize">{p.bedType}</dd>
        <dt className="font-semibold text-slate-700">Status</dt>
        <dd className="capitalize">{(p.lifecycleStatus || "waiting").replace("_", " ")}</dd>
        <dt className="font-semibold text-slate-700">Staff note</dt>
        <dd>{p.staffNote || "—"}</dd>
        <dt className="font-semibold text-slate-700">Queued</dt>
        <dd>{p.queuedAt ? new Date(p.queuedAt).toLocaleString() : "—"}</dd>
        <dt className="font-semibold text-slate-700">Symptoms</dt>
        <dd>{p.symptoms || "—"}</dd>
        <dt className="font-semibold text-slate-700">Age</dt>
        <dd>{p.age ?? "—"}</dd>
        <dt className="font-semibold text-slate-700">Temperature</dt>
        <dd>{p.temperature ?? "—"}{p.temperature !== null && p.temperature !== undefined ? " C" : ""}</dd>
        <dt className="font-semibold text-slate-700">Heart rate</dt>
        <dd>{p.heartRate ?? "—"}{p.heartRate !== null && p.heartRate !== undefined ? " bpm" : ""}</dd>
        <dt className="font-semibold text-slate-700">Oxygen sat</dt>
        <dd>{p.oxygenSat ?? "—"}{p.oxygenSat !== null && p.oxygenSat !== undefined ? "%" : ""}</dd>
        <dt className="font-semibold text-slate-700">Blood pressure</dt>
        <dd>
          {p.bpSystolic !== null && p.bpSystolic !== undefined && p.bpDiastolic !== null && p.bpDiastolic !== undefined
            ? `${p.bpSystolic}/${p.bpDiastolic}`
            : "—"}
        </dd>
        <dt className="font-semibold text-slate-700">Onset</dt>
        <dd>{p.onsetHours ?? "—"}{p.onsetHours !== null && p.onsetHours !== undefined ? " hours" : ""}</dd>
        <dt className="font-semibold text-slate-700">Pain level</dt>
        <dd>{p.painLevel ?? "—"}</dd>
        <dt className="font-semibold text-slate-700">Conditions</dt>
        <dd>{p.existingConditions || "—"}</dd>
        <dt className="font-semibold text-slate-700">Allergies</dt>
        <dd>{p.allergies || "—"}</dd>
      </dl>
    </section>
  );
}

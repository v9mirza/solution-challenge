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

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  const p = data?.patient;
  
  if (!p) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/70 p-10 text-center shadow-2xl backdrop-blur-xl">
          <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Your Priority Status</h1>
          <p className="mt-3 text-lg text-slate-500">We don't have an active intake on file for you.</p>
          <div className="mt-8">
            <Link 
              to="/patient/intake"
              className="inline-flex rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-cyan-500/30"
            >
              Submit Intake Form
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/70 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        
        <div className="relative z-10">
          <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200/60 pb-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Live Status Dashboard</h1>
              <p className="mt-2 text-slate-500">Real-time updates on your priority and queue position.</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              <Link to="/patient" className="rounded-lg border border-slate-200 bg-white/50 px-4 py-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 shadow-sm">
                Portal Home
              </Link>
              <Link to="/patient/intake" className="rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-cyan-700 transition-colors hover:bg-cyan-100 shadow-sm">
                Update Intake
              </Link>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  loadStatus(false);
                }}
                className="rounded-lg bg-gradient-to-r from-cyan-600 to-blue-700 px-5 py-2 text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-cyan-500/30"
              >
                Refresh Data
              </button>
            </div>
          </div>

          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-blue-200/60 bg-blue-50/50 p-6 shadow-sm backdrop-blur-sm">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">Urgency Score</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tighter text-blue-900">{p.urgencyScore}</span>
                <span className="text-sm font-semibold text-blue-600/70">/ 100</span>
              </div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-blue-200/50">
                <div className="h-full bg-blue-600" style={{ width: `${p.urgencyScore}%` }} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-6 shadow-sm backdrop-blur-sm">
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Triage Severity</p>
              <p className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">{p.severity}%</p>
              <p className="mt-2 text-sm font-medium text-slate-500">Automated classification</p>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-6 shadow-sm backdrop-blur-sm">
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Assigned Bed</p>
              <p className="mt-2 text-3xl font-extrabold capitalize tracking-tight text-slate-900">{p.bedType}</p>
              <p className="mt-3 text-sm font-medium text-slate-500">Status: <span className="capitalize font-bold text-slate-700">{(p.lifecycleStatus || "waiting").replace("_", " ")}</span></p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/60 bg-white/40 p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Intake Summary</h2>
              <dl className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Token ID</dt>
                  <dd className="mt-1 font-mono text-sm font-medium text-slate-900">{p.tokenId}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Queued At</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">{p.queuedAt ? new Date(p.queuedAt).toLocaleString() : "—"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Reported Symptoms</dt>
                  <dd className="mt-1 text-sm font-medium leading-relaxed text-slate-800">{p.symptoms || "—"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Staff Note</dt>
                  <dd className="mt-1 rounded-lg bg-yellow-50 p-3 text-sm font-medium text-yellow-800 border border-yellow-100">{p.staffNote || "No notes from staff yet."}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-white/40 p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Reported Vitals</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Age</dt>
                  <dd className="mt-1 font-medium text-slate-900">{p.age ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Temp</dt>
                  <dd className="mt-1 font-medium text-slate-900">{p.temperature ?? "—"}{p.temperature ? " °C" : ""}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Heart Rate</dt>
                  <dd className="mt-1 font-medium text-slate-900">{p.heartRate ?? "—"}{p.heartRate ? " bpm" : ""}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">O2 Sat</dt>
                  <dd className="mt-1 font-medium text-slate-900">{p.oxygenSat ?? "—"}{p.oxygenSat ? "%" : ""}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">BP</dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {p.bpSystolic && p.bpDiastolic ? `${p.bpSystolic}/${p.bpDiastolic}` : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pain</dt>
                  <dd className="mt-1 font-medium text-slate-900">{p.painLevel !== null ? `${p.painLevel}/10` : "—"}</dd>
                </div>
              </div>
              
              <div className="mt-6 border-t border-slate-200/60 pt-5">
                <dl className="grid gap-y-4">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Conditions</dt>
                    <dd className="mt-1 text-sm font-medium text-slate-900">{p.existingConditions || "None reported"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Allergies</dt>
                    <dd className="mt-1 text-sm font-medium text-slate-900">{p.allergies || "None reported"}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

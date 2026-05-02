import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { PageBreadcrumb, PageContainer } from "../components/PageChrome.jsx";

function IconPulse({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function IconSpark({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" />
    </svg>
  );
}

function IconBed({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10V6a2 2 0 012-2h4a2 2 0 012 2v4M2 19h20M2 21v-2a2 2 0 012-2h16a2 2 0 012 2v2" />
    </svg>
  );
}

function IconClipboard({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      />
    </svg>
  );
}

function IconHeart({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
}

function severityTone(severityColor) {
  switch (severityColor) {
    case "red":
      return {
        ring: "ring-rose-200/80",
        bar: "from-rose-500 to-orange-400",
        chip: "bg-rose-100 text-rose-800 ring-rose-200/80",
      };
    case "yellow":
      return {
        ring: "ring-amber-200/80",
        bar: "from-amber-500 to-yellow-400",
        chip: "bg-amber-100 text-amber-900 ring-amber-200/80",
      };
    default:
      return {
        ring: "ring-emerald-200/80",
        bar: "from-emerald-500 to-teal-400",
        chip: "bg-emerald-100 text-emerald-800 ring-emerald-200/80",
      };
  }
}

function lifecycleBadge(status) {
  const s = (status || "waiting").replace("_", " ");
  const map = {
    waiting: "bg-slate-100 text-slate-700 ring-slate-200/80",
    "in progress": "bg-sky-100 text-sky-800 ring-sky-200/80",
    admitted: "bg-violet-100 text-violet-800 ring-violet-200/80",
    discharged: "bg-slate-200 text-slate-600 ring-slate-300/80",
    cancelled: "bg-rose-100 text-rose-800 ring-rose-200/80",
  };
  const cls = map[s.toLowerCase()] ?? "bg-slate-100 text-slate-700 ring-slate-200/80";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ring-1 ${cls}`}>
      {s}
    </span>
  );
}

function VitalTile({ label, children, emphasize }) {
  return (
    <div
      className={`rounded-xl border px-3 py-3 shadow-sm transition-colors sm:px-4 ${
        emphasize
          ? "border-amber-200/90 bg-gradient-to-br from-amber-50 to-orange-50/80"
          : "border-slate-100 bg-white/80"
      }`}
    >
      <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className="mt-1.5 tabular-nums text-sm font-semibold text-slate-900">{children}</dd>
    </div>
  );
}

export function PatientStatusPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStatus = useCallback(async (opts = {}) => {
    const silent = opts.silent === true;
    if (!silent) setError("");
    if (silent) setRefreshing(true);
    try {
      const res = await api("/patients/me");
      setData(res);
    } catch (err) {
      setError(err.message || "Could not load");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStatus({ silent: false });
  }, [loadStatus]);

  if (loading) {
    return (
      <PageContainer className="flex min-h-[55vh] flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 animate-ping rounded-full bg-cyan-400/20" />
            <div className="relative flex h-full w-full items-center justify-center rounded-2xl border border-white/80 bg-white/90 shadow-lg shadow-cyan-500/10">
              <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-slate-200 border-t-cyan-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">Loading your status…</p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer maxWidthClass="max-w-lg" className="py-10">
        <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50 to-white px-5 py-8 text-center shadow-lg shadow-rose-500/5 sm:rounded-3xl sm:px-8 sm:py-10">
          <p className="text-lg font-bold text-rose-900">Something went wrong</p>
          <p className="mt-2 text-sm leading-relaxed text-rose-700/90">{error}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              loadStatus({ silent: false });
            }}
            className="mt-6 inline-flex rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-rose-700"
          >
            Try again
          </button>
        </div>
      </PageContainer>
    );
  }

  const p = data?.patient;

  if (!p) {
    return (
      <PageContainer maxWidthClass="max-w-xl" className="py-10">
        <section className="relative overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-white via-white to-cyan-50/40 px-5 py-10 text-center shadow-xl shadow-slate-900/5 sm:rounded-3xl sm:px-8 sm:py-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
            <IconClipboard className="h-8 w-8" />
          </div>
          <h1 className="relative mt-6 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            No active intake yet
          </h1>
          <p className="relative mt-3 text-slate-600">
            Complete an intake once to see live queue priority, vitals summary, and bed suggestions here.
          </p>
          <div className="relative mt-8">
            <Link
              to="/patient/intake"
              className="inline-flex rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-700 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-600/25 transition hover:-translate-y-0.5 hover:shadow-cyan-500/35"
            >
              Start intake
            </Link>
          </div>
        </section>
      </PageContainer>
    );
  }

  const priorityFill = Math.min(100, Math.max(0, Number(p.urgencyScore) || 0));
  const tone = severityTone(p.severityColor);
  const sevPct = Number(p.severity) || 0;
  const tempNum = p.temperature != null ? Number(p.temperature) : null;
  const feverEmphasis = tempNum != null && tempNum >= 38;

  async function handleRefresh() {
    await loadStatus({ silent: true });
  }

  return (
    <PageContainer>
      <PageBreadcrumb items={[{ label: "Portal", to: "/patient" }, { label: "Live status" }]} />

      <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-200/80">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live
            </span>
          </div>
          <h1 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Your care status
          </h1>
          <p className="mt-2 max-w-xl text-pretty text-slate-600 sm:text-[17px]">
            Queue priority updates with vitals, wait time, and hospital capacity. Symptom % is AI-only — use both together.
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-shrink-0 flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
          <Link
            to="/patient"
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200/90 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
          >
            Home
          </Link>
          <Link
            to="/patient/intake"
            className="inline-flex w-full items-center justify-center rounded-xl border border-cyan-200/90 bg-cyan-50 px-4 py-2.5 text-sm font-semibold text-cyan-900 shadow-sm transition hover:bg-cyan-100/90 sm:w-auto"
          >
            Edit intake
          </Link>
          <button
            type="button"
            disabled={refreshing}
            onClick={handleRefresh}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-cyan-600/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/35 disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
          >
            {refreshing ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
                Refreshing…
              </>
            ) : (
              "Refresh"
            )}
          </button>
        </div>
      </header>

      <section
        aria-busy={refreshing}
        className={`relative min-w-0 overflow-hidden rounded-2xl border border-white/70 bg-white/75 p-4 shadow-xl shadow-slate-900/[0.04] backdrop-blur-xl sm:rounded-3xl sm:p-8 ${refreshing ? "opacity-[0.97]" : ""}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-100/50 via-transparent to-transparent" />

        <div className="relative grid gap-5 md:grid-cols-3">
          <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-blue-100/90 bg-gradient-to-br from-blue-50/95 via-white to-white p-5 shadow-md shadow-blue-900/5 ring-1 ring-blue-200/60 transition hover:shadow-lg hover:shadow-blue-900/[0.07]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-700/85">Queue priority</p>
                <p className="mt-2 text-sm leading-snug text-slate-600">Rank in the dynamic queue · vitals, wait &amp; beds</p>
              </div>
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/25">
                <IconPulse className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-6 flex flex-1 flex-col justify-end">
              <div className="flex flex-wrap items-baseline gap-1.5">
                <span className="text-4xl font-black tabular-nums tracking-tight text-slate-900 sm:text-5xl lg:text-[3rem]">
                  {p.urgencyScore}
                </span>
                <span className="text-sm font-semibold text-slate-400">priority</span>
              </div>
              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <span>Relative scale</span>
                  <span>{priorityFill}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-200/70 ring-1 ring-slate-200/80">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-[width] duration-700 ease-out"
                    style={{ width: `${priorityFill}%` }}
                  />
                </div>
              </div>
            </div>
          </article>

          <article
            className={`relative flex flex-col overflow-hidden rounded-2xl border border-slate-100/95 bg-white p-5 shadow-md shadow-slate-900/5 ring-1 ring-slate-200/60 ${tone.ring}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Symptom severity</p>
                <p className="mt-2 text-sm leading-snug text-slate-600">AI estimate from reported text only</p>
              </div>
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 ring-1 ring-slate-200/90">
                <IconSpark className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-6 flex flex-1 flex-col justify-end gap-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                <p className="text-4xl font-black tabular-nums tracking-tight text-slate-900 sm:text-5xl sm:leading-none lg:text-[3rem]">
                  {sevPct}%
                </p>
                <span
                  className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ring-1 sm:mb-1 ${tone.chip}`}
                >
                  {p.severityColor === "red" ? "higher concern" : p.severityColor === "yellow" ? "moderate" : "routine band"}
                </span>
              </div>
              <div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/80">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${tone.bar}`}
                    style={{ width: `${Math.min(100, sevPct)}%` }}
                  />
                </div>
              </div>
            </div>
          </article>

          <article className="relative flex flex-col overflow-hidden rounded-2xl border border-slate-100/95 bg-gradient-to-br from-slate-50/90 to-white p-5 shadow-md shadow-slate-900/5 ring-1 ring-slate-200/60">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Bed suggestion</p>
                <p className="mt-2 text-sm leading-snug text-slate-600">Suggested unit from current workload</p>
              </div>
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 ring-1 ring-violet-200/80">
                <IconBed className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-8 flex flex-1 flex-col justify-end">
              <p className="text-3xl font-extrabold capitalize tracking-tight text-slate-900 sm:text-4xl">{p.bedType}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Care stage</span>
                {lifecycleBadge(p.lifecycleStatus)}
              </div>
            </div>
          </article>
        </div>

        <div className="relative mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-100/95 bg-white/90 p-4 shadow-sm shadow-slate-900/[0.02] sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                <IconClipboard className="h-[18px] w-[18px]" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">Intake summary</h2>
            </div>
            <dl className="space-y-5">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-x-6">
                <div className="min-w-0 flex-1">
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Token</dt>
                  <dd className="mt-1.5 break-all font-mono text-xs font-semibold tracking-tight text-slate-800 sm:text-sm">
                    {p.tokenId}
                  </dd>
                </div>
                <div className="min-w-0 sm:text-right">
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Queued</dt>
                  <dd className="mt-1.5 text-sm font-semibold text-slate-800">
                    {p.queuedAt ? new Date(p.queuedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—"}
                  </dd>
                </div>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Symptoms</dt>
                <dd className="mt-2 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm leading-relaxed text-slate-800">
                  {p.symptoms || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Staff note</dt>
                <dd className="mt-2 rounded-xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-amber-50/30 px-4 py-3 text-sm leading-relaxed text-amber-950 ring-1 ring-amber-100/80">
                  {p.staffNote?.trim()
                    ? p.staffNote
                    : "No note yet — clinical staff may add updates as your visit progresses."}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-100/95 bg-white/90 p-4 shadow-sm shadow-slate-900/[0.02] sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-rose-500 text-white">
                <IconHeart className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900">Vitals you reported</h2>
                <p className="text-xs text-slate-500">High fever is highlighted · not a diagnosis</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <VitalTile label="Age">{p.age ?? "—"}</VitalTile>
              <VitalTile label="Temperature" emphasize={feverEmphasis}>
                {p.temperature != null ? (
                  <>
                    {p.temperature} <span className="font-bold text-slate-600">°C</span>
                  </>
                ) : (
                  "—"
                )}
              </VitalTile>
              <VitalTile label="Heart rate">
                {p.heartRate ?? "—"}
                {p.heartRate ? <span className="text-slate-500"> bpm</span> : null}
              </VitalTile>
              <VitalTile label="O₂ sat">
                {p.oxygenSat ?? "—"}
                {p.oxygenSat ? <span className="text-slate-500">%</span> : null}
              </VitalTile>
              <VitalTile label="Blood pressure">{p.bpSystolic && p.bpDiastolic ? `${p.bpSystolic}/${p.bpDiastolic}` : "—"}</VitalTile>
              <VitalTile label="Pain">{p.painLevel != null ? `${p.painLevel}/10` : "—"}</VitalTile>
            </dl>
            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Conditions</dt>
                  <dd className="mt-2 text-sm font-medium leading-relaxed text-slate-800">{p.existingConditions || "None reported"}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Allergies</dt>
                  <dd className="mt-2 text-sm font-medium leading-relaxed text-slate-800">{p.allergies || "None reported"}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}

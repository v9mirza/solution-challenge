import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, getAuthToken } from "../lib/api.js";
import { parseJwtPayload } from "../lib/jwt.js";

export function HomePage() {
  const token = getAuthToken();
  const role = token ? parseJwtPayload(token)?.role : null;
  const isAuthed = Boolean(token);
  const primaryCtaHref = !isAuthed ? "/signup" : role === "user" ? "/patient" : "/staff";
  const primaryCtaLabel = !isAuthed
    ? "Start as patient"
    : role === "user"
      ? "Go to patient portal"
      : "Go to staff dashboard";
  const secondaryCtaHref = !isAuthed ? "/login" : role === "user" ? "/patient/status" : "/staff";
  const secondaryCtaLabel = !isAuthed
    ? "I already have an account"
    : role === "user"
      ? "View live status"
      : "Open live queue";
  const canViewOpsSnapshot = role === "staff";

  const [snapshot, setSnapshot] = useState({
    criticalInQueue: "—",
    icuLoad: "—",
    generalLoad: "—",
    avgMinutes: "—",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadSnapshot() {
      if (!canViewOpsSnapshot) {
        setSnapshot({
          criticalInQueue: "—",
          icuLoad: "—",
          generalLoad: "—",
          avgMinutes: "—",
        });
        return;
      }

      try {
        const [patientsRes, hospitalsRes] = await Promise.all([api("/patients"), api("/hospitals")]);
        if (cancelled) return;

        const patients = patientsRes?.patients ?? [];
        const hospitals = hospitalsRes?.hospitals ?? [];

        const criticalInQueue = patients.filter((p) => Number(p.urgencyScore) >= 70).length;

        const totals = hospitals.reduce(
          (acc, h) => {
            acc.icuTotal += Number(h.icuTotal || 0);
            acc.icuOccupied += Number(h.icuOccupied || 0);
            acc.generalTotal += Number(h.generalTotal || 0);
            acc.generalOccupied += Number(h.generalOccupied || 0);
            return acc;
          },
          { icuTotal: 0, icuOccupied: 0, generalTotal: 0, generalOccupied: 0 }
        );

        const icuLoad =
          totals.icuTotal > 0 ? `${Math.round((totals.icuOccupied / totals.icuTotal) * 100)}%` : "—";
        const generalLoad =
          totals.generalTotal > 0
            ? `${Math.round((totals.generalOccupied / totals.generalTotal) * 100)}%`
            : "—";

        const now = Date.now();
        const waitTimes = patients
          .map((p) =>
            p.queuedAt ? Math.max(0, Math.floor((now - new Date(p.queuedAt).getTime()) / 60000)) : null
          )
          .filter((m) => m !== null);
        const avgMinutes =
          waitTimes.length > 0
            ? `${Math.round(waitTimes.reduce((sum, minutes) => sum + minutes, 0) / waitTimes.length)} min`
            : "—";

        setSnapshot({ criticalInQueue, icuLoad, generalLoad, avgMinutes });
      } catch {
        if (cancelled) return;
        setSnapshot({
          criticalInQueue: "—",
          icuLoad: "—",
          generalLoad: "—",
          avgMinutes: "—",
        });
      }
    }

    loadSnapshot();
    return () => {
      cancelled = true;
    };
  }, [canViewOpsSnapshot]);

  const snapshotLabel = useMemo(() => {
    if (canViewOpsSnapshot) return "Live triage snapshot";
    if (role === "user") return "Ops snapshot (staff only)";
    return "Ops snapshot (login as staff)";
  }, [canViewOpsSnapshot, role]);

  return (
    <section className="space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_top_right,_#0f766e_0%,_#115e59_42%,_#1e3a8a_100%)] p-7 text-white shadow-2xl sm:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-cyan-200/25 blur-2xl" />

        <div className="grid items-end gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <span className="inline-flex rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              Smart Hospital Decision Engine
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Prioritize critical patients and allocate beds in real time.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-cyan-50 sm:text-lg">
              A modern triage workflow for hospitals: urgency-aware queueing, explainable scoring,
              and capacity-aware assignment so the right patient gets care first.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to={primaryCtaHref}
                className="rounded-lg bg-white px-5 py-2.5 font-semibold text-teal-800 transition hover:translate-y-[-1px] hover:bg-teal-50"
              >
                {primaryCtaLabel}
              </Link>
              <Link
                to={secondaryCtaHref}
                className="rounded-lg border border-white/40 bg-transparent px-5 py-2.5 font-semibold text-white transition hover:bg-white/10"
              >
                {secondaryCtaLabel}
              </Link>
            </div>
          </div>

          <aside className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wide text-cyan-50">{snapshotLabel}</p>
            <div className="mt-3 space-y-3">
              <div className="rounded-xl border border-white/20 bg-white/10 p-3">
                <p className="text-xs text-cyan-50">Critical in queue</p>
                <p className="text-2xl font-bold">{snapshot.criticalInQueue}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/20 bg-white/10 p-3">
                  <p className="text-xs text-cyan-50">ICU load</p>
                  <p className="text-lg font-semibold">{snapshot.icuLoad}</p>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 p-3">
                  <p className="text-xs text-cyan-50">General load</p>
                  <p className="text-lg font-semibold">{snapshot.generalLoad}</p>
                </div>
              </div>
              <div className="rounded-xl border border-emerald-200/60 bg-emerald-300/20 p-3">
                <p className="text-xs text-emerald-50">Avg wait time</p>
                <p className="text-lg font-semibold">{snapshot.avgMinutes}</p>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/20 bg-white/10 p-3">
            <p className="text-2xl font-bold">Real-time</p>
            <p className="text-sm text-cyan-50">Live priority recalculation and queue updates</p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 p-3">
            <p className="text-2xl font-bold">Explainable</p>
            <p className="text-sm text-cyan-50">Transparent urgency score reasoning</p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 p-3">
            <p className="text-2xl font-bold">Role-based</p>
            <p className="text-sm text-cyan-50">User and staff-specific workflows</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <h2 className="text-lg font-semibold text-slate-900">Urgency-first queue</h2>
          <p className="mt-2 text-sm text-slate-600">Critical patients can move above earlier mild cases.</p>
        </article>
        <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <h2 className="text-lg font-semibold text-slate-900">Resource-aware assignment</h2>
          <p className="mt-2 text-sm text-slate-600">ICU/general assignment adapts to available capacity.</p>
        </article>
        <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <h2 className="text-lg font-semibold text-slate-900">Symptom intelligence</h2>
          <p className="mt-2 text-sm text-slate-600">Emergency symptom cues boost priority automatically.</p>
        </article>
        <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <h2 className="text-lg font-semibold text-slate-900">Role-based operations</h2>
          <p className="mt-2 text-sm text-slate-600">Users and staff each get relevant actions.</p>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">How it works</h3>
          <ol className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="flex gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
                1
              </span>
              Patient submits intake details and symptoms.
            </li>
            <li className="flex gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
                2
              </span>
              Decision engine computes urgency score and bed type.
            </li>
            <li className="flex gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
                3
              </span>
              System checks hospital capacity and attempts assignment.
            </li>
            <li className="flex gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
                4
              </span>
              Staff dashboard shows priority-sorted queue for action.
            </li>
          </ol>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Role access</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="font-semibold text-slate-900">User</p>
              <p className="text-slate-600">Submit intake, view token, urgency score, and assignment status.</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="font-semibold text-slate-900">Staff</p>
              <p className="text-slate-600">View ranked queue and update hospital bed occupancy in real time.</p>
            </div>
          </div>
        </article>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h3 className="text-2xl font-semibold text-slate-900">Ready to use Smart Hospital?</h3>
        <p className="mt-2 text-slate-600">
          Start triaging smarter with real-time prioritization and transparent decisions.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
            to={primaryCtaHref}
            className="rounded-lg bg-teal-700 px-5 py-2.5 font-semibold text-white transition hover:bg-teal-800"
            >
            {primaryCtaLabel}
          </Link>
          {!isAuthed ? (
            <Link
              to="/login"
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Log in
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

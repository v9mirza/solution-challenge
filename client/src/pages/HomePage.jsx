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
        const [patientsRes, capacityRes] = await Promise.all([api("/patients"), api("/capacity")]);
        if (cancelled) return;

        const patients = patientsRes?.patients ?? [];
        const criticalInQueue = patients.filter((p) => Number(p.urgencyScore) >= 70).length;
        const totals = {
          icuTotal: Number(capacityRes?.capacity?.icuTotal || 0),
          icuOccupied: Number(capacityRes?.capacity?.icuOccupied || 0),
          generalTotal: Number(capacityRes?.capacity?.generalTotal || 0),
          generalOccupied: Number(capacityRes?.capacity?.generalOccupied || 0),
        };

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
    <div className="space-y-12 sm:space-y-16 pb-12 sm:pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0f1c] text-white shadow-2xl">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/20 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-600/20 blur-[100px]" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/10 blur-[120px]" />

        <div className="relative z-10 grid items-center gap-8 p-6 sm:gap-12 sm:p-12 lg:grid-cols-[1.2fr_0.8fr] lg:p-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-cyan-300 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
              </span>
              Smart Hospital Triage OS
            </div>
            <h1 className="mt-6 text-4xl font-black leading-[1.1] tracking-tight sm:mt-8 sm:text-5xl md:text-6xl lg:text-7xl">
              Intelligent Care.<br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
                Zero Bottlenecks.
              </span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-300 sm:mt-6 sm:text-lg md:text-xl">
              A modern, AI-assisted triage workflow for world-class hospitals. Experience urgency-aware queueing, transparent scoring, and automated capacity assignment.
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:mt-10 sm:flex-row">
              <Link
                to={primaryCtaHref}
                className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-xl bg-white px-6 py-3.5 font-bold text-[#0a0f1c] transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] sm:w-auto sm:px-8 sm:py-4"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {primaryCtaLabel}
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </Link>
              <Link
                to={secondaryCtaHref}
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 sm:w-auto sm:px-8 sm:py-4"
              >
                {secondaryCtaLabel}
              </Link>
            </div>
          </div>

          <aside className="relative mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-md sm:mt-0 sm:p-6">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-50" />
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">{snapshotLabel}</p>
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-slate-600 animate-pulse"></div>
                  <div className="h-2 w-2 rounded-full bg-slate-600 animate-pulse delay-75"></div>
                  <div className="h-2 w-2 rounded-full bg-slate-600 animate-pulse delay-150"></div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="group rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10">
                  <p className="text-sm font-medium text-slate-400">Critical in Queue</p>
                  <p className="mt-1 text-4xl font-black text-white">{snapshot.criticalInQueue}</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-medium text-slate-400">ICU Load</p>
                    <p className="mt-1 text-2xl font-bold text-white">{snapshot.icuLoad}</p>
                    {snapshot.icuLoad !== "—" && (
                      <div className="mt-3 h-1 w-full rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-rose-500" style={{ width: snapshot.icuLoad }}></div>
                      </div>
                    )}
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-medium text-slate-400">General Load</p>
                    <p className="mt-1 text-2xl font-bold text-white">{snapshot.generalLoad}</p>
                    {snapshot.generalLoad !== "—" && (
                      <div className="mt-3 h-1 w-full rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-cyan-500" style={{ width: snapshot.generalLoad }}></div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <p className="text-sm font-medium text-cyan-200">Average Wait Time</p>
                  <p className="mt-1 text-3xl font-black text-cyan-400">{snapshot.avgMinutes}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="relative z-10 grid divide-y divide-white/10 border-t border-white/10 bg-white/5 backdrop-blur-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="p-6 text-center transition-colors hover:bg-white/5 sm:p-8">
            <p className="text-2xl font-black text-white">Real-Time</p>
            <p className="mt-2 text-sm text-slate-400">Live priority recalculation and instantaneous queue updates.</p>
          </div>
          <div className="p-6 text-center transition-colors hover:bg-white/5 sm:p-8">
            <p className="text-2xl font-black text-white">Explainable</p>
            <p className="mt-2 text-sm text-slate-400">Transparent urgency score reasoning without hidden algorithms.</p>
          </div>
          <div className="p-6 text-center transition-colors hover:bg-white/5 sm:p-8">
            <p className="text-2xl font-black text-white">Role-Based</p>
            <p className="mt-2 text-sm text-slate-400">Purpose-built workflows for patients, nurses, and doctors.</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Urgency-First Queue", desc: "Critical patients automatically bypass earlier, milder cases to receive immediate attention." },
          { title: "Smart Bed Allocation", desc: "ICU and general ward assignments adapt dynamically to your hospital's real-time capacity." },
          { title: "Symptom Intelligence", desc: "Advanced keyword recognition elevates priority for emergency symptoms instantly." },
          { title: "Frictionless Operations", desc: "Distinct, uncluttered interfaces tailored perfectly for staff efficiency and patient ease." }
        ].map((feature, i) => (
          <article key={i} className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-cyan-500/10 sm:p-8">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-slate-50 opacity-50 transition-transform duration-500 group-hover:scale-150 group-hover:bg-cyan-50" />
            <h2 className="relative z-10 text-xl font-bold text-slate-900">{feature.title}</h2>
            <p className="relative z-10 mt-3 leading-relaxed text-slate-600">{feature.desc}</p>
          </article>
        ))}
      </div>

      {/* How it Works & Roles */}
      <div className="grid gap-8 lg:grid-cols-2">
        <article className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm sm:p-10 lg:p-12">
          <h3 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">How it works</h3>
          <div className="mt-8 space-y-8">
            {[
              "Patient submits digital intake details and symptoms securely.",
              "Decision engine computes a precise urgency score and bed requirement.",
              "System verifies hospital capacity and attempts automated assignment.",
              "Staff dashboard presents a priority-sorted, actionable live queue."
            ].map((step, i) => (
              <div key={i} className="flex gap-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-lg font-black text-cyan-700 shadow-inner">
                  {i + 1}
                </span>
                <p className="pt-1.5 text-lg font-medium text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm sm:p-10 lg:p-12">
          <h3 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Access Portals</h3>
          <div className="mt-8 space-y-6">
            <div className="group rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-slate-900">Patient Portal</h4>
              </div>
              <p className="mt-4 text-slate-600 leading-relaxed">Secure environment to submit symptoms, monitor priority scores, view digital tokens, and track live assignment status.</p>
            </div>
            
            <div className="group rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all hover:border-teal-200 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-100">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-slate-900">Staff Command Center</h4>
              </div>
              <p className="mt-4 text-slate-600 leading-relaxed">Comprehensive view of the ranked queue, real-time bed capacity management, and priority override controls.</p>
            </div>
          </div>
        </article>
      </div>

      {/* Bottom CTA */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white py-12 text-center shadow-lg sm:py-16">
        <div className="absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-[80px]" />
        
        <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6">
          <h3 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Ready to transform your triage?</h3>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            Deploy our intelligent prioritization engine to ensure the right patient gets care at the exact right moment.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:mt-10 sm:flex-row">
            <Link
              to={primaryCtaHref}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 px-6 py-3.5 font-bold text-white shadow-lg shadow-cyan-500/30 transition-all hover:-translate-y-1 hover:shadow-cyan-500/50 sm:w-auto sm:px-8 sm:py-4"
            >
              {primaryCtaLabel}
            </Link>
            {!isAuthed && (
              <Link
                to="/login"
                className="w-full rounded-xl border-2 border-slate-200 bg-transparent px-6 py-3.5 font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 sm:w-auto sm:px-8 sm:py-4"
              >
                Sign In to Portal
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

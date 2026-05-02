import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { normalizeRole } from "../lib/roles.js";
import { ContentPanel, PageBreadcrumb, PageContainer } from "../components/PageChrome.jsx";

export function ProfilePage() {
  const [data, setData] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError("");
      try {
        const res = await api("/auth/me");
        if (!cancelled) {
          const normalizedRole = normalizeRole(res?.user?.role);
          setData({ ...res, user: { ...res?.user, role: normalizedRole } });
          if (normalizedRole === "user") {
            try {
              const patientRes = await api("/patients/me");
              if (!cancelled) setPatientData(patientRes?.patient ?? null);
            } catch {
              if (!cancelled) setPatientData(null);
            }
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const user = data?.user;
  const quickLinks = useMemo(() => {
    if (user?.role === "user") {
      return [
        { to: "/patient/intake", label: "Edit intake", primary: false },
        { to: "/patient/status", label: "Live status", primary: true },
      ];
    }
    return [
      { to: "/staff", label: "Staff dashboard", primary: true },
      { to: "/", label: "Home", primary: false },
    ];
  }, [user?.role]);

  if (loading) {
    return (
      <PageContainer className="flex min-h-[45vh] flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 animate-ping rounded-full bg-cyan-400/20" />
            <div className="relative flex h-full w-full items-center justify-center rounded-2xl border border-white/80 bg-white shadow-md">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">Loading profile…</p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer maxWidthClass="max-w-lg" className="py-12">
        <div className="rounded-3xl border border-rose-200/90 bg-gradient-to-br from-rose-50 to-white px-6 py-10 text-center shadow-lg">
          <p className="font-semibold text-rose-900">{error}</p>
        </div>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer maxWidthClass="max-w-lg" className="py-12">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-md">
          <p className="text-slate-600">No profile data found.</p>
        </div>
      </PageContainer>
    );
  }

  const joined = user.createdAt ? new Date(user.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";
  const updated = user.updatedAt ? new Date(user.updatedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";
  const roleLabel = user.role === "staff" ? "Clinical staff" : "Patient";

  return (
    <PageContainer>
      <PageBreadcrumb items={[{ label: "Profile" }]} />

      <header className="mb-8">
        <h1 className="text-balance text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Your profile</h1>
        <p className="mt-2 max-w-xl text-slate-600">Account basics and — for patients — a compact triage snapshot.</p>
      </header>

      <ContentPanel paddingClass="p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col items-center gap-6 border-b border-slate-100 pb-10 text-center sm:flex-row sm:items-start sm:gap-8 sm:text-left">
          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 text-3xl font-black text-white shadow-lg shadow-cyan-600/30">
            {(user.fullName || user.email).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-slate-900">{user.fullName || "Account"}</h2>
            <p className="mt-1 text-slate-600">{user.email}</p>
            <span className="mt-4 inline-flex rounded-full bg-slate-100 px-4 py-1 text-xs font-bold uppercase tracking-wide text-slate-700 ring-1 ring-slate-200/80">
              {roleLabel}
            </span>
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">Account</h3>
            <dl className="mt-5 space-y-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 ring-1 ring-slate-100/80">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Joined</dt>
                <dd className="mt-1.5 font-medium text-slate-900">{joined}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Last updated</dt>
                <dd className="mt-1.5 font-medium text-slate-900">{updated}</dd>
              </div>
            </dl>
          </div>

          {user.role === "user" ? (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">Triage snapshot</h3>
              <div className="mt-5 rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-cyan-50/30 p-5 ring-1 ring-slate-100/90">
                {patientData ? (
                  <dl className="space-y-5">
                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Queue token</dt>
                      <dd className="mt-2 break-all font-mono text-xs font-semibold tracking-tight text-slate-900 sm:text-sm">
                        {patientData.tokenId}
                      </dd>
                    </div>
                    <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
                      <div>
                        <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Priority score</dt>
                        <dd className="mt-2 text-xl font-black tabular-nums text-cyan-700">{patientData.urgencyScore}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Symptoms (AI)</dt>
                        <dd className="mt-2 text-xl font-black tabular-nums text-slate-900">{patientData.severity ?? "—"}%</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Bed suggestion</dt>
                        <dd className="mt-2 text-lg font-bold capitalize text-slate-900">{patientData.bedType}</dd>
                      </div>
                    </div>
                  </dl>
                ) : (
                  <p className="py-8 text-center text-sm text-slate-500">No intake on file — submit one from the portal.</p>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-10 border-t border-slate-100 pt-10">
          <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">Shortcuts</h3>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {quickLinks.map((link) =>
              link.primary ? (
                <Link
                  key={link.to}
                  to={link.to}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-cyan-600/20 transition hover:-translate-y-0.5 sm:w-auto"
                >
                  {link.label}
                </Link>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:w-auto"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>
        </div>
      </ContentPanel>
    </PageContainer>
  );
}

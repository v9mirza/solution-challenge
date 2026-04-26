import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { normalizeRole } from "../lib/roles.js";

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
        { to: "/patient/intake", label: "Update intake" },
        { to: "/patient/status", label: "View status" },
      ];
    }
    return [
      { to: "/staff", label: "Open staff dashboard" },
      { to: "/", label: "Back to home" },
    ];
  }, [user?.role]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center shadow-sm">
          <p className="text-rose-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-slate-600">No profile data found.</p>
        </div>
      </div>
    );
  }

  const joined = user.createdAt ? new Date(user.createdAt).toLocaleString() : "—";
  const updated = user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "—";

  return (
    <div className="mx-auto max-w-3xl p-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/70 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        
        <div className="relative z-10">
          <div className="mb-8 flex items-center gap-6 border-b border-slate-200/60 pb-8">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-200 text-3xl font-bold text-cyan-800 shadow-inner">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{user.fullName || "User Profile"}</h1>
              <p className="mt-1 text-slate-500">{user.email}</p>
              <div className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
                {user.role} Account
              </div>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Account Details</h2>
              <div className="mt-4 space-y-4 rounded-2xl border border-slate-200/60 bg-white/50 p-5 shadow-sm">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Joined</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{joined}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Last Updated</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{updated}</p>
                </div>
              </div>
            </div>

            {user.role === "user" && (
              <div>
                <h2 className="text-lg font-bold text-slate-900">Triage Snapshot</h2>
                <div className="mt-4 h-full rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white/60 to-cyan-50/30 p-5 shadow-sm">
                  {patientData ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Token ID</p>
                        <p className="mt-1 font-mono text-sm font-medium text-slate-900">{patientData.tokenId}</p>
                      </div>
                      <div className="flex gap-6">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Urgency</p>
                          <p className="mt-1 text-lg font-bold text-cyan-600">{patientData.urgencyScore}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Bed Type</p>
                          <p className="mt-1 text-lg font-bold capitalize text-slate-900">{patientData.bedType}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">
                      No active intake data.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-10 border-t border-slate-200/60 pt-8">
            <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:-translate-y-0.5 hover:shadow-cyan-500/40"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

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

  if (loading) return <p className="text-slate-600">Loading…</p>;
  if (error) return <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>;
  if (!user) return <p className="text-slate-600">No profile data found.</p>;

  const joined = user.createdAt ? new Date(user.createdAt).toLocaleString() : "—";
  const updated = user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "—";

  return (
    <section className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
      <p className="mt-1 text-sm text-slate-500">Your account details and role access.</p>

      <dl className="mt-5 grid gap-3 sm:grid-cols-[10rem_1fr]">
        <dt className="font-semibold text-slate-700">Full name</dt>
        <dd>{user.fullName || "—"}</dd>
        <dt className="font-semibold text-slate-700">Email</dt>
        <dd>{user.email}</dd>
        <dt className="font-semibold text-slate-700">Role</dt>
        <dd className="capitalize">{user.role}</dd>
        <dt className="font-semibold text-slate-700">Joined</dt>
        <dd>{joined}</dd>
        <dt className="font-semibold text-slate-700">Last updated</dt>
        <dd>{updated}</dd>
      </dl>

      {user.role === "user" ? (
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-lg font-semibold text-slate-900">Latest triage snapshot</h2>
          {patientData ? (
            <dl className="mt-3 grid gap-2 sm:grid-cols-[9rem_1fr]">
              <dt className="text-sm font-semibold text-slate-700">Token</dt>
              <dd className="text-sm">{patientData.tokenId}</dd>
              <dt className="text-sm font-semibold text-slate-700">Urgency score</dt>
              <dd className="text-sm">{patientData.urgencyScore}</dd>
              <dt className="text-sm font-semibold text-slate-700">Bed type</dt>
              <dd className="text-sm capitalize">{patientData.bedType}</dd>
            </dl>
          ) : (
            <p className="mt-2 text-sm text-slate-600">No intake data yet.</p>
          )}
        </div>
      ) : null}

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-md bg-teal-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-teal-800"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

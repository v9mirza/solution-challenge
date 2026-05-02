import { useEffect, useMemo, useState } from "react";
import { api, getAuthToken } from "../lib/api.js";
import { PageBreadcrumb } from "../components/PageChrome.jsx";

export function StaffDashboardPage() {
  const [capacity, setCapacity] = useState(null);
  const [patients, setPatients] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [error, setError] = useState("");
  const [bedForm, setBedForm] = useState({
    icuTotal: "",
    icuOccupied: "",
    generalTotal: "",
    generalOccupied: "",
  });
  const [bedMessage, setBedMessage] = useState("");
  const [queueSearch, setQueueSearch] = useState("");
  const [queueBedType, setQueueBedType] = useState("all");
  const [queueStatus, setQueueStatus] = useState("all");
  const [queueUrgencyMin, setQueueUrgencyMin] = useState("");
  const [staffForm, setStaffForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [staffMessage, setStaffMessage] = useState("");
  const [governanceMessage, setGovernanceMessage] = useState("");
  const [resetPasswordByUser, setResetPasswordByUser] = useState({});
  const [lifecycleDraft, setLifecycleDraft] = useState({});
  const [overrideDraft, setOverrideDraft] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPatientForSymptoms, setSelectedPatientForSymptoms] = useState(null);

  async function load() {
    setError("");
    try {
      const [cRes, pRes, uRes] = await Promise.all([api("/capacity"), api("/patients"), api("/staff/users")]);
      setCapacity(cRes.capacity || null);
      setPatients(pRes.patients || []);
      setStaffUsers(uRes.users || []);
      if (cRes.capacity) {
        setBedForm({
          icuTotal: String(cRes.capacity.icuTotal ?? ""),
          icuOccupied: String(cRes.capacity.icuOccupied ?? ""),
          generalTotal: String(cRes.capacity.generalTotal ?? ""),
          generalOccupied: String(cRes.capacity.generalOccupied ?? ""),
        });
      }
    } catch (err) {
      setError(err.message || "Could not load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveBeds(e) {
    e.preventDefault();
    if (!capacity) {
      setBedMessage("Capacity data unavailable.");
      return;
    }
    setBedMessage("");
    try {
      await api("/capacity", {
        method: "PATCH",
        body: {
          icuTotal: Number(bedForm.icuTotal),
          icuOccupied: Number(bedForm.icuOccupied),
          generalTotal: Number(bedForm.generalTotal),
          generalOccupied: Number(bedForm.generalOccupied),
        },
      });
      setBedMessage("Bed counts saved.");
      await load();
    } catch (err) {
      setBedMessage(err.message || "Save failed");
    }
  }

  async function createStaffUser(e) {
    e.preventDefault();
    setStaffMessage("");
    try {
      await api("/staff/users", {
        method: "POST",
        body: {
          fullName: staffForm.fullName,
          email: staffForm.email,
          password: staffForm.password,
          role: "staff",
        },
      });
      setStaffMessage("Staff account created.");
      setStaffForm({ fullName: "", email: "", password: "" });
      await load();
    } catch (err) {
      setStaffMessage(err.message || "Create staff failed");
    }
  }

  async function setStaffActive(userId, isActive) {
    setGovernanceMessage("");
    try {
      await api(`/staff/users/${userId}/active`, { method: "PATCH", body: { isActive } });
      setGovernanceMessage(isActive ? "Staff activated." : "Staff disabled.");
      await load();
    } catch (err) {
      setGovernanceMessage(err.message || "Could not update staff status");
    }
  }

  async function resetStaffPassword(userId) {
    const newPassword = resetPasswordByUser[userId];
    setGovernanceMessage("");
    try {
      await api(`/staff/users/${userId}/reset-password`, {
        method: "POST",
        body: { newPassword },
      });
      setGovernanceMessage("Password reset completed. User must reset on next login.");
      setResetPasswordByUser((prev) => ({ ...prev, [userId]: "" }));
      await load();
    } catch (err) {
      setGovernanceMessage(err.message || "Could not reset password");
    }
  }

  async function updateLifecycle(patientId) {
    const draft = lifecycleDraft[patientId] || {};
    try {
      await api(`/patients/${patientId}/lifecycle`, {
        method: "PATCH",
        body: {
          lifecycleStatus: draft.lifecycleStatus || "waiting",
          staffNote: draft.staffNote || "",
        },
      });
      await load();
    } catch (err) {
      setError(err.message || "Could not update lifecycle");
    }
  }

  async function applyOverride(patientId) {
    const draft = overrideDraft[patientId] || {};
    try {
      await api(`/patients/${patientId}/override`, {
        method: "PATCH",
        body: {
          score: draft.score === "" || draft.score === undefined ? null : Number(draft.score),
          reason: draft.reason || "",
        },
      });
      await load();
    } catch (err) {
      setError(err.message || "Could not apply override");
    }
  }

  async function exportCsv() {
    try {
      const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const params = new URLSearchParams();
      if (queueSearch.trim()) params.set("search", queueSearch.trim());
      if (queueBedType !== "all") params.set("bedType", queueBedType);
      if (queueStatus !== "all") params.set("lifecycleStatus", queueStatus);
      if (queueUrgencyMin !== "") params.set("minUrgency", queueUrgencyMin);
      const url = `${base}/patients/export.csv${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = "patients-report.csv";
      a.click();
      URL.revokeObjectURL(href);
    } catch (err) {
      setError(err.message || "Could not export report");
    }
  }

  const filteredPatients = useMemo(() => {
    const search = queueSearch.trim().toLowerCase();
    const minUrgency =
      queueUrgencyMin === "" || Number.isNaN(Number(queueUrgencyMin)) ? null : Number(queueUrgencyMin);

    return patients.filter((p) => {
      if (queueBedType !== "all" && p.bedType !== queueBedType) return false;
      if (queueStatus !== "all" && p.lifecycleStatus !== queueStatus) return false;
      if (minUrgency !== null && Number(p.urgencyScore || 0) < minUrgency) return false;
      if (!search) return true;
      const haystack = [p.fullName, p.email, p.tokenId].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(search);
    }).sort((a, b) => {
      const severityA = Number(a.severity || 0);
      const severityB = Number(b.severity || 0);
      return severityB - severityA;
    });
  }, [patients, queueBedType, queueStatus, queueUrgencyMin, queueSearch]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 animate-ping rounded-full bg-cyan-400/20" />
          <div className="relative flex h-full w-full items-center justify-center rounded-2xl border border-white/80 bg-white shadow-md">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-600" />
          </div>
        </div>
        <p className="text-sm font-medium text-slate-500">Loading command center…</p>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6 pb-10 sm:space-y-8">
      <PageBreadcrumb items={[{ label: "Home", to: "/" }, { label: "Staff dashboard" }]} />

      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-5 text-white shadow-2xl ring-1 ring-white/10 sm:rounded-3xl sm:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative z-10 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-black tracking-tight sm:text-4xl">Staff dashboard</h1>
            <p className="mt-2 text-pretty text-sm text-slate-300 sm:text-base">Capacity, roster, and ranked patient queue.</p>
          </div>
          {error ? (
            <div className="w-full shrink-0 rounded-lg border border-rose-500/30 bg-rose-500/20 px-4 py-2 text-sm font-medium text-rose-100 backdrop-blur-md sm:max-w-md sm:text-rose-200">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-3 lg:gap-8">
        {/* Capacity Load */}
        <div className="min-w-0 rounded-3xl border border-white/70 bg-white/80 p-5 shadow-xl shadow-slate-900/[0.04] backdrop-blur-xl sm:p-6 lg:col-span-1">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></div>
            System Capacity Load
          </h2>
          {capacity ? (
            <div className="mt-5 space-y-5">
              <div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-slate-700">ICU Beds</span>
                  <span className="text-cyan-700">{capacity.icuOccupied} / {capacity.icuTotal}</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500" 
                    style={{ width: capacity.icuTotal > 0 ? `${(capacity.icuOccupied / capacity.icuTotal) * 100}%` : '0%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-slate-700">General Beds</span>
                  <span className="text-blue-700">{capacity.generalOccupied} / {capacity.generalTotal}</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-500" 
                    style={{ width: capacity.generalTotal > 0 ? `${(capacity.generalOccupied / capacity.generalTotal) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm font-medium text-slate-500">No capacity data available.</p>
          )}
        </div>

        {/* Update Bed Counts */}
        {capacity ? (
          <div className="min-w-0 rounded-3xl border border-white/70 bg-white/80 p-5 shadow-xl shadow-slate-900/[0.04] backdrop-blur-xl sm:p-6 lg:col-span-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold text-slate-900">Update capacity</h2>
              {bedMessage && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  {bedMessage}
                </span>
              )}
            </div>
            <form onSubmit={saveBeds} className="mt-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="block">
                  <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">ICU Total</span>
                  <input
                    type="number" min="0" step="1" value={bedForm.icuTotal}
                    onChange={(e) => setBedForm((f) => ({ ...f, icuTotal: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300/80 bg-white/50 px-3 py-2 text-slate-900 outline-none transition-all focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">ICU Occ.</span>
                  <input
                    type="number" min="0" step="1" value={bedForm.icuOccupied}
                    onChange={(e) => setBedForm((f) => ({ ...f, icuOccupied: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300/80 bg-white/50 px-3 py-2 text-slate-900 outline-none transition-all focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Gen Total</span>
                  <input
                    type="number" min="0" step="1" value={bedForm.generalTotal}
                    onChange={(e) => setBedForm((f) => ({ ...f, generalTotal: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300/80 bg-white/50 px-3 py-2 text-slate-900 outline-none transition-all focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Gen Occ.</span>
                  <input
                    type="number" min="0" step="1" value={bedForm.generalOccupied}
                    onChange={(e) => setBedForm((f) => ({ ...f, generalOccupied: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300/80 bg-white/50 px-3 py-2 text-slate-900 outline-none transition-all focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                  />
                </label>
              </div>
              <div className="mt-5 flex justify-stretch sm:justify-end">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </div>

      {/* Staff Management */}
      <div className="min-w-0 rounded-3xl border border-white/70 bg-white/80 p-5 shadow-xl shadow-slate-900/[0.04] backdrop-blur-xl sm:p-6">
        <h2 className="text-lg font-bold text-slate-900">Staff governance</h2>

        <form onSubmit={createStaffUser} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input
            placeholder="Full Name" required value={staffForm.fullName}
            onChange={(e) => setStaffForm((f) => ({ ...f, fullName: e.target.value }))}
            className="w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 py-2.5 text-slate-900 outline-none transition-all focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
          />
          <input
            type="email" placeholder="Email Address" required value={staffForm.email}
            onChange={(e) => setStaffForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 py-2.5 text-slate-900 outline-none transition-all focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
          />
          <input
            type="password" placeholder="Password" required minLength={6} value={staffForm.password}
            onChange={(e) => setStaffForm((f) => ({ ...f, password: e.target.value }))}
            className="w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 py-2.5 text-slate-900 outline-none transition-all focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 px-4 py-2.5 font-bold text-white shadow-lg shadow-cyan-500/30 transition-all hover:-translate-y-0.5 hover:shadow-cyan-500/40 md:col-span-2 xl:col-span-1"
          >
            Create staff
          </button>
        </form>
        
        {(staffMessage || governanceMessage) && (
          <div className="mt-4 flex flex-col gap-2">
            {staffMessage && <p className="text-sm font-medium text-emerald-600">{staffMessage}</p>}
            {governanceMessage && <p className="text-sm font-medium text-emerald-600">{governanceMessage}</p>}
          </div>
        )}

        <div className="mt-6 -mx-1 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200/60 bg-white shadow-sm sm:mx-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-bold">Name</th>
                <th className="px-4 py-3 font-bold">Email</th>
                <th className="px-4 py-3 font-bold">Role</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Password Reset</th>
                <th className="px-4 py-3 font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffUsers.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-900">{u.fullName}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{u.role}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                      {u.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="password" placeholder="New password" minLength={6}
                      value={resetPasswordByUser[u.id] || ""}
                      onChange={(e) => setResetPasswordByUser((prev) => ({ ...prev, [u.id]: e.target.value }))}
                      className="w-full max-w-[10rem] min-w-0 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setStaffActive(u.id, !u.isActive)} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200">
                        {u.isActive ? "Disable" : "Activate"}
                      </button>
                      <button onClick={() => resetStaffPassword(u.id)} disabled={!resetPasswordByUser[u.id]} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50">
                        Reset
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Queue */}
      <div className="min-w-0 rounded-3xl border border-white/70 bg-white/80 p-5 shadow-xl shadow-slate-900/[0.04] backdrop-blur-xl sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900">Live patient queue</h2>
            <p className="mt-1 text-pretty text-sm text-slate-500">Sorted by AI symptom % — lifecycle and overrides apply here.</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5 xl:gap-4">
          <input
            placeholder="Search name, email, token..." value={queueSearch} onChange={(e) => setQueueSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 py-2 text-slate-900 outline-none transition-all focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
          />
          <select
            value={queueBedType} onChange={(e) => setQueueBedType(e.target.value)}
            className="w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 py-2 text-slate-900 outline-none transition-all focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
          >
            <option value="all">All Beds</option>
            <option value="icu">ICU</option>
            <option value="general">General</option>
            <option value="none">Unassigned</option>
          </select>
          <select
            value={queueStatus} onChange={(e) => setQueueStatus(e.target.value)}
            className="w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 py-2 text-slate-900 outline-none transition-all focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
          >
            <option value="all">All Status</option>
            <option value="waiting">Waiting</option>
            <option value="in_progress">In Progress</option>
            <option value="admitted">Admitted</option>
            <option value="discharged">Discharged</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="number" min="0" max="100" placeholder="Min priority score" value={queueUrgencyMin} onChange={(e) => setQueueUrgencyMin(e.target.value)}
            className="w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 py-2 text-slate-900 outline-none transition-all focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
          />
          <button
            onClick={exportCsv}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:col-span-2 xl:col-span-1"
          >
            Export CSV
          </button>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="mt-3 font-medium text-slate-600">No patients currently in queue.</p>
          </div>
        ) : (
          <div className="mt-6 -mx-1 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200/60 bg-white shadow-sm sm:mx-0">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-bold">Priority</th>
                  <th className="px-4 py-3 font-bold">Symptoms (AI)</th>
                  <th className="px-4 py-3 font-bold">Patient</th>
                  <th className="px-4 py-3 font-bold">Bed</th>
                  <th className="px-4 py-3 font-bold">Lifecycle</th>
                  <th className="px-4 py-3 font-bold">Staff Note</th>
                  <th className="px-4 py-3 font-bold">Override</th>
                  <th className="px-4 py-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((p) => {
                  const rowBg = p.severityColor === "red" ? "bg-rose-50/50 hover:bg-rose-50" : p.severityColor === "yellow" ? "bg-amber-50/50 hover:bg-amber-50" : "bg-emerald-50/50 hover:bg-emerald-50";
                  return (
                    <tr key={p.id} className={`transition-colors ${rowBg}`}>
                      <td className="px-4 py-4 font-black text-slate-900">{p.urgencyScore}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${p.severityColor === "red" ? "bg-rose-100 text-rose-800" : p.severityColor === "yellow" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${p.severityColor === "red" ? "bg-rose-600" : p.severityColor === "yellow" ? "bg-amber-600" : "bg-emerald-600"}`} />
                          {p.severity}%
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button onClick={() => setSelectedPatientForSymptoms(p)} className="flex flex-col items-start text-left hover:opacity-80">
                          <span className="font-bold text-cyan-700">{p.fullName || "Unknown"}</span>
                          <span className="text-xs text-slate-500">{p.tokenId}</span>
                        </button>
                      </td>
                      <td className="px-4 py-4 font-medium capitalize text-slate-700">{p.bedType}</td>
                      <td className="px-4 py-4">
                        <select
                          value={lifecycleDraft[p.id]?.lifecycleStatus ?? p.lifecycleStatus ?? "waiting"}
                          onChange={(e) => setLifecycleDraft((prev) => ({ ...prev, [p.id]: { ...(prev[p.id] || {}), lifecycleStatus: e.target.value } }))}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                        >
                          <option value="waiting">Waiting</option>
                          <option value="in_progress">In Progress</option>
                          <option value="admitted">Admitted</option>
                          <option value="discharged">Discharged</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <input
                          value={lifecycleDraft[p.id]?.staffNote ?? p.staffNote ?? ""}
                          onChange={(e) => setLifecycleDraft((prev) => ({ ...prev, [p.id]: { ...(prev[p.id] || {}), staffNote: e.target.value } }))}
                          placeholder="Note..."
                          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2 xl:flex-row">
                          <input
                            type="number" min="0" max="100" placeholder={String(p.urgencyScore ?? "")}
                            value={overrideDraft[p.id]?.score ?? ""}
                            onChange={(e) => setOverrideDraft((prev) => ({ ...prev, [p.id]: { ...(prev[p.id] || {}), score: e.target.value } }))}
                            className="w-16 rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                          />
                          <input
                            placeholder="Reason..." value={overrideDraft[p.id]?.reason ?? ""}
                            onChange={(e) => setOverrideDraft((prev) => ({ ...prev, [p.id]: { ...(prev[p.id] || {}), reason: e.target.value } }))}
                            className="w-full min-w-[80px] rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          <button onClick={() => updateLifecycle(p.id)} className="whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800">
                            Save State
                          </button>
                          <button onClick={() => applyOverride(p.id)} className="whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50">
                            Override
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedPatientForSymptoms && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[85vh] sm:rounded-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-6">
              <h3 className="min-w-0 flex-1 pr-2 text-base font-bold leading-snug text-slate-900 sm:text-lg">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Symptoms</span>
                <span className="break-words">{selectedPatientForSymptoms.fullName || selectedPatientForSymptoms.tokenId}</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPatientForSymptoms(null)}
                className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto px-4 py-5 sm:max-h-[60vh] sm:px-6 sm:py-6">
              <div className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap font-medium">
                {selectedPatientForSymptoms.symptoms || "No symptoms recorded."}
              </div>
            </div>
            <div className="flex justify-end border-t border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setSelectedPatientForSymptoms(null)}
                className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 sm:w-auto sm:py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

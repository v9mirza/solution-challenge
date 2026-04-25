import { useEffect, useMemo, useState } from "react";
import { api, getAuthToken } from "../lib/api.js";

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
    });
  }, [patients, queueBedType, queueStatus, queueUrgencyMin, queueSearch]);

  if (loading) return <p className="text-slate-600">Loading…</p>;

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">Staff dashboard</h1>
        {error ? <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">System capacity load</h2>
        {capacity ? (
          <div className="mt-4 rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-600">
              ICU {capacity.icuOccupied}/{capacity.icuTotal} · General {capacity.generalOccupied}/
              {capacity.generalTotal}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No capacity data found.</p>
        )}
      </div>

      {capacity ? (
        <form
          onSubmit={saveBeds}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold">Update bed counts</h2>
          <p className="mt-2 text-sm text-slate-500">
            Validation is enforced and occupied counts auto-adjust if totals are reduced.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              ICU total
              <input
                type="number"
                min="0"
                step="1"
                value={bedForm.icuTotal}
                onChange={(e) => setBedForm((f) => ({ ...f, icuTotal: e.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              ICU occupied
              <input
                type="number"
                min="0"
                step="1"
                value={bedForm.icuOccupied}
                onChange={(e) => setBedForm((f) => ({ ...f, icuOccupied: e.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              General total
              <input
                type="number"
                min="0"
                step="1"
                value={bedForm.generalTotal}
                onChange={(e) => setBedForm((f) => ({ ...f, generalTotal: e.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              General occupied
              <input
                type="number"
                min="0"
                step="1"
                value={bedForm.generalOccupied}
                onChange={(e) => setBedForm((f) => ({ ...f, generalOccupied: e.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
              />
            </label>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              className="rounded-md bg-teal-700 px-4 py-2 font-medium text-white transition hover:bg-teal-800"
            >
              Save
            </button>
            {bedMessage ? <span className="text-sm text-slate-600">{bedMessage}</span> : null}
          </div>
        </form>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Staff user management</h2>
        <form onSubmit={createStaffUser} className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            placeholder="Full name"
            value={staffForm.fullName}
            onChange={(e) => setStaffForm((f) => ({ ...f, fullName: e.target.value }))}
            required
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
          />
          <input
            type="email"
            placeholder="Email"
            value={staffForm.email}
            onChange={(e) => setStaffForm((f) => ({ ...f, email: e.target.value }))}
            required
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
          />
          <input
            type="password"
            placeholder="Password"
            value={staffForm.password}
            onChange={(e) => setStaffForm((f) => ({ ...f, password: e.target.value }))}
            required
            minLength={6}
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
          />
          <button
            type="submit"
            className="rounded-md bg-teal-700 px-4 py-2 font-medium text-white transition hover:bg-teal-800 md:col-span-2 xl:col-span-3"
          >
            Create staff account
          </button>
        </form>
        {staffMessage ? <p className="mt-3 text-sm text-slate-600">{staffMessage}</p> : null}
        {governanceMessage ? <p className="mt-3 text-sm text-slate-600">{governanceMessage}</p> : null}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="px-3 py-2 font-semibold">Name</th>
                <th className="px-3 py-2 font-semibold">Email</th>
                <th className="px-3 py-2 font-semibold">Role</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Reset password</th>
                <th className="px-3 py-2 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {staffUsers.map((u) => (
                <tr key={u.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{u.fullName}</td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2 capitalize">{u.role}</td>
                  <td className="px-3 py-2">{u.isActive ? "Active" : "Disabled"}</td>
                  <td className="px-3 py-2">
                    <input
                      type="password"
                      placeholder="New password"
                      minLength={6}
                      value={resetPasswordByUser[u.id] || ""}
                      onChange={(e) =>
                        setResetPasswordByUser((prev) => ({ ...prev, [u.id]: e.target.value }))
                      }
                      className="w-40 rounded border border-slate-300 px-2 py-1"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setStaffActive(u.id, !u.isActive)}
                        className="rounded border border-slate-300 px-2 py-1 text-xs"
                      >
                        {u.isActive ? "Disable" : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => resetStaffPassword(u.id)}
                        className="rounded border border-slate-300 px-2 py-1 text-xs"
                        disabled={!resetPasswordByUser[u.id]}
                      >
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

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Patients by priority</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            placeholder="Search name/email/token"
            value={queueSearch}
            onChange={(e) => setQueueSearch(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
          />
          <select
            value={queueBedType}
            onChange={(e) => setQueueBedType(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
          >
            <option value="all">All beds</option>
            <option value="icu">ICU</option>
            <option value="general">General</option>
            <option value="none">Unassigned</option>
          </select>
          <select
            value={queueStatus}
            onChange={(e) => setQueueStatus(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
          >
            <option value="all">All status</option>
            <option value="waiting">Waiting</option>
            <option value="in_progress">In progress</option>
            <option value="admitted">Admitted</option>
            <option value="discharged">Discharged</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="number"
            min="0"
            max="100"
            placeholder="Min urgency"
            value={queueUrgencyMin}
            onChange={(e) => setQueueUrgencyMin(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
          />
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Export CSV report
          </button>
        </div>
        {filteredPatients.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No patients in queue.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="px-3 py-2 font-semibold">Urgency</th>
                  <th className="px-3 py-2 font-semibold">Severity</th>
                  <th className="px-3 py-2 font-semibold">Name</th>
                  <th className="px-3 py-2 font-semibold">Email</th>
                  <th className="px-3 py-2 font-semibold">Bed</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold">Staff note</th>
                  <th className="px-3 py-2 font-semibold">Override</th>
                  <th className="px-3 py-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="px-3 py-2">{p.urgencyScore}</td>
                    <td className="px-3 py-2">{p.severity}</td>
                    <td className="px-3 py-2">{p.fullName ?? "—"}</td>
                    <td className="px-3 py-2">{p.email ?? "—"}</td>
                    <td className="px-3 py-2 capitalize">{p.bedType}</td>
                    <td className="px-3 py-2">
                      <select
                        value={lifecycleDraft[p.id]?.lifecycleStatus ?? p.lifecycleStatus ?? "waiting"}
                        onChange={(e) =>
                          setLifecycleDraft((prev) => ({
                            ...prev,
                            [p.id]: { ...(prev[p.id] || {}), lifecycleStatus: e.target.value },
                          }))
                        }
                        className="rounded border border-slate-300 px-2 py-1"
                      >
                        <option value="waiting">Waiting</option>
                        <option value="in_progress">In progress</option>
                        <option value="admitted">Admitted</option>
                        <option value="discharged">Discharged</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={lifecycleDraft[p.id]?.staffNote ?? p.staffNote ?? ""}
                        onChange={(e) =>
                          setLifecycleDraft((prev) => ({
                            ...prev,
                            [p.id]: { ...(prev[p.id] || {}), staffNote: e.target.value },
                          }))
                        }
                        placeholder="Add note"
                        className="w-44 rounded border border-slate-300 px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder={String(p.urgencyScore ?? "")}
                          value={overrideDraft[p.id]?.score ?? ""}
                          onChange={(e) =>
                            setOverrideDraft((prev) => ({
                              ...prev,
                              [p.id]: { ...(prev[p.id] || {}), score: e.target.value },
                            }))
                          }
                          className="w-20 rounded border border-slate-300 px-2 py-1"
                        />
                        <input
                          placeholder="Reason"
                          value={overrideDraft[p.id]?.reason ?? ""}
                          onChange={(e) =>
                            setOverrideDraft((prev) => ({
                              ...prev,
                              [p.id]: { ...(prev[p.id] || {}), reason: e.target.value },
                            }))
                          }
                          className="w-32 rounded border border-slate-300 px-2 py-1"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded border border-slate-300 px-2 py-1 text-xs"
                          onClick={() => updateLifecycle(p.id)}
                        >
                          Save lifecycle
                        </button>
                        <button
                          type="button"
                          className="rounded border border-slate-300 px-2 py-1 text-xs"
                          onClick={() => applyOverride(p.id)}
                        >
                          Apply override
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

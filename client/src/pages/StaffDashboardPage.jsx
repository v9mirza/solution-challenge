import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";

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
  const [queueUrgencyMin, setQueueUrgencyMin] = useState("");
  const [staffForm, setStaffForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [staffMessage, setStaffMessage] = useState("");
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

  const filteredPatients = useMemo(() => {
    const search = queueSearch.trim().toLowerCase();
    const minUrgency =
      queueUrgencyMin === "" || Number.isNaN(Number(queueUrgencyMin)) ? null : Number(queueUrgencyMin);

    return patients.filter((p) => {
      if (queueBedType !== "all" && p.bedType !== queueBedType) return false;
      if (minUrgency !== null && Number(p.urgencyScore || 0) < minUrgency) return false;
      if (!search) return true;
      const haystack = [p.fullName, p.email, p.tokenId].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(search);
    });
  }, [patients, queueBedType, queueUrgencyMin, queueSearch]);

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
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="px-3 py-2 font-semibold">Name</th>
                <th className="px-3 py-2 font-semibold">Email</th>
                <th className="px-3 py-2 font-semibold">Role</th>
              </tr>
            </thead>
            <tbody>
              {staffUsers.map((u) => (
                <tr key={u.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{u.fullName}</td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2 capitalize">{u.role}</td>
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
          <input
            type="number"
            min="0"
            max="100"
            placeholder="Min urgency"
            value={queueUrgencyMin}
            onChange={(e) => setQueueUrgencyMin(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
          />
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

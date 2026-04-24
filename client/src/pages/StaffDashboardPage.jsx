import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

export function StaffDashboardPage() {
  const [hospitals, setHospitals] = useState([]);
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState("");
  const [bedForm, setBedForm] = useState({
    icuTotal: "",
    icuOccupied: "",
    generalTotal: "",
    generalOccupied: "",
  });
  const [bedMessage, setBedMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setError("");
    try {
      const [hRes, pRes] = await Promise.all([api("/hospitals"), api("/patients")]);
      setHospitals(hRes.hospitals || []);
      setPatients(pRes.patients || []);
      const h = hRes.hospitals?.[0];
      if (h) {
        setBedForm({
          icuTotal: String(h.icuTotal ?? ""),
          icuOccupied: String(h.icuOccupied ?? ""),
          generalTotal: String(h.generalTotal ?? ""),
          generalOccupied: String(h.generalOccupied ?? ""),
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
    const h = hospitals[0];
    if (!h?._id) {
      setBedMessage("No hospital assigned to this account.");
      return;
    }
    setBedMessage("");
    try {
      await api(`/hospitals/${h._id}/beds`, {
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

  if (loading) return <p className="text-slate-600">Loading…</p>;

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">Staff dashboard</h1>
        {error ? <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Hospital load</h2>
        {hospitals.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No hospitals (check staff <code>hospitalId</code> in the database).
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {hospitals.map((h) => (
              <div key={h._id} className="rounded-lg border border-slate-200 p-4">
                <strong className="block text-slate-900">{h.name}</strong>
                <p className="mt-1 text-sm text-slate-600">
                  ICU {h.icuOccupied}/{h.icuTotal} · General {h.generalOccupied}/{h.generalTotal}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {hospitals[0] ? (
        <form
          onSubmit={saveBeds}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold">Update bed counts</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              ICU total
              <input
                value={bedForm.icuTotal}
                onChange={(e) => setBedForm((f) => ({ ...f, icuTotal: e.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-indigo-200 transition focus:border-indigo-500 focus:ring"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              ICU occupied
              <input
                value={bedForm.icuOccupied}
                onChange={(e) => setBedForm((f) => ({ ...f, icuOccupied: e.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-indigo-200 transition focus:border-indigo-500 focus:ring"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              General total
              <input
                value={bedForm.generalTotal}
                onChange={(e) => setBedForm((f) => ({ ...f, generalTotal: e.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-indigo-200 transition focus:border-indigo-500 focus:ring"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              General occupied
              <input
                value={bedForm.generalOccupied}
                onChange={(e) => setBedForm((f) => ({ ...f, generalOccupied: e.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-indigo-200 transition focus:border-indigo-500 focus:ring"
              />
            </label>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700"
            >
              Save
            </button>
            {bedMessage ? <span className="text-sm text-slate-600">{bedMessage}</span> : null}
          </div>
        </form>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Patients by priority</h2>
        {patients.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No patients in queue.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="px-3 py-2 font-semibold">Urgency</th>
                  <th className="px-3 py-2 font-semibold">Severity</th>
                  <th className="px-3 py-2 font-semibold">Email</th>
                  <th className="px-3 py-2 font-semibold">Bed</th>
                  <th className="px-3 py-2 font-semibold">Hospital</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="px-3 py-2">{p.urgencyScore}</td>
                    <td className="px-3 py-2">{p.severity}</td>
                    <td className="px-3 py-2">{p.email ?? "—"}</td>
                    <td className="px-3 py-2 capitalize">{p.bedType}</td>
                    <td className="px-3 py-2">{p.hospital?.name ?? "—"}</td>
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

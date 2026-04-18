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

  if (loading) return <p>Loading…</p>;

  return (
    <section>
      <h1>Staff dashboard</h1>
      {error ? <p className="form-error">{error}</p> : null}

      <h2>Hospital load</h2>
      {hospitals.length === 0 ? (
        <p className="muted">No hospitals (check staff <code>hospitalId</code> in the database).</p>
      ) : (
        hospitals.map((h) => (
          <div key={h._id} className="card">
            <strong>{h.name}</strong>
            <p>
              ICU {h.icuOccupied}/{h.icuTotal} · General {h.generalOccupied}/{h.generalTotal}
            </p>
          </div>
        ))
      )}

      {hospitals[0] ? (
        <form onSubmit={saveBeds} className="form form-inline">
          <fieldset>
            <legend>Update bed counts</legend>
            <label>
              ICU total
              <input
                value={bedForm.icuTotal}
                onChange={(e) => setBedForm((f) => ({ ...f, icuTotal: e.target.value }))}
              />
            </label>
            <label>
              ICU occupied
              <input
                value={bedForm.icuOccupied}
                onChange={(e) => setBedForm((f) => ({ ...f, icuOccupied: e.target.value }))}
              />
            </label>
            <label>
              General total
              <input
                value={bedForm.generalTotal}
                onChange={(e) => setBedForm((f) => ({ ...f, generalTotal: e.target.value }))}
              />
            </label>
            <label>
              General occupied
              <input
                value={bedForm.generalOccupied}
                onChange={(e) => setBedForm((f) => ({ ...f, generalOccupied: e.target.value }))}
              />
            </label>
          </fieldset>
          <button type="submit">Save</button>
          {bedMessage ? <span className="muted"> {bedMessage}</span> : null}
        </form>
      ) : null}

      <h2>Patients by priority</h2>
      {patients.length === 0 ? (
        <p className="muted">No patients in queue.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Urgency</th>
              <th>Severity</th>
              <th>Email</th>
              <th>Bed</th>
              <th>Hospital</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id}>
                <td>{p.urgencyScore}</td>
                <td>{p.severity}</td>
                <td>{p.email ?? "—"}</td>
                <td>{p.bedType}</td>
                <td>{p.hospital?.name ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

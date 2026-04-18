import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";

export function PatientIntakePage() {
  const [symptoms, setSymptoms] = useState("");
  const [severity, setSeverity] = useState(30);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const data = await api("/patients/me/intake", {
        method: "POST",
        body: { symptoms, severity: Number(severity) },
      });
      setMessage(`Saved. Token: ${data.tokenId?.slice(0, 8)}…`);
    } catch (err) {
      setError(err.message || "Could not save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-form">
      <h1>Intake</h1>
      <p className="muted">
        <Link to="/patient/status">View status</Link> · <Link to="/patient">Patient home</Link>
      </p>
      <form onSubmit={onSubmit} className="form">
        <label>
          Symptoms
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={4}
            placeholder="Describe symptoms"
          />
        </label>
        <label>
          Severity (0–100)
          <input
            type="number"
            min={0}
            max={100}
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        {message ? <p className="form-success">{message}</p> : null}
        <button type="submit" disabled={loading}>
          {loading ? "…" : "Submit"}
        </button>
      </form>
    </section>
  );
}

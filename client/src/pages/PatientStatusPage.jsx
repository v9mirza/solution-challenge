import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";

export function PatientStatusPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError("");
      try {
        const res = await api("/patients/me");
        if (!cancelled) setData(res);
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="form-error">{error}</p>;

  const p = data?.patient;
  if (!p) {
    return (
      <section>
        <h1>Your status</h1>
        <p>No intake yet.</p>
        <p>
          <Link to="/patient/intake">Submit intake</Link>
        </p>
      </section>
    );
  }

  return (
    <section>
      <h1>Your status</h1>
      <p className="muted">
        <Link to="/patient/intake">Update intake</Link> · <Link to="/patient">Patient home</Link>
      </p>
      <dl className="status-grid">
        <dt>Token</dt>
        <dd>
          <code>{p.tokenId}</code>
        </dd>
        <dt>Urgency score</dt>
        <dd>{p.urgencyScore}</dd>
        <dt>Severity</dt>
        <dd>{p.severity}</dd>
        <dt>Bed</dt>
        <dd>{p.bedType}</dd>
        <dt>Hospital</dt>
        <dd>{p.hospital?.name ?? "—"}</dd>
        <dt>Queued</dt>
        <dd>{p.queuedAt ? new Date(p.queuedAt).toLocaleString() : "—"}</dd>
        <dt>Symptoms</dt>
        <dd>{p.symptoms || "—"}</dd>
      </dl>
    </section>
  );
}

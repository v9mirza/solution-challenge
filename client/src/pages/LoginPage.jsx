import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { api, setAuthToken } from "../lib/api.js";
import { parseJwtPayload } from "../lib/jwt.js";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api("/auth/login", { method: "POST", body: { email, password } });
      setAuthToken(data.token);
      const role = parseJwtPayload(data.token)?.role;
      if (from && role === "patient" && from.startsWith("/patient")) {
        navigate(from, { replace: true });
      } else if (role === "patient") {
        navigate("/patient/status", { replace: true });
      } else {
        navigate("/staff", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-form">
      <h1>Log in</h1>
      <form onSubmit={onSubmit} className="form">
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" disabled={loading}>
          {loading ? "…" : "Log in"}
        </button>
      </form>
      <p className="form-footer">
        No account? <Link to="/signup">Sign up</Link>
      </p>
    </section>
  );
}

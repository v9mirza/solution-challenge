import { Link } from "react-router-dom";
import { getAuthToken } from "../lib/api.js";
import { parseJwtPayload } from "../lib/jwt.js";

export function HomePage() {
  const token = getAuthToken();
  const role = token ? parseJwtPayload(token)?.role : null;

  return (
    <section>
      <h1>Smart Hospital</h1>
      <p>Decision and resource allocation — log in by role.</p>
      <ul className="link-list">
        {!token ? (
          <>
            <li>
              <Link to="/login">Log in</Link>
            </li>
            <li>
              <Link to="/signup">Sign up (patient)</Link>
            </li>
          </>
        ) : null}
        {role === "patient" ? (
          <li>
            <Link to="/patient">Patient portal</Link>
          </li>
        ) : null}
        {(role === "staff" || role === "admin") && (
          <li>
            <Link to="/staff">Staff dashboard</Link>
          </li>
        )}
      </ul>
    </section>
  );
}

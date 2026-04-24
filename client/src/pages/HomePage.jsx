import { Link } from "react-router-dom";
import { getAuthToken } from "../lib/api.js";
import { parseJwtPayload } from "../lib/jwt.js";

export function HomePage() {
  const token = getAuthToken();
  const role = token ? parseJwtPayload(token)?.role : null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-4xl font-bold tracking-tight">Smart Hospital</h1>
      <p className="mt-3 text-slate-600">Decision and resource allocation — log in by role.</p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
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

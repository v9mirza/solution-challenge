import { Link } from "react-router-dom";

export function PatientPortalPage() {
  return (
    <section>
      <h1>Patient</h1>
      <ul className="link-list">
        <li>
          <Link to="/patient/intake">Submit or update symptoms</Link>
        </li>
        <li>
          <Link to="/patient/status">Priority &amp; queue status</Link>
        </li>
      </ul>
    </section>
  );
}

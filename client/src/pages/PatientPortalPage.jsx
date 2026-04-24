import { Link } from "react-router-dom";

export function PatientPortalPage() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-bold tracking-tight">Patient portal</h1>
      <p className="mt-2 text-sm text-slate-500">Submit intake updates and track queue status.</p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
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

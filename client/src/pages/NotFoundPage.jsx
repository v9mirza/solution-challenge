import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="mt-2 text-slate-600">Page not found.</p>
      <p className="mt-3">
        <Link to="/">Home</Link>
      </p>
    </section>
  );
}

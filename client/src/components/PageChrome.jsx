import { Link } from "react-router-dom";

/** Shared form control styling aligned across portal pages */
export const fieldClass =
  "w-full rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 shadow-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10";

export function PageContainer({ children, maxWidthClass = "max-w-5xl", className = "" }) {
  return <div className={`mx-auto w-full min-w-0 ${maxWidthClass} px-4 pb-10 pt-2 sm:px-6 sm:pb-12 ${className}`}>{children}</div>;
}

export function PageBreadcrumb({ items }) {
  return (
    <nav className="mb-6 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-2">
          {i > 0 ? <span className="text-slate-300">/</span> : null}
          {item.to ? (
            <Link to={item.to} className="font-medium text-cyan-700 hover:text-cyan-800 hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-slate-700">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function ContentPanel({ children, className = "", paddingClass = "p-6 sm:p-8" }) {
  return (
    <section
      className={`relative min-w-0 overflow-hidden rounded-2xl border border-white/70 bg-white/75 shadow-xl shadow-slate-900/[0.04] backdrop-blur-xl sm:rounded-3xl ${paddingClass} ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-100/50 via-transparent to-transparent" />
      <div className="relative min-w-0">{children}</div>
    </section>
  );
}

/** Centered column for login / signup / 404 */
export function AuthPanel({ children, className = "" }) {
  return (
    <div className={`relative w-full min-w-0 overflow-hidden rounded-2xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-900/[0.06] backdrop-blur-xl sm:rounded-3xl sm:p-10 ${className}`}>
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-blue-400/15 blur-3xl" />
      <div className="relative">{children}</div>
    </div>
  );
}

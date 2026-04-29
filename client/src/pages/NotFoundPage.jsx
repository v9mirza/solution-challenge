import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8 sm:p-6">
      <section className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-6 text-center shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-cyan-500/10 sm:rounded-3xl sm:p-10">
        <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
        
        <div className="relative z-10">
          <h1 className="bg-gradient-to-br from-cyan-600 to-blue-800 bg-clip-text text-6xl font-extrabold tracking-tighter text-transparent drop-shadow-sm sm:text-8xl">
            404
          </h1>
          <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">Page not found</h2>
          <p className="mt-3 text-slate-500">
            The page you are looking for doesn't exist or has been moved to another location within our system.
          </p>
          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 hover:shadow-blue-500/40 sm:w-auto sm:px-8 sm:py-3.5"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

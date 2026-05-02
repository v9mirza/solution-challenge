import { Link } from "react-router-dom";
import { AuthPanel } from "../components/PageChrome.jsx";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-9rem)] flex-col items-center justify-center px-4 py-16 sm:px-6">
      <div className="w-full max-w-lg">
        <AuthPanel className="p-10 text-center sm:p-14">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">404</p>
          <h1 className="mt-4 bg-gradient-to-br from-cyan-600 to-blue-800 bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-6xl">
            Lost in the ward
          </h1>
          <p className="mt-4 text-pretty text-slate-600 leading-relaxed">
            This route doesn&apos;t exist or moved. Double-check the URL or head back to the homepage.
          </p>
          <div className="mt-10">
            <Link
              to="/"
              className="inline-flex rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-700 px-10 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-600/25 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30"
            >
              Back home
            </Link>
          </div>
        </AuthPanel>
      </div>
    </div>
  );
}

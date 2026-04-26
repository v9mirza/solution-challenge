import { Link } from "react-router-dom";

export function PatientPortalPage() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/70 p-8 shadow-2xl backdrop-blur-xl sm:p-12">
        <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        
        <div className="relative z-10">
          <div className="mb-8 border-b border-slate-200/60 pb-6">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Patient Portal</h1>
            <p className="mt-3 text-lg text-slate-600">Manage your intake details, monitor your priority score, and track your queue status in real-time.</p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <Link 
              to="/patient/intake"
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/60 bg-white/50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-cyan-500/10"
            >
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Intake & Symptoms</h3>
                <p className="mt-2 text-sm text-slate-600">Submit a new symptom report or update your existing medical intake details securely.</p>
              </div>
              <div className="mt-6 font-semibold text-cyan-600 group-hover:text-cyan-700">
                Update records &rarr;
              </div>
            </Link>

            <Link 
              to="/patient/status"
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/60 bg-white/50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Priority Status</h3>
                <p className="mt-2 text-sm text-slate-600">View your current urgency score and live updates on your queue position and hospital bed assignment.</p>
              </div>
              <div className="mt-6 font-semibold text-blue-600 group-hover:text-blue-700">
                View status &rarr;
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

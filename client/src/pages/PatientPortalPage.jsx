import { Link } from "react-router-dom";
import { ContentPanel, PageBreadcrumb, PageContainer } from "../components/PageChrome.jsx";

export function PatientPortalPage() {
  return (
    <PageContainer>
      <PageBreadcrumb items={[{ label: "Portal" }]} />

      <header className="mb-8">
        <h1 className="text-balance text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Patient portal</h1>
        <p className="mt-2 max-w-2xl text-pretty text-slate-600 sm:text-[17px]">
          Update your intake or check live queue priority, AI symptom estimate, and bed suggestion — same design language
          as your status dashboard.
        </p>
      </header>

      <ContentPanel paddingClass="p-5 sm:p-8 lg:p-10">
        <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">
          <Link
            to="/patient/intake"
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100/95 bg-gradient-to-br from-white to-cyan-50/40 p-6 shadow-md shadow-slate-900/[0.04] ring-1 ring-slate-200/70 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 sm:p-7"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 shadow-sm ring-1 ring-cyan-200/70 transition group-hover:bg-cyan-200/80">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </span>
            <h2 className="mt-5 text-xl font-bold text-slate-900">Intake &amp; symptoms</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
              Submit or update symptoms and vitals. We recalculate queue priority whenever you save.
            </p>
            <span className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-cyan-700 group-hover:text-cyan-900">
              Open intake
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>

          <Link
            to="/patient/status"
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100/95 bg-gradient-to-br from-white to-blue-50/50 p-6 shadow-md shadow-slate-900/[0.04] ring-1 ring-slate-200/70 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:p-7"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shadow-sm ring-1 ring-blue-200/70 transition group-hover:bg-blue-200/80">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </span>
            <h2 className="mt-5 text-xl font-bold text-slate-900">Live care status</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
              Queue priority vs AI symptom severity, assigned bed, token, vitals snapshot, and staff notes.
            </p>
            <span className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-blue-700 group-hover:text-blue-900">
              View status
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
        </div>
      </ContentPanel>
    </PageContainer>
  );
}

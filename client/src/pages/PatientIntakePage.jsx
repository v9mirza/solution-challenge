import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { ContentPanel, fieldClass, PageBreadcrumb, PageContainer } from "../components/PageChrome.jsx";

function SectionHeader({ step, title, subtitle, accent }) {
  const accents = {
    blue: "from-blue-600 to-blue-500",
    cyan: "from-cyan-600 to-cyan-500",
    teal: "from-teal-600 to-teal-500",
  };
  return (
    <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-9 min-w-[2.25rem] items-center justify-center rounded-xl bg-gradient-to-br ${accents[accent]} text-sm font-black text-white shadow-md`}
          aria-hidden
        >
          {step}
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
    </div>
  );
}

export function PatientIntakePage() {
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [temperature, setTemperature] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [oxygenSat, setOxygenSat] = useState("");
  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [onsetHours, setOnsetHours] = useState("");
  const [painLevel, setPainLevel] = useState("");
  const [existingConditions, setExistingConditions] = useState("");
  const [allergies, setAllergies] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const data = await api("/patients/me/intake", {
        method: "POST",
        body: {
          symptoms,
          age,
          temperature,
          heartRate,
          oxygenSat,
          bpSystolic,
          bpDiastolic,
          onsetHours,
          painLevel,
          existingConditions,
          allergies,
        },
      });
      setMessage(`Saved. Token ${data.tokenId?.slice(0, 8)}… · Priority score ${data.urgencyScore}`);
    } catch (err) {
      setError(err.message || "Could not save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer>
      <PageBreadcrumb items={[{ label: "Portal", to: "/patient" }, { label: "Intake" }]} />

      <header className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-balance text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Clinical intake</h1>
          <p className="mt-2 max-w-2xl text-pretty text-slate-600">
            Structured triage information. Symptoms drive the AI severity band; vitals and history feed queue priority when you
            save.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <Link
            to="/patient"
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:w-auto"
          >
            Portal
          </Link>
          <Link
            to="/patient/status"
            className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-cyan-600/20 transition hover:-translate-y-0.5 sm:w-auto"
          >
            View status
          </Link>
        </div>
      </header>

      <form onSubmit={onSubmit} className="space-y-8">
        <ContentPanel paddingClass="p-6 sm:p-8">
          <SectionHeader step={1} title="Symptoms & pain" subtitle="Required narrative for AI triage band." accent="blue" />
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Describe symptoms</span>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={4}
                placeholder="e.g. throbbing headache, nausea since this morning…"
                className={`${fieldClass} resize-y`}
                required
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Onset (hours ago)</span>
                <input
                  type="number"
                  min={0}
                  max={720}
                  value={onsetHours}
                  onChange={(e) => setOnsetHours(e.target.value)}
                  placeholder="Optional"
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Pain (0–10)</span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={painLevel}
                  onChange={(e) => setPainLevel(e.target.value)}
                  placeholder="Optional"
                  className={fieldClass}
                />
              </label>
            </div>
          </div>
        </ContentPanel>

        <ContentPanel paddingClass="p-6 sm:p-8">
          <SectionHeader step={2} title="Vitals & demographics" accent="cyan" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Age</span>
              <input
                type="number"
                min={0}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Years"
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Temperature (°C)</span>
              <input
                type="number"
                step="0.1"
                min={30}
                max={45}
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="e.g. 37.2"
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Heart rate (bpm)</span>
              <input
                type="number"
                min={20}
                max={260}
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                placeholder="Optional"
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Oxygen sat (%)</span>
              <input
                type="number"
                min={40}
                max={100}
                value={oxygenSat}
                onChange={(e) => setOxygenSat(e.target.value)}
                placeholder="Optional"
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">BP systolic</span>
              <input
                type="number"
                min={50}
                max={260}
                value={bpSystolic}
                onChange={(e) => setBpSystolic(e.target.value)}
                placeholder="Optional"
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">BP diastolic</span>
              <input
                type="number"
                min={30}
                max={180}
                value={bpDiastolic}
                onChange={(e) => setBpDiastolic(e.target.value)}
                placeholder="Optional"
                className={fieldClass}
              />
            </label>
          </div>
        </ContentPanel>

        <ContentPanel paddingClass="p-6 sm:p-8">
          <SectionHeader step={3} title="Medical history" accent="teal" />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Conditions</span>
              <input
                type="text"
                value={existingConditions}
                onChange={(e) => setExistingConditions(e.target.value)}
                placeholder="e.g. asthma"
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Allergies</span>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. penicillin"
                className={fieldClass}
              />
            </label>
          </div>
        </ContentPanel>

        {error ? (
          <div className="rounded-2xl border border-rose-200/90 bg-gradient-to-br from-rose-50 to-white px-5 py-4 text-sm font-medium text-rose-800 shadow-sm">
            {error}
          </div>
        ) : null}
        {message ? (
          <div className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50 to-white px-5 py-4 text-sm font-medium text-emerald-900 shadow-sm">
            {message}
          </div>
        ) : null}

        <div className="flex justify-stretch pb-4 sm:justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-700 px-8 py-4 text-base font-bold text-white shadow-lg shadow-cyan-600/25 transition hover:-translate-y-0.5 hover:shadow-cyan-500/35 disabled:pointer-events-none disabled:opacity-65 sm:w-auto"
          >
            {loading ? "Saving…" : "Save intake"}
          </button>
        </div>
      </form>
    </PageContainer>
  );
}

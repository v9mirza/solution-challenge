import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";

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
      setMessage(`Saved. Token: ${data.tokenId?.slice(0, 8)}… Score: ${data.urgencyScore}`);
    } catch (err) {
      setError(err.message || "Could not save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:p-6">
      <section className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-6 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-10">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        
        <div className="relative z-10">
          <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200/60 pb-6 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Patient Intake</h1>
              <p className="mt-2 text-sm text-slate-500">Provide accurate details for immediate triage processing.</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              <Link to="/patient" className="rounded-lg border border-slate-200 bg-white/50 px-4 py-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 shadow-sm">
                Portal Home
              </Link>
              <Link to="/patient/status" className="rounded-lg bg-cyan-50 px-4 py-2 text-cyan-700 transition-colors hover:bg-cyan-100 shadow-sm">
                View Status
              </Link>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-8">
            <div className="rounded-2xl border border-slate-200/60 bg-white/40 p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">1</span>
                Primary Symptoms
              </h2>
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1 text-sm font-semibold text-slate-700">Describe your symptoms in detail</span>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={4}
                    placeholder="e.g., sharp chest pain, shortness of breath, dizziness"
                    className="w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    required
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 text-sm font-semibold text-slate-700">Symptom onset (hours ago)</span>
                    <input
                      type="number"
                      min={0}
                      max={720}
                      value={onsetHours}
                      onChange={(e) => setOnsetHours(e.target.value)}
                      placeholder="e.g., 2"
                      className="w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 text-sm font-semibold text-slate-700">Pain level (0-10)</span>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={painLevel}
                      onChange={(e) => setPainLevel(e.target.value)}
                      placeholder="0 = None, 10 = Severe"
                      className="w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-white/40 p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700">2</span>
                Vitals & Demographics
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className="block">
                  <span className="mb-1 text-sm font-semibold text-slate-700">Age</span>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Years"
                    className="w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 text-sm font-semibold text-slate-700">Temperature (°C)</span>
                  <input
                    type="number"
                    step="0.1"
                    min={30}
                    max={45}
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder="e.g., 37.5"
                    className="w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 text-sm font-semibold text-slate-700">Heart Rate (bpm)</span>
                  <input
                    type="number"
                    min={20}
                    max={260}
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    placeholder="e.g., 80"
                    className="w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 text-sm font-semibold text-slate-700">Oxygen Sat. (%)</span>
                  <input
                    type="number"
                    min={40}
                    max={100}
                    value={oxygenSat}
                    onChange={(e) => setOxygenSat(e.target.value)}
                    placeholder="e.g., 98"
                    className="w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 text-sm font-semibold text-slate-700">BP Systolic</span>
                  <input
                    type="number"
                    min={50}
                    max={260}
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(e.target.value)}
                    placeholder="e.g., 120"
                    className="w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 text-sm font-semibold text-slate-700">BP Diastolic</span>
                  <input
                    type="number"
                    min={30}
                    max={180}
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(e.target.value)}
                    placeholder="e.g., 80"
                    className="w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-white/40 p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700">3</span>
                Medical History
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 text-sm font-semibold text-slate-700">Existing Conditions</span>
                  <input
                    type="text"
                    value={existingConditions}
                    onChange={(e) => setExistingConditions(e.target.value)}
                    placeholder="e.g., asthma, diabetes"
                    className="w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 text-sm font-semibold text-slate-700">Allergies</span>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g., penicillin, peanuts"
                    className="w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                  />
                </label>
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm font-medium text-rose-700 backdrop-blur-sm">
                {error}
              </div>
            ) : null}
            {message ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm font-medium text-emerald-700 backdrop-blur-sm">
                {message}
              </div>
            ) : null}

            <div className="flex pt-2 sm:justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-cyan-500/30 transition-all hover:-translate-y-0.5 hover:shadow-cyan-500/40 disabled:pointer-events-none disabled:opacity-70 sm:w-auto sm:px-8 sm:text-lg"
              >
                {loading ? "Submitting…" : "Submit Intake"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

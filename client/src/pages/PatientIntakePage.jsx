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
    <section className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-bold tracking-tight">Patient intake</h1>
      <p className="mt-1 text-sm text-slate-500">
        <Link to="/patient/status">View status</Link> · <Link to="/patient">Patient home</Link>
      </p>
      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Symptoms
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={4}
            placeholder="Describe symptoms"
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Age
            <input
              type="number"
              min={0}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Temperature (C)
            <input
              type="number"
              step="0.1"
              min={30}
              max={45}
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Heart rate (bpm)
            <input
              type="number"
              min={20}
              max={260}
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Oxygen saturation (%)
            <input
              type="number"
              min={40}
              max={100}
              value={oxygenSat}
              onChange={(e) => setOxygenSat(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            BP systolic
            <input
              type="number"
              min={50}
              max={260}
              value={bpSystolic}
              onChange={(e) => setBpSystolic(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            BP diastolic
            <input
              type="number"
              min={30}
              max={180}
              value={bpDiastolic}
              onChange={(e) => setBpDiastolic(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Symptom onset (hours)
            <input
              type="number"
              min={0}
              max={720}
              value={onsetHours}
              onChange={(e) => setOnsetHours(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Pain level (0-10)
            <input
              type="number"
              min={0}
              max={10}
              value={painLevel}
              onChange={(e) => setPainLevel(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Existing conditions
          <input
            type="text"
            value={existingConditions}
            onChange={(e) => setExistingConditions(e.target.value)}
            placeholder="e.g. asthma, diabetes"
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Allergies
          <input
            type="text"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            placeholder="e.g. penicillin"
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-200 transition focus:border-teal-600 focus:ring"
          />
        </label>
        {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
        {message ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-fit rounded-md bg-teal-700 px-4 py-2 font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "…" : "Submit"}
        </button>
      </form>
    </section>
  );
}

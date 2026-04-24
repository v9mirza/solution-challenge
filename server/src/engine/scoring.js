/**
 * Pure decision helpers (no I/O) — import from services when you wire the engine.
 */

const CRITICAL_SYMPTOMS = [
  "chest pain",
  "shortness of breath",
  "breathing difficulty",
  "unconscious",
  "seizure",
  "stroke",
  "heart attack",
  "bleeding",
];

const MODERATE_SYMPTOMS = ["high fever", "vomiting", "dehydration", "dizziness", "fainting"];

function symptomBoost(symptoms = "") {
  const text = String(symptoms).toLowerCase();
  if (!text) return { boost: 0, label: "none" };
  if (CRITICAL_SYMPTOMS.some((term) => text.includes(term))) {
    return { boost: 25, label: "critical" };
  }
  if (MODERATE_SYMPTOMS.some((term) => text.includes(term))) {
    return { boost: 10, label: "moderate" };
  }
  return { boost: 0, label: "none" };
}

export function computePriorityScore(input = {}) {
  const severity = Number(input.severity) || 0;
  const waitMinutes = Math.min(Number(input.waitMinutes) || 0, 24 * 60);
  const icuP = Number(input.icuPressure) || 0;
  const genP = Number(input.generalPressure) || 0;
  const { boost, label } = symptomBoost(input.symptoms);
  const effectiveSeverity = Math.min(100, severity + boost);

  const score = effectiveSeverity * 0.7 + waitMinutes * 0.015 + icuP * 10 + genP * 6;

  const explanation = [
    `Base severity: ${severity.toFixed(1)}`,
    `Symptom boost (${label}): +${boost}`,
    `Effective severity weight: ${(effectiveSeverity * 0.7).toFixed(1)}`,
    `Waiting (${waitMinutes}m): ${(waitMinutes * 0.015).toFixed(1)}`,
    `Resource pressure (ICU/general): ${(icuP * 10 + genP * 6).toFixed(1)}`,
  ];

  return {
    score: Math.round(score * 100) / 100,
    explanation,
    effectiveSeverity,
  };
}

/** @returns {"icu"|"general"|"none"} */
export function suggestBedType(patient = {}) {
  const s = Number(patient.severity) || 0;
  if (s >= 80) return "icu";
  if (s >= 35) return "general";
  return "none";
}

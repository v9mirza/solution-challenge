/**
 * Pure decision helpers (no I/O) — import from services when you wire the engine.
 */

export function computePriorityScore(input = {}) {
  const severity = Number(input.severity) || 0;
  const waitMinutes = Math.min(Number(input.waitMinutes) || 0, 24 * 60);
  const icuP = Number(input.icuPressure) || 0;
  const genP = Number(input.generalPressure) || 0;

  const score = severity * 0.5 + waitMinutes * 0.02 + icuP * 15 + genP * 8;

  const explanation = [
    `Severity weight: ${(severity * 0.5).toFixed(1)}`,
    `Waiting (${waitMinutes}m): ${(waitMinutes * 0.02).toFixed(1)}`,
    `Resource pressure (ICU/general): ${(icuP * 15 + genP * 8).toFixed(1)}`,
  ];

  return { score: Math.round(score * 100) / 100, explanation };
}

/** @returns {"icu"|"general"|"none"} */
export function suggestBedType(patient = {}) {
  const s = Number(patient.severity) || 0;
  if (s >= 80) return "icu";
  if (s >= 35) return "general";
  return "none";
}

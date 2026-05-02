import { randomBytes } from "node:crypto";
import { computePriorityScore, suggestBedType } from "../engine/scoring.js";
import { Patient, SystemState } from "../models/index.js";
import Groq from "groq-sdk";

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseOptionalNumber(raw) {
  if (raw === undefined || raw === null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : NaN;
}

function validateRange(name, value, min, max) {
  if (value === null) return;
  if (!Number.isFinite(value) || value < min || value > max) {
    const err = new Error(`${name} must be between ${min} and ${max}`);
    err.status = 400;
    throw err;
  }
}

function vitalSeverityBoost(patient) {
  let boost = 0;
  if (patient.oxygenSat !== null && patient.oxygenSat < 90) boost += 25;
  if (patient.oxygenSat !== null && patient.oxygenSat >= 90 && patient.oxygenSat <= 93) boost += 10;
  if (patient.temperature !== null && patient.temperature >= 39.5) boost += 15;
  if (patient.temperature !== null && patient.temperature >= 38.5 && patient.temperature < 39.5) boost += 7;
  if (patient.heartRate !== null && patient.heartRate >= 130) boost += 15;
  if (patient.heartRate !== null && patient.heartRate >= 110 && patient.heartRate < 130) boost += 8;
  if (patient.bpSystolic !== null && patient.bpSystolic < 90) boost += 20;
  if (patient.bpSystolic !== null && patient.bpSystolic > 180) boost += 10;
  if (patient.painLevel !== null && patient.painLevel >= 8) boost += 8;
  if (patient.age !== null && patient.age >= 70) boost += 6;
  if (patient.onsetHours !== null && patient.onsetHours <= 2) boost += 5;
  return boost;
}

function getResourcePressure(capacity) {
  const icuTotal = toNumber(capacity?.icuTotal);
  const icuOccupied = toNumber(capacity?.icuOccupied);
  const generalTotal = toNumber(capacity?.generalTotal);
  const generalOccupied = toNumber(capacity?.generalOccupied);
  return {
    icuPressure: icuTotal > 0 ? icuOccupied / icuTotal : 0,
    generalPressure: generalTotal > 0 ? generalOccupied / generalTotal : 0,
  };
}

function manualOverrideActive(patient) {
  const raw = patient.manualPriorityOverride?.score;
  return raw !== null && raw !== undefined && Number.isFinite(Number(raw));
}

/** Mutates patient.bedType + patient.urgencyScore from engine (respects staff manual override for score only). */
async function recomputeDerivedQueueFields(patient) {
  const waitMinutes = patient.queuedAt
    ? Math.max(0, Math.floor((Date.now() - patient.queuedAt.getTime()) / 60000))
    : 0;
  const capacity = await SystemState.findOne({ key: "default" });
  const { icuPressure, generalPressure } = getResourcePressure(capacity);

  const vitalsBoost = vitalSeverityBoost(patient);
  const derivedSeverity = Math.min(100, Number(patient.severity || 0) + vitalsBoost);

  const { score, explanation, effectiveSeverity } = computePriorityScore({
    severity: derivedSeverity,
    symptoms: patient.symptoms,
    waitMinutes,
    icuPressure,
    generalPressure,
  });
  patient.bedType = suggestBedType({ severity: effectiveSeverity });

  const hasManualOverride = manualOverrideActive(patient);
  const rawOverride = patient.manualPriorityOverride?.score;
  patient.urgencyScore = hasManualOverride ? Number(rawOverride) : score;

  return { vitalsBoost, explanation, effectiveSeverity, score, hasManualOverride };
}

function formatPatientListItem(p) {
  return {
    id: p._id,
    fullName: p.userId?.fullName ?? null,
    email: p.userId?.email ?? null,
    tokenId: p.tokenId,
    symptoms: p.symptoms,
    severity: p.severity,
    severityColor: p.severityColor,
    age: p.age,
    temperature: p.temperature,
    heartRate: p.heartRate,
    oxygenSat: p.oxygenSat,
    bpSystolic: p.bpSystolic,
    bpDiastolic: p.bpDiastolic,
    onsetHours: p.onsetHours,
    painLevel: p.painLevel,
    urgencyScore: p.urgencyScore,
    bedType: p.bedType,
    lifecycleStatus: p.lifecycleStatus,
    staffNote: p.staffNote || "",
    manualPriorityOverride: p.manualPriorityOverride?.score ?? null,
    manualPriorityReason: p.manualPriorityOverride?.reason || "",
    queuedAt: p.queuedAt,
  };
}

export const patientService = {
  async listForStaff(user, query = {}) {
    if (user.role === "staff") {
      const q = {};
      if (query.bedType && ["icu", "general", "none"].includes(query.bedType)) {
        q.bedType = query.bedType;
      }
      if (
        query.lifecycleStatus &&
        ["waiting", "in_progress", "admitted", "discharged", "cancelled"].includes(query.lifecycleStatus)
      ) {
        q.lifecycleStatus = query.lifecycleStatus;
      }
      if (query.minUrgency !== undefined && query.minUrgency !== "") {
        const minUrgency = Number(query.minUrgency);
        if (Number.isFinite(minUrgency)) q.urgencyScore = { $gte: minUrgency };
      }
      if (query.search) {
        const pattern = String(query.search).trim();
        if (pattern) q.$or = [{ tokenId: { $regex: pattern, $options: "i" } }];
      }

      const patients = await Patient.find(q)
        .populate("userId", "fullName email")
        .sort({ urgencyScore: -1, queuedAt: 1 })
        .exec();
      let rows = patients.map(formatPatientListItem);
      if (query.search) {
        const s = String(query.search).toLowerCase();
        rows = rows.filter((p) =>
          [p.fullName, p.email, p.tokenId, p.symptoms, p.staffNote].filter(Boolean).join(" ").toLowerCase().includes(s)
        );
      }
      return { patients: rows };
    }
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  },

  async getStatusForUser(userId) {
    const patient = await Patient.findOne({ userId });
    if (!patient) return { patient: null };
    await recomputeDerivedQueueFields(patient);
    await patient.save();
    return {
      patient: {
        tokenId: patient.tokenId,
        symptoms: patient.symptoms,
        severity: patient.severity,
        severityColor: patient.severityColor,
        age: patient.age,
        temperature: patient.temperature,
        heartRate: patient.heartRate,
        oxygenSat: patient.oxygenSat,
        bpSystolic: patient.bpSystolic,
        bpDiastolic: patient.bpDiastolic,
        onsetHours: patient.onsetHours,
        painLevel: patient.painLevel,
        existingConditions: patient.existingConditions,
        allergies: patient.allergies,
        urgencyScore: patient.urgencyScore,
        bedType: patient.bedType,
        lifecycleStatus: patient.lifecycleStatus,
        staffNote: patient.staffNote || "",
        queuedAt: patient.queuedAt,
      },
    };
  },

  async setLifecycle(user, patientId, { lifecycleStatus, staffNote }) {
    if (user.role !== "staff") {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }
    const allowed = ["waiting", "in_progress", "admitted", "discharged", "cancelled"];
    if (!lifecycleStatus || !allowed.includes(lifecycleStatus)) {
      const err = new Error("Valid lifecycleStatus required");
      err.status = 400;
      throw err;
    }
    const patient = await Patient.findById(patientId);
    if (!patient) {
      const err = new Error("Patient not found");
      err.status = 404;
      throw err;
    }
    patient.lifecycleStatus = lifecycleStatus;
    if (staffNote !== undefined) patient.staffNote = String(staffNote || "").trim();
    await patient.save();
    const populated = await Patient.findById(patientId).populate("userId", "fullName email");
    return { patient: formatPatientListItem(populated) };
  },

  async setPriorityOverride(user, patientId, { score, reason }) {
    if (user.role !== "staff") {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }
    const patient = await Patient.findById(patientId);
    if (!patient) {
      const err = new Error("Patient not found");
      err.status = 404;
      throw err;
    }
    if (score === null) {
      patient.manualPriorityOverride = {
        score: null,
        reason: "",
        updatedBy: null,
        updatedAt: null,
      };
      await recomputeDerivedQueueFields(patient);
      await patient.save();
    } else {
      const numeric = Number(score);
      if (!Number.isFinite(numeric) || numeric < 0 || numeric > 100) {
        const err = new Error("score must be between 0 and 100");
        err.status = 400;
        throw err;
      }
      if (!reason || String(reason).trim().length < 3) {
        const err = new Error("reason required for override");
        err.status = 400;
        throw err;
      }
      patient.urgencyScore = numeric;
      patient.manualPriorityOverride = {
        score: numeric,
        reason: String(reason).trim(),
        updatedBy: user.id,
        updatedAt: new Date(),
      };
      await patient.save();
    }
    const populated = await Patient.findById(patientId).populate("userId", "fullName email");
    return { patient: formatPatientListItem(populated) };
  },

  async exportCsv(user, query = {}) {
    const data = await this.listForStaff(user, query);
    const header = [
      "tokenId",
      "fullName",
      "email",
      "urgencyScore",
      "severity",
      "bedType",
      "lifecycleStatus",
      "queuedAt",
      "manualPriorityOverride",
      "manualPriorityReason",
    ];
    const escape = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
    const lines = [header.join(",")];
    for (const p of data.patients) {
      lines.push(
        [
          p.tokenId,
          p.fullName,
          p.email,
          p.urgencyScore,
          p.severity,
          p.bedType,
          p.lifecycleStatus,
          p.queuedAt ? new Date(p.queuedAt).toISOString() : "",
          p.manualPriorityOverride ?? "",
          p.manualPriorityReason ?? "",
        ]
          .map(escape)
          .join(",")
      );
    }
    return lines.join("\n");
  },

  async submitIntake(userId, body) {
    let {
      symptoms,
      severity,
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
    } = body;

    let severityColor = "green";
    if (symptoms && symptoms.trim() !== "") {
      try {
        const groq = new Groq({ apiKey: process.env.GROQ_KEY });
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are a medical triage assistant. Given the symptoms, determine the severity percentage (0-100) and severity color ('red' for more serious, 'yellow' for serious, 'green' for safe). Reply in strictly valid JSON format like: { \"percentage\": 85, \"color\": \"red\" }"
            },
            {
              role: "user",
              content: `Symptoms: ${symptoms}`
            }
          ],
          model: "llama-3.1-8b-instant",
          response_format: { type: "json_object" }
        });
        const aiResult = JSON.parse(chatCompletion.choices[0]?.message?.content || '{"percentage": 0, "color": "green"}');
        severity = aiResult.percentage;
        severityColor = aiResult.color;
      } catch (err) {
        console.error("Groq API error:", err);
      }
    }

    if (severity !== undefined) {
      const s = Number(severity);
      if (!Number.isFinite(s) || s < 0 || s > 100) {
        const err = new Error("severity must be a number between 0 and 100");
        err.status = 400;
        throw err;
      }
    }

    const parsedAge = parseOptionalNumber(age);
    const parsedTemperature = parseOptionalNumber(temperature);
    const parsedHeartRate = parseOptionalNumber(heartRate);
    const parsedOxygenSat = parseOptionalNumber(oxygenSat);
    const parsedBpSystolic = parseOptionalNumber(bpSystolic);
    const parsedBpDiastolic = parseOptionalNumber(bpDiastolic);
    const parsedOnsetHours = parseOptionalNumber(onsetHours);
    const parsedPainLevel = parseOptionalNumber(painLevel);

    validateRange("age", parsedAge, 0, 120);
    validateRange("temperature", parsedTemperature, 30, 45);
    validateRange("heartRate", parsedHeartRate, 20, 260);
    validateRange("oxygenSat", parsedOxygenSat, 40, 100);
    validateRange("bpSystolic", parsedBpSystolic, 50, 260);
    validateRange("bpDiastolic", parsedBpDiastolic, 30, 180);
    validateRange("onsetHours", parsedOnsetHours, 0, 720);
    validateRange("painLevel", parsedPainLevel, 0, 10);

    let patient = await Patient.findOne({ userId });
    if (!patient) {
      patient = await Patient.create({
        userId,
        tokenId: randomBytes(12).toString("hex"),
        symptoms: symptoms ?? "",
        severity: severity ?? 0,
        severityColor: severityColor,
        age: parsedAge,
        temperature: parsedTemperature,
        heartRate: parsedHeartRate,
        oxygenSat: parsedOxygenSat,
        bpSystolic: parsedBpSystolic,
        bpDiastolic: parsedBpDiastolic,
        onsetHours: parsedOnsetHours,
        painLevel: parsedPainLevel,
        existingConditions: existingConditions ?? "",
        allergies: allergies ?? "",
        lifecycleStatus: "waiting",
        staffNote: "",
        queuedAt: new Date(),
      });
    } else {
      if (symptoms !== undefined) patient.symptoms = symptoms;
      if (severity !== undefined) patient.severity = severity;
      patient.severityColor = severityColor;
      if (age !== undefined) patient.age = parsedAge;
      if (temperature !== undefined) patient.temperature = parsedTemperature;
      if (heartRate !== undefined) patient.heartRate = parsedHeartRate;
      if (oxygenSat !== undefined) patient.oxygenSat = parsedOxygenSat;
      if (bpSystolic !== undefined) patient.bpSystolic = parsedBpSystolic;
      if (bpDiastolic !== undefined) patient.bpDiastolic = parsedBpDiastolic;
      if (onsetHours !== undefined) patient.onsetHours = parsedOnsetHours;
      if (painLevel !== undefined) patient.painLevel = parsedPainLevel;
      if (existingConditions !== undefined) patient.existingConditions = existingConditions;
      if (allergies !== undefined) patient.allergies = allergies;
      patient.queuedAt = patient.queuedAt || new Date();
    }

    const { vitalsBoost, explanation, hasManualOverride } = await recomputeDerivedQueueFields(patient);
    await patient.save();

    return {
      patientId: patient._id,
      tokenId: patient.tokenId,
      severity: patient.severity,
      severityColor: patient.severityColor,
      vitalsBoost,
      urgencyScore: patient.urgencyScore,
      bedType: patient.bedType,
      explanation: hasManualOverride
        ? `${explanation} Manual priority override applied by staff.`
        : explanation,
    };
  },
};

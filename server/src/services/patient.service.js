import { randomBytes } from "node:crypto";
import { computePriorityScore, suggestBedType } from "../engine/scoring.js";
import { Patient, SystemState } from "../models/index.js";

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

function formatPatientListItem(p) {
  return {
    id: p._id,
    fullName: p.userId?.fullName ?? null,
    email: p.userId?.email ?? null,
    tokenId: p.tokenId,
    symptoms: p.symptoms,
    severity: p.severity,
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
    queuedAt: p.queuedAt,
  };
}

export const patientService = {
  async listForStaff(user) {
    if (user.role === "staff") {
      const patients = await Patient.find()
        .populate("userId", "fullName email")
        .sort({ urgencyScore: -1, queuedAt: 1 })
        .exec();
      return { patients: patients.map(formatPatientListItem) };
    }
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  },

  async getStatusForUser(userId) {
    const patient = await Patient.findOne({ userId });
    if (!patient) return { patient: null };
    return {
      patient: {
        tokenId: patient.tokenId,
        symptoms: patient.symptoms,
        severity: patient.severity,
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
        queuedAt: patient.queuedAt,
      },
    };
  },

  async submitIntake(userId, body) {
    const {
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
        queuedAt: new Date(),
      });
    } else {
      if (symptoms !== undefined) patient.symptoms = symptoms;
      if (severity !== undefined) patient.severity = severity;
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
    const bedType = suggestBedType({ severity: effectiveSeverity });

    patient.urgencyScore = score;
    patient.bedType = bedType;
    await patient.save();

    return {
      patientId: patient._id,
      tokenId: patient.tokenId,
      severity: patient.severity,
      vitalsBoost,
      urgencyScore: patient.urgencyScore,
      bedType: patient.bedType,
      explanation,
    };
  },
};

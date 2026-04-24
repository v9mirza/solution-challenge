import { randomBytes } from "node:crypto";
import { computePriorityScore, suggestBedType } from "../engine/scoring.js";
import { Hospital, Patient } from "../models/index.js";

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getResourcePressure(hospitals) {
  if (!hospitals.length) return { icuPressure: 0, generalPressure: 0 };

  let icuTotal = 0;
  let icuOccupied = 0;
  let generalTotal = 0;
  let generalOccupied = 0;

  for (const h of hospitals) {
    icuTotal += toNumber(h.icuTotal);
    icuOccupied += toNumber(h.icuOccupied);
    generalTotal += toNumber(h.generalTotal);
    generalOccupied += toNumber(h.generalOccupied);
  }

  return {
    icuPressure: icuTotal > 0 ? icuOccupied / icuTotal : 0,
    generalPressure: generalTotal > 0 ? generalOccupied / generalTotal : 0,
  };
}

function canAllocateBed(hospital, bedType) {
  if (bedType === "icu") {
    return toNumber(hospital.icuTotal) - toNumber(hospital.icuOccupied) > 0;
  }
  if (bedType === "general") {
    return toNumber(hospital.generalTotal) - toNumber(hospital.generalOccupied) > 0;
  }
  return false;
}

async function assignHospitalForBedType(bedType) {
  if (bedType === "none") return null;
  const hospitals = await Hospital.find().sort({ createdAt: 1 }).exec();
  const match = hospitals.find((h) => canAllocateBed(h, bedType));
  return match ? match._id : null;
}

function formatPatientListItem(p) {
  return {
    id: p._id,
    fullName: p.userId?.fullName ?? null,
    email: p.userId?.email ?? null,
    tokenId: p.tokenId,
    symptoms: p.symptoms,
    severity: p.severity,
    urgencyScore: p.urgencyScore,
    bedType: p.bedType,
    queuedAt: p.queuedAt,
    hospital: p.assignedHospitalId,
  };
}

export const patientService = {
  async listForStaff(user) {
    const q = Patient.find()
      .populate("userId", "fullName email")
      .populate("assignedHospitalId", "name")
      .sort({ urgencyScore: -1, queuedAt: 1 });

    if (user.role === "admin") {
      const patients = await q.exec();
      return { patients: patients.map(formatPatientListItem) };
    }
    if (user.role === "staff" && user.hospitalId) {
      const patients = await Patient.find({
        $or: [{ assignedHospitalId: user.hospitalId }, { assignedHospitalId: null }],
      })
        .populate("userId", "fullName email")
        .populate("assignedHospitalId", "name")
        .sort({ urgencyScore: -1, queuedAt: 1 })
        .exec();
      return { patients: patients.map(formatPatientListItem) };
    }
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  },

  async getStatusForUser(userId) {
    const patient = await Patient.findOne({ userId }).populate("assignedHospitalId", "name");
    if (!patient) return { patient: null };
    return {
      patient: {
        tokenId: patient.tokenId,
        symptoms: patient.symptoms,
        severity: patient.severity,
        urgencyScore: patient.urgencyScore,
        bedType: patient.bedType,
        queuedAt: patient.queuedAt,
        hospital: patient.assignedHospitalId,
      },
    };
  },

  async submitIntake(userId, body) {
    const { symptoms, severity } = body;
    if (severity !== undefined) {
      const s = Number(severity);
      if (!Number.isFinite(s) || s < 0 || s > 100) {
        const err = new Error("severity must be a number between 0 and 100");
        err.status = 400;
        throw err;
      }
    }

    let patient = await Patient.findOne({ userId });
    if (!patient) {
      patient = await Patient.create({
        userId,
        tokenId: randomBytes(12).toString("hex"),
        symptoms: symptoms ?? "",
        severity: severity ?? 0,
        queuedAt: new Date(),
      });
    } else {
      if (symptoms !== undefined) patient.symptoms = symptoms;
      if (severity !== undefined) patient.severity = severity;
      patient.queuedAt = patient.queuedAt || new Date();
    }

    const waitMinutes = patient.queuedAt
      ? Math.max(0, Math.floor((Date.now() - patient.queuedAt.getTime()) / 60000))
      : 0;
    const hospitals = await Hospital.find().exec();
    const { icuPressure, generalPressure } = getResourcePressure(hospitals);

    const { score, explanation, effectiveSeverity } = computePriorityScore({
      severity: patient.severity,
      symptoms: patient.symptoms,
      waitMinutes,
      icuPressure,
      generalPressure,
    });
    const bedType = suggestBedType({ severity: effectiveSeverity });
    const assignedHospitalId = await assignHospitalForBedType(bedType);

    patient.urgencyScore = score;
    patient.bedType = bedType;
    patient.assignedHospitalId = assignedHospitalId;
    await patient.save();

    return {
      patientId: patient._id,
      tokenId: patient.tokenId,
      urgencyScore: patient.urgencyScore,
      bedType: patient.bedType,
      assignedHospitalId: patient.assignedHospitalId,
      explanation,
    };
  },
};

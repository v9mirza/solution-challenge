import { randomBytes } from "node:crypto";
import { Patient } from "../models/index.js";

function formatPatientListItem(p) {
  return {
    id: p._id,
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
      .populate("userId", "email")
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
        .populate("userId", "email")
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
      await patient.save();
    }
    return { patientId: patient._id, tokenId: patient.tokenId };
  },
};

import { randomBytes } from "node:crypto";
import { Patient } from "../models/index.js";

export const patientService = {
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

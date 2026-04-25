import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    tokenId: { type: String, unique: true, sparse: true },
    symptoms: { type: String, default: "" },
    severity: { type: Number, min: 0, max: 100, default: 0 },
    age: { type: Number, min: 0, max: 120, default: null },
    temperature: { type: Number, min: 30, max: 45, default: null },
    heartRate: { type: Number, min: 20, max: 260, default: null },
    oxygenSat: { type: Number, min: 40, max: 100, default: null },
    bpSystolic: { type: Number, min: 50, max: 260, default: null },
    bpDiastolic: { type: Number, min: 30, max: 180, default: null },
    onsetHours: { type: Number, min: 0, max: 720, default: null },
    painLevel: { type: Number, min: 0, max: 10, default: null },
    existingConditions: { type: String, default: "" },
    allergies: { type: String, default: "" },
    urgencyScore: { type: Number, default: 0 },
    lifecycleStatus: {
      type: String,
      enum: ["waiting", "in_progress", "admitted", "discharged", "cancelled"],
      default: "waiting",
    },
    staffNote: { type: String, default: "" },
    manualPriorityOverride: {
      score: { type: Number, default: null },
      reason: { type: String, default: "" },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      updatedAt: { type: Date, default: null },
    },
    bedType: {
      type: String,
      enum: ["icu", "general", "none"],
      default: "none",
    },
    queuedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Patient = mongoose.model("Patient", patientSchema);

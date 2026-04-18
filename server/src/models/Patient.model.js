import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    tokenId: { type: String, unique: true, sparse: true },
    symptoms: { type: String, default: "" },
    severity: { type: Number, min: 0, max: 100, default: 0 },
    urgencyScore: { type: Number, default: 0 },
    assignedHospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", default: null },
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

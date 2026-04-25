import mongoose from "mongoose";

const systemStateSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "default" },
    icuTotal: { type: Number, default: 10 },
    icuOccupied: { type: Number, default: 3 },
    generalTotal: { type: Number, default: 50 },
    generalOccupied: { type: Number, default: 20 },
  },
  { timestamps: true }
);

export const SystemState = mongoose.model("SystemState", systemStateSchema);

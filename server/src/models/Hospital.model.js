import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    icuTotal: { type: Number, default: 0 },
    icuOccupied: { type: Number, default: 0 },
    generalTotal: { type: Number, default: 0 },
    generalOccupied: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Hospital = mongoose.model("Hospital", hospitalSchema);

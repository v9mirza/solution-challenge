import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["patient", "staff", "admin"],
      default: "patient",
    },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", default: null },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);

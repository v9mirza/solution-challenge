import mongoose from "mongoose";
import "../models/index.js";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("MONGODB_URI not set — skipping MongoDB");
    return;
  }
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}

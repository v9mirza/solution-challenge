import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import { Hospital } from "../models/index.js";

async function seedHospital() {
  await connectDatabase();

  const defaultHospital = {
    name: "Main Hospital",
    icuTotal: 10,
    icuOccupied: 3,
    generalTotal: 50,
    generalOccupied: 20,
  };

  await Hospital.updateOne({ name: defaultHospital.name }, { $set: defaultHospital }, { upsert: true });
  console.log("Seeded hospital:", defaultHospital.name);
}

seedHospital()
  .catch((err) => {
    console.error("Failed to seed hospital:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

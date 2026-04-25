import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import { User } from "../models/index.js";

async function migrateRoles() {
  await connectDatabase();

  const patientToUser = await User.updateMany({ role: "patient" }, { $set: { role: "user" } });
  const adminToStaff = await User.updateMany({ role: "admin" }, { $set: { role: "staff" } });

  console.log("Updated patient -> user:", patientToUser.modifiedCount);
  console.log("Updated admin -> staff:", adminToStaff.modifiedCount);
}

migrateRoles()
  .catch((err) => {
    console.error("Role migration failed:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

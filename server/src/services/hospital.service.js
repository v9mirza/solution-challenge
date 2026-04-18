import { Hospital } from "../models/index.js";

export const hospitalService = {
  async listForStaff(user) {
    if (user.role === "staff" && user.hospitalId) {
      const h = await Hospital.findById(user.hospitalId);
      return { hospitals: h ? [h] : [] };
    }
    if (user.role === "admin") {
      const hospitals = await Hospital.find().sort({ name: 1 });
      return { hospitals };
    }
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  },

  async updateBeds(user, hospitalId, body) {
    if (user.role !== "staff" && user.role !== "admin") {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }
    if (user.role === "staff" && String(user.hospitalId) !== String(hospitalId)) {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      const err = new Error("Hospital not found");
      err.status = 404;
      throw err;
    }
    const fields = ["icuTotal", "icuOccupied", "generalTotal", "generalOccupied"];
    for (const f of fields) {
      if (body[f] !== undefined) hospital[f] = body[f];
    }
    await hospital.save();
    return { hospital };
  },
};

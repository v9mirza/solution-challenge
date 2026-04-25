import { SystemState } from "../models/index.js";

function toNonNegativeInt(name, value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
    const err = new Error(`${name} must be a non-negative integer`);
    err.status = 400;
    throw err;
  }
  return n;
}

async function getOrCreateState() {
  let state = await SystemState.findOne({ key: "default" });
  if (!state) state = await SystemState.create({ key: "default" });
  return state;
}

export const capacityService = {
  async getCapacity() {
    const state = await getOrCreateState();
    return { capacity: state };
  },

  async updateCapacity(user, body) {
    if (user.role !== "staff") {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }
    const state = await getOrCreateState();
    const fields = ["icuTotal", "icuOccupied", "generalTotal", "generalOccupied"];
    const next = {
      icuTotal: state.icuTotal,
      icuOccupied: state.icuOccupied,
      generalTotal: state.generalTotal,
      generalOccupied: state.generalOccupied,
    };
    for (const f of fields) {
      if (body[f] !== undefined) next[f] = toNonNegativeInt(f, body[f]);
    }
    if (next.icuOccupied > next.icuTotal) next.icuOccupied = next.icuTotal;
    if (next.generalOccupied > next.generalTotal) next.generalOccupied = next.generalTotal;

    state.icuTotal = next.icuTotal;
    state.icuOccupied = next.icuOccupied;
    state.generalTotal = next.generalTotal;
    state.generalOccupied = next.generalOccupied;
    await state.save();
    return { capacity: state };
  },
};

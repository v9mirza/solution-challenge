import bcrypt from "bcryptjs";
import { User } from "../models/index.js";
import { normalizeRole } from "../utils/roles.js";

const SALT_ROUNDS = 10;

function sanitizeUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    mustResetPassword: Boolean(user.mustResetPassword),
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export const adminService = {
  async listPrivilegedUsers() {
    const users = await User.find({ role: { $in: ["staff", "admin"] } })
      .sort({ role: 1, fullName: 1 })
      .select("_id fullName email role isActive mustResetPassword lastLoginAt createdAt updatedAt");
    return {
      users: users.map((u) => ({ ...sanitizeUser(u), role: normalizeRole(u.role) })),
    };
  },

  async createPrivilegedUser({ fullName, email, password, role }) {
    if (!fullName || !email || !password || !role) {
      const err = new Error("fullName, email, password and role required");
      err.status = 400;
      throw err;
    }

    if (role !== "staff") {
      const err = new Error("role must be staff");
      err.status = 400;
      throw err;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail }).select("_id");
    if (existing) {
      const err = new Error("Email already in use");
      err.status = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      fullName,
      email: normalizedEmail,
      passwordHash,
      role,
      isActive: true,
      mustResetPassword: false,
    });

    return { user: sanitizeUser(user) };
  },

  async setStaffActiveStatus(userId, { isActive }) {
    if (typeof isActive !== "boolean") {
      const err = new Error("isActive boolean required");
      err.status = 400;
      throw err;
    }
    const user = await User.findById(userId);
    if (!user || normalizeRole(user.role) !== "staff") {
      const err = new Error("Staff user not found");
      err.status = 404;
      throw err;
    }
    user.isActive = isActive;
    await user.save();
    return { user: sanitizeUser(user) };
  },

  async resetStaffPassword(userId, { newPassword }) {
    if (!newPassword || String(newPassword).length < 6) {
      const err = new Error("newPassword with min length 6 required");
      err.status = 400;
      throw err;
    }
    const user = await User.findById(userId);
    if (!user || normalizeRole(user.role) !== "staff") {
      const err = new Error("Staff user not found");
      err.status = 404;
      throw err;
    }
    user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.mustResetPassword = true;
    await user.save();
    return { user: sanitizeUser(user) };
  },
};

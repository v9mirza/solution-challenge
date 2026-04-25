import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { normalizeRole } from "../utils/roles.js";

const SALT_ROUNDS = 10;

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error("JWT_SECRET not configured");
    err.status = 500;
    throw err;
  }
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: normalizeRole(user.role),
    },
    secret,
    { expiresIn: "7d" }
  );
}

export const authService = {
  async register({ fullName, email, password }) {
    if (!fullName || !email || !password) {
      const err = new Error("fullName, email and password required");
      err.status = 400;
      throw err;
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      fullName,
      email,
      passwordHash,
      role: "user",
    });
    const token = signToken(user);
    return {
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: normalizeRole(user.role) },
    };
  },

  async login({ email, password }) {
    if (!email || !password) {
      const err = new Error("email and password required");
      err.status = 400;
      throw err;
    }
    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error("Invalid credentials");
      err.status = 401;
      throw err;
    }
    if (!user.isActive) {
      const err = new Error("Account disabled");
      err.status = 403;
      throw err;
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      const err = new Error("Invalid credentials");
      err.status = 401;
      throw err;
    }
    user.lastLoginAt = new Date();
    await user.save();
    const token = signToken(user);
    return {
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: normalizeRole(user.role),
        mustResetPassword: Boolean(user.mustResetPassword),
      },
    };
  },

  async getMe(userId) {
    const user = await User.findById(userId).select(
      "_id fullName email role isActive mustResetPassword lastLoginAt createdAt updatedAt"
    );
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    return {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: normalizeRole(user.role),
        isActive: user.isActive,
        mustResetPassword: Boolean(user.mustResetPassword),
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  },
};

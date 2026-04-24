import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

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
      role: user.role,
      hospitalId: user.hospitalId ? user.hospitalId.toString() : null,
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
      role: "patient",
    });
    const token = signToken(user);
    return {
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
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
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      const err = new Error("Invalid credentials");
      err.status = 401;
      throw err;
    }
    const token = signToken(user);
    return {
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        hospitalId: user.hospitalId,
      },
    };
  },

  async getMe(userId) {
    const user = await User.findById(userId).select(
      "_id fullName email role hospitalId createdAt updatedAt"
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
        role: user.role,
        hospitalId: user.hospitalId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  },
};

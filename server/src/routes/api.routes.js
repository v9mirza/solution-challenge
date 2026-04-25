import { Router } from "express";
import * as auth from "../controllers/auth.controller.js";
import * as patient from "../controllers/patient.controller.js";
import * as hospital from "../controllers/hospital.controller.js";
import * as admin from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRoles } from "../middleware/roles.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ ok: true, service: "smart-hospital-api" });
});

apiRouter.post("/auth/register", auth.register);
apiRouter.post("/auth/login", auth.login);
apiRouter.get("/auth/me", requireAuth, auth.me);

apiRouter.get("/patients", requireAuth, requireRoles("staff"), patient.list);
apiRouter.get("/patients/me", requireAuth, requireRoles("user"), patient.getMe);
apiRouter.post("/patients/me/intake", requireAuth, requireRoles("user"), patient.intake);

apiRouter.get("/hospitals", requireAuth, hospital.list);
apiRouter.patch("/hospitals/:id/beds", requireAuth, hospital.updateBeds);

apiRouter.get("/admin/users", requireAuth, requireRoles("staff"), admin.listUsers);
apiRouter.post("/admin/users", requireAuth, requireRoles("staff"), admin.createUser);
apiRouter.get("/staff/users", requireAuth, requireRoles("staff"), admin.listUsers);
apiRouter.post("/staff/users", requireAuth, requireRoles("staff"), admin.createUser);

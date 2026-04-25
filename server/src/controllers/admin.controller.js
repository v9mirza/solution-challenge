import { adminService } from "../services/admin.service.js";

export async function listUsers(_req, res, next) {
  try {
    const data = await adminService.listPrivilegedUsers();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function createUser(req, res, next) {
  try {
    const data = await adminService.createPrivilegedUser(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function setUserActive(req, res, next) {
  try {
    const data = await adminService.setStaffActiveStatus(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function resetUserPassword(req, res, next) {
  try {
    const data = await adminService.resetStaffPassword(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

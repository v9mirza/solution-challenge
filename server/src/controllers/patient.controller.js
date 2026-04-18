import { patientService } from "../services/patient.service.js";

export async function list(req, res, next) {
  try {
    const data = await patientService.listForStaff(req.user);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const data = await patientService.getStatusForUser(req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function intake(req, res, next) {
  try {
    const data = await patientService.submitIntake(req.user.id, req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

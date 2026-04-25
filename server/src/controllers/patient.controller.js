import { patientService } from "../services/patient.service.js";

export async function list(req, res, next) {
  try {
    const data = await patientService.listForStaff(req.user, req.query);
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

export async function setLifecycle(req, res, next) {
  try {
    const data = await patientService.setLifecycle(req.user, req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function setPriorityOverride(req, res, next) {
  try {
    const data = await patientService.setPriorityOverride(req.user, req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function exportCsv(req, res, next) {
  try {
    const csv = await patientService.exportCsv(req.user, req.query);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=\"patients-report.csv\"");
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

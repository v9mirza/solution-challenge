import { hospitalService } from "../services/hospital.service.js";

export async function list(req, res, next) {
  try {
    const data = await hospitalService.listForStaff(req.user);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateBeds(req, res, next) {
  try {
    const data = await hospitalService.updateBeds(req.user, req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

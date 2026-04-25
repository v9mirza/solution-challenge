import { capacityService } from "../services/capacity.service.js";

export async function get(req, res, next) {
  try {
    const data = await capacityService.getCapacity();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const data = await capacityService.updateCapacity(req.user, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

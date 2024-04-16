import { Router } from "express";
import scheduleController from "./schedule.controller.js";

const router = Router();
router
  .route("/")
  .get(scheduleController.getAll)
  .post(scheduleController.create)
  .delete(scheduleController.delete);

router
  .route("/:id")
  .get(scheduleController.getById)
  .patch(scheduleController.update)
  .delete(scheduleController.deleteById);

export default router;

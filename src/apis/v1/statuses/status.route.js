import { Router } from "express";
import statusController from "./status.controller.js";

const router = Router();
router
  .route("/")
  .get(statusController.getAll)
  .post(statusController.create)
  .delete(statusController.delete);

router
  .route("/:id")
  .get(statusController.getById)
  .patch(statusController.update)
  .delete(statusController.deleteById);

export default router;

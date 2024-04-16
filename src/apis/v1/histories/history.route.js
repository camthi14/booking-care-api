import { Router } from "express";
import historyController from "./history.controller.js";

const router = Router();
router
  .route("/")
  .get(historyController.getAll)
  .post(historyController.create)
  .delete(historyController.delete);

router.route("/:id").delete(historyController.deleteById);

export default router;

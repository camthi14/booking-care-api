import { Router } from "express";
import { upload } from "../../../utils/index.js";
import specialtyController from "./specialty.controller.js";

const router = Router();
router
  .route("/")
  .get(specialtyController.getAll)
  .post(upload.single("specialty_img"), specialtyController.create)
  .delete(specialtyController.delete);

router
  .route("/:id")
  .get(specialtyController.getById)
  .patch(upload.single("specialty_img"), specialtyController.update)
  .delete(specialtyController.deleteById);

export default router;

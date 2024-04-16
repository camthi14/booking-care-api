import { Router } from "express";
import { upload } from "../../../utils/index.js";
import clinicController from "./clinic.controller.js";

const router = Router();
router
  .route("/")
  .get(clinicController.getAll)
  .post(upload.single("clinic_img"), clinicController.create)
  .delete(clinicController.delete);

router.route("/getAllSpec/:id").get(clinicController.getAllSpecialtyClinic);
router.route("/countClinic").get(clinicController.getClinicCount);

router
  .route("/:id")
  .get(clinicController.getById)
  .patch(upload.single("clinic_img"), clinicController.update)
  .delete(clinicController.deleteById);

export default router;

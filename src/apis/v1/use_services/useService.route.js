import { Router } from "express";
import { upload } from "../../../utils/index.js";
import useServiceController from "./useService.controller.js";

const router = Router();
router
  .route("/")
  .get(useServiceController.getAll)
  .post(upload.single("service_img"), useServiceController.create)
  .delete(useServiceController.delete);

router.route("/filterService").get(useServiceController.getFilter);
router.route("/countService").get(useServiceController.getServiceCount);

router
  .route("/:id")
  .get(useServiceController.getById)
  .patch(upload.single("service_img"), useServiceController.update)
  .delete(useServiceController.deleteById);

export default router;

import { Router } from "express";
import { upload } from "../../../utils/index.js";
import userController from "./user.controller.js";
import authMiddleware from "../auth/auth.middleware.js";

const router = Router();
router
  .route("/")
  .get(userController.getAll)
  .post(upload.single("avatar"), userController.create)
  .delete(userController.delete);

router.get("/doctors", userController.getDoctor);
router.get("/doctors/:id", userController.getDoctorById);
router.route("/count").get(userController.getUserCount);

router
  .route("/:id")
  .get(
    [
      authMiddleware.verifyAccessToken,
      authMiddleware.getUser,
      authMiddleware.verifyByIdIsAdmin,
    ],
    userController.getById
  )
  .patch(upload.single("avatar"), userController.update)
  .delete(userController.deleteById);

export default router;

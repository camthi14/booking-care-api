import { Router } from "express";
import authController from "./auth.controller.js";
import authMiddleware from "./auth.middleware.js";

const router = Router();
router.route("/sign-up").post(authController.signUp);
router.route("/sign-out").post(authController.signOut);
router.route("/forgot-password").post(authController.forgotPassword);
router.route("/change-password").patch(authController.changePasswordForgot);
router
  .route("/sign-in")
  .post(authController.signIn)
  .get(authMiddleware.verifyAccessToken, authController.getCurrentAccount);

router
  .route("/refresh-token")
  .get(authMiddleware.verifyRefreshToken, authController.refreshToken);

export default router;

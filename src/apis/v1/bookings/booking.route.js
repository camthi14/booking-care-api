import { Router } from "express";
import bookingController from "./booking.controller.js";

const router = Router();
router
  .route("/")
  .get(
    // [authMiddleware.verifyAccessToken, authMiddleware.getUser],
    bookingController.getAll
  )
  .post(bookingController.create)
  .delete(bookingController.delete);

router.route("/countBooking").get(bookingController.getBookingCount);

router
  .route("/:id")
  .get(bookingController.getById)
  .delete(bookingController.deleteById)
  .patch(bookingController.transferStatus);

export default router;

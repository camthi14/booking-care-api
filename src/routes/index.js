import {
  authRouter,
  bookingRouter,
  clinicRouter,
  historyRouter,
  scheduleRouter,
  specialtyRouter,
  statusRouter,
  uploadRouter,
  userRouter,
  useServiceRouter,
  vnpayRouter,
  workRouter,
} from "../apis/v1/index.js";
import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  return res.json({ message: "SERVER RUNNING.." });
});

router.use("/api/v1/statuses", statusRouter);
router.use("/api/v1/users", userRouter);
router.use("/api/v1/clinics", clinicRouter);
router.use("/api/v1/specialties", specialtyRouter);
router.use("/api/v1/works", workRouter);
router.use("/api/v1/schedules", scheduleRouter);
router.use("/api/v1/use_services", useServiceRouter);
router.use("/api/v1/bookings", bookingRouter);
router.use("/api/v1/histories", historyRouter);
router.use("/api/v1/auth", authRouter);
router.use("/api/v1/uploads", uploadRouter);
router.use("/api/v1/vn-pay", vnpayRouter);

export default router;

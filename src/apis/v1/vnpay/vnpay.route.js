import { Router } from "express";
import vnPayController from "./vnpay.controller.js";

const router = Router();

router.post("/create-payment-url", vnPayController.createPaymentUrl);
router.get("/return", vnPayController.vnpayReturn);
router.post("/refund", vnPayController.vnpayRefund);

export default router;

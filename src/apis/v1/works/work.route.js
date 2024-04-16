import { Router } from "express";
import workController from "./work.controller.js";

const router = Router();
router.route("/").post(workController.create).get(workController.getAll);

export default router;

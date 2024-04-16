import { Router } from "express";
import { APIError, upload } from "../../../utils/index.js";

const router = Router();

router.post("/image", upload.single("image"), (req, res, next) => {
  try {
    const file = req.file;

    return res.json(file);
  } catch (error) {
    next(new APIError(500, error.message));
  }
});

export default router;

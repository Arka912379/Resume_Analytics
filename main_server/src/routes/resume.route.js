import { Router } from "express";
import { parsePDF, isResumeUploaded } from "../controllers/resume.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyUser } from "../middlewares/user.middleware.js";

const router = Router();

router.route("/parse").patch(verifyUser, upload.single("resume"), parsePDF);
router.route("/check").get(verifyUser, isResumeUploaded);

export default router;
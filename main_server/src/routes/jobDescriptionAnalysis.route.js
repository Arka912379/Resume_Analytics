import { Router } from "express";
import {jobDescriptionAnalysis} from "../controllers/jobDescriptionAnalysis.controller.js";
import { verifyUser } from "../middlewares/user.middleware.js";

const router = Router();

router.route("/get-job-description-analysis").post(verifyUser, jobDescriptionAnalysis);

export default router;
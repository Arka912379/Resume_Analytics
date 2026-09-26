import { Router } from "express";
import {jobDescriptionAnalysis} from "../controllers/jobDescriptionAnalysis.controller.js";
import { verifyUser } from "../middlewares/user.middleware.js";

const router = Router();

router.route("/jd/:userId").post(verifyUser, jobDescriptionAnalysis);

export default router;
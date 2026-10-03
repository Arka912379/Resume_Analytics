import {Router} from 'express';
import {findJobsForUser} from '../controllers/jobfinder.controller.js';
import { verifyUser } from "../middlewares/user.middleware.js";

const router = Router();

router.route('/find-jobs').post(verifyUser, findJobsForUser);

export default router;
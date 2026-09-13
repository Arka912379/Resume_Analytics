import {Router} from 'express';
import {
    getTotalInterviewsCount,
    getAverageInterviewScore
} from '../controllers/dashbord.controller.js';
import {verifyUser} from '../middlewares/user.middleware.js';

const router = Router();

router.route('/interview-count').get(verifyUser, getTotalInterviewsCount);
router.route('/average-interview-score').get(verifyUser, getAverageInterviewScore);

export default router;
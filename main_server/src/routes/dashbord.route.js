import {Router} from 'express';
import {
    getTotalInterviewsCount,
    getAverageInterviewScore,
    userStrikeCount,
    getUserResumeATSScore
} from '../controllers/dashbord.controller.js';
import {verifyUser} from '../middlewares/user.middleware.js';

const router = Router();

router.route('/interview-count').get(verifyUser, getTotalInterviewsCount);
router.route('/average-interview-score').get(verifyUser, getAverageInterviewScore);
router.route('/strike-count-update').get(verifyUser, userStrikeCount);
router.route('/ats-score').get(verifyUser, getUserResumeATSScore);

export default router;
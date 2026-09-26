import {Router} from 'express';
import { getUserHistory, getHistoryDataById } from '../controllers/history.controller.js';
import {verifyUser} from '../middlewares/user.middleware.js';

const router = Router();

router.route('/getUserHistory').get(verifyUser, getUserHistory);
router.route('/getHistoryDataById/:historyId').get(verifyUser, getHistoryDataById);

export default router;
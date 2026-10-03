import { Router } from 'express';
import {findJobsForUser } from '../controllers/jobfinder.controller.js';

const router = Router();

router.route('/:userId/find-jobs').post(findJobsForUser);

export default router;
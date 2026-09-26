import { Router } from 'express';
import  { jobDescriptionAnalysis } from '../controllers/jobDescriptionAnalysis.controller.js';

const router = Router();

router.route('/jd/:userId').post(jobDescriptionAnalysis);

export default router;
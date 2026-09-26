import {Router} from "express";
import {
    generateInterviewQuestions,
    sendQuestionsToCandidate,
    getCandidateResponses,
    evaluateCandidateResponses
} from "../controllers/interview.controller.js";

const router = Router();

router.route('/generate/:userId').post(generateInterviewQuestions);
 
router.route('/:interviewId/next-question').post(sendQuestionsToCandidate);
 
router.route('/:interviewId/respond').post(getCandidateResponses);
 
router.route('/:interviewId/evaluate').post(evaluateCandidateResponses);
 
export default router;
 
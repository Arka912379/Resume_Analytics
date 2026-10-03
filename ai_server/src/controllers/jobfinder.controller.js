import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import Resume from '../models/resume.model.js';
import Interview from '../models/interview.model.js';
import JobFinderResult from '../models/jobFinderResult.model.js';
import mongoose from 'mongoose';
import {runJobFinderAgent} from '../utils/jobfinderAgent.js';
import History from '../models/history.model.js';

const findJobsForUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
 
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, 'Invalid userId');
    }
 
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
 
    const alreadyRanToday = await JobFinderResult.findOne({
        userId,
        createdAt: { $gte: startOfToday },
    }).sort({ createdAt: -1 });
 
    if (alreadyRanToday) {
        throw new ApiError(
            429,
            'You can only use the job finder once per day. Please try again tomorrow.'
        );
    }
 
    const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
    if (!resume) {
        throw new ApiError(404, 'No resume found for this user');
    }
 
    const completedInterviews = await Interview.find({
        resumeId: resume._id,
        status: 'completed',
    });
 
    const scores = completedInterviews
        .map((i) => i.finalEvaluation?.overallScore)
        .filter((score) => typeof score === 'number');
 
    const interviewContext = {
        interviewsCompleted: completedInterviews.length,
        averageScore: scores.length
            ? Math.round((scores.reduce((sum, s) => sum + s, 0) / scores.length) * 100) / 100
            : null,
    };
 
    const agentResult = await runJobFinderAgent({ resume, interviewContext });
 
    if (!agentResult.jobs || agentResult.jobs.length === 0) {
        throw new ApiError(502, 'The agent could not find any matching jobs right now');
    }
 
    const savedResult = await JobFinderResult.create({
        userId,
        resumeId: resume._id,
        experienceLevel: agentResult.profile.experienceLevel,
        yearsOfExperience: agentResult.profile.yearsOfExperience,
        developerTypes: agentResult.profile.developerTypes || [],
        profileSummary: agentResult.profile.profileSummary,
        interviewContext,
        jobs: agentResult.jobs,
    });
 
    await History.create({
        userId,
        jobFinderId: savedResult._id,
        typeOfHistory: 'jobFinder',
    });
 
    return res
        .status(201)
        .json(new ApiResponse(201, savedResult, 'Job finder agent completed successfully'));
});
 
export { findJobsForUser };
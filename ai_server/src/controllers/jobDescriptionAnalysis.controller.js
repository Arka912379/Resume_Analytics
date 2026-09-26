import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import Resume from '../models/resume.model.js';
import User from '../models/user.model.js';
import History from '../models/history.model.js';
import JobDescriptionAnalysis from '../models/jobDescriptionAnalysis.model.js';
import mongoose from 'mongoose';
import { buildJobDescriptionAnalysisPrompt } from '../utils/interviewPrompts.js';
import callAIJson from '../utils/aiClient.js';

const jobDescriptionAnalysis = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { jobDescription } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, 'Invalid userId');
    }

    if (!jobDescription || typeof jobDescription !== 'string' || !jobDescription.trim()) {
        throw new ApiError(400, 'jobDescription is required');
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
    if (!resume) {
        throw new ApiError(404, 'No resume found for this user');
    }

    const { systemPrompt, userPrompt } = buildJobDescriptionAnalysisPrompt({
        resume,
        jobDescription,
    });
    const aiResult = await callAIJson(systemPrompt, userPrompt);

    if (typeof aiResult?.matchScore !== 'number') {
        throw new ApiError(502, 'AI failed to produce a valid job description analysis');
    }

    const analysisPayload = {
        userId: user._id,
        resumeId: resume._id,
        rawText: jobDescription,
        matchScore: aiResult.matchScore,
        matchedKeywords: Array.isArray(aiResult.matchedKeywords) ? aiResult.matchedKeywords : [],
        missingKeywords: Array.isArray(aiResult.missingKeywords) ? aiResult.missingKeywords : [],
        suggestions: Array.isArray(aiResult.suggestions) ? aiResult.suggestions : [],
    };

    if (aiResult.title && typeof aiResult.title === 'string' && aiResult.title.trim()) {
        analysisPayload.title = aiResult.title.trim();
    }
    if (aiResult.company && typeof aiResult.company === 'string' && aiResult.company.trim()) {
        analysisPayload.company = aiResult.company.trim();
    }

    const analysis = await JobDescriptionAnalysis.create(analysisPayload);

    await History.create({
        userId: user._id,
        jobDescriptionAnalysisId: analysis._id,
        typeOfHistory: 'jobDescriptionAnalysis',
    });

    return res
        .status(201)
        .json(new ApiResponse(201, analysis, 'Job description analysis completed successfully'));
});

export { jobDescriptionAnalysis };
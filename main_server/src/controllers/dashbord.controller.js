import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

const getTotalInterviewsCount = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    if (!userId) {
        throw new ApiError(401, 'Unauthorized');
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, 'Invalid user ID');
    }

    const result = await User.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId) } },
        {
            $lookup: {
                from: 'resumes',
                localField: '_id',
                foreignField: 'userId',
                as: 'resumes',
            },
        },
        {
            $lookup: {
                from: 'interviews',
                let: { resumeIds: '$resumes._id' },
                pipeline: [{ $match: { $expr: { $in: ['$resumeId', '$$resumeIds'] } } }],
                as: 'interviews',
            },
        },
        {
            $project: {
                _id: 1,
                fullName: 1,
                totalInterviews: { $size: '$interviews' },
            },
        },
    ]);

    const data = result?.[0];
    if (!data) {
        throw new ApiError(404, 'User not found');
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { totalInterviews: data.totalInterviews }, 'Total interviews fetched successfully'));
});

const getAverageInterviewScore = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    if (!userId) {
        throw new ApiError(401, 'Unauthorized');
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, 'Invalid user ID');
    }

    const result = await User.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId) } },
        {
            $lookup: {
                from: 'resumes',
                localField: '_id',
                foreignField: 'userId',
                as: 'resumes',
            },
        },
        {
            $lookup: {
                from: 'interviews',
                let: { resumeIds: '$resumes._id' },
                pipeline: [{ $match: { $expr: { $in: ['$resumeId', '$$resumeIds'] } } }],
                as: 'interviews',
            },
        },
        { $unwind: '$interviews' },
        { $match: { 'interviews.finalEvaluation.overallScore': { $ne: null } } },
        {
            $group: {
                _id: '$_id',
                averageScore: { $avg: '$interviews.finalEvaluation.overallScore' },
                totalEvaluatedInterviews: { $sum: 1 },
            },
        },
    ]);

    const data = result?.[0];

    if (!data) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { averageScore: 0, totalEvaluatedInterviews: 0 },
                    'No evaluated interviews found yet'
                )
            );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                averageScore: Math.round(data.averageScore * 100) / 100,
                totalEvaluatedInterviews: data.totalEvaluatedInterviews,
            },
            'Average interview score fetched successfully'
        )
    );
});

export {
    getTotalInterviewsCount,
    getAverageInterviewScore
}
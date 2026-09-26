import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import User from '../models/user.model.js';
import History from '../models/history.model.js';
import mongoose from 'mongoose';

const getUserHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }
    const historyRecords = await History.find({ userId }).sort({ createdAt: -1 });
    
    return res.status(200).json(new ApiResponse(200, historyRecords, 'User history retrieved successfully'));
})

const getHistoryDataById = asyncHandler(async (req, res) => {
    const { historyId } = req.params;
    const userId = req.user._id;
    const { typeOfHistory } = req.query;
 
    if (!userId) {
        throw new ApiError(401, 'Unauthorized');
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, 'Invalid user ID');
    }
    if (!mongoose.Types.ObjectId.isValid(historyId)) {
        throw new ApiError(400, 'Invalid history ID');
    }
 
    const historyRecord = await History.findOne({ _id: historyId, userId });
    if (!historyRecord) {
        throw new ApiError(404, 'History record not found');
    }
 
    if (typeOfHistory && typeOfHistory !== historyRecord.typeOfHistory) {
        throw new ApiError(
            400,
            `typeOfHistory query param ("${typeOfHistory}") does not match this history record ("${historyRecord.typeOfHistory}")`
        );
    }
 
    const type = historyRecord.typeOfHistory;
    let pipeline;
 
    if (type === 'resume') {
        pipeline = [
            { $match: { _id: historyRecord._id } },
            {
                $lookup: {
                    from: 'resumes',
                    localField: 'resumeId',
                    foreignField: '_id',
                    as: 'resume',
                },
            },
            { $unwind: { path: '$resume', preserveNullAndEmptyArrays: true } },
        ];
    } else if (type === 'jobDescriptionAnalysis') {
        pipeline = [
            { $match: { _id: historyRecord._id } },
            {
                $lookup: {
                    from: 'jobdescriptionanalyses',
                    localField: 'jobDescriptionAnalysisId',
                    foreignField: '_id',
                    as: 'jobDescriptionAnalysis',
                },
            },
            { $unwind: { path: '$jobDescriptionAnalysis', preserveNullAndEmptyArrays: true } },
        ];
    } else if (type === 'interview') {
        pipeline = [
            { $match: { _id: historyRecord._id } },
            {
                $lookup: {
                    from: 'interviews',
                    localField: 'interviewId',
                    foreignField: '_id',
                    as: 'interview',
                },
            },
            { $unwind: { path: '$interview', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'questions',
                    let: { interviewId: '$interview._id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$interviewId', '$$interviewId'] } } },
                        { $sort: { number: 1 } },
                    ],
                    as: 'interview.questions',
                },
            },
        ];
    } else {
        throw new ApiError(400, 'Unknown typeOfHistory on this history record');
    }
 
    const result = await History.aggregate(pipeline);
    const fullHistoryData = result?.[0];
 
    if (!fullHistoryData) {
        throw new ApiError(404, 'History details not found');
    }
 
    return res
        .status(200)
        .json(new ApiResponse(200, fullHistoryData, 'History details retrieved successfully'));
    
})

export { getUserHistory, getHistoryDataById };
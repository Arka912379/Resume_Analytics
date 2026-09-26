import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import axios from 'axios';
import mongoose from 'mongoose';
import User from '../models/user.model.js';

const AI_SERVER_URL = process.env.AI_SERVER_URL + '/api/v2/job-description-analysis';

const jobDescriptionAnalysis = asyncHandler(async (req, res) => {
    const userId = req.user._id; 
    const { jobDescription } = req.body;

    if(!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, 'Invalid userId');
    }

    if(!jobDescription) {
        throw new ApiError(400, 'Job description is required');
    }

    const user = await User.findById(userId);
    if(!user) {
        throw new ApiError(404, 'User not found');
    }

    const response = await axios.post(`${AI_SERVER_URL}/jd/${userId}`, {
        userId,
        jobDescription
    });

    if(response.status !== 200) {
        throw new ApiError(response.status, 'Failed to analyze job description');
    }

    return res.status(200).json(new ApiResponse(200, response.data, 'Job description analysis completed successfully'));
})

export { jobDescriptionAnalysis };
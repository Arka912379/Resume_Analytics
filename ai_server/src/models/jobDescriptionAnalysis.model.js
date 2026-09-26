import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const jobDescriptionAnalysisSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        resumeId: {
            type: Schema.Types.ObjectId,
            ref: 'Resume',
            required: true,
        },
        title: {
            type: String,
        },
        company: {
            type: String,
        },
        rawText: {
            type: String,
            required: true,
        },

        matchScore: {
            type: Number,
            required: true,
        },

        atsScore: {
            type: Number,
            required: false,
        },

        matchedKeywords: [String],
        missingKeywords: [String],

        suggestions: [String],
    },
    { timestamps: true }
);

const JobDescriptionAnalysis = model('JobDescriptionAnalysis', jobDescriptionAnalysisSchema);

export default JobDescriptionAnalysis;
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const jobFinderResultSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        resumeId: {
            type: Schema.Types.ObjectId,
            ref: 'Resume',
            required: true,
        },

        experienceLevel: {
            type: String,
            enum: ['fresher', 'junior', 'mid', 'senior', 'lead'],
            required: true,
        },
        yearsOfExperience: {
            type: Number,
            default: 0,
        },
        developerTypes: [{ type: String }],
        profileSummary: {
            type: String,
            required: true,
        },

        interviewContext: {
            interviewsCompleted: { type: Number, default: 0 },
            averageScore: { type: Number, default: null },
        },

        jobs: [
            {
                title: { type: String, required: true },
                company: { type: String, default: null },
                url: { type: String, required: true },
                matchReason: { type: String, default: null },
            },
        ],
    },
    { timestamps: true }
);

jobFinderResultSchema.index({ userId: 1, createdAt: -1 });

const JobFinderResult = model('JobFinderResult', jobFinderResultSchema);

export default JobFinderResult;
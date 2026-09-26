import mongoose from "mongoose";

const {Schema, model} = mongoose;

const historySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    resumeId: {
        type: Schema.Types.ObjectId,
        ref: 'Resume',
    },
    interviewId: {
        type: Schema.Types.ObjectId,
        ref: 'Interview',
    },
    jobDescriptionAnalysisId: {
        type: Schema.Types.ObjectId,
        ref: 'JobDescriptionAnalysis',
    },
    typeOfHistory: {
        type: String,
        enum: ['resume', 'interview', 'jobDescriptionAnalysis'],
        required: true,
    },
}, {timestamps:true});

const History = model("History", historySchema);

export default History;
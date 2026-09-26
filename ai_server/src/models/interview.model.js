import { Schema, model } from 'mongoose';

const interviewSchema = new Schema(
  {
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['created', 'in_progress', 'completed'],
      default: 'created',
      index: true,
    },
    maxQuestions: {
      type: Number,
      default: 10,
    },
    currentQuestionNumber: {
      type: Number,
      default: 0,
    },
    questionsAsked: {
      type: Number,
      default: 0,
    },
    questionsSkipped: {
      type: Number,
      default: 0,
    },
    plan: {
      totalQuestions: { type: Number, required: true },
      sections: [
        {
          section: { type: String, required: true },
          count: { type: Number, required: true },
        },
      ],
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    finalEvaluation: {
      overallScore: { type: Number },
      technicalScore: { type: Number },
      communicationScore: { type: Number },
      problemSolvingScore: { type: Number },
      resumeKnowledgeScore: { type: Number },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      recommendations: [{ type: String }],
      summary: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

interviewSchema.index({ resumeId: 1, status: 1 });

export const Interview = model('Interview', interviewSchema);
export default Interview;

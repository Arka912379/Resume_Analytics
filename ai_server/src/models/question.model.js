import { Schema, model } from 'mongoose';

const questionSchema = new Schema(
  {
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
      index: true,
    },
    number: {
      type: Number,
      required: true,
    },
    section: {
      type: String,
      enum: [
        'introduction',
        'skills',
        'experience',
        'projects',
        'education',
        'achievements',
        'certificates',
        'follow_up',
      ],
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    simplifiedQuestion: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    expectedTopics: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'asked', 'answered', 'skipped'],
      default: 'pending',
    },
    answer: {
      type: String,
      default: null,
    },
    evaluation: {
      score: { type: Number },
      relevance: { type: Number },
      technicalAccuracy: { type: Number },
      clarity: { type: Number },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      missingPoints: [{ type: String }],
      followUpNeeded: { type: Boolean, default: false },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

questionSchema.index({ interviewId: 1, number: 1 }, { unique: true });

export const Question = model('Question', questionSchema);
export default Question;

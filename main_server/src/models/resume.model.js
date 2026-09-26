import {Schema, model} from 'mongoose';

const resumeSchema = new Schema(
  {
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileId: {
        type: String,
    },
    extractedText: {
      type: String,
      required: true,
    },
    parsedData: {
      candidate: {
        name: { type: String, default: null },
        email: { type: String, default: null },
        phone: { type: String, default: null },
      },
      skills: [{ type: String }],
      experience: [
        {
          company: { type: String, default: null },
          role: { type: String, default: null },
          duration: { type: String, default: null },
          description: { type: String, default: null },
          technologies: [{ type: String }],
        },
      ],
      education: [
        {
          institution: { type: String, default: null },
          degree: { type: String, default: null },
          field: { type: String, default: null },
          duration: { type: String, default: null },
          description: { type: String, default: null },
        },
      ],
      projects: [
        {
          name: { type: String, default: null },
          description: { type: String, default: null },
          technologies: [{ type: String }],
          responsibilities: { type: String, default: null },
        },
      ],
      achievements: [{ type: String }],
      certificates: [{ type: String }],
    },
    atsScore: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const Resume = model('Resume', resumeSchema);
export default Resume;

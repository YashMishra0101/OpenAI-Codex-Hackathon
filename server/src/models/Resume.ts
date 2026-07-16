import mongoose, { Schema, Document } from 'mongoose';

export interface IResume extends Document {
  user: mongoose.Types.ObjectId;
  resumeText: string;
  jobDescription?: string;
  searchPreferences?: string;
  verdict: 'Strong' | 'Partial' | 'Weak';
  analysis: {
    strengths: string[];
    improvements: string[];
  };
  interviewQuestions: string[];
  searchQueries: Array<{ query: string; category: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    resumeText: { type: String, required: true },
    jobDescription: { type: String },
    searchPreferences: { type: String },
    verdict: { type: String, enum: ['Strong', 'Partial', 'Weak'], required: true },
    analysis: {
      strengths: [{ type: String }],
      improvements: [{ type: String }],
    },
    interviewQuestions: [{ type: String }],
    searchQueries: [
      {
        query: { type: String },
        category: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for fetching user's analysis history quickly
resumeSchema.index({ user: 1, createdAt: -1 });

export const Resume = mongoose.model<IResume>('Resume', resumeSchema);

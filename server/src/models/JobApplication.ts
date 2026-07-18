import mongoose, { Schema, Document } from 'mongoose';

export type JobStatus = 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'OnHold' | 'Withdrawn';

export interface IJobApplication extends Document {
  user: mongoose.Types.ObjectId;
  companyName: string;
  jobTitle: string;
  status: JobStatus;
  url?: string;
  location?: string;
  salary?: string;
  notes?: string;
  appliedDate?: Date;
  reminderCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const jobApplicationSchema = new Schema<IJobApplication>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected', 'OnHold', 'Withdrawn'],
      default: 'Saved',
    },
    url: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    salary: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
    },
    appliedDate: {
      type: Date,
    },
    reminderCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast dashboard queries and sorting
jobApplicationSchema.index({ user: 1, createdAt: -1 });
jobApplicationSchema.index({ user: 1, status: 1 });

export const JobApplication = mongoose.model<IJobApplication>('JobApplication', jobApplicationSchema);

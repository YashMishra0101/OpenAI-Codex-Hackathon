import mongoose from 'mongoose';
import { JobApplication, IJobApplication } from '../models/JobApplication.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP } from '../constants/httpStatus.js';
import type { CreateJobInput, UpdateJobInput } from '../validations/jobValidation.js';

export async function createJob(userId: string, data: CreateJobInput): Promise<IJobApplication> {
  const job = new JobApplication({
    ...data,
    user: userId,
  });
  
  await job.save();
  return job;
}

export async function getJobs(userId: string, status?: string) {
  const query: any = { user: userId };
  if (status) {
    query.status = status;
  }
  
  return JobApplication.find(query).sort({ createdAt: -1 }).lean();
}

export async function getJobById(userId: string, jobId: string) {
  const job = await JobApplication.findOne({ _id: jobId, user: userId }).lean();
  if (!job) {
    throw new ApiError(HTTP.NOT_FOUND, 'Job application not found');
  }
  return job;
}

export async function updateJob(userId: string, jobId: string, data: UpdateJobInput) {
  const job = await JobApplication.findOneAndUpdate(
    { _id: jobId, user: userId },
    { $set: data },
    { new: true, runValidators: true }
  ).lean();
  
  if (!job) {
    throw new ApiError(HTTP.NOT_FOUND, 'Job application not found');
  }
  
  return job;
}

export async function deleteJob(userId: string, jobId: string): Promise<void> {
  const result = await JobApplication.deleteOne({ _id: jobId, user: userId });
  if (result.deletedCount === 0) {
    throw new ApiError(HTTP.NOT_FOUND, 'Job application not found');
  }
}

export async function getJobDashboardStats(userId: string) {
  const stats = await JobApplication.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  // Initialize default structure
  const defaultStats = {
    Saved: 0,
    Applied: 0,
    Interview: 0,
    Offer: 0,
    Rejected: 0,
  };
  
  stats.forEach((stat) => {
    if (stat._id && stat._id in defaultStats) {
      defaultStats[stat._id as keyof typeof defaultStats] = stat.count;
    }
  });
  
  return defaultStats;
}

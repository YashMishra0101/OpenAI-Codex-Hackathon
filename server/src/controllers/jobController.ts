import type { Request, Response } from 'express';
import { HTTP } from '../constants/httpStatus.js';
import * as jobService from '../services/jobService.js';
import logger from '../utils/logger.js';
import { createJobSchema, updateJobSchema } from '../validations/jobValidation.js';

export async function createJobHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const validated = createJobSchema.parse({ body: req.body });
  
  const job = await jobService.createJob(userId, validated.body);
  logger.info('JOB_CREATED', { userId, jobId: job._id });

  res.status(HTTP.CREATED).json({
    success: true,
    data: job,
  });
}

export async function getJobsHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const status = req.query.status as string | undefined;

  const jobs = await jobService.getJobs(userId, status);

  res.status(HTTP.OK).json({
    success: true,
    data: jobs,
  });
}

export async function getJobDashboardStatsHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const stats = await jobService.getJobDashboardStats(userId);

  res.status(HTTP.OK).json({
    success: true,
    data: stats,
  });
}

export async function getJobByIdHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { id } = req.params;

  const job = await jobService.getJobById(userId, id as string);

  res.status(HTTP.OK).json({
    success: true,
    data: job,
  });
}

export async function updateJobHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { id } = req.params;
  const validated = updateJobSchema.parse({ body: req.body });

  const job = await jobService.updateJob(userId, id as string, validated.body);
  logger.info('JOB_UPDATED', { userId, jobId: job._id });

  res.status(HTTP.OK).json({
    success: true,
    data: job,
  });
}

export async function deleteJobHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { id } = req.params;

  await jobService.deleteJob(userId, id as string);
  logger.info('JOB_DELETED', { userId, jobId: id });

  res.status(HTTP.OK).json({
    success: true,
    data: null,
  });
}

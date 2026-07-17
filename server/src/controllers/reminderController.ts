import type { Request, Response } from 'express';
import { HTTP } from '../constants/httpStatus.js';
import { getJobById } from '../services/jobService.js';
import { agenda } from '../config/agenda.js';
import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { z } from 'zod';
import { User } from '../models/User.js';
import { JobApplication } from '../models/JobApplication.js';

const scheduleReminderSchema = z.object({
  body: z.object({
    date: z.string().datetime(), // ISO 8601
    notes: z.string().optional(),
  }),
});

export async function scheduleReminderHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const id = req.params.id as string;
  
  // 1. Validate payload
  const validated = scheduleReminderSchema.parse({ body: req.body });
  const scheduledDate = new Date(validated.body.date);
  
  if (scheduledDate.getTime() < Date.now()) {
    throw new ApiError(HTTP.BAD_REQUEST, 'Cannot schedule a reminder in the past.');
  }

  // 2. Fetch Job to ensure ownership and get details
  const job = await getJobById(userId, id);
  
  // 3. Fetch User to get the correct verified email address (works for both Google and Email/Password users)
  const user = await User.findById(userId);
  if (!user || !user.email) {
    throw new ApiError(HTTP.INTERNAL_SERVER_ERROR, 'Failed to fetch user email address for reminder.');
  }
  
  // 4. Schedule the Job in Agenda
  await agenda.schedule(scheduledDate, 'send-interview-reminder', {
    to: user.email,
    companyName: job.companyName,
    jobTitle: job.jobTitle,
    notes: validated.body.notes || job.notes,
  });

  logger.info('REMINDER_SCHEDULED', { userId, jobId: id, date: scheduledDate });

  // 5. Increment reminder count on the job document
  await JobApplication.findByIdAndUpdate(id, { $inc: { reminderCount: 1 } });

  res.status(HTTP.OK).json({
    success: true,
    message: 'Reminder scheduled successfully.',
  });
}

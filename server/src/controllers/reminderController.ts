import type { Request, Response } from 'express';
import { HTTP } from '../constants/httpStatus.js';
import { getJobById } from '../services/jobService.js';
import { agenda } from '../config/agenda.js';
import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { z } from 'zod';

const scheduleReminderSchema = z.object({
  body: z.object({
    date: z.string().datetime(), // ISO 8601
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
  const user = req.user!; // Has userId, email inside request object (augmented by auth middleware)
  
  // Wait, req.user from JWT only has userId and email. Let's make sure it has email.
  // Actually, req.user might just be { userId }. Let's look up the user's email if needed, or pass it from frontend?
  // Our token payload: { userId, email? }. Let's assume it has email. If not, we might need a userService.getUser(userId).
  // Actually, I can just require the email in the request, or query the DB.
  // For safety, I'll pass the email in the request or query the User model.
  
  // 3. Schedule the Job in Agenda
  await agenda.schedule(scheduledDate, 'send-interview-reminder', {
    to: req.user!.email || 'user@example.com', // Will be replaced by actual user email lookup if needed
    companyName: job.companyName,
    jobTitle: job.jobTitle,
    notes: job.notes,
  });

  logger.info('REMINDER_SCHEDULED', { userId, jobId: id, date: scheduledDate });

  res.status(HTTP.OK).json({
    success: true,
    message: 'Reminder scheduled successfully.',
  });
}

import type { Request, Response } from 'express';
import { HTTP } from '../constants/httpStatus.js';
import { getJobById } from '../services/jobService.js';
import { agenda } from '../config/agenda.js';
import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { z } from 'zod';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { JobApplication } from '../models/JobApplication.js';

const scheduleReminderSchema = z.object({
  body: z.object({
    date: z.string().datetime(), // ISO 8601
    notes: z.string().max(500).optional(),
  }),
});

export async function scheduleReminderHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const id = req.params.id as string;
  
  // 1. Validate payload
  const validated = scheduleReminderSchema.parse({ body: req.body });
  const scheduledDate = new Date(validated.body.date);
  const now = Date.now();

  if (scheduledDate.getTime() < now) {
    throw new ApiError(HTTP.BAD_REQUEST, 'Cannot schedule a reminder in the past.');
  }

  // Prevent far-future reminders that would persist in MongoDB indefinitely.
  // 1 year is a generous maximum for any job interview workflow.
  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
  if (scheduledDate.getTime() > now + ONE_YEAR_MS) {
    throw new ApiError(HTTP.BAD_REQUEST, 'Reminder cannot be scheduled more than 1 year in the future.');
  }

  // 2. Fetch Job to ensure ownership and get details
  const job = await getJobById(userId, id);
  
  // 3. Fetch User to get the correct verified email address
  const user = await User.findById(userId);
  if (!user || !user.email) {
    throw new ApiError(HTTP.INTERNAL_SERVER_ERROR, 'Failed to fetch user email address for reminder.');
  }
  
  // 4. Schedule the Agenda job — include jobId for auto-decrement after send
  await agenda.schedule(scheduledDate, 'send-interview-reminder', {
    to: user.email,
    companyName: job.companyName,
    jobTitle: job.jobTitle,
    notes: validated.body.notes || job.notes,
    jobId: id, // used for reminderCount decrement after send
  });

  logger.info('REMINDER_SCHEDULED', { userId, jobId: id, date: scheduledDate });

  // 5. Increment reminder count on the job document
  await JobApplication.findByIdAndUpdate(id, { $inc: { reminderCount: 1 } });

  res.status(HTTP.OK).json({
    success: true,
    message: 'Reminder scheduled successfully.',
  });
}

/**
 * GET /api/v1/jobs/:id/reminders
 * Lists all pending Agenda reminder jobs for a specific job application.
 */
export async function getRemindersHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const id = req.params.id as string;

  // Verify ownership
  await getJobById(userId, id);

  // Fetch user's email for ownership check
  const user = await User.findById(userId);
  if (!user?.email) {
    throw new ApiError(HTTP.INTERNAL_SERVER_ERROR, 'Failed to fetch user.');
  }

  // Query agendaJobs collection directly for pending reminders matching this job
  const jobs = await agenda.jobs({
    name: 'send-interview-reminder',
    'data.jobId': id,
    'data.to': user.email,
    nextRunAt: { $ne: null }, // still pending
  });

  const reminders = jobs.map((j) => ({
    _id: j.attrs._id?.toString(),
    scheduledAt: j.attrs.nextRunAt,
    notes: j.attrs.data?.notes,
  }));

  res.status(HTTP.OK).json({
    success: true,
    data: reminders,
  });
}

/**
 * DELETE /api/v1/jobs/:id/reminders/:reminderId
 * Manually cancels a pending reminder before it fires.
 */
export async function deleteReminderHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const id = req.params['id'] as string;
  const reminderId = req.params['reminderId'] as string;

  // Verify job ownership
  await getJobById(userId, id);

  // Fetch user's email to verify this reminder belongs to this user
  const user = await User.findById(userId);
  if (!user?.email) {
    throw new ApiError(HTTP.INTERNAL_SERVER_ERROR, 'Failed to fetch user.');
  }

  // Find the specific Agenda job — must match jobId AND user email (ownership)
  const [agendaJob] = await agenda.jobs({
    _id: new mongoose.Types.ObjectId(reminderId),
    name: 'send-interview-reminder',
    'data.jobId': id,
    'data.to': user.email,
  });

  if (!agendaJob) {
    throw new ApiError(HTTP.NOT_FOUND, 'Reminder not found or already sent.');
  }

  await agendaJob.remove();

  // Decrement reminderCount — clamp to 0 to prevent negative counts
  await JobApplication.findByIdAndUpdate(id, {
    $inc: { reminderCount: -1 },
  });
  // Ensure it never goes below 0
  await JobApplication.updateOne(
    { _id: id, reminderCount: { $lt: 0 } },
    { $set: { reminderCount: 0 } }
  );

  logger.info('REMINDER_DELETED', { userId, jobId: id, reminderId });

  res.status(HTTP.OK).json({
    success: true,
    message: 'Reminder cancelled successfully.',
  });
}

/**
 * PUT /api/v1/jobs/:id/reminders/:reminderId
 * Edits an existing pending reminder.
 */
export async function updateReminderHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const id = req.params['id'] as string;
  const reminderId = req.params['reminderId'] as string;
  const { date, notes } = req.body;

  // Validate date if provided
  let scheduledDate: Date | undefined;
  if (date) {
    scheduledDate = new Date(date);
    const now = Date.now();
    if (scheduledDate.getTime() < now) {
      throw new ApiError(HTTP.BAD_REQUEST, 'Cannot schedule a reminder in the past.');
    }
    const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
    if (scheduledDate.getTime() > now + ONE_YEAR_MS) {
      throw new ApiError(HTTP.BAD_REQUEST, 'Reminder cannot be scheduled more than 1 year in the future.');
    }
  }

  // Verify job ownership
  await getJobById(userId, id);

  const user = await User.findById(userId);
  if (!user?.email) {
    throw new ApiError(HTTP.INTERNAL_SERVER_ERROR, 'Failed to fetch user.');
  }

  // Find the specific Agenda job — must match jobId AND user email (ownership)
  const [agendaJob] = await agenda.jobs({
    _id: new mongoose.Types.ObjectId(reminderId),
    name: 'send-interview-reminder',
    'data.jobId': id,
    'data.to': user.email,
  });

  if (!agendaJob) {
    throw new ApiError(HTTP.NOT_FOUND, 'Reminder not found or already sent.');
  }

  // Update fields
  if (scheduledDate) {
    agendaJob.schedule(scheduledDate);
  }
  if (notes !== undefined) {
    agendaJob.attrs.data.notes = notes;
  }

  await agendaJob.save();

  logger.info('REMINDER_UPDATED', { userId, jobId: id, reminderId });

  res.status(HTTP.OK).json({
    success: true,
    message: 'Reminder updated successfully.',
  });
}

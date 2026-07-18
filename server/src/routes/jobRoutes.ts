import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createJobHandler,
  getJobsHandler,
  getJobDashboardStatsHandler,
  getJobByIdHandler,
  updateJobHandler,
  deleteJobHandler
} from '../controllers/jobController.js';
import {
  scheduleReminderHandler,
  getRemindersHandler,
  deleteReminderHandler,
  updateReminderHandler,
} from '../controllers/reminderController.js';

const router = Router();

// All job routes require authentication
router.use(authenticate);

// POST /api/v1/jobs
router.post('/', asyncHandler(createJobHandler));

// GET /api/v1/jobs
router.get('/', asyncHandler(getJobsHandler));

// GET /api/v1/jobs/stats
router.get('/stats', asyncHandler(getJobDashboardStatsHandler));

// GET /api/v1/jobs/:id
router.get('/:id', asyncHandler(getJobByIdHandler));

// PUT /api/v1/jobs/:id
router.put('/:id', asyncHandler(updateJobHandler));

// DELETE /api/v1/jobs/:id
router.delete('/:id', asyncHandler(deleteJobHandler));

// POST /api/v1/jobs/:id/reminders
router.post('/:id/reminders', asyncHandler(scheduleReminderHandler));

// GET /api/v1/jobs/:id/reminders
router.get('/:id/reminders', asyncHandler(getRemindersHandler));

// PUT /api/v1/jobs/:id/reminders/:reminderId
router.put('/:id/reminders/:reminderId', asyncHandler(updateReminderHandler));

// DELETE /api/v1/jobs/:id/reminders/:reminderId
router.delete('/:id/reminders/:reminderId', asyncHandler(deleteReminderHandler));

export default router;

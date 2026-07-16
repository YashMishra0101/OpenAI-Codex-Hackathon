import { Router, type Request, type Response } from 'express';
import authRoutes from './authRoutes.js';

const router = Router();

/**
 * Health check endpoint.
 *
 * Used by UptimeRobot to ping the server every 10 minutes, keeping
 * Render's free-tier server awake so Agenda.js scheduled email reminders
 * never miss their firing time due to a cold start.
 *
 * Monitor URL to configure in UptimeRobot:
 *   GET https://<your-render-url>/api/v1/health
 */
router.get('/health', (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env['NODE_ENV'] ?? 'unknown',
  });
});

// Feature routers — mounted as each phase completes
router.use('/auth', authRoutes);          // ✔ Phase 3/4
// router.use('/users', userRoutes);      ← Phase 7
// router.use('/resumes', resumeRoutes);  ← Phase 8/9
// router.use('/jobs', jobRoutes);        ← Phase 13

export default router;

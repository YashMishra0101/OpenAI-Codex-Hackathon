import type { Request, Response } from 'express';
import { HTTP } from '../constants/httpStatus.js';
import { ApiError } from '../utils/ApiError.js';
import { processAndAnalyzeResume } from '../services/resumeService.js';
import logger from '../utils/logger.js';

export async function analyzeResumeHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  
  if (!req.file) {
    throw new ApiError(HTTP.BAD_REQUEST, 'No PDF file uploaded');
  }

  const { jobDescription, searchPreferences } = req.body;

  logger.info('RESUME_ANALYSIS_STARTED', { userId });
  
  const resume = await processAndAnalyzeResume({
    userId,
    pdfPath: req.file.path,
    jobDescription,
    searchPreferences,
  });

  logger.info('RESUME_ANALYSIS_COMPLETED', { userId, resumeId: resume._id });

  res.status(HTTP.OK).json({
    success: true,
    data: resume,
  });
}

export async function getResumeHistoryHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  
  // Note: we can use pagination here later, but for MVP we fetch all.
  const { Resume } = await import('../models/Resume.js');
  const resumes = await Resume.find({ user: userId })
    .select('-resumeText') // Exclude full raw text for faster list loading
    .sort({ createdAt: -1 })
    .lean();

  res.status(HTTP.OK).json({
    success: true,
    data: resumes,
  });
}

export async function getResumeByIdHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { id } = req.params;

  const { Resume } = await import('../models/Resume.js');
  const resume = await Resume.findOne({ _id: id, user: userId }).lean();

  if (!resume) {
    throw new ApiError(HTTP.NOT_FOUND, 'Resume analysis not found');
  }

  res.status(HTTP.OK).json({
    success: true,
    data: resume,
  });
}

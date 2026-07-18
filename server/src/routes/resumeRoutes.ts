import { Router } from 'express';
import fs from 'fs/promises';
import { analyzeResumeHandler, getResumeHistoryHandler, getResumeByIdHandler, regenerateQuestionsHandler } from '../controllers/resumeController.js';
import { authenticate } from '../middlewares/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP } from '../constants/httpStatus.js';
import { validate } from '../middlewares/validate.js';
import { generateQuestionsSchema } from '../validations/resumeValidation.js';
import { z } from 'zod';
import multer from 'multer';
import os from 'os';
import path from 'path';
import type { Request, Response, NextFunction } from 'express';

// Define a separate upload config for PDFs (override fileFilter to only allow PDF)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, os.tmpdir()),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const pdfUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new ApiError(HTTP.BAD_REQUEST, 'Only PDF files are allowed.'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for PDFs
});

/**
 * Magic-byte validation middleware.
 *
 * The MIME type check in multer's fileFilter relies on the Content-Type header,
 * which an attacker can spoof. This middleware reads the first 5 bytes of the
 * uploaded file and verifies they match the PDF magic bytes (%PDF-).
 * Any file that fails this check is rejected and the temp file is cleaned up.
 */
async function validatePdfMagicBytes(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.file) return next();

  try {
    const fd = await fs.open(req.file.path, 'r');
    const header = Buffer.alloc(5);
    await fd.read(header, 0, 5, 0);
    await fd.close();

    // PDF files always begin with the magic bytes: %PDF- (hex: 25 50 44 46 2D)
    if (header.toString('ascii') !== '%PDF-') {
      await fs.unlink(req.file.path).catch(() => {}); // Clean up the invalid file
      return next(new ApiError(HTTP.BAD_REQUEST, 'Uploaded file is not a valid PDF.'));
    }
    return next();
  } catch (_err) {
    await fs.unlink(req.file.path).catch(() => {});
    return next(new ApiError(HTTP.BAD_REQUEST, 'Failed to validate uploaded file.'));
  }
}

/**
 * Validates the multipart/form-data text fields for the resume analysis endpoint.
 *
 * jobDescription and searchPreferences are injected into AI prompts — bounding
 * their length prevents prompt injection, AI token exhaustion, and server-side
 * resource abuse.
 */
const analyzeBodySchema = z.object({
  jobDescription: z
    .string()
    .max(5_000, 'Job description must be 5,000 characters or fewer')
    .optional(),
  searchPreferences: z
    .string()
    .max(1_000, 'Search preferences must be 1,000 characters or fewer')
    .optional(),
});

function validateAnalyzeBody(req: Request, _res: Response, next: NextFunction): void {
  try {
    analyzeBodySchema.parse(req.body);
    next();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid input fields.';
    next(new ApiError(HTTP.UNPROCESSABLE_ENTITY, msg));
  }
}

const router: Router = Router();

router.use(authenticate);

router.post(
  '/analyze',
  pdfUpload.single('resume'),
  validatePdfMagicBytes,
  validateAnalyzeBody,
  asyncHandler(analyzeResumeHandler),
);

// GET /api/v1/resumes
router.get('/', asyncHandler(getResumeHistoryHandler));

// GET /api/v1/resumes/:id
router.get('/:id', asyncHandler(getResumeByIdHandler));

// POST /api/v1/resumes/:id/questions
router.post('/:id/questions', validate(generateQuestionsSchema), asyncHandler(regenerateQuestionsHandler));

export default router;


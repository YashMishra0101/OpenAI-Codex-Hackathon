import { Router } from 'express';
import { analyzeResumeHandler, getResumeHistoryHandler, getResumeByIdHandler } from '../controllers/resumeController.js';
import { authenticate } from '../middlewares/auth.js';
import { uploadImage } from '../middlewares/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP } from '../constants/httpStatus.js';
import multer from 'multer';
import os from 'os';
import path from 'path';

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

const router: Router = Router();

router.use(authenticate);

router.post('/analyze', pdfUpload.single('resume'), asyncHandler(analyzeResumeHandler));

// GET /api/v1/resumes
router.get('/', asyncHandler(getResumeHistoryHandler));

// GET /api/v1/resumes/:id
router.get('/:id', asyncHandler(getResumeByIdHandler));

export default router;

import os from 'os';
import path from 'path';
import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';
import { HTTP } from '../constants/httpStatus.js';

// Use OS temporary directory to prevent Out Of Memory (OOM) crashes
// when handling multiple large file uploads concurrently.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allow images (JPEG, PNG, WebP)
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ApiError(HTTP.BAD_REQUEST, 'Only image files are allowed.'));
  }
};

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

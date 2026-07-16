import type { Request, Response } from 'express';
import { HTTP } from '../constants/httpStatus.js';
import { ApiError } from '../utils/ApiError.js';
import { getProfile, updateProfile, updateProfileImage } from '../services/userService.js';

/**
 * GET /api/v1/users/me
 * Retrieves the currently authenticated user's profile.
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const user = await getProfile(userId);
  
  res.status(HTTP.OK).json({
    success: true,
    data: user,
  });
}

/**
 * PUT /api/v1/users/me
 * Updates the user's profile information.
 */
export async function updateMe(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const user = await updateProfile(userId, req.body);
  
  res.status(HTTP.OK).json({
    success: true,
    message: 'Profile updated successfully',
    data: user,
  });
}

/**
 * PATCH /api/v1/users/me/profile-image
 * Uploads and updates the user's profile image via Cloudinary.
 */
export async function uploadProfileImage(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  
  if (!req.file) {
    throw new ApiError(HTTP.BAD_REQUEST, 'No image file provided');
  }

  // req.file.path is the absolute path to the temp file created by Multer's diskStorage
  const user = await updateProfileImage(userId, req.file.path);
  
  res.status(HTTP.OK).json({
    success: true,
    message: 'Profile image updated successfully',
    data: user,
  });
}

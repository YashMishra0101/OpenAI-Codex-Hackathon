import fs from 'fs/promises';
import argon2 from 'argon2';
import { User } from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP } from '../constants/httpStatus.js';
import { MSG } from '../constants/messages.js';
import logger from '../utils/logger.js';
import type { SafeUser } from '../types/auth.js';
import type { UpdateProfileDto } from '../validations/userValidation.js';

function toSafeUser(user: any): SafeUser {
  return {
    id: user.id || user._id.toString(),
    name: user.name,
    email: user.email,
    profileImage: user.profileImage,
    isVerified: user.isVerified,
    authProvider: user.authProvider,
  };
}

/**
 * Retrieves the current user's profile.
 */
export async function getProfile(userId: string): Promise<SafeUser> {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(HTTP.NOT_FOUND, 'User not found');
  }
  return toSafeUser(user);
}

/**
 * Updates the user's profile details (name, email, password, socialLinks).
 */
export async function updateProfile(userId: string, dto: UpdateProfileDto): Promise<SafeUser> {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ApiError(HTTP.NOT_FOUND, 'User not found');
  }

  // Handle email change -> email already exists check
  if (dto.email && dto.email !== user.email) {
    const existingEmail = await User.findOne({ email: dto.email }).lean();
    if (existingEmail) {
      throw new ApiError(HTTP.CONFLICT, MSG.EMAIL_ALREADY_EXISTS);
    }
    user.email = dto.email;
    // When changing email, the user is no longer verified until they click a new link
    user.isVerified = false;
  }

  if (dto.name) user.name = dto.name;
  if (dto.password) user.password = await argon2.hash(dto.password);

  await user.save();
  logger.info('USER_PROFILE_UPDATED', { userId });

  return toSafeUser(user);
}

/**
 * Uploads a profile picture to Cloudinary and updates the user record.
 * Crucially cleans up the temp file created by Multer's diskStorage to prevent leaks.
 */
export async function updateProfileImage(userId: string, filePath: string): Promise<SafeUser> {
  let uploadResult;

  try {
    // Upload image to Cloudinary (folder 'profiles' groups them together)
    uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: 'profiles',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });
  } catch (err: any) {
    logger.error('CLOUDINARY_UPLOAD_ERROR', { error: err.message, userId });
    throw new ApiError(HTTP.INTERNAL_SERVER_ERROR, 'Failed to upload image to cloud storage');
  } finally {
    // ALWAYS clean up the temporary file, whether upload succeeds or fails
    try {
      await fs.unlink(filePath);
    } catch (cleanupErr: any) {
      logger.error('FILE_CLEANUP_ERROR', { error: cleanupErr.message, filePath });
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { profileImage: uploadResult.secure_url },
    { new: true }
  );

  if (!user) {
    throw new ApiError(HTTP.NOT_FOUND, 'User not found');
  }

  logger.info('USER_PROFILE_IMAGE_UPDATED', { userId, imageUrl: uploadResult.secure_url });

  return toSafeUser(user);
}

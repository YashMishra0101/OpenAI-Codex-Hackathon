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

  // Password change requires verification of the current password to prevent
  // account takeover via a stolen session cookie.
  if (dto.password) {
    if (!dto.currentPassword) {
      throw new ApiError(HTTP.BAD_REQUEST, 'Current password is required to set a new password');
    }

    if (!user.password) {
      // OAuth-only accounts have no password to verify against
      throw new ApiError(HTTP.BAD_REQUEST, 'Password cannot be changed for accounts signed in with Google');
    }

    const isCurrentPasswordValid = await argon2.verify(user.password, dto.currentPassword);
    if (!isCurrentPasswordValid) {
      logger.warn('USER_PASSWORD_CHANGE_FAILED', { userId, reason: 'wrong_current_password' });
      throw new ApiError(HTTP.UNAUTHORIZED, 'Current password is incorrect');
    }

    user.password = await argon2.hash(dto.password);
  }

  await user.save();
  logger.info('USER_PROFILE_UPDATED', { userId });

  return toSafeUser(user);
}

/**
 * Helper to delete an image from Cloudinary by its stored public_id.
 * Falls back to URL-based extraction if public_id is not available (for
 * images uploaded before this field was introduced).
 */
async function deleteImageFromCloudinary(imageUrl: string, publicId?: string | null): Promise<void> {
  if (!imageUrl && !publicId) return;

  try {
    let idToDelete = publicId;

    // Fallback: extract public_id from URL for legacy records without stored public_id
    if (!idToDelete && imageUrl && imageUrl.includes('res.cloudinary.com')) {
      const parts = imageUrl.split('/');
      const folderAndFile = parts.slice(-2).join('/');
      idToDelete = folderAndFile.split('.')[0] ?? null;
    }

    if (idToDelete) {
      await cloudinary.uploader.destroy(idToDelete);
      logger.info('CLOUDINARY_IMAGE_DELETED', { publicId: idToDelete });
    }
  } catch (error: unknown) {
    logger.error('CLOUDINARY_DELETE_ERROR', { error: error instanceof Error ? error.message : String(error), imageUrl });
  }
}

/**
 * Uploads a profile picture to Cloudinary and updates the user record.
 * Crucially cleans up the temp file created by Multer's diskStorage to prevent leaks.
 */
export async function updateProfileImage(userId: string, filePath: string): Promise<SafeUser> {
  let uploadResult;
  const oldUser = await User.findById(userId).select('+profileImagePublicId');

  try {
    // Upload image to Cloudinary (folder 'profiles' groups them together)
    uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: 'profiles',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });
  } catch (err: unknown) {
    logger.error('CLOUDINARY_UPLOAD_ERROR', { error: err instanceof Error ? err.message : String(err), userId });
    throw new ApiError(HTTP.INTERNAL_SERVER_ERROR, 'Failed to upload image to cloud storage');
  } finally {
    // ALWAYS clean up the temporary file, whether upload succeeds or fails
    try {
      await fs.unlink(filePath);
    } catch (cleanupErr: unknown) {
      logger.error('FILE_CLEANUP_ERROR', { error: cleanupErr instanceof Error ? cleanupErr.message : String(cleanupErr), filePath });
    }
  }

  // Store both the secure URL and the public_id for reliable future deletion
  const user = await User.findByIdAndUpdate(
    userId,
    {
      profileImage: uploadResult.secure_url,
      profileImagePublicId: uploadResult.public_id,
    },
    { new: true }
  );

  if (!user) {
    throw new ApiError(HTTP.NOT_FOUND, 'User not found');
  }

  // Delete old image using stored public_id (preferred) or URL fallback
  if (oldUser && oldUser.profileImage) {
    await deleteImageFromCloudinary(oldUser.profileImage, oldUser.profileImagePublicId);
  }

  logger.info('USER_PROFILE_IMAGE_UPDATED', { userId, imageUrl: uploadResult.secure_url });

  return toSafeUser(user);
}

/**
 * Removes the user's profile image.
 */
export async function removeProfileImage(userId: string): Promise<SafeUser> {
  const oldUser = await User.findById(userId).select('+profileImagePublicId');
  if (!oldUser) {
    throw new ApiError(HTTP.NOT_FOUND, 'User not found');
  }

  if (oldUser.profileImage) {
    await deleteImageFromCloudinary(oldUser.profileImage, oldUser.profileImagePublicId);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { profileImage: '', $unset: { profileImagePublicId: 1 } },
    { new: true }
  );

  if (!user) {
    throw new ApiError(HTTP.NOT_FOUND, 'User not found');
  }

  logger.info('USER_PROFILE_IMAGE_REMOVED', { userId });

  return toSafeUser(user);
}

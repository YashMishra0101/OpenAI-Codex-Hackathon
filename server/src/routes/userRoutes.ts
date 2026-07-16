import { Router } from 'express';
import { getMe, updateMe, uploadProfileImage } from '../controllers/userController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { updateProfileSchema } from '../validations/userValidation.js';
import { uploadImage } from '../middlewares/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router: Router = Router();

// All user routes require authentication
router.use(authenticate);

// GET /api/v1/users/me
router.get('/me', asyncHandler(getMe));

// PUT /api/v1/users/me
router.put('/me', validate(updateProfileSchema), asyncHandler(updateMe));

// PATCH /api/v1/users/me/profile-image
// multer parses the multipart/form-data before the controller runs
router.patch('/me/profile-image', uploadImage.single('image'), asyncHandler(uploadProfileImage));

export default router;

import { Schema, model, type Document, type Model, type Types } from 'mongoose';

/**
 * User document interface — the shape of a user in MongoDB.
 *
 * Sensitive fields (password, tokens) use `select: false` in the schema
 * to exclude them from all default query results. Explicitly include them
 * only when needed: User.findOne({ email }).select('+password').
 *
 * authProvider distinguishes email/password accounts from OAuth accounts.
 * OAuth users have no password — attempting to set one is a logic error
 * that should be caught at the service layer.
 */
export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  // Excluded from default queries — only fetched when explicitly needed for auth
  password?: string;
  profileImage?: string;
  profileImagePublicId?: string;
  isVerified: boolean;
  // Token fields — excluded from default queries for security
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  refreshToken?: string;
  // OAuth fields
  googleId?: string;
  authProvider: 'email' | 'google';
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = IUser & Document<Types.ObjectId>;

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must be 100 characters or fewer'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    // select:false — never returned in default queries, must be explicitly included
    password: {
      type: String,
      select: false,
      minlength: [8, 'Password must be at least 8 characters'],
    },
    profileImage: {
      type: String,
    },
    profileImagePublicId: {
      type: String,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpiry: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpiry: {
      type: Date,
      select: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    googleId: {
      type: String,
      // sparse: only index non-null values (most email users won't have a googleId)
      sparse: true,
      index: true,
    },
    authProvider: {
      type: String,
      enum: {
        values: ['email', 'google'],
        message: 'authProvider must be "email" or "google"',
      },
      default: 'email',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound index for fast lookups by email + verification status (used in auth flows)
userSchema.index({ email: 1, isVerified: 1 });

export const User: Model<UserDocument> = model<UserDocument>('User', userSchema);

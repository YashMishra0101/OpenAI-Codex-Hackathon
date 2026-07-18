import { Schema, model, type Document, type Model, type Types } from 'mongoose';

/**
 * PendingRegistration — a temporary holding record created when a user submits
 * the registration form but has not yet verified their email address.
 *
 * Design rationale:
 *   - The real User collection only ever contains fully-verified accounts.
 *   - Unverified signups are stored here and automatically purged by MongoDB's
 *     TTL mechanism once the token expires (24 hours).
 *   - On successful email verification the pending record is atomically promoted
 *     into a real User document and then deleted from this collection.
 *
 * Security properties:
 *   - verificationToken is a 64-char hex string (32 CSPRNG bytes) — collision
 *     probability is negligible and brute-force is computationally infeasible.
 *   - MongoDB TTL index expires records server-side: no cron job required.
 *   - Upserting on re-registration rotates the token and resets the expiry,
 *     so there is never more than one pending record per email address.
 */
export interface IPendingRegistration {
  _id: Types.ObjectId;
  name: string;
  email: string;
  hashedPassword: string;
  verificationToken: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type PendingRegistrationDocument = IPendingRegistration & Document<Types.ObjectId>;

const pendingRegistrationSchema = new Schema<PendingRegistrationDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      // Unique: only one pending registration per email at a time.
      // Upsert in authService handles re-registration before verification.
      index: { unique: true },
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    verificationToken: {
      type: String,
      required: true,
      // Indexed for fast O(1) lookup when processing the verification link.
      index: { unique: true },
    },
    // TTL field — MongoDB deletes the document automatically when this date passes.
    // The TTL index background job runs approximately every 60 seconds.
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// MongoDB TTL index — documents are automatically deleted after expiresAt.
// expireAfterSeconds: 0 means "delete when the expiresAt date is reached."
pendingRegistrationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PendingRegistration: Model<PendingRegistrationDocument> =
  model<PendingRegistrationDocument>('PendingRegistration', pendingRegistrationSchema);
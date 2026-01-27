import { Schema, model } from 'mongoose';
import { TOTP } from './otp.interface';

const otpSchema = new Schema<TOTP>(
  {
    phone: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '5m' }, // ৫ মিনিট পর ডাটাবেস থেকে অটো ডিলিট হবে
    },
  },
  { timestamps: true },
);

export const OTP = model<TOTP>('OTP', otpSchema);

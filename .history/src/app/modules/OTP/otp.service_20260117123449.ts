import httpStatus from 'http-status';
import AppError from '../../errors/appError';
import { JobPost } from '../JobPost/jobPost.model';
import { OTP } from './otp.model';

const verifyOTP = async (phone: string, otp: string, jobId: string) => {
  // ১. ডাটাবেসে ওটিপি চেক করা
  const isOtpValid = await OTP.findOne({ phone, otp });

  if (!isOtpValid) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid or Expired OTP');
  }

  // ২. জব পোস্ট আপডেট করা
  const updatedJob = await JobPost.findByIdAndUpdate(
    jobId,
    { status: 'published', isOtpVerified: true },
    { new: true },
  );

  if (!updatedJob) {
    throw new AppError(httpStatus.NOT_FOUND, 'Job Post not found');
  }

  // ৩. ভেরিফাই হয়ে গেলে ওটিপি ডিলিট করে দেওয়া
  await OTP.deleteOne({ _id: isOtpValid._id });

  return updatedJob;
};

export const OTPService = {
  verifyOTP,
};

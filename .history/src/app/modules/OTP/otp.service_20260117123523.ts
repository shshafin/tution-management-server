import httpStatus from 'http-status';
import AppError from '../../errors/appError';
import { JobPost } from '../JobPost/jobPost.model';
import { OTP } from './otp.model';

const verifyOTP = async (phone: string, otp: string, jobId: string) => {
  // ১. ডাটাবেসে ওটিপি চেক করা
  const isOtpValid = await OTP.findOne({ phone, otp });

  if (!isOtpValid) {
    // এখানে ৩টি প্যারামিটার পাস করা হচ্ছে (StatusCode, Message)
    // যদি তোর AppError এ শুধু ২টা প্যারামিটার লাগে তবে নিচেরটা ঠিক আছে
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'আপনার দেওয়া ওটিপিটি সঠিক নয় অথবা মেয়াদ শেষ হয়ে গেছে!',
    );
  }

  // ২. জব পোস্ট খুঁজে বের করা এবং আপডেট করা
  const updatedJob = await JobPost.findByIdAndUpdate(
    jobId,
    {
      status: 'published',
      isOtpVerified: true,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedJob) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'দুঃখিত, এই জব পোস্টটি খুঁজে পাওয়া যায়নি!',
    );
  }

  // ৩. ভেরিফাই হয়ে গেলে ওটিপি ডিলিট করে দেওয়া (Clean up)
  await OTP.deleteOne({ _id: isOtpValid._id });

  return updatedJob;
};

export const OTPService = {
  verifyOTP,
};

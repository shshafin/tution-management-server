import httpStatus from 'http-status';
import AppError from '../../errors/appError';
import { AdminConfig } from '../AdminConfig/adminConfig.model';
import { TJobPost } from './jobPost.interface';
import { JobPost } from './jobPost.model';
import { OTP } from '../OTP/otp.model';
import { sendSMS } from '../../utils/sendSMS';

const createJobPostIntoDB = async (payload: TJobPost) => {
  const config = await AdminConfig.findOne();

  // ১. Guardrail Checks (স্যালারি লজিক)
  if (config) {
    if (payload.minSalary < config.globalMinSalary) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Invalid Salary',
        `মিনিমাম স্যালারি অবশ্যই ${config.globalMinSalary} টাকার উপরে হতে হবে।`,
      );
    }

    const allowedMaxSalary = payload.minSalary * config.salaryGapMultiplier;
    if (payload.maxSalary > allowedMaxSalary) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Salary Gap Too Large',
        `মিনিমাম এবং ম্যাক্সিমাম স্যালারির পার্থক্য অনেক বেশি! স্যালারি গ্যাপ ${config.salaryGapMultiplier} গুণের বেশি হতে পারবে না।`,
      );
    }
  }

  // ২. প্রাথমিক জব পোস্ট তৈরি (By default pending থাকবে)
  const result = await JobPost.create(payload);

  // ৩. Admin OTP Toggle Logic
  if (config?.isOtpSecurityEnabled) {
    // ৬ ডিজিটের ওটিপি জেনারেট করা
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // ওটিপি ডাটাবেসে সেভ করা ( expires index অটো হ্যান্ডেল করবে ৫ মিনিট)
    await OTP.create({
      phone: payload.guardianPhone,
      otp: otpCode,
      expiresAt: new Date(), // TTL index ৫ মিনিট পর ডিলিট করবে
    });

   
    await sendSMS(payload.guardianPhone, otpCode);

    return {
      message: 'Job post created successfully. Please verify OTP to publish.',
      jobId: result._id,
      isOtpRequired: true,
    };
  }

  
  const publishedJob = await JobPost.findByIdAndUpdate(
    result._id,
    { status: 'published', isOtpVerified: true },
    { new: true },
  );

  return {
    message: 'Job post published successfully.',
    jobId: publishedJob?._id,
    isOtpRequired: false,
  };
};

const getAllJobPostsFromDB = async () => {
  
  const result = await JobPost.find({ status: 'published' }).sort({
    createdAt: -1,
  });
  return result;
};

const getSingleJobPostFromDB = async (id: string) => {
  const result = await JobPost.findById(id);
  return result;
};

export const JobPostService = {
  createJobPostIntoDB,
  getAllJobPostsFromDB,
  getSingleJobPostFromDB,
};

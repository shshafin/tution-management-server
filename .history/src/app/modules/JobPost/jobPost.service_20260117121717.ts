import httpStatus from 'http-status';
import AppError from '../../errors/appError';
import { AdminConfig } from '../AdminConfig/adminConfig.model';
import { TJobPost } from './jobPost.interface';
import { JobPost } from './jobPost.model';

const createJobPostIntoDB = async (payload: TJobPost) => {
  // ১. অ্যাডমিন কনফিগ থেকে গ্লোবাল রুলসগুলো আনা
  const config = await AdminConfig.findOne();

  if (config) {
    // ২. Guardrail: Global Minimum Salary Check
    if (payload.minSalary < config.globalMinSalary) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Invalid Salary',
        `মিনিমাম স্যালারি অবশ্যই ${config.globalMinSalary} টাকার উপরে হতে হবে।`,
      );
    }

    // ৩. Guardrail: Salary Gap Multiplier (Typo Prevention)
    const allowedMaxSalary = payload.minSalary * config.salaryGapMultiplier;
    if (payload.maxSalary > allowedMaxSalary) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Salary Gap Too Large',
        `মিনিমাম এবং ম্যাক্সিমাম স্যালারির পার্থক্য অনেক বেশি! স্যালারি গ্যাপ ৫ গুণের বেশি হতে পারবে না।`,
      );
    }
  }

  // ৪. OTP Security Logic (প্রাথমিক অবস্থায় pending রাখা)
  // যদি ওটিপি এনাবল থাকে, তবে ফ্রন্টএন্ড থেকে ওটিপি ভেরিফাই হওয়ার পর আমরা এটাকে published করবো
  const result = await JobPost.create(payload);
  return result;
};

const getAllJobPostsFromDB = async () => {
  // শুধুমাত্র পাবলিশড জবগুলো দেখাবে
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

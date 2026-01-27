import httpStatus from 'http-status';
import AppError from '../../errors/appError';
import { AdminConfig } from '../AdminConfig/adminConfig.model';
import { TJobPost } from './jobPost.interface';
import { JobPost } from './jobPost.model';
import { OTP } from '../OTP/otp.model';
import { sendSMS } from '../../utils/sendSMS';

const createJobPostIntoDB = async (payload: TJobPost) => {
  const config = await AdminConfig.findOne();

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

  const result = await JobPost.create(payload);

  if (config?.isOtpSecurityEnabled) {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.create({
      phone: payload.guardianPhone,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
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

const getTutorJobFeedFromDB = async (query: Record<string, unknown>) => {
  // ১. শুধুমাত্র 'published' এবং 'isOtpVerified' জবগুলো নিবো
  let searchTerm = '';
  if (query?.searchTerm) {
    searchTerm = query.searchTerm as string;
  }

  // ২. সার্চ লজিক (Location, Subject, বা Class দিয়ে সার্চ)
  const searchableFields = ['location', 'subjects', 'teachingClass'];

  const searchQuery = JobPost.find({
    status: 'published',
    isOtpVerified: true,
    $or: searchableFields.map((field) => ({
      [field]: { $regex: searchTerm, $options: 'i' },
    })),
  });

  // ৩. ফিল্টারিং (Salary range, Gender preference, Medium)
  const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
  const filterQuery = { ...query };
  excludeFields.forEach((el) => delete filterQuery[el]);

  const result = await searchQuery
    .find(filterQuery)
    .sort('-createdAt') // লেটেস্ট জব আগে দেখাবে
    .populate('guardianId', 'name'); // যদি গার্ডিয়ানের নাম দেখাতে চাস

  return result;
};

export const JobPostService = {
  createJobPostIntoDB,
  getAllJobPostsFromDB,
  getSingleJobPostFromDB,
  getTutorJobFeedFromDB,
};

import httpStatus from 'http-status';
import AppError from '../../errors/appError';
import { AdminConfig } from '../AdminConfig/adminConfig.model';
import { TJobPost } from './jobPost.interface';
import { JobPost } from './jobPost.model';
import { OTP } from '../OTP/otp.model';
import { sendSMS } from '../../utils/sendSMS';

const createJobPostIntoDB = async (payload: TJobPost) => {
  const config = await AdminConfig.findOne();

  // ১. স্যালারি গার্ডরেইল চেক
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
        `স্যালারি গ্যাপ ${config.salaryGapMultiplier} গুণের বেশি হতে পারবে না।`,
      );
    }
  }

  // ২. জব পোস্ট তৈরি (Status default 'pending')
  const result = await JobPost.create(payload);

  // ৩. ওটিপি সিকিউরিটি চেক
  if (config?.isOtpSecurityEnabled) {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.create({
      phone: payload.guardianPhone,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendSMS(payload.guardianPhone, otpCode);

    return {
      message: 'Job post saved! Please verify OTP to publish.',
      jobId: result._id,
      isOtpRequired: true,
    };
  }

  // ৪. ওটিপি অফ থাকলে সরাসরি পাবলিশ
  const publishedJob = await JobPost.findByIdAndUpdate(
    result._id,
    { status: 'published', isOtpVerified: true },
    { new: true },
  );

  return {
    message: 'Job published successfully.',
    jobId: publishedJob?._id,
    isOtpRequired: false,
  };
};

const getTutorJobFeedFromDB = async (query: Record<string, unknown>) => {
  let searchTerm = '';
  if (query?.searchTerm) searchTerm = query.searchTerm as string;


  const searchableFields = ['location', 'classLevel'];

  const searchQuery = JobPost.find({
    status: 'published',
    isOtpVerified: true,
    totalApplications: { $lt: 5 },
    $or: [
      ...searchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: 'i' },
      })),
      { subjects: { $in: [new RegExp(searchTerm, 'i')] } }, // array search logic
    ],
  });

  const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
  const filterQuery = { ...query };
  excludeFields.forEach((el) => delete filterQuery[el]);

  return await searchQuery
    .find(filterQuery)
    .select('-guardianPhone -guardianEmail') 
    .sort('-createdAt');
};

const getSingleJobPostFromDB = async (id: string, role?: string) => {
  const query = JobPost.findById(id);

  // টিউটর হলে কন্টাক্ট ইনফো হাইড থাকবে
  if (role === 'tutor') {
    query.select('-guardianPhone -guardianEmail');
  }

  const result = await query;
  if (!result)
    throw new AppError(httpStatus.NOT_FOUND, 'Job post not found', '');

  return result;
};

export const JobPostService = {
  createJobPostIntoDB,
  getTutorJobFeedFromDB,
  getSingleJobPostFromDB,
};

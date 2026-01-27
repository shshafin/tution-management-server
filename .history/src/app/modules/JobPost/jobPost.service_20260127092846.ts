import httpStatus from 'http-status';
import AppError from '../../errors/appError';
import { AdminConfig } from '../AdminConfig/adminConfig.model';
import { IJobPost } from './jobPost.interface';
import { JobPost } from './jobPost.model';
import { OTP } from '../OTP/otp.model';
import { sendSMS } from '../../utils/sendSMS';

/**
 * ১. টিউশনি পোস্ট তৈরি ও পাবলিশিং লজিক
 */
const createJobPostIntoDB = async (payload: IJobPost) => {
  const config = await AdminConfig.findOne();

  if (config) {
    // স্যালারি ভ্যালিডেশন লজিক (তোর আগের লজিক অপরিবর্তিত)
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

  const result = await JobPost.create(payload);

  // OTP সিকিউরিটি হ্যান্ডেলিং
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

  // যদি OTP এনাবল না থাকে, সরাসরি পাবলিশ করে দেওয়া
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

/**
 * ২. টিউটরদের জন্য ডাইনামিক জব ফিড (Smart Filtering)
 */
const getTutorJobFeedFromDB = async (query: Record<string, unknown>) => {
  let searchTerm = '';
  if (query?.searchTerm) searchTerm = query.searchTerm as string;

  // সার্চযোগ্য ফিল্ডস
  const searchableFields = ['location', 'classLevel', 'district'];

  // বেসিক কোয়েরি (Status, OTP, and Application Limit)
  const filterQuery: any = {
    status: 'published',
    isOtpVerified: true,
    totalApplications: { $lt: 5 }, // ৫ জনের বেশি আবেদন করলে ফিডে দেখাবে না
  };

  /**
   * 🕵️‍♂️ ডাইনামিক ফিল্টারিং (Tutor Profile Match)
   * যদি কুয়েরি প্যারামিটারে টিউটর প্রোফাইলের ডেটা পাঠানো হয়
   */
  if (query.tutoringType) filterQuery.tutoringType = query.tutoringType;
  if (query.studyCategory) filterQuery.studyCategory = query.studyCategory;
  if (query.classLevel) filterQuery.classLevel = query.classLevel;
  if (query.tutorGenderPreference) {
    // 'any' অথবা টিউটরের জেন্ডার এর সাথে ম্যাচিং
    filterQuery.tutorGenderPreference = {
      $in: [query.tutorGenderPreference, 'any'],
    };
  }

  // সাবজেক্ট ব্যাকগ্রাউন্ড ফিল্টার (যদি রিকোয়ার্ড হয়)
  if (query.discipline) {
    filterQuery.$or = [
      { 'specialPreferences.isSubjectBackgroundRequired': false },
      {
        'specialPreferences.selectedSubjectBackground': {
          $in: [query.discipline],
        },
      },
    ];
  }

  // সার্চ লজিক
  const searchCondition = {
    $or: [
      ...searchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: 'i' },
      })),
      { subjects: { $in: [new RegExp(searchTerm, 'i')] } },
    ],
  };

  const excludeFields = [
    'searchTerm',
    'sort',
    'limit',
    'page',
    'fields',
    'tutoringType',
    'studyCategory',
    'classLevel',
    'tutorGenderPreference',
    'discipline',
  ];
  const finalQuery = { ...query };
  excludeFields.forEach((el) => delete finalQuery[el]);

  // কম্বাইন্ড কোয়েরি
  const resultQuery = JobPost.find({
    ...filterQuery,
    ...searchCondition,
    ...finalQuery,
  })
    .select('-guardianPhone') // টিউটর সরাসরি নাম্বার দেখবে না
    .sort(query.sort ? (query.sort as string) : '-createdAt');

  // পেজিনেশন লজিক (শাফিন, তুই চাইলে এখানে pagination মেথড অ্যাড করতে পারিস)
  return await resultQuery;
};

/**
 * ৩. সিঙ্গেল জব ডিটেইলস
 */
const getSingleJobPostFromDB = async (id: string, role?: string) => {
  const query = JobPost.findById(id);

  // রোল অনুযায়ী ডাটা হাইড করা
  if (role === 'tutor') {
    query.select('-guardianPhone');
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

import httpStatus from 'http-status';
import AppError from '../../errors/appError';
import { AdminConfig } from '../AdminConfig/adminConfig.model';
import { IJobPost } from './jobPost.interface';
import { JobPost } from './jobPost.model';
import { OTP } from '../OTP/otp.model';
import { sendSMS } from '../../utils/sendSMS';
import { TutorApplication } from '../TutorApplication/tutorApplication.model';

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
 * ২. টিউটরদের জন্য ডাইনামিক জব ফিড (Privacy Protected)
 */
const getTutorJobFeedFromDB = async (query: Record<string, any>) => {
  let searchTerm = '';
  if (query?.searchTerm) searchTerm = query.searchTerm as string;

  // ১. বেসিক ফিল্টার (পাবলিশড এবং যেগুলোতে ৫টির কম আবেদন পড়েছে)
  const filterQuery: any = {
    status: 'published',
    isOtpVerified: true,
    totalApplications: { $lt: 5 },
  };

  // ২. ডাইনামিক ফিল্টারিং (Gender, Type, Category, Class)
  if (query.tutorGender) {
    // টিউটরের জেন্ডার যদি Male হয়, তবে সে 'male' এবং 'any' দুই ধরণের জবই দেখবে
    filterQuery.tutorGenderPreference = { $in: [query.tutorGender, 'any'] };
  }
  if (query.tutoringType) filterQuery.tutoringType = query.tutoringType;
  if (query.studyCategory) filterQuery.studyCategory = query.studyCategory;
  if (query.classLevel) filterQuery.classLevel = query.classLevel;

  // ৩. সাবজেক্ট ব্যাকগ্রাউন্ড ফিল্টার (যদি টিউটরের ডিসিপ্লিন রিকোয়ারমেন্ট থাকে)
  if (query.tutorDiscipline) {
    filterQuery.$and = filterQuery.$and || [];
    filterQuery.$and.push({
      $or: [
        { 'specialPreferences.isSubjectBackgroundRequired': false },
        {
          'specialPreferences.selectedSubjectBackground': {
            $in: [query.tutorDiscipline],
          },
        },
      ],
    });
  }

  // ৪. 🚀 Geo-Spatial Radius Search (Fix)
  // যদি ইউজার 'offline' টিউশনি খুঁজে এবং সার্চ টার্ম না থাকে, তবেই রেডিয়াস কাজ করবে
  if (
    query.latitude &&
    query.longitude &&
    query.tutoringType === 'offline' &&
    !searchTerm
  ) {
    const config = await AdminConfig.findOne();
    const radiusInMeters = (config?.jobSearchRadius || 5) * 1000;

    filterQuery.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [
            parseFloat(query.longitude), // Longitude
            parseFloat(query.latitude), // Latitude
          ],
        },
        $maxDistance: radiusInMeters,
      },
    };
  }

  // ৫. স্মার্ট টেক্সট সার্চ (Area, Class, Subjects)
  let searchCondition = {};
  if (searchTerm) {
    searchCondition = {
      $or: [
        { 'location.shortArea': { $regex: searchTerm, $options: 'i' } },
        { 'location.mapAddress': { $regex: searchTerm, $options: 'i' } },
        { classLevel: { $regex: searchTerm, $options: 'i' } },
        { subjects: { $in: [new RegExp(searchTerm, 'i')] } },
      ],
    };
  }

  // ৬. কুয়েরি এক্সিকিউশন
  const finalQuery = { ...filterQuery, ...searchCondition };

  // ডিরেক্ট সর্টিং কনফ্লিক্ট এড়ানোর জন্য লজিক
  let jobQuery = JobPost.find(finalQuery).select(
    '-guardianPhone -location.detailedAddress',
  );

  // যদি রেডিয়াস সার্চ না হয়, তবেই কেবল নরমাল সর্ট (-createdAt) কাজ করবে
  // কারণ $near কুয়েরি অটোমেটিক ডিস্টেন্স অনুযায়ী সর্ট করে দেয়
  if (
    !(
      query.latitude &&
      query.longitude &&
      query.tutoringType === 'offline' &&
      !searchTerm
    )
  ) {
    jobQuery = jobQuery.sort('-createdAt');
  }

  const result = await jobQuery.lean();

  return result;
};

/**
 * ৩. সিঙ্গেল জব ডিটেইলস (Privacy & Application Logic)
 */
const getSingleJobPostFromDB = async (
  id: string,
  userId?: string,
  role?: string,
) => {
  // ১. শুরুতে ফোন ও ডিটেইল অ্যাড্রেস বাদে ডেটা নেওয়া
  const job = await JobPost.findById(id)
    .select('-guardianPhone -location.detailedAddress')
    .lean();

  if (!job) {
    // ৩টা আর্গুমেন্ট: statusCode, errorMessage, stack/extraMessage
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Job post not found',
      'ID matches no record',
    );
  }

  let isApplied = false;
  let revealedPhone = undefined;
  let revealedDetail = undefined;

  // ২. যদি টিউটর লগইন থাকে, চেক করো সে অ্যাপ্লাই করেছে কি না
  if (role === 'tutor' && userId) {
    const application = await TutorApplication.findOne({
      tutor: userId,
      jobPost: id,
    });

    if (application) {
      isApplied = true;
      // অ্যাপ্লাই করলে ডাটাবেজ থেকে আসল ফোন আর ডিটেইল অ্যাড্রেস নিয়ে আসো
      const fullData = await JobPost.findById(id)
        .select('guardianPhone location.detailedAddress')
        .lean();

      revealedPhone = fullData?.guardianPhone;
      revealedDetail = fullData?.location?.detailedAddress;
    }
  }

  // ৩. রেজাল্ট মার্জ করা (তোর ইন্টারফেস অনুযায়ী)
  return {
    ...job,
    isApplied,
    guardianPhone: isApplied ? revealedPhone : 'Apply to see contact',
    location: {
      ...job.location,
      detailedAddress: isApplied
        ? revealedDetail
        : 'Detailed address is hidden',
    },
  };
};

/**
 * ৪. জব পোস্ট আপডেট (Admin/Guardian)
 */
const updateJobPostIntoDB = async (id: string, payload: Partial<IJobPost>) => {
  const isExist = await JobPost.findById(id);
  if (!isExist) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'জব পোস্টটি খুঁজে পাওয়া যায়নি।',
      '',
    );
  }

  const result = await JobPost.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

/**
 * ৫. জব পোস্ট ডিলিট
 */
const deleteJobPostFromDB = async (id: string) => {
  const isExist = await JobPost.findById(id);
  if (!isExist) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'জব পোস্টটি খুঁজে পাওয়া যায়নি।',
      '',
    );
  }

  const result = await JobPost.findByIdAndDelete(id);
  return result;
};

/**
 * ৬. সব জব পোস্ট পাওয়া (For Admin Panel with QueryBuilder)
 */
const getAllJobsFromDB = async (query: Record<string, unknown>) => {
  let searchTerm = '';
  if (query?.searchTerm) searchTerm = query.searchTerm as string;

  // সার্চযোগ্য ফিল্ডস
  const searchableFields = ['location', 'classLevel', 'guardianPhone'];

  // সার্চ কন্ডিশন
  const searchCondition = {
    $or: [
      ...searchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: 'i' },
      })),
      { subjects: { $in: [new RegExp(searchTerm, 'i')] } },
    ],
  };

  // ফিল্টারিং লজিক (Exclude special fields)
  const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
  const filterQuery = { ...query };
  excludeFields.forEach((el) => delete filterQuery[el]);

  // Query Build করা
  let searchQuery = JobPost.find({ ...searchCondition, ...filterQuery });

  // সর্টিং (Default: latest first)
  if (query.sort) {
    searchQuery = searchQuery.sort(query.sort as string);
  } else {
    searchQuery = searchQuery.sort('-createdAt');
  }

  // পেজিনেশন
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  searchQuery = searchQuery.skip(skip).limit(limit);

  // ফিল্ড সিলেকশন
  if (query.fields) {
    const fields = (query.fields as string).split(',').join(' ');
    searchQuery = searchQuery.select(fields);
  }

  const result = await searchQuery;
  const total = await JobPost.countDocuments({
    ...searchCondition,
    ...filterQuery,
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };
};

export const JobPostService = {
  createJobPostIntoDB,
  getTutorJobFeedFromDB,
  getSingleJobPostFromDB,
  updateJobPostIntoDB,
  deleteJobPostFromDB,
  getAllJobsFromDB, // 🟢 New
};

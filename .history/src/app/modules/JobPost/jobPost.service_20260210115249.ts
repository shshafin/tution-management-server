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
 * ২. টিউটরদের জন্য ডাইনামিক জব ফিড (Smart Filtering)
 */
/**
 * ২. টিউটরদের জন্য ডাইনামিক জব ফিড (Smart Filtering with Geo-Spatial Search)
 */
const getTutorJobFeedFromDB = async (query: Record<string, any>) => {
  let searchTerm = '';
  if (query?.searchTerm) searchTerm = query.searchTerm as string;

  // ১. প্রাথমিক ফিল্টার (স্ট্যাটাস এবং অ্যাপ্লিকেশন লিমিট)
  const filterQuery: any = {
    status: 'published',
    isOtpVerified: true,
    totalApplications: { $lt: 5 },
  };

  // ২. জেন্ডার ফিল্টারিং
  if (query.tutorGender) {
    filterQuery.tutorGenderPreference = {
      $in: [query.tutorGender, 'any'],
    };
  }

  // ৩. টিউটর ডিসিপ্লিন/সাবজেক্ট ব্যাকগ্রাউন্ড ফিল্টারিং
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

  // ৪. ক্যাটাগরি এবং ক্লাস লেভেল ফিল্টারিং
  if (query.tutoringType) filterQuery.tutoringType = query.tutoringType;
  if (query.studyCategory) filterQuery.studyCategory = query.studyCategory;
  if (query.classLevel) filterQuery.classLevel = query.classLevel;

  // ৫. 🚀 জাদুকরী Geo-Spatial Filtering (Radius Search)
  // টিউটর যদি অফলাইন টিউশনি খুঁজে এবং তার লোকেশন ডাটা থাকে
  if (query.latitude && query.longitude && query.tutoringType === 'offline') {
    const config = await AdminConfig.findOne();
    const radiusInKm = config?.jobSearchRadius || 5; // অ্যাডমিন সেট করা রেডিয়াস অথবা ডিফল্ট ৫
    const radiusInMeters = radiusInKm * 1000;

    filterQuery.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [
            parseFloat(query.longitude),
            parseFloat(query.latitude),
          ], // [lng, lat]
        },
        $maxDistance: radiusInMeters,
      },
    };
  }

  // ৬. টেক্সট সার্চ কন্ডিশন (অ্যাড্রেস এবং ক্লাস লেভেল দিয়ে)
  let searchCondition = {};
  if (searchTerm) {
    searchCondition = {
      $or: [
        { 'location.address': { $regex: searchTerm, $options: 'i' } },
        { classLevel: { $regex: searchTerm, $options: 'i' } },
        { subjects: { $in: [new RegExp(searchTerm, 'i')] } },
      ],
    };
  }

  // ৭. ফিল্ড এক্সক্লুশন (Query থেকে প্যারামিটারগুলো বাদ দেওয়া)
  const excludeFields = [
    'searchTerm',
    'sort',
    'limit',
    'page',
    'fields',
    'tutorGender',
    'tutorDiscipline',
    'tutoringType',
    'studyCategory',
    'classLevel',
    'latitude',
    'longitude',
  ];

  const finalQuery = { ...query };
  excludeFields.forEach((el) => delete finalQuery[el]);

  // ৮. কোয়েরি এক্সিকিউশন
  // মনে রাখিস: $near ইউজ করলে অটোমেটিক ডিস্টেন্স অনুযায়ী সর্ট হয়, তাই ম্যানুয়াল সর্ট দরকার নেই
  const sortOrder =
    query.latitude && query.longitude
      ? ''
      : query.sort
        ? (query.sort as string)
        : '-createdAt';

  const resultQuery = JobPost.find({
    ...filterQuery,
    ...searchCondition,
    ...finalQuery,
  })
    .select('-guardianPhone')
    .sort(sortOrder);

  return await resultQuery;
};

/**
 * ৩. সিঙ্গেল জব ডিটেইলস
 */
const getSingleJobPostFromDB = async (
  id: string,
  userId?: string,
  role?: string,
) => {
  // ১. সবার জন্য জবের মেইন ডাটা কুয়েরি (ফোন নাম্বার বাদে)
  const query = JobPost.findById(id).select('-guardianPhone');

  const job = await query;
  if (!job) {
    throw new AppError(httpStatus.NOT_FOUND, 'Job post not found', '');
  }

  let isApplied = false;
  let guardianPhone = undefined;

  // ২. যদি ইউজার টিউটর হয়, তবে চেক করো সে অ্যাপ্লাই করেছে কি না
  if (role === 'tutor' && userId) {
    const application = await TutorApplication.findOne({
      tutor: userId,
      jobPost: id,
    });

    if (application) {
      isApplied = true;
      // যদি অ্যাপ্লাই করা থাকে, তবেই ডাটাবেজ থেকে ফোন নাম্বারটি আলাদা করে নিয়ে আসো
      const fullData = await JobPost.findById(id).select('guardianPhone');
      guardianPhone = fullData?.guardianPhone;
    }
  }

  // ৩. রেজাল্ট অবজেক্ট তৈরি
  const result = job.toObject();

  return {
    ...result,
    isApplied,
    guardianPhone: isApplied ? guardianPhone : undefined, // অ্যাপ্লাই করলে ফোন আসবে, নাহলে আসবে না
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

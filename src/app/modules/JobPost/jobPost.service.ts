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
  // 🔒 Duplicate Phone Number Check (same phone দিয়ে একাধিক active post block)
  const existingPost = await JobPost.findOne({
    guardianPhone: payload.guardianPhone,
    status: { $in: ['pending', 'published'] },
  });
  if (existingPost) {
    throw new AppError(
      httpStatus.CONFLICT,
      'এই নম্বর দিয়ে আগে একটি পোস্ট করা হয়েছে।',
      'Duplicate guardian phone for active job post',
    );
  }

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

  const filterQuery: any = {
    status: 'published',
    isOtpVerified: true,
    totalApplications: { $lt: 5 },
  };

  if (query.tutorGender) {
    filterQuery.tutorGenderPreference = { $in: [query.tutorGender, 'any'] };
  }
  if (query.studyCategory) filterQuery.studyCategory = query.studyCategory;
  if (query.classLevel) filterQuery.classLevel = query.classLevel;

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

  // --- TUTOR TYPE ↔ JOB MATCHING LOGIC ---
  //
  // Matching Rules:
  //   Guardian posts 'online'  → Only tutors with 'online' or 'both' can see it
  //   Guardian posts 'offline' → Only tutors with 'offline' or 'both' can see it
  //   Guardian posts 'both'    → All tutors can see it
  //
  // Tutor Types:
  //   tutorType = ['online']         → isOnline=true,  isOffline=false
  //   tutorType = ['offline']        → isOnline=false, isOffline=true
  //   tutorType = ['online','offline'] or 'both' → isOnline=true, isOffline=true

  let isOnline = false;
  let isOffline = false;

  if (query.tutorType) {
    const ttString = Array.isArray(query.tutorType)
      ? query.tutorType.join(',')
      : String(query.tutorType);
    const tt = ttString.toLowerCase();
    isOnline = tt.includes('online');
    isOffline = tt.includes('offline');
  } else {
    // tutorType পাঠানো না হলে সব দেখাবে
    isOnline = true;
    isOffline = true;
  }

  // ── Job tutoringType filter based on tutor capability ──
  // Guardian posts 'online'  → tutor must have 'online' in their tutorType
  // Guardian posts 'offline' → tutor must have 'offline' in their tutorType
  // Tutor with both online+offline → sees ALL jobs (no restriction)
  if (!query.tutoringType) {
    // Frontend থেকে explicit filter না আসলে tutor-profile-based filter লাগাও
    if (isOnline && !isOffline) {
      // online-only tutor → শুধু 'online' jobs দেখবে
      filterQuery.$and = filterQuery.$and || [];
      filterQuery.$and.push({ tutoringType: 'online' });
    } else if (!isOnline && isOffline) {
      // offline-only tutor → শুধু 'offline' jobs দেখবে
      filterQuery.$and = filterQuery.$and || [];
      filterQuery.$and.push({ tutoringType: 'offline' });
    }
    // online+offline tutor → সব jobs দেখবে (কোনো filter নেই)
  } else {
    // Frontend থেকে explicit tutoringType filter এলে সেটাই প্রাধান্য পাবে
    filterQuery.$and = filterQuery.$and || [];
    filterQuery.$and.push({ tutoringType: query.tutoringType });
  }

  // ── Location (Radius) Filter for offline-capable tutors ──
  const hasLocation = query.latitude && query.longitude;
  const config = await AdminConfig.findOne();
  const radiusInMeters = (config?.jobSearchRadius || 5) * 1000;

  if (!isOnline && isOffline) {
    // strictly offline tutor → location radius filter লাগাও
    if (hasLocation && !searchTerm) {
      filterQuery.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(query.longitude), Number(query.latitude)],
          },
          $maxDistance: radiusInMeters,
        },
      };
    } else if (!hasLocation && !searchTerm) {
      // Location নেই, search-ও নেই → কোনো job দেখাবে না
      return [];
    }
  }
  // ── END OF MATCHING LOGIC ──

  if (searchTerm) {
    // ড্যাশ ও স্পেস normalize করো: "mirpur 1" ↔ "mirpur-1"
    const normalized = searchTerm.replace(/[-\s]/g, '[-\\s]?');
    const searchRegex = new RegExp(normalized, 'i');

    // Individual words দিয়েও match করো
    const words = searchTerm.trim().split(/\s+/);
    const wordRegexes = words.map((w: string) => new RegExp(w, 'i'));

    filterQuery.$and = filterQuery.$and || [];
    filterQuery.$and.push({
      $or: [
        { 'location.shortArea': searchRegex },
        { 'location.mapAddress': searchRegex },
        { classLevel: searchRegex },
        { subjects: { $in: [searchRegex] } },
        ...wordRegexes.map((r: RegExp) => ({ 'location.shortArea': r })),
        ...wordRegexes.map((r: RegExp) => ({ 'location.mapAddress': r })),
      ],
    });
  }

  let jobQuery = JobPost.find(filterQuery).select(
    '-guardianPhone -location.detailedAddress',
  );

  const isRadiusSearch = !!filterQuery.location;
  if (!isRadiusSearch) {
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
  // admin/super_admin হলে সব data দেখাবে
  if (role === 'admin' || role === 'super_admin') {
    const job = await JobPost.findById(id).lean();
    if (!job) {
      throw new AppError(httpStatus.NOT_FOUND, 'Job post not found', '');
    }
    const applications = await TutorApplication.find({ jobPost: id })
      .populate('tutor', 'name email phone image location gender')
      .lean();
    return { ...job, applications };
  }

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
  const searchableFields = ['location', 'classLevel', 'guardianPhone', 'guardianName'];

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

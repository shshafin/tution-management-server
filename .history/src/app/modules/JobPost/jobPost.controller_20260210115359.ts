import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { JobPostService } from './jobPost.service';

/**
 * ১. টিউশনি পোস্ট তৈরি
 */
const createJobPost = catchAsync(async (req: Request, res: Response) => {
  const result = await JobPostService.createJobPostIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: result.isOtpRequired
      ? 'আপনার রিকোয়েস্টটি সেভ হয়েছে, পাবলিশ করতে OTP ভেরিফাই করুন।'
      : 'জবটি সফলভাবে পাবলিশ হয়েছে।',
    data: result,
  });
});

/**
 * ২. টিউটরদের জন্য কাস্টমাইজড জব ফিড (Smart Radius Filtering)
 */
const getTutorJobFeed = catchAsync(async (req: Request, res: Response) => {
  // req.user এ তোর লগইন করা ইউজারের ডাটা আছে (যদি auth middleware থাকে)
  const user = req.user;

  const queryData = {
    ...req.query,

    // ১. জেন্ডার প্রেফারেন্স: ইউজারের জেন্ডার অথবা ম্যানুয়াল কুয়েরি
    tutorGender: user?.gender || req.query.tutorGender,

    // ২. ডিসিপ্লিন: ইউজারের সাবজেক্ট ব্যাকগ্রাউন্ড অথবা ম্যানুয়াল কুয়েরি
    tutorDiscipline:
      user?.bachelorInfo?.discipline || req.query.tutorDiscipline,

    // ৩. জিপিএস লোকেশন:
    // যদি টিউটর লগইন করা থাকে এবং তার প্রোফাইলে লোকেশন থাকে, সেখান থেকে নেবে।
    // নতুবা যদি কেউ ম্যাপ থেকে সার্চ করে (req.query), সেখান থেকে নেবে।
    latitude: user?.location?.coordinates?.[1] || req.query.latitude,
    longitude: user?.location?.coordinates?.[0] || req.query.longitude,
  };

  // সার্ভিসে ডাটা পাঠানো
  const result = await JobPostService.getTutorJobFeedFromDB(queryData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: queryData.latitude
      ? 'আপনার এলাকার ৬ কিমি ব্যাসার্ধের সেরা জবগুলো পাওয়া গেছে।'
      : 'জব ফিড সফলভাবে লোড হয়েছে।',
    data: result,
  });
});

/**
 * ৩. সিঙ্গেল জব ডিটেইলস
 */
const getSingleJobPost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  // টোকেন থেকে আইডি এবং রোল নেওয়া (টোকেন না থাকলে undefined থাকবে, যা পাবলিক এক্সেস হিসেবে গণ্য হবে)
  const userId = req.user?.userId || req.user?.id;
  const userRole = req.user?.role;

  const result = await JobPostService.getSingleJobPostFromDB(
    id,
    userId,
    userRole,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'জব ডিটেইলস সফলভাবে পাওয়া গেছে।',
    data: result,
  });
});

/**
 * ৪. জব পোস্ট আপডেট (Admin/Guardian)
 */
const updateJobPost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await JobPostService.updateJobPostIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'জব পোস্টটি সফলভাবে আপডেট করা হয়েছে।',
    data: result,
  });
});

/**
 * ৫. জব পোস্ট ডিলিট
 */
const deleteJobPost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await JobPostService.deleteJobPostFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'জব পোস্টটি সফলভাবে রিমুভ করা হয়েছে।',
    data: null,
  });
});

/**
 * ৬. সব জব পোস্ট রিট্রিভ করা (Admin Only)
 */
const getAllJobs = catchAsync(async (req: Request, res: Response) => {
  const result = await JobPostService.getAllJobsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'সব জব পোস্ট সফলভাবে পাওয়া গেছে।',
    meta: result.meta, // Pagination info
    data: result.data,
  });
});

export const JobPostController = {
  createJobPost,
  getTutorJobFeed,
  getSingleJobPost,
  updateJobPost,
  deleteJobPost,
  getAllJobs,
};

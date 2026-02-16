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
 * ২. টিউটরদের জন্য কাস্টমাইজড জব ফিড
 */
const getTutorJobFeed = catchAsync(async (req: Request, res: Response) => {
  const user = req.user; // Auth middleware থেকে আসা ডেটা

  const queryData = {
    ...req.query,
    tutorGender: user?.gender || req.query.tutorGender,
    tutorDiscipline:
      user?.bachelorInfo?.discipline || req.query.tutorDiscipline,
    // ফোনের হার্ডওয়্যার জিপিএস বা প্রোফাইল থেকে ল্যাট-লং নেওয়া
    latitude: req.query.latitude || user?.location?.coordinates?.[1],
    longitude: req.query.longitude || user?.location?.coordinates?.[0],
  };

  const result = await JobPostService.getTutorJobFeedFromDB(queryData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message:
      result.length > 0
        ? 'আপনার জন্য সেরা টিউটরিং জবগুলো পাওয়া গেছে।'
        : 'এই মুহূর্তে কোনো জব এভেইলঅ্যাবল নেই।',
    data: result,
  });
});

/**
 * ৩. সিঙ্গেল জব ডিটেইলস
 */
const getSingleJobPost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id || req.user?.userId;
  const userRole = req.user?.role;

  const result = await JobPostService.getSingleJobPostFromDB(
    id,
    userId,
    userRole,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'জব ডিটেইলস সফলভাবে লোড হয়েছে।',
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

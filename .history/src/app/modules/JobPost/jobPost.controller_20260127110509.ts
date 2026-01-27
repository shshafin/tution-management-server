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
  // 🟢 এখানে আমরা টিউটরের প্রোফাইল ডাটা পাস করছি
  const queryData = {
    ...req.query,
    tutorGender: req.user?.gender, // টিউটরের জেন্ডার
    tutorDiscipline: req.user?.discipline, // টিউটরের পড়াশোনা
  };

  const result = await JobPostService.getTutorJobFeedFromDB(queryData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'আপনার প্রোফাইলের সাথে সামঞ্জস্যপূর্ণ জবগুলো খুঁজে পাওয়া গেছে।',
    data: result,
  });
});

/**
 * ৩. সিঙ্গেল জব ডিটেইলস
 */
const getSingleJobPost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // মিডলওয়্যার থেকে আসা ইউজার রোল (tutor/admin/super_admin)
  const userRole = req.user?.role;

  const result = await JobPostService.getSingleJobPostFromDB(id, userRole);

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

import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { TutorApplicationService } from './tutorApplication.service';
import AppError from '../../errors/appError';

const applyToJob = catchAsync(async (req, res) => {
  const tutorId = req.user.userId || req.user.id;
  const { jobPostId } = req.body;

  if (!tutorId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'ইউজার আইডি পাওয়া যায়নি। আবার লগইন করুন।',
      '',
    );
  }

  const result = await TutorApplicationService.applyToJobIntoDB(
    tutorId,
    jobPostId,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Applied to job successfully! Credit deducted.',
    data: result,
  });
});

const getMyAppliedJobs = catchAsync(async (req, res) => {
  const tutorId = req.user.userId;
  // কুয়েরি প্যারামিটার পাস করা হচ্ছে
  const result = await TutorApplicationService.getMyAppliedJobsFromDB(
    tutorId,
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'আপনার আবেদনসমূহ সফলভাবে পাওয়া গেছে।',
    meta: result.meta, // 🟢 মেটা ডাটা (প্যাগিনেশনের জন্য)
    data: result.data,
  });
});

export const TutorApplicationController = {
  applyToJob,
  getMyAppliedJobs,
};

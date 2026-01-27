import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { TutorApplicationService } from './tutorApplication.service';

// tutorApplication.controller.ts
const applyToJob = catchAsync(async (req, res) => {
  // তোর টোকেনে "userId" আছে, "id" না। তাই এটা চেঞ্জ কর:
  const tutorId = req.user.userId || req.user.id; 
  const { jobPostId } = req.body;

  if (!tutorId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "ইউজার আইডি পাওয়া যায়নি। আবার লগইন করুন।", "");
  }

  const result = await TutorApplicationService.applyToJobIntoDB(tutorId, jobPostId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Applied to job successfully! Credit deducted.',
    data: result,
  });
});

const getMyAppliedJobs = catchAsync(async (req, res) => {
  const tutorId = req.user.id;
  const result = await TutorApplicationService.getMyAppliedJobsFromDB(tutorId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My applied jobs retrieved successfully with contact info.',
    data: result,
  });
});

export const TutorApplicationController = {
  applyToJob,
  getMyAppliedJobs,
};

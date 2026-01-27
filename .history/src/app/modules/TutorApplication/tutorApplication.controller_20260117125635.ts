import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { TutorApplicationService } from './tutorApplication.service';

const applyToJob = catchAsync(async (req, res) => {
  const tutorId = req.user.id; // Auth Middleware থেকে আসবে
  const { jobPostId } = req.body;

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

export const TutorApplicationController = {
  applyToJob,
};

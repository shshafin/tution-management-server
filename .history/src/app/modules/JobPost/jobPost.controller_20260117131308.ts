import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { JobPostService } from './jobPost.service';

const createJobPost = catchAsync(async (req: Request, res: Response) => {
  const result = await JobPostService.createJobPostIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: result.isOtpRequired
      ? 'Job post created! Please verify OTP.'
      : 'Job post published successfully!',
    data: result,
  });
});

const getTutorJobFeed = catchAsync(async (req: Request, res: Response) => {
  const result = await JobPostService.getTutorJobFeedFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Job feed retrieved successfully',
    data: result,
  });
});

const getAllJobPosts = catchAsync(async (req: Request, res: Response) => {
  const result = await JobPostService.getAllJobPostsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Job posts retrieved successfully',
    data: result,
  });
});

const getSingleJobPost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await JobPostService.getSingleJobPostFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Job post retrieved successfully',
    data: result,
  });
});

export const JobPostController = {
  createJobPost,
  getTutorJobFeed,
  getAllJobPosts,
  getSingleJobPost,
};

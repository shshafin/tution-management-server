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
    message: 'Success',
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

const getSingleJobPost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userRole = req.user?.role;

  const result = await JobPostService.getSingleJobPostFromDB(id, userRole);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Job details retrieved',
    data: result,
  });
});

export const JobPostController = {
  createJobPost,
  getTutorJobFeed,
  getSingleJobPost,
};

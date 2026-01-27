import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { AdminStatsService } from './AdminStats.service';

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminStatsService.getDashboardStatsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin Dashboard statistics retrieved successfully',
    data: result,
  });
});

export const AdminStatsController = {
  getDashboardStats,
};

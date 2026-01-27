import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { AdminConfigService } from './adminConfig.service';
import { AdminConfig } from './adminConfig.model';

const updateAdminConfig = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminConfigService.updateAdminConfig(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin configuration updated successfully',
    data: result,
  });
});

const getAdminConfig = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminConfigService.getAdminConfig();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin configuration retrieved successfully',
    data: result,
  });
});

export const AdminConfigController = {
  updateAdminConfig,
  getAdminConfig,
};

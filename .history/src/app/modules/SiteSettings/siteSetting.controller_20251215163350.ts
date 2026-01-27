import { Request, Response } from 'express';
import { SiteSettingService } from './siteSetting.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';

const getSiteSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await SiteSettingService.getSiteSettingsFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Site settings retrieved successfully',
    data: result,
  });
});

const updateSiteSettings = catchAsync(async (req: Request, res: Response) => {
  // Handle Logo Upload
  if (req.file) {
    const imageName = `logo-${Date.now()}`;
    const { secure_url }: any = await sendImageToCloudinary(imageName, req.file.path);
    req.body.logo = secure_url;
  }

  const result = await SiteSettingService.updateSiteSettingsInDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Site settings updated successfully',
    data: result,
  });
});

export const SiteSettingController = {
  getSiteSettings,
  updateSiteSettings,
};
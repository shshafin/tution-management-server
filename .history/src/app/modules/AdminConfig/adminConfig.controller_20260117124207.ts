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

const getAdminConfig = async () => {
  let result = await AdminConfig.findOne();

  // যদি প্রথমবার হয় এবং কোনো কনফিগ না থাকে, তবে একটা ডিফল্ট ক্রিয়েট করো
  if (!result) {
    result = await AdminConfig.create({
      signupBonusCredits: 5,
      jobApplyCost: 1,
      globalMinSalary: 2000,
      salaryGapMultiplier: 5,
      isOtpSecurityEnabled: false,
    });
  }
  return result;
};

export const AdminConfigController = {
  updateAdminConfig,
  getAdminConfig,
};

import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { OTPService } from './otp.service';

const verifyJobOTP = catchAsync(async (req: Request, res: Response) => {
  const { phone, otp, jobId } = req.body;
  const result = await OTPService.verifyOTP(phone, otp, jobId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP Verified! Job is now published.',
    data: result,
  });
});

export const OTPController = {
  verifyJobOTP,
};

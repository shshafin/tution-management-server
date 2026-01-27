import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { AuthService } from './auth.service';
import sendResponse from '../../shared/sendResponse';
import catchAsync from '../../shared/catchAsync';

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is logged in successfully',
    data: result,
  });
});

export const AuthController = {
  loginUser,
};

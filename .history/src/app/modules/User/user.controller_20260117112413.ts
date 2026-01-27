import { Request, Response } from 'express';
import { UserService } from './user.service';
import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import handleImageUpload from '../../helpers/handleImageUpload';

const createTutor = catchAsync(async (req: Request, res: Response) => {
  const imageUrl = await handleImageUpload(req);
  if (imageUrl) req.body.image = imageUrl;

  const result = await UserService.createTutorIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Tutor registered successfully! 5 credits added.',
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  // ডিস্ট্রাকচার করে নিলাম যাতে টাইপ স্ক্রিপ্ট এরর না দেয়
  const { result, meta } = await UserService.getAllUsersFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieved successfully',
    meta: meta, // এখানে মেটা ডেটা যাবে
    data: result, // এখানে মেইন ইউজার লিস্ট যাবে
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getMyProfileFromDB(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const imageUrl = await handleImageUpload(req);
  if (imageUrl) req.body.image = imageUrl;

  const result = await UserService.updateUserIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await UserService.deleteUserFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
    data: null,
  });
});

export const UserController = {
  createTutor,
  getAllUsers,
  getMyProfile,
  updateUser,
  deleteUser,
};

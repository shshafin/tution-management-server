import httpStatus from 'http-status';
import AppError from '../../errors/appError';
import { TUser } from './user.interface';
import { User } from './user.model';
import { CategoryService } from '../Category/category.service';

const createUserIntoDB = async (payload: TUser) => {
  const { username } = payload;

  // check duplicate user
  const isUserExists = await User.findOne({ username });
  if (isUserExists) {
    throw new AppError(
      httpStatus.ALREADY_REPORTED,
      'User already exists!',
      'create user with another username and email',
    );
  }

  // create user
  const result = await User.create(payload);

  // 👇 default categories create
  await CategoryService.createDefaultCategoriesForUser(result._id);

  return result;
};

export const getSingleUserByEmail = async (email: string) => {
  const user = await User.findOne({ email });
  return user;
};

export const UserServices = {
  createUserIntoDB,
};

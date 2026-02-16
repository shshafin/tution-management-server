import { User } from './user.model';
import { IUser } from './user.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import { AdminConfig } from '../AdminConfig/adminConfig.model';
import config from '../../config';
import jwt from 'jsonwebtoken';

const createTutorIntoDB = async (payload: IUser) => {
  const adminConfig = await AdminConfig.findOne();

  const signupBonus = adminConfig ? adminConfig.signupBonusCredits : 5;

  payload.credits = signupBonus;
  payload.role = 'tutor';
  payload.status = 'active';

  const result = await User.create(payload);
  return result;
};

const createUserIntoDB = async (payload: IUser) => {
  const result = await User.create(payload);
  return result;
};

// user.service.ts
const getAllUsersFromDB = async (query: Record<string, unknown>) => {
  const searchableFields = ['name', 'email', 'phone', 'location', 'role'];

  const queryObj = { ...query };
  const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
  excludeFields.forEach((el) => delete queryObj[el]);

  Object.keys(queryObj).forEach((key) => {
    if (queryObj[key] === '' || queryObj[key] === undefined) {
      delete queryObj[key];
    }
  });

  const userQuery = new QueryBuilder(User.find(), query)
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  return { result, meta };
};

const getSingleUserFromDB = async (id: string) => {
  const result = await User.findById(id);
  if (!result) {
    throw new Error('এই ইউজারের কোনো অস্তিত্ব নেই!');
  }
  return result;
};

const getMyProfileFromDB = async (id: string) => {
  const result = await User.findById(id);

  if (!result) {
    throw new Error('User not found!');
  }

  if (result.status === 'blocked') {
    throw new Error('This user is blocked!');
  }

  return result;
};

const updateUserIntoDB = async (id: string, payload: Partial<IUser>) => {
  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    return null;
  }

  const jwtPayload = {
    userId: result._id,
    email: result.email,
    name: result.name,
    image: result.image,
    role: result.role,
    // location: result.location,
    credits: result.credits,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: config.jwt_access_expires_in as any,
  });

  return { result, accessToken };
};

const deleteUserFromDB = async (id: string) => {
  const targetUser = await User.findById(id);
  if (targetUser?.role === 'super_admin') {
    throw new Error('Cannot delete Super Admin');
  }
  const result = await User.findByIdAndDelete(id);
  return result;
};

export const UserService = {
  createTutorIntoDB,
  createUserIntoDB,
  getAllUsersFromDB,
  getSingleUserFromDB,
  getMyProfileFromDB,
  updateUserIntoDB,
  deleteUserFromDB,
};

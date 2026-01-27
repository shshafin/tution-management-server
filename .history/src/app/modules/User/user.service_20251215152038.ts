import { User } from './user.model';
import { IUser } from './user.interface';
import config from '../../config';
import bcrypt from 'bcryptjs';
import QueryBuilder from '../../builder/QueryBuilder'; // 👈 Import this

// Create a new Admin or Moderator
const createUserIntoDB = async (payload: IUser) => {
  const result = await User.create(payload);
  return result;
};

// 🌟 Get all users (Updated with Search/Filter/Sort)
const getAllUsersFromDB = async (query: Record<string, unknown>) => {
  // We allow searching by Name and Email
  const searchableFields = ['name', 'email'];

  const userQuery = new QueryBuilder(User.find(), query)
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  return result;
};

// Get single user by ID
const getSingleUserFromDB = async (id: string) => {
  const result = await User.findById(id);
  return result;
};

// Update user details
const updateUserIntoDB = async (id: string, payload: Partial<IUser>) => {
  // 1. Check if password is being updated
  if (payload.password) {
    payload.password = await bcrypt.hash(
      payload.password,
      Number(config.bcrypt_salt_rounds) || 12,
    );
  }

  // 2. Update the user
  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

// Delete a user
const deleteUserFromDB = async (id: string) => {
  // Security Check: Prevent deleting the Super Admin
  const targetUser = await User.findById(id);
  if (targetUser?.role === 'super_admin') {
    throw new Error('Cannot delete Super Admin');
  }

  const result = await User.findByIdAndDelete(id);
  return result;
};

export const UserService = {
  createUserIntoDB,
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateUserIntoDB,
  deleteUserFromDB,
};

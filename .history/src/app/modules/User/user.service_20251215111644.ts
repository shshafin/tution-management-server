import { User } from './user.model';
import { IUser } from './user.interface';

// Create a new Admin or Moderator
const createUserIntoDB = async (payload: IUser) => {
  // If we needed to check if user exists, we could do it here,
  // but the 'unique: true' in Schema handles the email constraint automatically.

  const result = await User.create(payload);
  return result;
};

// Get all users (for Super Admin dashboard)
const getAllUsersFromDB = async () => {
  const result = await User.find({});
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
    // Hash it manually because findByIdAndUpdate doesn't trigger pre('save') hook
    payload.password = await bcrypt.hash(
      payload.password,
      Number(config) || 12,
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

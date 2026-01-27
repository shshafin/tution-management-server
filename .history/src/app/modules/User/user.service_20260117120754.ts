import { User } from './user.model';
import { IUser } from './user.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import { AdminConfig } from '../AdminConfig/adminConfig.model'; // ইমপোর্ট করতে হবে

// ১. টিউটর রেজিস্ট্রেশন (ডাইনামিক ক্রেডিট বোনাস লজিক)
const createTutorIntoDB = async (payload: IUser) => {
  // অ্যাডমিন সেটিংস থেকে গ্লোবাল কনফিগ খুঁজে আনা
  const adminConfig = await AdminConfig.findOne();

  // যদি অ্যাডমিন কনফিগ সেট করে থাকে তবে সেটা নিবে, নয়তো ডিফল্ট ৫ ক্রেডিট দিবে
  const signupBonus = adminConfig ? adminConfig.signupBonusCredits : 5;

  payload.credits = signupBonus;
  payload.role = 'tutor';

  const result = await User.create(payload);
  return result;
};
// ২. অ্যাডমিন দ্বারা ইউজার ক্রিয়েট (Admin/Super Admin)
const createUserIntoDB = async (payload: IUser) => {
  const result = await User.create(payload);
  return result;
};

// ৩. সার্চ, ফিল্টার ও স্মার্ট ম্যাচিং সহ সব ইউজার গেট
const getAllUsersFromDB = async (query: Record<string, unknown>) => {
  const searchableFields = ['name', 'email', 'phone', 'location'];

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
  return result;
};

const getMyProfileFromDB = async (id: string) => {
  const result = await User.findById(id);
  return result;
};

const updateUserIntoDB = async (id: string, payload: Partial<IUser>) => {
  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
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

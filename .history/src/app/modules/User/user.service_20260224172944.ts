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

  if (result) {
    // 📧 প্রফেশনাল ওয়েলকাম ইমেইল টেমপ্লেট
    const welcomeEmailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 0; margin: 0; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Tutorliy</h1>
            <p style="color: #e0e7ff; margin-top: 10px; font-size: 16px;">শিক্ষার আলো ছড়িয়ে দিন আপনার দক্ষতায়</p>
          </div>

          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px; font-weight: 700;">স্বাগতম, ${result.name}! 🎉</h2>
            <p style="color: #4b5563; line-height: 1.8; font-size: 15px;">
              আমরা অত্যন্ত আনন্দিত যে আপনি <strong>Tutorliy</strong> টিউটর কমিউনিটির অংশ হয়েছেন। আপনার প্রোফাইলটি সফলভাবে তৈরি হয়েছে এবং এখন আপনি টিউশন খোঁজার জন্য প্রস্তুত।
            </p>

            <div style="background: #f3f0ff; border: 1px dashed #7c3aed; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
              <p style="color: #7c3aed; margin: 0; font-weight: 700; font-size: 14px; text-transform: uppercase;">রেজিস্ট্রেশন বোনাস</p>
              <h3 style="color: #1f2937; margin: 5px 0 0; font-size: 24px; font-weight: 800;">${signupBonus} ফ্রি ক্রেডিট</h3>
              <p style="color: #6b7280; font-size: 13px; margin-top: 5px;">টিউশন অ্যাপ্লিকেশন শুরু করার জন্য আপনার অ্যাকাউন্টে ক্রেডিট যোগ করা হয়েছে।</p>
            </div>

            <h4 style="color: #1f2937; font-size: 16px; margin-bottom: 15px;">পরবর্তী করণীয় কী?</h4>
            <ul style="padding: 0; margin: 0; list-style: none;">
              <li style="margin-bottom: 12px; display: flex; align-items: center; color: #4b5563; font-size: 14px;">
                <span style="color: #7c3aed; margin-right: 10px;">✔</span> আপনার স্মার্ট জব ফিড চেক করুন।
              </li>
              <li style="margin-bottom: 12px; display: flex; align-items: center; color: #4b5563; font-size: 14px;">
                <span style="color: #7c3aed; margin-right: 10px;">✔</span> পছন্দমতো টিউশনে আবেদন করুন।
              </li>
              <li style="margin-bottom: 12px; display: flex; align-items: center; color: #4b5563; font-size: 14px;">
                <span style="color: #7c3aed; margin-right: 10px;">✔</span> ডেমো ক্লাসের জন্য প্রস্তুত থাকুন।
              </li>
            </ul>

            <div style="text-align: center; margin-top: 40px;">
              <a href="${config.frontend_url}/jobs" style="background: #7c3aed; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px 0 rgba(124, 58, 237, 0.39);">জব বোর্ড দেখুন</a>
            </div>
          </div>

          <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #f3f4f6;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">আপনার যদি কোনো প্রশ্ন থাকে, তবে আমাদের সাপোর্ট টিমে যোগাযোগ করুন।</p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0;">&copy; 2026 Tutorliy Inc. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

    // ইমেইল পাঠানো হচ্ছে (Error Handling ছাড়া যাতে প্রোফাইল ক্রিয়েশন না থামে)
    try {
      await sendEmail(
        result.email,
        welcomeEmailHtml,
        'স্বাগতম Tutorliy টিউটর কমিউনিটিতে! 🎉',
      );
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  }

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
    location: result.location,
    credits: result.credits,
    gender: result.gender,
    discipline: result.bachelorInfo?.discipline,
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

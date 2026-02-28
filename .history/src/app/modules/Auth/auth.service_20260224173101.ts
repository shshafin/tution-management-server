import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';
import { TLoginUser } from './auth.interface';
import { User } from '../User/user.model';
import config from '../../config';
import AppError from '../../errors/appError';
import httpStatus from 'http-status';
import { sendEmail } from '../../utils/sendEmail';

const loginUser = async (payload: TLoginUser) => {
  const user = await User.findOne({ email: payload.email }).select('+password');

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'User Not Found',
      'এই ইমেইলে কোনো ইউজার পাওয়া যায়নি!',
    );
  }

  if (user.status === 'blocked') {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Account Blocked',
      'আপনার অ্যাকাউন্টটি ব্লক করা হয়েছে!',
    );
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Invalid Password',
      'পাসওয়ার্ড ভুল দিয়েছেন!',
    );
  }

  const jwtPayload = {
    userId: user._id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
    location: user.location,
    credits: user.credits,
    gender: user.gender,
    discipline: user.bachelorInfo?.discipline,
  };

  // ১. Access Token জেনারেট করা
  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: config.jwt_access_expires_in as jwt.SignOptions['expiresIn'],
  });

  // ২. Refresh Token জেনারেট করা (নতুন যোগ করা হয়েছে)
  const refreshToken = jwt.sign(
    jwtPayload,
    config.jwt_refresh_secret as string,
    {
      expiresIn: config.jwt_refresh_expires_in as jwt.SignOptions['expiresIn'],
    },
  );

  return {
    accessToken,
    refreshToken, // এটি রিটার্ন দিচ্ছি যাতে কন্ট্রোলার কুকিতে সেট করতে পারে
    user,
  };
};

const refreshToken = async (token: string) => {
  // ১. চেক করো টোকেনটা ভ্যালিড কি না
  let decoded;
  try {
    decoded = jwt.verify(
      token,
      config.jwt_refresh_secret as string,
    ) as JwtPayload;
  } catch (err) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Refresh token is expired!',
      '',
    );
  }

  const { userId } = decoded;

  // ২. ইউজার ডাটাবেসে আছে কি না চেক করো
  const user = await User.findById(userId);
  if (!user || user.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is not authorized!', '');
  }

  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    image: user.image,
    location: user.location,
    name: user.name,
    credits: user.credits,
    gender: user.gender,
    discipline: user.bachelorInfo?.discipline,
  };

  // ৩. নতুন একটি Access Token জেনারেট করো
  const accessToken = jwt.sign(
    jwtPayload,
    config.jwt_access_secret as string,
    {
      expiresIn: config.jwt_access_expires_in,
    } as any,
  ) as any;

  return { accessToken };
};

const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'User Not Found',
      'এই ইমেইলে কোনো ইউজার নেই!',
    );
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  await user.save({ validateBeforeSave: false });

  const rolePath =
    user.role === 'admin' || user.role === 'super_admin' ? 'admin' : 'tutor';

  const resetUILink = `${config.frontend_url}/${rolePath}/reset-password?token=${resetToken}`;

  // 📧 প্রিমিয়াম পাসওয়ার্ড রিসেট টেমপ্লেট
  const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 0; margin: 0; background-color: #f3f4f6;">
      <div style="max-width: 500px; margin: 40px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
        
        <div style="background: #7c3aed; padding: 30px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">পাসওয়ার্ড রিসেট</h2>
        </div>

        <div style="padding: 40px 30px; text-align: center;">
          <p style="color: #4b5563; font-size: 16px; margin-bottom: 25px; text-align: left;">
            হ্যালো <strong>${user.name || 'ইউজার'}</strong>,
          </p>
          <p style="color: #4b5563; line-height: 1.6; font-size: 15px; text-align: left; margin-bottom: 30px;">
            আপনি আপনার <strong>Tutorliy</strong> অ্যাকাউন্টের পাসওয়ার্ড রিসেট করার জন্য রিকোয়েস্ট করেছেন। নিচের বাটনে ক্লিক করে নতুন পাসওয়ার্ড সেট করুন।
          </p>

          <a href="${resetUILink}" style="background: #7c3aed; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block; transition: background 0.3s ease;">পাসওয়ার্ড রিসেট করুন</a>

          <div style="margin-top: 30px; padding: 15px; background: #fff7ed; border-radius: 12px; border: 1px solid #ffedd5;">
            <p style="color: #9a3412; font-size: 13px; margin: 0; font-weight: 600;">
              ⚠️ এই লিংকটি মাত্র ১০ মিনিটের জন্য কার্যকর থাকবে।
            </p>
          </div>
        </div>

        <div style="padding: 20px 30px; background: #f9fafb; text-align: center; border-top: 1px solid #f3f4f6;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">যদি আপনি এই রিকোয়েস্ট না করে থাকেন, তবে ইমেইলটি ইগনোর করুন।</p>
          <p style="font-size: 12px; color: #9ca3af; margin: 5px 0 0;">ধন্যবাদ, <strong>Tutorliy Team</strong></p>
        </div>
      </div>
    </div>
  `;

  // 📍 সাবজেক্ট এখন ডাইনামিক
  await sendEmail(
    user.email,
    emailHtml,
    'আপনার পাসওয়ার্ড রিসেট করার লিংক (Tutorliy) 🔐',
  );

  return null;
};

const resetPassword = async (payload: any) => {
  const { token, newPassword } = payload;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Invalid Token',
      'টোকেনটি অবৈধ অথবা মেয়াদ শেষ হয়ে গেছে!',
    );
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return null;
};

const changePassword = async (userData: JwtPayload, payload: any) => {
  const { oldPassword, newPassword } = payload;

  const user = await User.findById(userData.userId).select('+password');
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!', '');
  }

  const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordMatched) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Old password does not match!',
      'আপনার বর্তমান পাসওয়ার্ডটি ভুল!',
    );
  }

  user.password = newPassword;
  await user.save();

  return null;
};

export const AuthService = {
  loginUser,
  forgotPassword,
  resetPassword,
  refreshToken,
  changePassword,
};

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
    credits: user.credits,
    gender:
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
    name: user.name,
    credits: user.credits,
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

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
      <h2 style="color: #7c3aed; text-align: center;">Password Reset Request</h2>
      <p style="color: #444; line-height: 1.6;">হ্যালো <strong>${user.name || 'ইউজার'}</strong>,</p>
      <p style="color: #444; line-height: 1.6;">আপনি আপনার অ্যাকাউন্টের পাসওয়ার্ড রিসেট করার জন্য রিকোয়েস্ট করেছেন। নিচের বাটনে ক্লিক করে আপনার পাসওয়ার্ডটি রিসেট করুন। মনে রাখবেন, এই লিংকটি মাত্র <strong>১০ মিনিটের</strong> জন্য কাজ করবে।</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUILink}" style="background: #7c3aed; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">পাসওয়ার্ড রিসেট করুন</a>
      </div>
      
      <p style="font-size: 12px; color: #888; border-top: 1px solid #eee; pt: 15px;">যদি আপনি এই রিকোয়েস্ট না করে থাকেন, তবে এই ইমেইলটি ইগনোর করুন। আপনার নিরাপত্তা আমাদের কাছে গুরুত্বপূর্ণ।</p>
      <p style="font-size: 12px; color: #888;">ধন্যবাদ, <br> Tutorliy Team</p>
    </div>
  `;

  await sendEmail(user.email, emailHtml);

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

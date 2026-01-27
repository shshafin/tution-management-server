import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { TLoginUser } from './auth.interface';
import { User } from '../User/user.model';
import config from '../../config';
import AppError from '../../errors/appError';
import httpStatus from 'http-status';

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
    role: user.role,
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
  };

  // ৩. নতুন একটি Access Token জেনারেট করো
  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: config.jwt_access_expires_in,
  });

  return { accessToken };
};

const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'User Not Found',
      'এই ইমেইলে কোনো ইউজার রেজিস্টার্ড নেই!',
    );
  }

  const resetToken = crypto.randomBytes(32).toString('hex');

  user.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  await user.save({ validateBeforeSave: false });

  return resetToken;
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

export const AuthService = {
  loginUser,
  forgotPassword,
  resetPassword,
};

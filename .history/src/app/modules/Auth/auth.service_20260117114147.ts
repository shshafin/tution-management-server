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
      'এই ইমেইলে কোনো ইউজার পাওয়া যায়নি!',
    );
  }

  if (user.status === 'blocked') {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Account Blocked',
      'আপনার অ্যাকাউন্টটি ব্লক করা হয়েছে!',
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
      'পাসওয়ার্ড ভুল দিয়েছেন!',
    );
  }

  const jwtPayload = { userId: user._id, email: user.email, role: user.role };
  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: config.jwt_access_expires_in,
  });

  return { accessToken, user };
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

  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // ১০ মিনিট মেয়াদ
  await user.save({ validateBeforeSave: false });

  return resetToken;
};

const resetPassword = async (payload: any) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(payload.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Invalid Token',
      'টোকেনটি অবৈধ অথবা মেয়াদ শেষ হয়ে গেছে!',
    );
  }

  user.password = payload.newPassword;
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

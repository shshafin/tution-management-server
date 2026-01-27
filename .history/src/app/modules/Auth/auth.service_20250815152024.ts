import jwt, { JwtPayload } from 'jsonwebtoken';
import AppError from '../../errors/appError';
import { User } from '../User/user.model';
import { TUserLogin } from './auth.interface';
import bcrypt from 'bcrypt';
import config from '../../config';
import httpStatus from 'http-status';
import { PasswordHistory } from '../User/passwordHistory/passwordHistory.model';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { sendEmail } from '../../services/emailService';

// ------------------------------
// LOGIN SERVICE
// ------------------------------
const loginExistingUser = async (payload: TUserLogin) => {
  const user = await User.findOne({ email: payload?.email }).select(
    '+password',
  );
  if (!user) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Invalid credentials.',
      'User not found with provided email.',
    );
  }

  const isMatched = await bcrypt.compare(payload.password, user.password);
  if (!isMatched) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Invalid credentials.',
      'Password did not match for user.',
    );
  }

  const jwtPayload = {
    _id: user._id,
    email: user.email,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: '10d',
  });

  return {
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
    },
    accessToken: accessToken,
  };
};

// ------------------------------
// CHANGE PASSWORD SERVICE
// ------------------------------
const changePasswordFromDB = async (
  user: JwtPayload,
  payload: { currentPassword: string; newPassword: string },
) => {
  const { _id } = user;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const existingUser = await User.findById(_id).select('+password');
    if (!existingUser) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'User not found.',
        'No user found with given ID.',
      );
    }

    const currentPasswordMatched = await bcrypt.compare(
      payload.currentPassword,
      existingUser.password,
    );

    if (!currentPasswordMatched) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Incorrect current password.',
        'User tried to change password with wrong current password.',
      );
    }

    // Password history check (last 2 or 3)
    const historyRecord = await PasswordHistory.findOne({ userId: _id });
    let history = historyRecord?.passwordHistory || [];

    history.unshift(existingUser.password);
    history = history.slice(0, 3);

    // Prevent reuse of recent passwords
    for (const oldHashed of history) {
      const reused = await bcrypt.compare(payload.newPassword, oldHashed);
      if (reused) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'New password must be different from previous passwords.',
          'User attempted to reuse a recently used password.',
        );
      }
    }

    // Update password history
    await PasswordHistory.findOneAndUpdate(
      { userId: _id },
      { userId: _id, passwordHistory: history },
      { upsert: true },
    );

    const hashedNewPassword = await bcrypt.hash(
      payload.newPassword,
      Number(config.bcrypt_salt_rounds),
    );

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { password: hashedNewPassword },
      { new: true },
    );

    await session.commitTransaction();
    session.endSession();

    return updatedUser;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Password change failed. Try again.',
      'Internal error during password change transaction.',
    );
  }
};

// password reset service
const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'User with this email not found',
      'User not found during forgot password process',
    );
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHashed = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Save hashed token and expiry in user document
  user.passwordResetToken = resetTokenHashed;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now
  await user.save({ validateBeforeSave: false });

  // Construct reset URL
  const resetUrl = `${config.frontend_url}/reset-password/${resetToken}`;

  // Send email (subject and message)
  const message = `Forgot your password? Click the link to reset your password:\n\n${resetUrl}\n\nIf you didn't request this, ignore this email.`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset',
      text: message,
    });
  } catch (error) {
    // If email sending fails, clean token fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    if (!user) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'User with this email not found',
        'User not found during forgot password process',
      );
    }
  }

  return true;
};

const resetPassword = async (token: string, newPassword: string) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with token and check expiry
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error sending email',
      'Failed to send password reset email',
    );
  }

  // Update password & clear reset token fields
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  return user;
};

export const AuthServices = {
  loginExistingUser,
  changePasswordFromDB,
  forgotPassword,
  resetPassword,
};

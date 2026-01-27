
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { TLoginUser } from './auth.interface'; // We will define this next
import { User } from '../User/user.model';
import config from '../../config';

const loginUser = async (payload: TLoginUser) => {
  // 1. Check if user exists
  const user = await User.findOne({ email: payload.email }).select('+password'); // We need password to compare

  if (!user) {
    throw new Error('User does not exist');
  }

  // 2. Check if password matches
  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new Error('Password do not match');
  }

  // 3. Create Access Token
  // Ideally, use a secret from your .env file
  const jwtSecret = config. || 'secret123';
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '1d';

  const accessToken = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    jwtSecret,
    { expiresIn },
  );

  return {
    accessToken,
    needsPasswordChange: false, // Future proofing
  };
};

export const AuthService = {
  loginUser,
};

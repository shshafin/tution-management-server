import { RequestHandler } from 'express';
import { AuthServices } from './auth.service';
import { JwtPayload } from 'jsonwebtoken';
import { getSingleUserByEmail } from '../User/user.service';

const userLogin: RequestHandler = async (req, res, next) => {
  try {
    const result = await AuthServices.loginExistingUser(req.body);

    res.status(200).json({
      success: true,
      message: 'User login successful',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const changePassword: RequestHandler = async (req, res, next) => {
  const user: JwtPayload = req.user;
  const { ...passwordData } = req.body;
  try {
    const result = await AuthServices.changePasswordFromDB(user, passwordData);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser: RequestHandler = async (req, res, next) => {
  try {
    const email = (req.user as any).email; // decoded token
    const user = await getSingleUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Something went wrong', error: err });
  }
};

export const AuthControllers = {
  userLogin,
  changePassword,
};

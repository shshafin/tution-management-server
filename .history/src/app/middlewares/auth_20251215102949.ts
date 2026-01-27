/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { TUserRole } from '../modules/User/user.interface';
import catchAsync from '../shared/catchAsync';
import { User } from '../modules/User/user.model';
import config from '../config';

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    // 1. Check if token is sent
    if (!token) {
      throw new Error('You are not authorized!');
    }

    // 2. Verify Token
    const jwtSecret = config.jwt_access_secret || 'secret123';

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    } catch (err) {
      throw new Error('Unauthorized');
    }

    // eslint-disable-next-line no-unused-vars
    const { role, userId, email } = decoded;

    // 3. Check if user still exists in DB (Security Best Practice)
    const isUserExist = await User.findById(userId);
    if (!isUserExist) {
      throw new Error('This user is not found !');
    }

    // 4. Check if role is allowed
    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new Error('You have no access to this route');
    }

    // 5. Attach user to request and proceed
    req.user = decoded;
    next();
  });
};

export default auth;

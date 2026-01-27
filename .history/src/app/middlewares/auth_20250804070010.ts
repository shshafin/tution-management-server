import { NextFunction, Request, Response } from 'express';
import AppError from '../errors/appError';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';

const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          'Authorization token missing or malformed.',
          'No token or bad token format in Authorization header.',
        );
      }

      const token = authHeader.split(' ')[1];

      const decoded = jwt.verify(
        token,
        config.jwt_access_secret as string,
      ) as JwtPayload;

      // Attach decoded user info to req.user
      req.user = decoded;

      next();
    } catch (err) {
      // If jwt.verify throws, it will be caught here
      if (err instanceof jwt.JsonWebTokenError) {
        return next(
          new AppError(
            httpStatus.UNAUTHORIZED,
            'Invalid or expired token.',
            'JWT verification failed.',
          ),
        );
      }
      next(err);
    }
  };
};

export default auth;

// middlewares/parseToken.ts
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';

const parseToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        config.jwt_access_secret as string,
      ) as JwtPayload;
      req.user = decoded; // টোকেন থাকলে ইউজার ডাটা ইনজেক্ট করো
    } catch (err) {
   
    }
  }
  next();
};

export default parseToken;

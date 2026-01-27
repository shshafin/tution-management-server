/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtPayload } from 'jsonwebtoken';
// eslint-disable-next-line no-unused-vars
import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}

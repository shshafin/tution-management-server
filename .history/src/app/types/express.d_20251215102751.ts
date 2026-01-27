/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtPayload } from 'jsonwebtoken';
import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}

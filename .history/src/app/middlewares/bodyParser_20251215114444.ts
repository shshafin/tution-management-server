import { NextFunction, Request, Response } from 'express';
import catchAsync from '../shared/catchAsync';
// <--- Check this path!

const parseBody = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.data) {
      return next();
    }

    try {
      req.body = JSON.parse(req.body.data);
    } catch (error) {
      throw new Error('Invalid JSON data format in form-data');
    }

    next();
  },
);

export default parseBody;

import { NextFunction, Request, Response } from 'express';


const parseBody = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.data) {
      // If no data is sent, just move next (might be a file-only upload or GET)
      return next();
    }

    // Parse the stringified JSON back to an object
    req.body = JSON.parse(req.body.data);

    next();
  },
);

export default parseBody;

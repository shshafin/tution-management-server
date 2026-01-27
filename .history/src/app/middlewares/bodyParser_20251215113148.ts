import { NextFunction, Request, Response } from 'express';


const parseBody = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.data) {
      // If you are doing an update and only changing the photo, 'data' might be missing.
      // That's okay, just skip parsing.
      return next();
    }

    try {
      req.body = JSON.parse(req.body.data);
    } catch (error) {
      // This catches the crash and sends a nice 400 error instead
      throw new Error('Invalid JSON data format in form-data');
    }

    next();
  },
);

export default parseBody;

import { ZodError, ZodIssue } from 'zod';
import { TErrorResponse } from '../interface/error';
import httpStatus from 'http-status';

const handleZodError = (err: ZodError): TErrorResponse => {
  const errorMessage = err.issues
    .map((issue: ZodIssue) => {
      const path = issue?.path?.[issue?.path?.length - 1];
      return `${path} is ${issue?.message.toLowerCase()}`;
    })
    .join('. ');

  return {
    statusCode: httpStatus.BAD_REQUEST,
    message: 'Validation Error',
    errorMessage,
  };
};

export default handleZodError;

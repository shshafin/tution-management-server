import httpStatus from 'http-status';
import { TErrorResponse } from '../interface/error';

const handleDuplicateError = (err: any): TErrorResponse => {
  const match = err.message.match(/"([^"]*)"/);
  const extractedMessage = match ? match[1] : '';

  return {
    statusCode: httpStatus.BAD_REQUEST,
    message: 'Duplicate Entry',
    errorMessage: `${extractedMessage} is already exists!`,
  };
};

export default handleDuplicateError;

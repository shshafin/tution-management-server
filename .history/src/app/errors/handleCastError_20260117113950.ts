import mongoose from 'mongoose';
import { TErrorResponse } from '../interface/error';
import httpStatus from 'http-status';

const handleCastError = (err: mongoose.Error.CastError): TErrorResponse => {
  // মঙ্গোজ কাস্ট এরর থেকে সরাসরি ভ্যালু নিয়ে সুন্দর মেসেজ তৈরি
  const errorMessage = `${err.value} is not a valid ID!`;

  return {
    statusCode: httpStatus.BAD_REQUEST,
    message: 'Invalid ID',
    errorMessage: errorMessage,
  };
};

export default handleCastError;

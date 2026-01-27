import { Response } from 'express';

// প্যাগিনেশন বা মেটা ডেটার জন্য আলাদা টাইপ
type TMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

// মেইন রেসপন্স টাইপ যেখানে meta যোগ করা হয়েছে
type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  meta?: TMeta; 
  data: T;
};

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    meta: data.meta || null, 
    data: data.data,
  });
};

export default sendResponse;

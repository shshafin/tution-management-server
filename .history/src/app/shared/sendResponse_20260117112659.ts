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
  meta?: TMeta; // 👈 এটা অপশনাল রাখলাম যাতে সব এপিআইতে মেটা দেওয়া না লাগে
  data: T;
};

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    meta: data.meta || null, // 👈 যদি মেটা থাকে তবে যাবে, নাহলে নাল
    data: data.data,
  });
};

export default sendResponse;

import { Types } from 'mongoose';

export type TPayment = {
  tutor: Types.ObjectId; 
  package: Types.ObjectId; 
  amount: number; 
  invoiceId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod?: string; // bkash, nagad, rocket ইত্যাদি
  transactionId?: string; // MFS থেকে আসা ট্রানজ্যাকশন আইডি
};

import { Types } from 'mongoose';

export type TPayment = {
  tutor: Types.ObjectId; // কোন টিউটর পেমেন্ট করছে
  package: Types.ObjectId; // কোন প্যাকেজটা কিনছে
  amount: number; // টাকার পরিমাণ
  invoiceId: string; // ZiniPay-র দেওয়া ইউনিক আইডি (ভেরিফাই করতে লাগবে)
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod?: string; // bkash, nagad, rocket ইত্যাদি
  transactionId?: string; // MFS থেকে আসা ট্রানজ্যাকশন আইডি
};

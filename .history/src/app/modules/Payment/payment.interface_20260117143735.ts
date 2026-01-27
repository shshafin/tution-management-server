import { Types } from 'mongoose';

export type TPayment = {
  tutor: Types.ObjectId; 
  package: Types.ObjectId; 
  amount: number; 
  invoiceId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod?: string; 
  transactionId?: string; 
};

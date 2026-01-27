import { Schema, model } from 'mongoose';
import { TPayment } from './payment.interface';

const paymentSchema = new Schema<TPayment>(
  {
    tutor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    package: { type: Schema.Types.ObjectId, ref: 'Package', required: true },
    amount: { type: Number, required: true },
    invoiceId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: { type: String },
    transactionId: { type: String },
  },
  { timestamps: true },
);

export const Payment = model<TPayment>('Payment', paymentSchema);

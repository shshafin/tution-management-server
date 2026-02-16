import { Schema, model } from 'mongoose';
import { TPayment } from './payment.interface';

const paymentSchema = new Schema<TPayment>(
  {
    tutor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    package: { type: Schema.Types.ObjectId, ref: 'Package', required: true },
    amount: { type: Number, required: true },

    /**
     * 🟢 ফিক্স: sparse: true যোগ করা হলো।
     * এর ফলে মঙ্গোডিবি শুধু ভ্যালু থাকলে ইউনিকনেস চেক করবে।
     * ভ্যালু না থাকলে (পেন্ডিং অবস্থায়) ডুপ্লিকেট এরর দিবে না।
     */
    invoiceId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },

    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },

    paymentMethod: { type: String },

    /**
     * ট্রানজ্যাকশন আইডির ক্ষেত্রেও ইউনিক রাখা ভালো এবং সেটাকেও sparse করা উচিত
     */
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true },
);

// ইউজার যখন পেন্ডিং অবস্থায় থাকবে তখন যেন সহজে কোয়েরি করা যায় তার জন্য ইনডেক্সিং
paymentSchema.index({ tutor: 1, package: 1, status: 1 });

export const Payment = model<TPayment>('Payment', paymentSchema);

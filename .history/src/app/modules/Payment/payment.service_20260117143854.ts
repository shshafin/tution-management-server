import httpStatus from 'http-status';
import AppError from '../../errors/appError';
import { User } from '../User/user.model';
import { Package } from '../Package/package.model'; // প্যাকেজ মডেল ইমপোর্ট করিস
import { Payment } from './payment.model';
import { initiatePayment } from '../../utils/payment.utils';
import { v4 as uuidv4 } from 'uuid'; // ইউনিক ইনভয়েস আইডির জন্য (npm install uuid)

const initPayment = async (tutorId: string, packageId: string) => {
  const tutor = await User.findById(tutorId);
  const pkg = await Package.findById(packageId);

  if (!tutor || !pkg) {
    throw new AppError(httpStatus.NOT_FOUND, 'Tutor or Package not found!');
  }

  // ১. একটি ইউনিক ইনভয়েস আইডি তৈরি (ZiniPay ভেরিফিকেশনের জন্য লাগবে)
  const invoiceId = `INV-${uuidv4().split('-')[0].toUpperCase()}-${Date.now()}`;

  // ২. ZiniPay পেমেন্ট লিঙ্ক জেনারেট করা
  const paymentResponse = await initiatePayment({
    cus_name: tutor.name,
    cus_email: tutor.email,
    amount: pkg.price.toString(),
    tutorId: tutorId,
    packageId: packageId,
  });

  if (paymentResponse.status) {
    // ৩. ডাটাবেসে পেমেন্ট রেকর্ড পেন্ডিং অবস্থায় সেভ করা
    await Payment.create({
      tutor: tutorId,
      package: packageId,
      amount: pkg.price,
      invoiceId: invoiceId, // জেনারেটেড আইডি
      status: 'pending',
    });

    return {
      paymentUrl: paymentResponse.payment_url,
    };
  }

  throw new AppError(
    httpStatus.BAD_REQUEST,
    'ZiniPay payment link generation failed!',
  );
};

export const PaymentService = {
  initPayment,
};

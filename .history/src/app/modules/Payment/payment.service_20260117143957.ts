import httpStatus from 'http-status';
import AppError from '../../errors/appError';
import { User } from '../User/user.model';
import { Package } from '../Package/package.model';
import { Payment } from './payment.model';
import { initiatePayment } from '../../utils/payment.utils';
import { v4 as uuidv4 } from 'uuid';

const initPayment = async (tutorId: string, packageId: string) => {
  const tutor = await User.findById(tutorId);
  const pkg = await Package.findById(packageId);

  // ৩টি আর্গুমেন্ট সহ AppError (statusCode, message, stack)
  if (!tutor) {
    throw new AppError(httpStatus.NOT_FOUND, 'Tutor not found!', '');
  }

  if (!pkg) {
    throw new AppError(httpStatus.NOT_FOUND, 'Package not found!', '');
  }

  const invoiceId = `INV-${uuidv4().split('-')[0].toUpperCase()}-${Date.now()}`;

  const paymentResponse = await initiatePayment({
    cus_name: tutor.name,
    cus_email: tutor.email,
    amount: pkg.price.toString(),
    tutorId: tutorId,
    packageId: packageId,
  });

  if (paymentResponse.status) {
    await Payment.create({
      tutor: tutorId,
      package: packageId,
      amount: pkg.price,
      invoiceId: invoiceId,
      status: 'pending',
    });

    return {
      paymentUrl: paymentResponse.payment_url,
    };
  }

  throw new AppError(
    httpStatus.BAD_REQUEST,
    'ZiniPay payment link generation failed!',
    '',
  );
};

export const PaymentService = {
  initPayment,
};

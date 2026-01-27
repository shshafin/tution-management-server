import httpStatus from 'http-status';
import AppError from '../../errors/appError';
import { User } from '../User/user.model';
import { Payment } from './payment.model';
import { initiatePayment, verifyPayment } from '../../utils/payment.utils';
import { v4 as uuidv4 } from 'uuid';
import { Package } from '../Package/package.model';

const initPayment = async (tutorId: string, packageId: string) => {
  const tutor = await User.findById(tutorId);
  const pkg = await Package.findById(packageId);

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

const verifyAndConfirmPayment = async (invoiceId: string) => {
  const paymentData = await verifyPayment(invoiceId);

  if (!paymentData || paymentData.status !== 'COMPLETED') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Payment verification failed or not completed!',
      '',
    );
  }

  const paymentRecord = await Payment.findOne({ invoiceId }).populate(
    'package',
  );

  if (!paymentRecord) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Payment record not found in database!',
      '',
    );
  }

  if (paymentRecord.status === 'completed') {
    return { message: 'Already processed' };
  }

  const pkg = paymentRecord.package as any;

  await User.findByIdAndUpdate(paymentRecord.tutor, {
    $inc: { credits: pkg.credits },
  });

  paymentRecord.status = 'completed';
  paymentRecord.paymentMethod = paymentData.paymentMethod;
  paymentRecord.transactionId = paymentData.transaction_id;
  await paymentRecord.save();

  return paymentRecord;
};

const getAllPaymentHistoryFromDB = async () => {
  const result = await Payment.find()
    .populate('tutor') // কে পেমেন্ট করেছে তার ডিটেইলস
    .populate('package') // কোন প্যাকেজ নিয়েছে
    .sort('-createdAt');
  return result;
};

const getMyPaymentHistoryFromDB = async (userId: string) => {
  const result = await Payment.find({ tutor: userId })
    .populate('package')
    .sort('-createdAt');
  return result;
};

export const PaymentService = {
  initPayment,
  verifyAndConfirmPayment,
  getMyPaymentHistoryFromDB,
  getAllPaymentHistoryFromDB,
};

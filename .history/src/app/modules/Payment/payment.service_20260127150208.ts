import httpStatus from 'http-status';
import AppError from '../../errors/appError';
import { User } from '../User/user.model';
import { Payment } from './payment.model';
import { initiatePayment, verifyPayment } from '../../utils/payment.utils';
import { v4 as uuidv4 } from 'uuid';
import { Package } from '../Package/package.model';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';

const initPayment = async (tutorId: string, packageId: string) => {
  const tutor = await User.findById(tutorId);
  const pkg = await Package.findById(packageId);

  if (!tutor) {
    throw new AppError(httpStatus.NOT_FOUND, 'Tutor not found!', '');
  }

  if (!pkg) {
    throw new AppError(httpStatus.NOT_FOUND, 'Package not found!', '');
  }

  // ১. ইউনিক ইনভয়েস আইডি জেনারেট করা
  const invoiceId = `INV-${uuidv4().split('-')[0].toUpperCase()}-${Date.now()}`;

  // ২. পেমেন্ট ইনিশিয়েট করার সময় এই আইডিটাই পাঠাতে হবে
  const paymentResponse = await initiatePayment({
    cus_name: tutor.name,
    cus_email: tutor.email,
    amount: pkg.price.toString(),
    tran_id: invoiceId, // 🟢 গেটওয়েকে বলে দিচ্ছি এই আইডিটা ইউজ করতে
    tutorId: tutorId,
    packageId: packageId,
  });

  if (paymentResponse.status) {
    
    await Payment.create({
      tutor: tutorId,
      package: packageId,
      amount: pkg.price,
      invoiceId: invoiceId, // 🟢 ডাটাবেজেও একই আইডি সেভ হচ্ছে
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
  paymentRecord.paymentMethod = paymentData.paymentMethod || 'online';
  paymentRecord.transactionId =
    paymentData.transaction_id || paymentData.pg_txnid;
  await paymentRecord.save();

  return paymentRecord;
};

const getAllPaymentHistoryFromDB = async (query: Record<string, unknown>) => {
  const searchableFields = ['invoiceId', 'transactionId'];

  const paymentQuery = new QueryBuilder(
    Payment.find().populate('tutor').populate('package'),
    query,
  )
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await paymentQuery.modelQuery;
  const meta = await paymentQuery.countTotal();

  return { meta, result };
};

const getMyPaymentHistoryFromDB = async (userId: string) => {
  const result = await Payment.find({ tutor: userId })
    .populate('package')
    .sort('-createdAt');
  return result;
};

const verifyPaymentManuallyByAdminFromDB = async (paymentId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const paymentRecord = await Payment.findById(paymentId)
      .populate('package')
      .session(session);

    if (!paymentRecord) {
      throw new AppError(httpStatus.NOT_FOUND, 'Payment record not found!', '');
    }

    if (paymentRecord.status === 'completed') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'This payment is already marked as completed.',
        '',
      );
    }

    const pkg = paymentRecord.package as any;

    const updatedUser = await User.findByIdAndUpdate(
      paymentRecord.tutor,
      { $inc: { credits: pkg.credits } },
      { session, new: true },
    );

    if (!updatedUser) {
      throw new AppError(httpStatus.NOT_FOUND, 'Tutor not found!', '');
    }

    paymentRecord.status = 'completed';
    paymentRecord.paymentMethod = 'manual_admin';
    paymentRecord.transactionId = `ADMIN-MANUAL-${Date.now()}`;
    await paymentRecord.save({ session });

    await session.commitTransaction();
    await session.endSession();

    return paymentRecord;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

export const PaymentService = {
  initPayment,
  verifyAndConfirmPayment,
  getMyPaymentHistoryFromDB,
  getAllPaymentHistoryFromDB,
  verifyPaymentManuallyByAdminFromDB,
};

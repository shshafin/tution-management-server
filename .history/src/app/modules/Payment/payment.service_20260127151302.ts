import httpStatus from 'http-status';
import AppError from '../../errors/appError';
import { User } from '../User/user.model';
import { Payment } from './payment.model';
import { initiatePayment, verifyPayment } from '../../utils/payment.utils';
import { Package } from '../Package/package.model';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';

const initPayment = async (tutorId: string, packageId: string) => {
  const tutor = await User.findById(tutorId);
  const pkg = await Package.findById(packageId);

  if (!tutor || !pkg)
    throw new AppError(httpStatus.NOT_FOUND, 'Tutor/Package not found!', '');

  // জিনিপে-তে পেমেন্ট রিকোয়েস্ট পাঠানো
  const paymentResponse = await initiatePayment({
    cus_name: tutor.name,
    cus_email: tutor.email,
    amount: pkg.price.toString(),
    tutorId: tutorId,
    packageId: packageId,
  });

  if (paymentResponse.status) {
    // 🟢 ডাটাবেজে রেকর্ড রাখা (invoiceId আপাতত ফাঁকা বা টেম্পোরারি)
    await Payment.create({
      tutor: tutorId,
      package: packageId,
      amount: pkg.price,
      status: 'pending',
    });

    return { paymentUrl: paymentResponse.payment_url };
  }
  throw new AppError(
    httpStatus.BAD_REQUEST,
    'Payment URL generation failed!',
    '',
  );
};

const verifyAndConfirmPayment = async (gatewayInvoiceId: string) => {
  // ১. জিনিপে থেকে পেমেন্ট ভেরিফাই করা
  const paymentData = await verifyPayment(gatewayInvoiceId);

  if (!paymentData || paymentData.status !== 'COMPLETED') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Payment not completed!', '');
  }

  // ২. মেটাডাটা থেকে আইডি বের করা
  const tutorId = paymentData.metadata?.tutorId;
  const packageId = paymentData.metadata?.packageId;

  // ৩. ডাটাবেজে ওই টিউটরের লেটেস্ট পেন্ডিং পেমেন্ট খুঁজে বের করা
  const paymentRecord = await Payment.findOne({
    tutor: tutorId,
    package: packageId,
    status: 'pending',
  })
    .sort({ createdAt: -1 })
    .populate('package');

  if (!paymentRecord)
    throw new AppError(httpStatus.NOT_FOUND, 'Payment record not found!', '');

  const pkg = paymentRecord.package as any;

  // ৪. ক্রেডিট আপডেট ও স্ট্যাটাস চেঞ্জ
  await User.findByIdAndUpdate(paymentRecord.tutor, {
    $inc: { credits: pkg.credits },
  });

  paymentRecord.status = 'completed';
  paymentRecord.invoiceId = gatewayInvoiceId; // 🟢 জিনিপে-র আইডিটা এখন সেভ করে নিলাম
  paymentRecord.transactionId = paymentData.transaction_id;
  paymentRecord.paymentMethod = paymentData.paymentMethod;
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

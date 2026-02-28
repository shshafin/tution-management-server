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

  // জিনিপে-তে রিকোয়েস্ট পাঠানো
  const paymentResponse = await initiatePayment({
    cus_name: tutor.name,
    cus_email: tutor.email,
    amount: pkg.price.toString(),
    tutorId: tutorId,
    packageId: packageId,
  });

  if (paymentResponse.status) {
    /**
     * 🟢 ফিক্স: ডুপ্লিকেট এন্ট্রি এড়ানোর জন্য লজিক
     * যদি এই টিউটরের জন্য ওই প্যাকেজের কোনো 'pending' রেকর্ড অলরেডি থাকে,
     * তবে নতুন করে create না করে ওটাকেই update করবো।
     */
    await Payment.findOneAndUpdate(
      {
        tutor: tutorId,
        package: packageId,
        status: 'pending',
      },
      {
        amount: pkg.price,
        // এখানে চাইলে createdAt আপডেট করে দিতে পারিস যাতে রিসেন্ট হয়
        $set: { updatedAt: new Date() },
      },
      {
        upsert: true, // না থাকলে নতুন ক্রিয়েট করবে, থাকলে আপডেট
        new: true,
      },
    );

    return { paymentUrl: paymentResponse.payment_url };
  }

  throw new AppError(
    httpStatus.BAD_REQUEST,
    'Payment URL generation failed!',
    '',
  );
};

const verifyAndConfirmPayment = async (gatewayInvoiceId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ১. জিনিপে থেকে পেমেন্ট ভেরিফাই করা
    const paymentData = await verifyPayment(gatewayInvoiceId);

    if (!paymentData || paymentData.status !== 'COMPLETED') {
      throw new AppError(httpStatus.BAD_REQUEST, 'Payment not completed!', '');
    }

    // ২. মেটাডাটা থেকে আইডি বের করা
    const tutorId = paymentData.metadata?.tutorId;
    const packageId = paymentData.metadata?.packageId;

    /**
     * ৩. ডাটাবেজে পেন্ডিং রেকর্ড খুঁজে বের করা
     * এখানে .session(session) ব্যবহার করছি যেন ট্রানজ্যাকশন সেফ থাকে
     */
    const paymentRecord = await Payment.findOne({
      tutor: tutorId,
      package: packageId,
      status: 'pending',
    })
      .sort({ createdAt: -1 })
      .populate('package')
      .session(session);

    if (!paymentRecord) {
      // যদি রেকর্ড না পাওয়া যায়, হয়তো অলরেডি কনফার্ম হয়ে গেছে (Webhook এর কারণে হতে পারে)
      // তাই চেক করে দেখা ভালো
      const alreadyDone = await Payment.findOne({
        invoiceId: gatewayInvoiceId,
      });
      if (alreadyDone) return alreadyDone;

      throw new AppError(httpStatus.NOT_FOUND, 'Payment record not found!', '');
    }

    const pkg = paymentRecord.package as any;

    // ৪. ক্রেডিট আপডেট
    const updatedTutor = await User.findByIdAndUpdate(
      paymentRecord.tutor,
      { $inc: { credits: pkg.credits } },
      { session, new: true },
    );

    if (!updatedTutor) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Tutor not found during verification!',
        '',
      );
    }

    // ৫. পেমেন্ট রেকর্ড আপডেট ও ইনভয়েস আইডি সেভ
    paymentRecord.status = 'completed';
    paymentRecord.invoiceId = gatewayInvoiceId;
    paymentRecord.transactionId = paymentData.transaction_id;
    paymentRecord.paymentMethod = paymentData.paymentMethod || 'geniepay';

    await paymentRecord.save({ session });

    // ৬. সব ঠিক থাকলে ডাটাবেজে সেভ করো
    await session.commitTransaction();
    return paymentRecord;
  } catch (error) {
    // কোনো ভুল হলে সব রোলব্যাক হবে (ক্রেডিট যোগ হবে না)
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
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

const getMyPaymentHistoryFromDB = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  // ১. মেক সিওর কর কুয়েরিতে যেন টিউটরের আইডিটা ফিক্সড থাকে
  const paymentQuery = new QueryBuilder(
    Payment.find({ tutor: userId }).populate('package'),
    query,
  )
    .search(['invoiceId', 'transactionId']) // ইনভয়েস বা ট্রানজ্যাকশন আইডি দিয়ে সার্চ
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await paymentQuery.modelQuery;
  const meta = await paymentQuery.countTotal();

  return { meta, result };
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

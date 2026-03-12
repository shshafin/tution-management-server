import httpStatus from 'http-status';
import AppError from '../../errors/appError';
import { User } from '../User/user.model';
import { Payment } from './payment.model';
import { initiatePayment, verifyPayment } from '../../utils/payment.utils';
import { Package } from '../Package/package.model';
import QueryBuilder from '../../builder/QueryBuilder';

const initPayment = async (tutorId: string, packageId: string) => {
  const tutor = await User.findById(tutorId);
  const pkg = await Package.findById(packageId);

  if (!tutor || !pkg)
    throw new AppError(httpStatus.NOT_FOUND, 'Tutor/Package not found!', '');

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
  const paymentData = await verifyPayment(gatewayInvoiceId);

  if (!paymentData || paymentData.status !== 'COMPLETED') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Payment not completed or invalid!',
      '',
    );
  }

  const tutorId = paymentData.metadata?.tutorId;
  const packageId = paymentData.metadata?.packageId;

  // Double credit protection
  const alreadyDone = await Payment.findOne({
    invoiceId: gatewayInvoiceId,
    status: 'completed',
  });

  if (alreadyDone) return alreadyDone;

  const paymentRecord = await Payment.findOne({
    tutor: tutorId,
    package: packageId,
    status: 'pending',
  })
    .sort({ createdAt: -1 })
    .populate('package');

  if (!paymentRecord) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Matching pending payment record not found!',
      '',
    );
  }

  const pkg = paymentRecord.package as any;

  await User.findByIdAndUpdate(paymentRecord.tutor, {
    $inc: { credits: pkg.credits },
  });

  paymentRecord.status = 'completed';
  paymentRecord.invoiceId = gatewayInvoiceId;
  paymentRecord.transactionId = paymentData.transaction_id;
  paymentRecord.paymentMethod = paymentData.payment_method || 'zinipay';

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

const getMyPaymentHistoryFromDB = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const paymentQuery = new QueryBuilder(
    Payment.find({ tutor: userId }).populate('package'),
    query,
  )
    .search(['invoiceId', 'transactionId'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await paymentQuery.modelQuery;
  const meta = await paymentQuery.countTotal();

  return { meta, result };
};

const verifyPaymentManuallyByAdminFromDB = async (paymentId: string) => {
  const paymentRecord = await Payment.findById(paymentId).populate('package');

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
    { new: true },
  );

  if (!updatedUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'Tutor not found!', '');
  }

  paymentRecord.status = 'completed';
  paymentRecord.paymentMethod = 'manual_admin';
  paymentRecord.transactionId = `ADMIN-MANUAL-${Date.now()}`;
  await paymentRecord.save();

  return paymentRecord;
};

export const PaymentService = {
  initPayment,
  verifyAndConfirmPayment,
  getMyPaymentHistoryFromDB,
  getAllPaymentHistoryFromDB,
  verifyPaymentManuallyByAdminFromDB,
};

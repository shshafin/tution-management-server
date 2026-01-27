import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { PaymentService } from './payment.service';
import config from '../../config'; // তোর কনফিগ ইমপোর্ট করবি

const initPayment = catchAsync(async (req: Request, res: Response) => {
  const tutorId = req.user.userId;
  const { packageId } = req.body;

  const result = await PaymentService.initPayment(tutorId, packageId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment URL generated successfully',
    data: result,
  });
});

/**
 * 🟢 পেমেন্ট সাকসেস হ্যান্ডেলার (রিডাইরেক্ট লজিক সহ)
 */
const handleSuccess = catchAsync(async (req: Request, res: Response) => {
  const { invoiceId } = req.query;

  try {

    await PaymentService.verifyAndConfirmPayment(invoiceId as string);

    res.redirect(
      `${config.frontend_payment_success_url}?invoiceId=${invoiceId}`,
    );
  } catch (error: any) {
    res.redirect(
      `${config.frontend_payment_fail_url}?error=verification_failed`,
    );
  }
});

const getMyPaymentHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getMyPaymentHistoryFromDB(
    req.user.userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment history retrieved successfully',
    data: result,
  });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getAllPaymentHistoryFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All payment history retrieved successfully',
    meta: result.meta,
    data: result.result,
  });
});

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  // Zinipay ডক অনুযায়ী payload.invoiceId অথবা payload.tran_id হতে পারে
  if (payload.status === 'COMPLETED') {
    await PaymentService.verifyAndConfirmPayment(payload.invoiceId);
  }

  res.status(200).send('OK');
});

const verifyPaymentManually = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await PaymentService.verifyPaymentManuallyByAdminFromDB(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Payment verified manually and credits added successfully!',
      data: result,
    });
  },
);

export const PaymentController = {
  initPayment,
  handleSuccess,
  getMyPaymentHistory,
  getAllPayments,
  handleWebhook,
  verifyPaymentManually,
};

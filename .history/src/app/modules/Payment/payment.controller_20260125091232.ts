import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { PaymentService } from './payment.service';

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

const handleSuccess = catchAsync(async (req: Request, res: Response) => {
  const { invoiceId } = req.query;

  const result = await PaymentService.verifyAndConfirmPayment(
    invoiceId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment completed and credits added successfully!',
    data: result,
  });
});

const getMyPaymentHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getMyPaymentHistoryFromDB(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment history retrieved successfully',
    data: result,
  });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getAllPaymentHistoryFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All payment history retrieved successfully',
    data: result,
  });
});

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  if (payload.status === 'COMPLETED') {
    await PaymentService.verifyAndConfirmPayment(payload.invoiceId);
  }

  res.status(200).send('OK');
});

const verifyPaymentManually = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params; // পেমেন্ট আইডি
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

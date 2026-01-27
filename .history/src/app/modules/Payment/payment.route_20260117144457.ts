import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { PaymentValidation } from './payment.validation';
import { PaymentController } from './payment.controller';

const router = express.Router();

/**
 * ১. পেমেন্ট ইনিশিয়েট করা
 * এখান থেকে টিউটর ZiniPay-র পেমেন্ট লিঙ্ক পাবে
 */
router.post(
  '/init',
  auth('tutor'),
  validateRequest(PaymentValidation.createPaymentValidationSchema),
  PaymentController.initPayment,
);

/**
 * ২. পেমেন্ট সাকসেস হ্যান্ডলার (Redirect URL)
 * ZiniPay পেমেন্ট শেষে ইউজারকে এই লিঙ্কে পাঠাবে:
 * yourdomain.com/api/v1/payment/success?invoiceId=xxxx
 */
router.get('/success', PaymentController.handleSuccess);

/**
 * ৩. পেমেন্ট ক্যানসেল বা ফেইল হ্যান্ডলার (অপশনাল কিন্তু রাখা ভালো)
 */
router.get('/cancel', (req, res) => {
  res.send('Payment was cancelled by the user.');
});

router.get('/fail', (req, res) => {
  res.send('Payment failed. Please try again.');
});

export const PaymentRoutes = router;

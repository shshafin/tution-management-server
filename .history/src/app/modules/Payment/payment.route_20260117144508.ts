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


router.get('/success', PaymentController.handleSuccess);


router.get('/cancel', (req, res) => {
  res.send('Payment was cancelled by the user.');
});

router.get('/fail', (req, res) => {
  res.send('Payment failed. Please try again.');
});

export const PaymentRoutes = router;

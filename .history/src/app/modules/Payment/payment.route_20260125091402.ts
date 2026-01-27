import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { PaymentValidation } from './payment.validation';
import { PaymentController } from './payment.controller';

const router = express.Router();

// ১. পেমেন্ট ইনিশিয়েট (POST)
router.post(
  '/init',
  auth('tutor', 'admin', 'super_admin'),
  validateRequest(PaymentValidation.createPaymentValidationSchema),
  PaymentController.initPayment,
);

// ২. গেটওয়ে কলব্যাক রাউটস (Public/Webhook)
router.get('/success', PaymentController.handleSuccess);
router.post('/webhook', PaymentController.handleWebhook); // Webhook-টা উপরে রাখা ভালো
router.get('/cancel', (req, res) =>
  res.send('Payment was cancelled by the user.'),
);
router.get('/fail', (req, res) =>
  res.send('Payment failed. Please try again.'),
);

// ৩. স্পেসিফিক ইউজার রাউটস (Static paths first!)
router.get(
  '/my-history',
  auth('tutor', 'admin', 'super_admin'),
  PaymentController.getMyPaymentHistory,
);

// ৪. অ্যাডমিন অ্যাকশনস (Specific actions)
router.patch(
  '/manual-verify/:id',
  auth('super_admin', 'admin'),
  PaymentController.verifyPaymentManually,
);

// ৫. জেনারেল লিস্ট রাউট (Root paths last)
router.get('/', auth('super_admin', 'admin'), PaymentController.getAllPayments);

export const PaymentRoutes = router;

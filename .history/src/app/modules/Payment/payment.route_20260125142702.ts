import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { PaymentValidation } from './payment.validation';
import { PaymentController } from './payment.controller';

const router = express.Router();

// ১. পেমেন্ট ইনিশিয়েট (Tutor)
router.post(
  '/init',
  auth('tutor', 'admin', 'super_admin'),
  validateRequest(PaymentValidation.createPaymentValidationSchema),
  PaymentController.initPayment,
);

// ২. পেমেন্ট গেটওয়ে কলব্যাক (Public)
router.get('/success', PaymentController.handleSuccess);
router.post('/webhook', PaymentController.handleWebhook);

// ৩. স্ট্যাটিক পাথ (অ্যাডমিন এবং টিউটরের হিস্ট্রি)
router.get(
  '/my-history',
  auth('tutor', 'admin', 'super_admin'),
  PaymentController.getMyPaymentHistory,
);

// ৪. অ্যাডমিন রুট (Get All)
router.get('/', auth('super_admin', 'admin'), PaymentController.getAllPayments);

// ৫. ডাইনামিক পাথ (Specific actions) - একদম নিচে 🛠️
router.patch(
  '/manual-verify/:id',
  auth('super_admin', 'admin'),
  PaymentController.verifyPaymentManually,
);

export const PaymentRoutes = router;

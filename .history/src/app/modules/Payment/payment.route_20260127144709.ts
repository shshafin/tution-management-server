import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { PaymentValidation } from './payment.validation';
import { PaymentController } from './payment.controller';

const router = express.Router();

router.post(
  '/init',
  auth('tutor', 'admin', 'super_admin'),
  validateRequest(PaymentValidation.createPaymentValidationSchema),
  PaymentController.initPayment,
);

router.get('/success', PaymentController.handleSuccess);
router.post('/webhook', PaymentController.handleWebhook);

router.get(
  '/my-history',
  auth('tutor', 'admin', 'super_admin'),
  PaymentController.getMyPaymentHistory,
);

router.get('/', auth('super_admin', 'admin'), PaymentController.getAllPayments);

router.patch(
  '/manual-verify/:id',
  auth('super_admin', 'admin'),
  PaymentController.verifyPaymentManually,
);

export const PaymentRoutes = router;

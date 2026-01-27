import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AuthValidation } from './auth.validation';
import { AuthController } from './auth.controller';

const router = express.Router();

router.post(
  '/login',
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.loginUser,
);

router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post(
  '/change-password',
  auth('tutor', 'admin', 'super_admin'), // শুধু লগইন ইউজার পারবে
  // তুই চাইলে একটা ভ্যালিডেশন স্কিমাও দিতে পারিস এখানে
  AuthController.changePassword,
);

router.post('/refresh-token', AuthController.refreshToken);

export const AuthRoutes = router;

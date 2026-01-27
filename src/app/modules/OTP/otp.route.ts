import express from 'express';
import rateLimit from 'express-rate-limit';
import { OTPController } from './otp.controller';

const router = express.Router();

// High Protection: প্রতি ১৫ মিনিটে ৫ বারের বেশি ওটিপি ট্রাই করা যাবে না
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many attempts. Please try again after 15 minutes.',
});

router.post('/verify-job-otp', otpLimiter, OTPController.verifyJobOTP);

export const OTPRoutes = router;

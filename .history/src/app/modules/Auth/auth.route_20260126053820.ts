import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AuthValidation } from './auth.validation';
import { AuthController } from './auth.controller';
import auth from '../../middlewares/auth';

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
  auth('tutor', 'admin', 'super_admin'), 
  AuthController.changePassword,
);

router.post('/refresh-token', AuthController.refreshToken);

export const AuthRoutes = router;

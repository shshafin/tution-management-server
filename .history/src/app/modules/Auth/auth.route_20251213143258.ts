import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { userLoginValidations } from './auth.validation';
import { AuthControllers, getCurrentUser } from './auth.controller';
import auth from '../../middlewares/auth';
// import { forgotPassword, resetPassword } from '../User/user.controller';

const router = Router();

router.post(
  '/login',
  validateRequest(userLoginValidations.userLoginValidationSchema),
  AuthControllers.userLogin,
);

router.post(
  '/change-password',
  auth(),
  validateRequest(userLoginValidations.changePasswordValidationSchema),
  AuthControllers.changePassword,
);

router.post('/forgot-password', forgotPassword); // Send reset email
router.post('/reset-password/:token', resetPassword); // Reset password with token

router.get('/me', auth(), getCurrentUser);

export const AuthRoutes = router;

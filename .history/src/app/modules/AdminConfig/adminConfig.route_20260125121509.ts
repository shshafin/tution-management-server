import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AdminConfigValidation } from './adminConfig.validation';
import { AdminConfigController } from './adminConfig.controller';

const router = express.Router();

// বর্তমান কনফিগ দেখার জন্য
router.get('/', AdminConfigController.getAdminConfig);

// কনফিগ আপডেট করার জন্য
router.patch(
  '/update',
  validateRequest(AdminConfigValidation.updateAdminConfigValidationSchema),
  AdminConfigController.updateAdminConfig,
);

export const AdminConfigRoutes = router;

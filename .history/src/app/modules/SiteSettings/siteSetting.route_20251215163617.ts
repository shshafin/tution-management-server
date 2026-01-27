import express from 'express';
import { SiteSettingController } from './siteSetting.controller';
import { SiteSettingValidation } from './siteSetting.validation'; // 👈 Import this
import auth from '../../middlewares/auth';
import { upload } from '../../utils/sendImageToCloudinary';
import parseBody from '../../middlewares/bodyParser';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

// Get Settings (Public)
router.get('/', SiteSettingController.getSiteSettings);

// Create or Update Settings (Admin Only)
// Use POST or PATCH - both work for the "Upsert" logic!
router.post(
  '/',
  auth('super_admin', 'admin'),
  upload.single('logo'),
  parseBody,
  validateRequest(SiteSettingValidation.updateSiteSettingValidationSchema),
  SiteSettingController.updateSiteSettings,
);

// Added a PATCH alias for consistency
router.patch(
  '/',
  auth('super_admin', 'admin'),
  upload.single('logo'),
  parseBody,
  validateRequest(SiteSettingValidation.updateSiteSettingValidationSchema),
  SiteSettingController.updateSiteSettings,
);

export const SiteSettingRoutes = router;

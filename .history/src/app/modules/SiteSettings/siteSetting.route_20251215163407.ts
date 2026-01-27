import express from 'express';
import { SiteSettingController } from './siteSetting.controller';
import auth from '../../middlewares/auth';
import { upload } from '../../utils/sendImageToCloudinary';
import parseBody from '../../middlewares/bodyParser';

const router = express.Router();

// Get Settings (Public - used by Footer/Header)
router.get('/', SiteSettingController.getSiteSettings);

// Update Settings (Admin Only)
// We use POST here to handle both Create (first time) and Update logic nicely,
// or you can call it POST for simplicity since it handles both.
router.post(
  '/',
  auth('super_admin', 'admin'),
  upload.single('logo'),
  parseBody,
  SiteSettingController.updateSiteSettings,
);

export const SiteSettingRoutes = router;

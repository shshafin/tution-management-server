import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { PackageValidation } from './package.validation';
import { PackageController } from './package.controller';

const router = express.Router();

// ১. অ্যাডমিন এরিয়া (স্ট্যাটিক পাথগুলো উপরে)
router.post(
  '/create-package',
  auth('admin', 'super_admin'),
  validateRequest(PackageValidation.createPackageValidationSchema),
  PackageController.createPackage,
);

router.get(
  '/admin-all',
  auth('admin', 'super_admin'),
  PackageController.getAllPackagesForAdmin,
);

// ২. টিউটর/পাবলিক এরিয়া
router.get('/', PackageController.getActivePackages);

// ৩. ডাইনামিক পাথগুলো সবার নিচে (CONFLICT FIX 🛠️)
router.get('/:id', auth('tutor', 'admin'), PackageController.getSinglePackage);
router.patch('/:id', auth('admin'), PackageController.updatePackage);
router.delete('/:id', auth('admin'), PackageController.deletePackage);

export const PackageRoutes = router;

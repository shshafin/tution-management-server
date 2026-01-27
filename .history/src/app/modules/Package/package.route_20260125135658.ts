import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { PackageValidation } from './package.validation';
import { PackageController } from './package.controller';

const router = express.Router();

// 1. Admin: Create Package
router.post(
  '/create-package',
  auth('admin', 'super_admin'),
  validateRequest(PackageValidation.createPackageValidationSchema),
  PackageController.createPackage,
);

// 2. Admin: Get All (including inactive)
router.get(
  '/admin-all',
  auth('admin', 'super_admin'),
  PackageController.getAllPackagesForAdmin,
);

// 3. Tutor/General: Get only active packages
router.get('/', PackageController.getActivePackages);

// 4. Get Single, Update, Delete
router.get('/:id', auth('tutor', 'admin'), PackageController.getSinglePackage);
router.patch('/:id', auth('admin'), PackageController.updatePackage);
router.delete('/:id', auth('admin'), PackageController.deletePackage);

export const PackageRoutes = router;

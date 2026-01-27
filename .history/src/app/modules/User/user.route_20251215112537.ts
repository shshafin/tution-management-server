import express from 'express';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { upload } from '../../utils/sendImageToCloudinary';
import parseBody from '../../middlewares/bodyParser';

const router = express.Router();

// Create a new user (Validation -> Controller)
router.post(
  '/create-user',
  auth('super_admin'),
  upload.single('file'), // Expects field name 'file'
  parseBody, // Parses field name 'data'
  validateRequest(UserValidation.createUserValidationSchema),
  UserController.createUser,
);

// Get all users
router.get('/', auth('super_admin'), UserController.getAllUsers);

// Get single user
router.get('/:id', auth('super_admin', 'admin'), UserController.getSingleUser);

// Update user
router.patch(
  '/:id',
  auth('super_admin'),
  upload.single('file'),
  parseBody,
  validateRequest(UserValidation.updateUserValidationSchema),
  UserController.updateUser
);

// Delete user
router.delete('/:id', auth('super_admin'), UserController.deleteUser);

export const UserRoutes = router;

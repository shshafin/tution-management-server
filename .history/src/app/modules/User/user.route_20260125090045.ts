import express from 'express';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { upload } from '../../utils/sendImageToCloudinary';
import parseBody from '../../middlewares/bodyParser';

const router = express.Router();

// ১. পাবলিক রেজিস্ট্রেশন (টিউটরদের জন্য)
router.post(
  '/become-a-tutor',
  upload.single('file'),
  parseBody,
  validateRequest(UserValidation.createTutorSchema),
  UserController.createTutor,
);

// ২. নিজের প্রোফাইল দেখা
router.get(
  '/me',
  auth('tutor', 'admin', 'super_admin'),
  UserController.getMyProfile,
);

// ৩. অ্যাডমিন অ্যাকশন (সব ইউজার দেখা)
router.get('/', auth('super_admin', 'admin'), UserController.getAllUsers);


router.patch(
  '/:id',
  auth('super_admin', 'admin', 'tutor'), // টিউটরও তার প্রোফাইল আপডেট করতে পারবে
  upload.single('file'),
  parseBody,
  UserController.updateUser,
);

router.delete('/:id', auth('super_admin'), UserController.deleteUser);

export const UserRoutes = router;

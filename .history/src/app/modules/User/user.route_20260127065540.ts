import express from 'express';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { upload } from '../../utils/sendImageToCloudinary';
import parseBody from '../../middlewares/bodyParser';

const router = express.Router();

router.post(
  '/become-a-tutor',
  upload.single('file'),
  parseBody,
  validateRequest(UserValidation.createTutorSchema),
  UserController.createTutor,
);

router.get(
  '/me',
  auth('tutor', 'admin', 'super_admin'),
  UserController.getMyProfile,
);

router.get('/', auth('super_admin', 'admin'), UserController.getAllUsers);
router.get('/:id', auth('super_admin', 'admin', 'tutor'), UserController.getSingleUser);

router.patch(
  '/:id',
  auth('super_admin', 'admin', 'tutor'),
  upload.single('file'),
  parseBody,
  UserController.updateUser,
);

router.delete('/:id', auth('super_admin'), UserController.deleteUser);

export const UserRoutes = router;

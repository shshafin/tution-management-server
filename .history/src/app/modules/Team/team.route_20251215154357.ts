import express from 'express';
import { TeamController } from './team.controller';
import { TeamValidation } from './team.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { upload } from '../../utils/sendImageToCloudinary';
import parseBody from '../../middlewares/bodyParser';

const router = express.Router();

// Create (Admin Only)
router.post(
  '/',
  auth('super_admin', 'admin'),
  upload.single('photo'),
  parseBody,
  validateRequest(TeamValidation.createTeamValidationSchema),
  TeamController.createTeamMember,
);

// Read (Public)
router.get('/', TeamController.getAllTeamMembers);
router.get('/:id', TeamController.getSingleTeamMember);

// Update
router.patch(
  '/:id',
  auth('super_admin', 'admin'),
  upload.single('photo'),
  parseBody,
  validateRequest(TeamValidation.updateTeamValidationSchema),
  TeamController.updateTeamMember,
);

// Delete
router.delete(
  '/:id',
  auth('super_admin', 'admin'),
  TeamController.deleteTeamMember,
);

export const TeamRoutes = router;

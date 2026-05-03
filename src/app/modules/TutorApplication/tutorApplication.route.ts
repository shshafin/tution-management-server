import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { TutorApplicationValidation } from './tutorApplication.validation';
import { TutorApplicationController } from './tutorApplication.controller';

const router = express.Router();

router.post(
  '/apply',
  auth('tutor'),
  validateRequest(TutorApplicationValidation.createApplicationValidationSchema),
  TutorApplicationController.applyToJob,
);

router.get(
  '/my-applications',
  auth('tutor', 'admin', 'super_admin'),
  TutorApplicationController.getMyAppliedJobs,
);

router.get(
  '/all',
  auth('admin', 'super_admin'),
  TutorApplicationController.getAllApplications,
);

export const TutorApplicationRoutes = router;

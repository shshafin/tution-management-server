import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { TutorApplicationValidation } from './tutorApplication.validation';
import { TutorApplicationController } from './tutorApplication.controller';

const router = express.Router();

// জবে অ্যাপ্লাই করার রাউট
router.post(
  '/apply',
  auth('tutor'),
  validateRequest(TutorApplicationValidation.createApplicationValidationSchema),
  TutorApplicationController.applyToJob,
);

router.get(
  '/my-applications',
  auth('tutor'),
  TutorApplicationController.getMyAppliedJobs,
);

export const TutorApplicationRoutes = router;
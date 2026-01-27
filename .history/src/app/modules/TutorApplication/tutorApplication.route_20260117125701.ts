import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { TutorApplicationValidation } from './tutorApplication.validation';
import { TutorApplicationController } from './tutorApplication.controller';

const router = express.Router();

router.post(
  '/apply',
  auth('tutor'), // শুধুমাত্র টিউটররা পারবে
  validateRequest(TutorApplicationValidation.createApplicationValidationSchema),
  TutorApplicationController.applyToJob,
);

export const TutorApplicationRoutes = router;

import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { JobPostValidation } from './jobPost.validation';
import { JobPostController } from './jobPost.controller';

const router = express.Router();

router.post(
  '/create-job',
  validateRequest(JobPostValidation.createJobPostValidationSchema),
  JobPostController.createJobPost,
);

router.get(
  '/job-feed',
  auth('tutor', 'admin', 'super_admin'),
  JobPostController.getTutorJobFeed,
);

router.get(
  '/:id',
  auth('tutor', 'admin', 'super_admin'),
  JobPostController.getSingleJobPost,
);

export const JobPostRoutes = router;

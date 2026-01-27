import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { JobPostValidation } from './jobPost.validation';
import { JobPostController } from './jobPost.controller';

const router = express.Router();

// পাবলিকলি জব পোস্ট করার সুবিধা
router.post(
  '/create-job',
  validateRequest(JobPostValidation.createJobPostValidationSchema),
  JobPostController.createJobPost,
);

// টিউটরদের জন্য সিকিউর ফিড
router.get(
  '/job-feed',
  auth('tutor', 'admin', 'super_admin'),
  JobPostController.getTutorJobFeed,
);

// নির্দিষ্ট জবের ডিটেইলস দেখা
router.get(
  '/:id',
  auth('tutor', 'admin', 'super_admin'),
  JobPostController.getSingleJobPost,
);

export const JobPostRoutes = router;

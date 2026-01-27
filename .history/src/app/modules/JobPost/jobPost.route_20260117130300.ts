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

// টিউটরদের জন্য স্পেশাল জব বোর্ড (সার্চ ও ফিল্টার সাপোর্ট করবে)
router.get(
  '/job-feed', 
  auth('tutor', 'admin', 'super_admin'),
  JobPostController.getTutorJobFeed
);

router.get('/', JobPostController.getAllJobPosts);
router.get('/:id', JobPostController.getSingleJobPost);

export const JobPostRoutes = router;
import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { JobPostValidation } from './jobPost.validation';
import { JobPostController } from './jobPost.controller';

const router = express.Router();

router.post(
  '/create-job',
  validateRequest(JobPostValidation.createJobPostValidationSchema),
  JobPostController.createJobPost,
);

router.get('/', JobPostController.getAllJobPosts);
router.get('/:id', JobPostController.getSingleJobPost);

export const JobPostRoutes = router;

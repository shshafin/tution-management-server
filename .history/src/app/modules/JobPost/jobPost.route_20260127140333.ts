import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { JobPostValidation } from './jobPost.validation';
import { JobPostController } from './jobPost.controller';
import parseToken from '../../middlewares/parseToken';

const router = express.Router();

/**
 * 📢 পাবলিক রাউট (Guardian)
 */
router.post(
  '/create-job',
  validateRequest(JobPostValidation.createJobPostValidationSchema),
  JobPostController.createJobPost,
);

/**
 * 👨‍🏫 টিউটর ও অ্যাডমিন রাউট
 */
router.get('/job-feed', JobPostController.getTutorJobFeed);

router.get('/:id', parseToken, JobPostController.getSingleJobPost);

/**
 * 🛡️ অ্যাডমিন ও সুপার অ্যাডমিন অনলি রাউট
 */
// সব জব ম্যানেজ করার জন্য (QueryBuilder সহ)
router.get('/', auth('admin', 'super_admin'), JobPostController.getAllJobs);

// জব স্ট্যাটাস আপডেট বা এডিট করা
router.patch(
  '/:id',
  auth('admin', 'super_admin'),
  JobPostController.updateJobPost,
);

// জব ডিলিট করা
router.delete(
  '/:id',
  auth('admin', 'super_admin'),
  JobPostController.deleteJobPost,
);

export const JobPostRoutes = router;

import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { JobPostValidation } from './jobPost.validation';
import { JobPostController } from './jobPost.controller';

const router = express.Router();

// ১. পাবলিক রাউট: যে কেউ জব পোস্ট করতে পারবে
router.post(
  '/create-job',
  validateRequest(JobPostValidation.createJobPostValidationSchema),
  JobPostController.createJobPost,
);

// ২. টিউটর রাউট: শুধুমাত্র লগইন করা টিউটর বা অ্যাডমিন ফিড দেখবে
router.get(
  '/job-feed',
  auth('tutor', 'admin', 'super_admin'),
  JobPostController.getTutorJobFeed,
);

// ৩. সিঙ্গেল ভিউ রাউট: লগইন করা থাকলে রোল অনুযায়ী কন্টাক্ট হাইড/শো হবে
router.get(
  '/:id',
  auth('tutor', 'admin', 'super_admin'),
  JobPostController.getSingleJobPost,
);

export const JobPostRoutes = router;

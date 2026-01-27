import express from 'express';
import { FaqController } from './faq.controller';
import { FaqValidation } from './faq.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/',
  auth('super_admin', 'admin'),
  validateRequest(FaqValidation.createFaqValidationSchema),
  FaqController.createFaq,
);

router.get('/', FaqController.getAllFaqs);

router.delete('/:id', auth('super_admin', 'admin'), FaqController.deleteFaq);

export const FaqRoutes = router;

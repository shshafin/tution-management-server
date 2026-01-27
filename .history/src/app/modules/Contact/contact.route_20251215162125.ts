import express from 'express';
import { ContactController } from './contact.controller';
import { ContactValidation } from './contact.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';

const router = express.Router();

// Public Route (Anyone can send a message)
router.post(
  '/create-contact',
  validateRequest(ContactValidation.createContactValidationSchema),
  ContactController.createContact,
);

// Admin Only Routes
router.get('/', auth('super_admin', 'admin'), ContactController.getAllContacts);
router.delete(
  '/:id',
  auth('super_admin', 'admin'),
  ContactController.deleteContact,
);
// Update Status (Admin Only)
router.patch(
  '/:id/read', // URL will be like: /api/contacts/12345/read
  auth('super_admin', 'admin'),
  ContactController.markAsRead
);

export const ContactRoutes = router;

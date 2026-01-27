import express from 'express';
import auth from '../../middlewares/auth';
import { SupportTicketController } from './supportTicket.controller';

const router = express.Router();

// ১. পাবলিকলি টিকেট জমা দেওয়া (No Auth)
router.post('/create', SupportTicketController.createTicket);

// ২. অ্যাডমিন একশনস (Auth Required)
router.get(
  '/',
  auth('super_admin', 'admin'),
  SupportTicketController.getAllTickets,
);

router.patch(
  '/:id/status',
  auth('super_admin', 'admin'),
  SupportTicketController.updateTicketStatus,
);

router.delete(
  '/:id',
  auth('super_admin', 'admin'),
  SupportTicketController.deleteTicket,
);

export const SupportTicketRoutes = router;

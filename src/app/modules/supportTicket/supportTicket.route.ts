import express from 'express';
import auth from '../../middlewares/auth';
import { SupportTicketController } from './supportTicket.controller';

const router = express.Router();

router.post('/create', SupportTicketController.createTicket);

router.get(
  '/',
  auth('super_admin', 'admin'),
  SupportTicketController.getAllTickets,
);

router.get(
  '/:id',
  auth('super_admin', 'admin'),
  SupportTicketController.getSingleTicket,
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

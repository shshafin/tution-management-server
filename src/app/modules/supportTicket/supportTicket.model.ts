import { Schema, model } from 'mongoose';
import { TSupportTicket } from './supportTicket.interface';

const supportTicketSchema = new Schema<TSupportTicket>(
  {
    ticketId: { type: String, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

export const SupportTicket = model<TSupportTicket>(
  'SupportTicket',
  supportTicketSchema,
);

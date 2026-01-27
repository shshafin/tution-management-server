import { TSupportTicket } from './supportTicket.interface';
import { SupportTicket } from './supportTicket.model';

const createTicketIntoDB = async (payload: TSupportTicket) => {
  // একটি র্যান্ডম টিকেট আইডি জেনারেট করা
  const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
  payload.ticketId = ticketId;

  const result = await SupportTicket.create(payload);
  return result;
};

const getAllTicketsFromDB = async () => {
  return await SupportTicket.find().sort('-createdAt');
};

const updateTicketStatusIntoDB = async (id: string, status: string) => {
  return await SupportTicket.findByIdAndUpdate(id, { status }, { new: true });
};

export const SupportTicketService = {
  createTicketIntoDB,
  getAllTicketsFromDB,
  updateTicketStatusIntoDB,
};

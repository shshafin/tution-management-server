import { TSupportTicket } from './supportTicket.interface';
import { SupportTicket } from './supportTicket.model';

const createTicketIntoDB = async (payload: TSupportTicket) => {
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

const deleteTicketFromDB = async (id: string) => {
  const result = await SupportTicket.findByIdAndDelete(id);
  return result;
};

export const SupportTicketService = {
  createTicketIntoDB,
  getAllTicketsFromDB,
  updateTicketStatusIntoDB,
  deleteTicketFromDB,
};

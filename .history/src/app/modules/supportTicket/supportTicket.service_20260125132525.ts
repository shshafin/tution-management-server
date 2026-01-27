import QueryBuilder from '../../builder/QueryBuilder'; // তোর পাথ অনুযায়ী ইমপোর্ট করিস
import { TSupportTicket } from './supportTicket.interface';
import { SupportTicket } from './supportTicket.model';

const createTicketIntoDB = async (payload: TSupportTicket) => {
  const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
  payload.ticketId = ticketId;
  return await SupportTicket.create(payload);
};

// 🛠️ Advanced Search, Filter, Pagination Logic
const getAllTicketsFromDB = async (query: Record<string, unknown>) => {
  const searchableFields = ['ticketId', 'name', 'email', 'subject'];

  const ticketQuery = new QueryBuilder(SupportTicket.find(), query)
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await ticketQuery.modelQuery;
  const meta = await ticketQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getSingleTicketFromDB = async (id: string) => {

const updateTicketStatusIntoDB = async (id: string, status: string) => {
  return await SupportTicket.findByIdAndUpdate(id, { status }, { new: true });
};

const deleteTicketFromDB = async (id: string) => {
  return await SupportTicket.findByIdAndDelete(id);
};

export const SupportTicketService = {
  createTicketIntoDB,
  getAllTicketsFromDB,
  updateTicketStatusIntoDB,
  deleteTicketFromDB,
};

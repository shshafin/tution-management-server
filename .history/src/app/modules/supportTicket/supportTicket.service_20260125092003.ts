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

const deleteTicket = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await SupportTicketService.deleteTicketFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ticket deleted successfully',
    data: null,
  });
});

export const SupportTicketController = {
  createTicket,
  getAllTickets,
  updateTicketStatus,
  deleteTicket,
};

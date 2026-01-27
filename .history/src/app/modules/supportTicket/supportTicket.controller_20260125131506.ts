import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { SupportTicketService } from './supportTicket.service';

const createTicket = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportTicketService.createTicketIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Your support ticket has been submitted successfully!',
    data: result,
  });
});

const getAllTickets = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportTicketService.getAllTicketsFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All support tickets retrieved successfully',
    data: result,
  });
});

const updateTicketStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await SupportTicketService.updateTicketStatusIntoDB(
    id,
    status,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ticket status updated successfully',
    data: result,
  });
});

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

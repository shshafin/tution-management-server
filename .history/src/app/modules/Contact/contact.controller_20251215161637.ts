import { Request, Response } from 'express';
import { ContactService } from './contact.service';

import httpStatus from 'http-status';

const createContact = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactService.createContactIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Message sent successfully',
    data: result,
  });
});

const getAllContacts = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactService.getAllContactsFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Messages retrieved successfully',
    data: result,
  });
});

const deleteContact = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await ContactService.deleteContactFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Message deleted successfully',
    data: null,
  });
});

export const ContactController = {
  createContact,
  getAllContacts,
  deleteContact,
};

import { Request, Response } from 'express';
import { ResourceService } from './resource.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';

const createResource = catchAsync(async (req: Request, res: Response) => {
  // Handle PDF Upload
  if (req.file) {
    const fileName = `resource-${Date.now()}`;
    // Cloudinary can handle PDFs too!
    const { secure_url }: any = await sendImageToCloudinary(
      fileName,
      req.file.path,
    );
    req.body.fileUrl = secure_url;
  }

  const result = await ResourceService.createResourceIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Resource/PDF added successfully',
    data: result,
  });
});

const getAllResources = catchAsync(async (req: Request, res: Response) => {
  const result = await ResourceService.getAllResourcesFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Resources retrieved successfully',
    data: result,
  });
});

const deleteResource = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await ResourceService.deleteResourceFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Resource deleted successfully',
    data: null,
  });
});

export const ResourceController = {
  createResource,
  getAllResources,
  deleteResource,
};

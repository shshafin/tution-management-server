import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { PackageService } from './package.service';

const createPackage = catchAsync(async (req: Request, res: Response) => {
  const result = await PackageService.createPackageIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Package created successfully',
    data: result,
  });
});

const getActivePackages = catchAsync(async (req: Request, res: Response) => {
  const result = await PackageService.getActivePackagesFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Active packages retrieved successfully',
    data: result,
  });
});

const getAllPackagesForAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PackageService.getAllPackagesForAdminFromDB(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'All packages retrieved for admin',
      meta: result.meta, 
      data: result.result, // 🛠️ Actual data
    });
  },
);

const getSinglePackage = catchAsync(async (req: Request, res: Response) => {
  const result = await PackageService.getSinglePackageFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Package retrieved successfully',
    data: result,
  });
});

const updatePackage = catchAsync(async (req: Request, res: Response) => {
  const result = await PackageService.updatePackageIntoDB(
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Package updated successfully',
    data: result,
  });
});

const deletePackage = catchAsync(async (req: Request, res: Response) => {
  await PackageService.deletePackageFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Package deleted successfully',
    data: null,
  });
});

export const PackageController = {
  createPackage,
  getActivePackages,
  getAllPackagesForAdmin,
  getSinglePackage,
  updatePackage,
  deletePackage,
};

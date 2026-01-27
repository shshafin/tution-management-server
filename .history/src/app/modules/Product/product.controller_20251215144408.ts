import { Request, Response } from 'express';
import { ProductService } from './product.service';

import httpStatus from 'http-status';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';

// Helper: Upload Multiple Images
const handleMultipleImageUploads = async (files: any[]) => {
  const imageUrls: string[] = [];

  // Loop through all files and upload them
  for (const file of files) {
    const imageName = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const path = file.path;

    // Upload each file
    const { secure_url }: any = await sendImageToCloudinary(imageName, path);
    imageUrls.push(secure_url);
  }

  return imageUrls;
};

const createProduct = catchAsync(async (req: Request, res: Response) => {
  // 1. Handle Images (If any)
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const imageUrls = await handleMultipleImageUploads(req.files as any[]);
    req.body.images = imageUrls; // Save the array of URLs
  }

  // 2. Save to DB
  const result = await ProductService.createProductIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product created successfully',
    data: result,
  });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getAllProductsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Products retrieved successfully',
    data: result,
  });
});

const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.getSingleProductFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product retrieved successfully',
    data: result,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Handle new images if uploaded during update
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const imageUrls = await handleMultipleImageUploads(req.files as any[]);
    req.body.images = imageUrls;
  }

  const result = await ProductService.updateProductIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product updated successfully',
    data: result,
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await ProductService.deleteProductFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product deleted successfully',
    data: null,
  });
});

export const ProductController = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};

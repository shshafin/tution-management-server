import { Request, Response } from 'express';
import { BlogService } from './blog.service';
import catchAsync from '../../shared/catchAsync';
import httpStatus from 'http-status';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';

const createBlog = catchAsync(async (req: Request, res: Response) => {
  // Handle Cover Image Upload
  if (req.file) {
    const imageName = `blog-${Date.now()}`;
    const { secure_url }: any = await sendImageToCloudinary(
      imageName,
      req.file.path,
    );
    req.body.coverImage = secure_url;
  }

  const result = await BlogService.createBlogIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Blog post created successfully',
    data: result,
  });
});

const getAllBlogs = catchAsync(async (req: Request, res: Response) => {
  const result = await BlogService.getAllBlogsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Blogs retrieved successfully',
    data: result,
  });
});

const getSingleBlog = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BlogService.getSingleBlogFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Blog retrieved successfully',
    data: result,
  });
});

const updateBlog = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Update image if new one provided
  if (req.file) {
    const imageName = `blog-${Date.now()}`;
    const { secure_url }: any = await sendImageToCloudinary(
      imageName,
      req.file.path,
    );
    req.body.coverImage = secure_url;
  }

  const result = await BlogService.updateBlogIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Blog updated successfully',
    data: result,
  });
});

const deleteBlog = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await BlogService.deleteBlogFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Blog deleted successfully',
    data: null,
  });
});

export const BlogController = {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog,
};

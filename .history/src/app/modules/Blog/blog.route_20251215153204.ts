import express from 'express';
import { BlogController } from './blog.controller';
import { BlogValidation } from './blog.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { upload } from '../../utils/sendImageToCloudinary';
import parseBody from '../../middlewares/bodyParser';

const router = express.Router();

// Create (Admin Only)
router.post(
  '/create-blog',
  auth('super_admin', 'admin', 'moderator'),
  upload.single('coverImage'), // Single file for blog cover
  parseBody,
  validateRequest(BlogValidation.createBlogValidationSchema),
  BlogController.createBlog,
);

// Get All (Public)
router.get('/', BlogController.getAllBlogs);

// Get Single (Public)
router.get('/:id', BlogController.getSingleBlog);

// Update (Admin Only)
router.patch(
  '/:id',
  auth('super_admin', 'admin', 'moderator'),
  upload.single('coverImage'),
  parseBody,
  validateRequest(BlogValidation.updateBlogValidationSchema),
  BlogController.updateBlog,
);

// Delete (Admin Only)
router.delete(
  '/:id',
  auth('super_admin', 'admin', 'moderator'),
  BlogController.deleteBlog,
);

export const BlogRoutes = router;

import express from 'express';
import { ProductController } from './product.controller';
import { ProductValidation } from './product.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { upload } from '../../utils/sendImageToCloudinary';
import parseBody from '../../middlewares/bodyParser';

const router = express.Router();

// CREATE: Auth + Max 5 Images + Body Parser + Validation
router.post(
  '/create',
  auth('super_admin', 'admin', 'moderator'), // Moderators can also create products
  upload.array('images', 5), // <--- NOTE: .array(), not .single()
  parseBody,
  validateRequest(ProductValidation.createProductValidationSchema),
  ProductController.createProduct,
);

// READ ALL (Public)
router.get('/', ProductController.getAllProducts);

// READ ONE (Public)
router.get('/:id', ProductController.getSingleProduct);

// UPDATE
router.patch(
  '/:id',
  auth('super_admin', 'admin', 'moderator'),
  upload.array('images', 5),
  parseBody,
  validateRequest(ProductValidation.updateProductValidationSchema),
  ProductController.updateProduct,
);

// DELETE
router.delete(
  '/:id',
  auth('super_admin', 'admin', 'moderator'),
  ProductController.deleteProduct,
);

export const ProductRoutes = router;

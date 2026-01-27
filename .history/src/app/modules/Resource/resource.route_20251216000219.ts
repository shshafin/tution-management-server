import express from 'express';
import { ResourceController } from './resource.controller';
import auth from '../../middlewares/auth';
import { upload } from '../../utils/sendImageToCloudinary';
import parseBody from '../../middlewares/bodyParser';

const router = express.Router();

router.post(
  '/create-resource',
  auth('super_admin', 'admin', ),
  upload.single('file'), // Note: Field name is 'file'
  parseBody,
  ResourceController.createResource,
);

router.get('/', ResourceController.getAllResources);

router.delete(
  '/:id',
  auth('super_admin', 'admin', ),
  ResourceController.deleteResource,
);

export const ResourceRoutes = router;

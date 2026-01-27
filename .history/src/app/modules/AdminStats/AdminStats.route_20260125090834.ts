import express from 'express';
import auth from '../../middlewares/auth';
import { AdminStatsController } from './AdminStats.controller';

const router = express.Router();

router.get(
  '/dashboard-stats',
  auth('super_admin', 'admin'),
  AdminStatsController.getDashboardStats,
);

export const AdminStatsRoutes = router;

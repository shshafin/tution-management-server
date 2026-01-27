import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { UserRoutes } from '../modules/User/user.route';
import { AdminConfigRoutes } from '../modules/AdminConfig/adminConfig.route';
import { JobPostRoutes } from '../modules/JobPost/jobPost.route'; // ইমপোর্ট করলি

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/admin-config',
    route: AdminConfigRoutes,
  },
  {
    path: '/job-posts', // গার্ডিয়ান ফ্লো এবং জব বোর্ড রাউট
    route: JobPostRoutes,
  },
];

// route loop
moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
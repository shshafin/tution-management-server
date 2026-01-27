import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { UserRoutes } from '../modules/User/user.route';
import { AdminConfigRoutes } from '../modules/AdminConfig/adminConfig.route';
import { JobPostRoutes } from '../modules/JobPost/jobPost.route';
import { OTPRoutes } from '../modules/OTP/otp.route';
import { TutorApplicationRoutes } from '../modules/TutorApplication/tutorApplication.route';
import { PaymentRoutes } from '../modules/Payment/payment.route';
import { PackageRoutes } from '../modules/Package/package.route';
import { AdminStatsRoutes } from '../modules/AdminStats/AdminStats.route';
import { SupportTicketRoutes } from '../modules/supportTicket/supportTicket.route';

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
    path: '/job-posts',
    route: JobPostRoutes,
  },
  {
    path: '/otp',
    route: OTPRoutes,
  },
  {
    path: '/tutor-applications',
    route: TutorApplicationRoutes,
  },
  {
    path: '/payments',
    route: PaymentRoutes,
  },
  {
    path: '/packages',
    route: PackageRoutes,
  },
  {
    path: '/admin-stats',
    route: AdminStatsRoutes,
  },
  {
    path: '/support-tickets',
    route: SupportTicketRoutes,
  },
];

// route loop
moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;

import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { UserRoutes } from '../modules/User/user.route';
import { ProductRoutes } from '../modules/Product/product.route';
import { BlogRoutes } from '../modules/Blog/blog.route';
import { TeamRoutes } from '../modules/Team/team.route';
import { FaqRoutes } from '../modules/Faq/faq.route';
import { ResourceRoutes } from '../modules/Resource/resource.route';

const router = Router();

const moduleRoute = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/products',
    route: ProductRoutes,
  },
  {
    path: '/blogs',
    route: BlogRoutes,
  },
  {
    path: '/teams',
    route: TeamRoutes,
  },
  {
    path: '/faqs',
    route: FaqRoutes,
  },
  {
    path: '/resources',
    route: ResourceRoutes,
  },
  {
    
  }
];

// route loop
moduleRoute.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;

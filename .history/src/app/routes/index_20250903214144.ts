import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { UserRoutes } from '../modules/User/user.route';
import { CategoryRoutes } from '../modules/Category/category.route';
import { ExpenseRoutes } from '../modules/Expense/expense.route';
import { BudgetRoutes } from '../modules/Budget/budget.route';
import { GoalRoutes } from '../modules/Goal/goal.route';
import { AccountRoutes } from '../modules/Accounts/accounts.route';
import { TransactionRoutes } from '../modules/Transaction/transaction.route';
import { CsvRoutes } from '../modules/CsvTemp/CsvTemp.route';

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
    path: '/categories',
    route: CategoryRoutes,
  },
  {
    path: '/expenses',
    route: ExpenseRoutes,
  },
  {
    path: '/budgets',
    route: BudgetRoutes,
  },
  {
    path: '/goals',
    route: GoalRoutes,
  },
  {
    path: '/accounts',
    route: AccountRoutes,
  },
  {
    path: '/transactions',
    route: TransactionRoutes,
  },
  {
    path: '/csv-temp',
    route: CsvRoutes,
  },
];

// route loop
moduleRoute.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
